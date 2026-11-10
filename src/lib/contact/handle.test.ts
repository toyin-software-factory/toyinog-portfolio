import { describe, expect, it, vi } from "vitest";

import { type ContactDeps, handleContact } from "./handle";
import type { ContactLogEvent } from "./log";

const NAME = "Ada Lovelace";
const EMAIL = "ada@example.com";
const MESSAGE = "We'd love to talk about a frontend lead role.";

const form = (overrides: Record<string, string> = {}): FormData => {
  const formData = new FormData();
  const fields = {
    name: NAME,
    email: EMAIL,
    type: "hiring",
    message: MESSAGE,
    "cf-turnstile-response": "token",
    website: "",
    ...overrides,
  };
  for (const [key, value] of Object.entries(fields)) formData.set(key, value);
  return formData;
};

const setup = (overrides: Partial<ContactDeps> = {}) => {
  const logs: ContactLogEvent[] = [];
  const deps: ContactDeps = {
    isProduction: true,
    clientIp: "203.0.113.7",
    verifyTurnstile: vi.fn().mockResolvedValue({ ok: true }),
    rateLimiter: { limit: vi.fn().mockResolvedValue({ success: true }) },
    send: vi.fn().mockResolvedValue(undefined),
    fromEmail: "contact@toyinog.com",
    toEmail: "inbox@example.org",
    now: () => new Date("2026-11-10T09:30:00.000Z"),
    log: (entry) => logs.push(entry),
    ...overrides,
  };
  return { deps, logs };
};

/** AC-12: nothing the visitor typed may appear in any log line. */
const expectNoPersonalData = (logs: readonly ContactLogEvent[]) => {
  const text = JSON.stringify(logs);
  for (const secret of [NAME, EMAIL, MESSAGE, "Ada", "example.com"])
    expect(text).not.toContain(secret);
};

describe("handleContact (spec 0007)", () => {
  it("sends one email in production and redirects with the cookie (AC-7, AC-10)", async () => {
    const { deps, logs } = setup();
    const outcome = await handleContact(form(), deps);

    expect(outcome).toEqual({ kind: "redirect", setSentCookie: true });
    expect(deps.send).toHaveBeenCalledTimes(1);
    const [from, to, raw] = vi.mocked(deps.send).mock.calls[0] ?? [];
    expect(from).toBe("contact@toyinog.com");
    expect(to).toBe("inbox@example.org");
    expect(raw).toContain("Reply-To: <ada@example.com>");
    expect(raw).toContain(MESSAGE);
    expect(logs).toEqual([{ event: "contact.sent", type: "hiring" }]);
    expectNoPersonalData(logs);
  });

  it("drops honeypot hits silently: success, no checks, no send (AC-4)", async () => {
    const { deps, logs } = setup();
    const outcome = await handleContact(form({ website: "https://spam.example" }), deps);

    expect(outcome).toEqual({ kind: "redirect", setSentCookie: false });
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
    expect(deps.rateLimiter.limit).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([{ event: "contact.honeypot" }]);
  });

  it("returns field errors and keeps the values, before any other check (AC-3)", async () => {
    const { deps, logs } = setup();
    const outcome = await handleContact(form({ email: "nope", message: "short" }), deps);

    expect(outcome).toEqual({
      kind: "state",
      state: {
        status: "invalid",
        errors: {
          email: "Enter an email address like name@example.com.",
          message: "Your message needs at least 20 characters.",
        },
        values: { name: NAME, email: "nope", type: "hiring", message: "short" },
      },
    });
    expect(deps.verifyTurnstile).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([{ event: "contact.invalid", fields: ["email", "message"] }]);
  });

  it("stops when Turnstile fails, passing the token and IP (AC-5)", async () => {
    const verifyTurnstile = vi
      .fn()
      .mockResolvedValue({ ok: false, reason: "invalid-input-response" });
    const { deps, logs } = setup({ verifyTurnstile });
    const outcome = await handleContact(form(), deps);

    expect(outcome).toMatchObject({ kind: "state", state: { status: "turnstile" } });
    expect(verifyTurnstile).toHaveBeenCalledWith("token", "203.0.113.7");
    expect(deps.rateLimiter.limit).not.toHaveBeenCalled();
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([{ event: "contact.turnstile_failed", reason: "invalid-input-response" }]);
  });

  it("stops when the rate limit is hit, after Turnstile (AC-6)", async () => {
    const rateLimiter = { limit: vi.fn().mockResolvedValue({ success: false }) };
    const { deps, logs } = setup({ rateLimiter });
    const outcome = await handleContact(form(), deps);

    expect(outcome).toMatchObject({
      kind: "state",
      state: { status: "rate_limited", values: { name: NAME } },
    });
    expect(rateLimiter.limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([{ event: "contact.rate_limited" }]);
  });

  it("the sixth submit in a minute is limited (AC-6)", async () => {
    let count = 0;
    const rateLimiter = { limit: vi.fn(() => Promise.resolve({ success: ++count <= 5 })) };
    const { deps } = setup({ rateLimiter });
    const outcomes = [];
    for (let i = 0; i < 6; i += 1) outcomes.push(await handleContact(form(), deps));

    expect(outcomes.slice(0, 5).every((o) => o.kind === "redirect")).toBe(true);
    expect(outcomes[5]).toMatchObject({ kind: "state", state: { status: "rate_limited" } });
    expect(deps.send).toHaveBeenCalledTimes(5);
  });

  it("does a dry run outside production: no send, a safe log line, the cookie (AC-8)", async () => {
    const { deps, logs } = setup({ isProduction: false });
    const outcome = await handleContact(form({ type: "project" }), deps);

    expect(outcome).toEqual({ kind: "redirect", setSentCookie: true });
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([
      { event: "contact.dry_run", type: "project", messageLength: MESSAGE.length },
    ]);
    expectNoPersonalData(logs);
  });

  it("shows the fallback and keeps the input when the send fails (AC-9)", async () => {
    const send = vi.fn().mockRejectedValue(new Error(`SMTP said no to ${EMAIL}`));
    const { deps, logs } = setup({ send });
    const outcome = await handleContact(form(), deps);

    expect(outcome).toEqual({
      kind: "state",
      state: {
        status: "send_failed",
        values: { name: NAME, email: EMAIL, type: "hiring", message: MESSAGE },
      },
    });
    expect(logs).toEqual([{ event: "contact.send_failed", error: "Error" }]);
    expectNoPersonalData(logs);
  });

  it("fails safely when the inbox secret isn't configured", async () => {
    const { deps, logs } = setup({ toEmail: "" });
    const outcome = await handleContact(form(), deps);

    expect(outcome).toMatchObject({ kind: "state", state: { status: "send_failed" } });
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([{ event: "contact.config_missing", missing: ["CONTACT_TO_EMAIL"] }]);
  });

  it("shows the email fallback, not the human check, when the Turnstile secret is missing", async () => {
    const { deps, logs } = setup({
      verifyTurnstile: vi.fn().mockResolvedValue({ ok: false, reason: "missing-secret" }),
    });
    const outcome = await handleContact(form(), deps);

    expect(outcome).toMatchObject({ kind: "state", state: { status: "send_failed" } });
    expect(deps.send).not.toHaveBeenCalled();
    expect(logs).toEqual([{ event: "contact.config_missing", missing: ["TURNSTILE_SECRET_KEY"] }]);
  });
});
