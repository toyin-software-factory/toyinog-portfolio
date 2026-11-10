import { describe, expect, it, vi } from "vitest";

import { verifyTurnstile } from "./turnstile";

const reply = (body: unknown, status = 200) =>
  vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(body), { status }));

describe("verifyTurnstile (spec 0007, AC-5)", () => {
  it("posts the secret, token and client IP to siteverify", async () => {
    const fetchMock = reply({ success: true });
    const result = await verifyTurnstile({
      token: "tok",
      secret: "sec",
      ip: "203.0.113.7",
      fetch: fetchMock,
    });

    expect(result).toEqual({ ok: true });
    const [url, init] = fetchMock.mock.calls[0] ?? [];
    expect(url).toBe("https://challenges.cloudflare.com/turnstile/v0/siteverify");
    const body = init?.body as URLSearchParams;
    expect(Object.fromEntries(body)).toEqual({
      secret: "sec",
      response: "tok",
      remoteip: "203.0.113.7",
    });
  });

  it("fails without calling the API when the token is missing", async () => {
    const fetchMock = reply({ success: true });
    expect(await verifyTurnstile({ token: "", secret: "sec", ip: null, fetch: fetchMock })).toEqual(
      {
        ok: false,
        reason: "missing-token",
      },
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("fails when Cloudflare rejects the token", async () => {
    const result = await verifyTurnstile({
      token: "tok",
      secret: "sec",
      ip: null,
      fetch: reply({ success: false, "error-codes": ["invalid-input-response"] }),
    });
    expect(result).toEqual({ ok: false, reason: "invalid-input-response" });
  });

  it("fails closed on HTTP errors, odd responses and network errors", async () => {
    const base = { token: "tok", secret: "sec", ip: null };
    expect(await verifyTurnstile({ ...base, fetch: reply({}, 500) })).toEqual({
      ok: false,
      reason: "http-500",
    });
    expect(await verifyTurnstile({ ...base, fetch: reply({ nope: 1 }) })).toEqual({
      ok: false,
      reason: "bad-response",
    });
    const broken = vi.fn<typeof fetch>().mockRejectedValue(new TypeError("offline"));
    expect(await verifyTurnstile({ ...base, fetch: broken })).toEqual({
      ok: false,
      reason: "network-error",
    });
  });

  it("fails when no secret is configured", async () => {
    expect(
      await verifyTurnstile({
        token: "tok",
        secret: "",
        ip: null,
        fetch: reply({ success: true }),
      }),
    ).toEqual({
      ok: false,
      reason: "missing-secret",
    });
  });
});
