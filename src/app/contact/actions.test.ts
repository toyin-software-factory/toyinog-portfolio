import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { TURNSTILE_TEST_SECRET_KEY, verifyTurnstile } from "@/lib/contact/turnstile";
import { getAppEnv } from "@/lib/env";

import { sendContact } from "./actions";
import { sendThroughBinding } from "./sendThroughBinding";
import { SENT_COOKIE } from "./sentCookie";

vi.mock("@opennextjs/cloudflare", () => ({ getCloudflareContext: vi.fn() }));
vi.mock("next/headers", () => ({ cookies: vi.fn(), headers: vi.fn() }));
vi.mock("next/navigation", () => ({
  redirect: vi.fn(() => {
    throw new Error("NEXT_REDIRECT");
  }),
}));
vi.mock("./sendThroughBinding", () => ({ sendThroughBinding: vi.fn() }));
vi.mock("@/lib/env", () => ({ getAppEnv: vi.fn() }));
vi.mock("@/lib/contact/turnstile", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/contact/turnstile")>()),
  verifyTurnstile: vi.fn(),
}));

const cookieStore = { set: vi.fn(), delete: vi.fn() };
const limit = vi.fn();
const env = {
  TURNSTILE_SECRET_KEY: "production-secret-from-env",
  CONTACT_RATE_LIMITER: { limit },
  SEND_EMAIL: { send: vi.fn() },
  CONTACT_FROM_EMAIL: "contact@toyinog.com",
  CONTACT_TO_EMAIL: "inbox@example.org",
};

const form = (fields: Record<string, string>) => {
  const data = new FormData();
  for (const [key, value] of Object.entries(fields)) data.set(key, value);
  return data;
};

const valid = form({
  name: "Ada Lovelace",
  email: "ada@example.com",
  type: "project",
  message: "Could you help us rebuild our marketing site?",
  "cf-turnstile-response": "token",
});

describe("sendContact (spec 0007 wiring)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, "log").mockImplementation(() => undefined);
    vi.mocked(getCloudflareContext).mockResolvedValue({ env } as unknown as Awaited<
      ReturnType<typeof getCloudflareContext>
    >);
    vi.mocked(headers).mockResolvedValue(new Headers({ "cf-connecting-ip": "203.0.113.7" }));
    vi.mocked(cookies).mockResolvedValue(
      cookieStore as unknown as Awaited<ReturnType<typeof cookies>>,
    );
    vi.mocked(verifyTurnstile).mockResolvedValue({ ok: true });
    limit.mockResolvedValue({ success: true });
  });

  it("outside production uses the Turnstile test secret, dry runs and sets the cookie (AC-8, AC-10)", async () => {
    vi.mocked(getAppEnv).mockReturnValue("preview");

    await expect(sendContact({ status: "idle" }, valid)).rejects.toThrow("NEXT_REDIRECT");

    expect(verifyTurnstile).toHaveBeenCalledWith({
      token: "token",
      ip: "203.0.113.7",
      secret: TURNSTILE_TEST_SECRET_KEY,
    });
    expect(limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
    expect(sendThroughBinding).not.toHaveBeenCalled();
    expect(cookieStore.set).toHaveBeenCalledWith("contact_sent", "1", SENT_COOKIE.options);
    expect(redirect).toHaveBeenCalledWith("/contact/sent");
  });

  it("in production uses the secret from the environment (AC-5)", async () => {
    vi.mocked(getAppEnv).mockReturnValue("production");
    vi.mocked(verifyTurnstile).mockResolvedValue({ ok: false, reason: "invalid-input-response" });

    await expect(sendContact({ status: "idle" }, valid)).resolves.toMatchObject({
      status: "turnstile",
    });
    expect(verifyTurnstile).toHaveBeenCalledWith(
      expect.objectContaining({ secret: "production-secret-from-env" }),
    );
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(redirect).not.toHaveBeenCalled();
  });

  it("in production sends one email through the binding, then sets the cookie (AC-7, AC-10)", async () => {
    vi.mocked(getAppEnv).mockReturnValue("production");

    await expect(sendContact({ status: "idle" }, valid)).rejects.toThrow("NEXT_REDIRECT");

    expect(sendThroughBinding).toHaveBeenCalledTimes(1);
    expect(sendThroughBinding).toHaveBeenCalledWith(
      env.SEND_EMAIL,
      "contact@toyinog.com",
      "inbox@example.org",
      expect.stringContaining("Reply-To: <ada@example.com>"),
    );
    expect(cookieStore.set).toHaveBeenCalledWith("contact_sent", "1", SENT_COOKIE.options);
  });

  it("redirects a honeypot hit without the cookie (AC-4)", async () => {
    vi.mocked(getAppEnv).mockReturnValue("production");

    await expect(
      sendContact({ status: "idle" }, form({ website: "https://spam.example" })),
    ).rejects.toThrow("NEXT_REDIRECT");
    expect(verifyTurnstile).not.toHaveBeenCalled();
    expect(cookieStore.set).not.toHaveBeenCalled();
    expect(redirect).toHaveBeenCalledWith("/contact/sent");
  });
});

describe("the sent cookie (AC-10)", () => {
  it("is httpOnly, secure, SameSite=Lax and lives 60 seconds", () => {
    expect(SENT_COOKIE).toEqual({
      name: "contact_sent",
      options: { httpOnly: true, secure: true, sameSite: "lax", maxAge: 60, path: "/contact" },
    });
  });
});
