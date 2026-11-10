import { z } from "zod";

/**
 * Cloudflare's published Turnstile test keys (always pass). Used outside production
 * so previews on workers.dev work without adding hosts to the widget (spec 0001).
 * https://developers.cloudflare.com/turnstile/troubleshooting/testing/
 */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";
export const TURNSTILE_TEST_SECRET_KEY = "1x0000000000000000000000000000000AA";

/** The hidden field the widget adds to the form. */
export const TURNSTILE_RESPONSE_FIELD = "cf-turnstile-response";

const SITEVERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

/** A stalled siteverify must not leave the visitor on a pending button. */
export const SITEVERIFY_TIMEOUT_MS = 5000;

/** The reason returned when the server has no Turnstile secret configured. */
export const MISSING_SECRET = "missing-secret";

const siteverifyResponse = z.object({
  success: z.boolean(),
  "error-codes": z.array(z.string()).optional(),
});

export type TurnstileResult =
  { readonly ok: true } | { readonly ok: false; readonly reason: string };

type VerifyOptions = {
  readonly token: string;
  /** May be undefined when the Worker secret isn't set. */
  readonly secret: string | undefined;
  readonly ip: string | null;
  readonly fetch?: typeof fetch;
};

/** Checks a Turnstile token server side (spec 0007, AC-5). Never throws. */
export async function verifyTurnstile({
  token,
  secret,
  ip,
  fetch: fetchImpl = fetch,
}: VerifyOptions): Promise<TurnstileResult> {
  if (token.trim() === "") return { ok: false, reason: "missing-token" };
  if (!secret) return { ok: false, reason: MISSING_SECRET };

  const body = new URLSearchParams({ secret, response: token });
  if (ip) body.set("remoteip", ip);

  try {
    const response = await fetchImpl(SITEVERIFY_URL, {
      method: "POST",
      body,
      signal: AbortSignal.timeout(SITEVERIFY_TIMEOUT_MS),
    });
    if (!response.ok) return { ok: false, reason: `http-${String(response.status)}` };
    const parsed = siteverifyResponse.safeParse(await response.json());
    if (!parsed.success) return { ok: false, reason: "bad-response" };
    if (parsed.data.success) return { ok: true };
    return { ok: false, reason: parsed.data["error-codes"]?.join(",") || "rejected" };
  } catch (error) {
    // AbortSignal.timeout rejects with a DOMException named TimeoutError.
    const timedOut =
      typeof error === "object" &&
      error !== null &&
      "name" in error &&
      error.name === "TimeoutError";
    return { ok: false, reason: timedOut ? "timeout" : "network-error" };
  }
}
