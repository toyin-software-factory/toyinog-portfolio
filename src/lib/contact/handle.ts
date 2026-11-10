import { buildContactEmail } from "./email";
import type { ContactLogger } from "./log";
import { isRateLimited, type RateLimiter } from "./rateLimit";
import {
  type ContactErrors,
  type ContactValues,
  isHoneypotFilled,
  parseContact,
  readContactValues,
} from "./schema";
import { MISSING_SECRET, TURNSTILE_RESPONSE_FIELD, type TurnstileResult } from "./turnstile";

/** What the form shows after a submit that didn't redirect. */
export type ContactState =
  | { readonly status: "idle" }
  | { readonly status: "invalid"; readonly errors: ContactErrors; readonly values: ContactValues }
  | { readonly status: "turnstile"; readonly values: ContactValues }
  | { readonly status: "rate_limited"; readonly values: ContactValues }
  | { readonly status: "send_failed"; readonly values: ContactValues };

export type ContactOutcome =
  | { readonly kind: "redirect"; readonly setSentCookie: boolean }
  | { readonly kind: "state"; readonly state: ContactState };

/** Everything the handler touches outside itself, injected so every path is testable. */
export type ContactDeps = {
  readonly isProduction: boolean;
  readonly clientIp: string | null;
  readonly verifyTurnstile: (token: string, ip: string | null) => Promise<TurnstileResult>;
  readonly rateLimiter: RateLimiter;
  /** Sends a raw MIME message from → to. Only called in production. */
  readonly send: (from: string, to: string, raw: string) => Promise<void>;
  readonly fromEmail: string;
  readonly toEmail: string;
  readonly now: () => Date;
  readonly log: ContactLogger;
};

const state = (value: ContactState): ContactOutcome => ({ kind: "state", state: value });

/**
 * The contact flow (spec 0007): honeypot, then validation, then Turnstile, then the
 * rate limit, then the send (or a dry run outside production). The cheapest checks
 * run first, and the rate limit is only spent on human looking requests.
 */
export async function handleContact(
  formData: FormData,
  deps: ContactDeps,
): Promise<ContactOutcome> {
  // AC-4: bots that fill the honeypot see success, and nothing else runs.
  if (isHoneypotFilled(formData)) {
    deps.log({ event: "contact.honeypot" });
    return { kind: "redirect", setSentCookie: false };
  }

  // AC-3: the same schema the form shows errors from.
  const values = readContactValues(formData);
  const parsed = parseContact(values);
  if (!parsed.ok) {
    deps.log({ event: "contact.invalid", fields: Object.keys(parsed.errors) });
    return state({ status: "invalid", errors: parsed.errors, values });
  }

  // AC-5: server side Turnstile check with the client IP.
  const token = formData.get(TURNSTILE_RESPONSE_FIELD);
  const human = await deps.verifyTurnstile(typeof token === "string" ? token : "", deps.clientIp);
  if (!human.ok && human.reason === MISSING_SECRET) {
    // A server misconfiguration, not the visitor's fault: show the email fallback.
    deps.log({ event: "contact.config_missing", missing: ["TURNSTILE_SECRET_KEY"] });
    return state({ status: "send_failed", values });
  }
  if (!human.ok) {
    deps.log({ event: "contact.turnstile_failed", reason: human.reason });
    return state({ status: "turnstile", values });
  }

  // AC-6: per IP rate limit, checked before sending.
  if (await isRateLimited(deps.rateLimiter, deps.clientIp)) {
    deps.log({ event: "contact.rate_limited" });
    return state({ status: "rate_limited", values });
  }

  const input = parsed.data;

  // AC-8: outside production, everything except the send. No personal data in the log.
  if (!deps.isProduction) {
    deps.log({ event: "contact.dry_run", type: input.type, messageLength: input.message.length });
    return { kind: "redirect", setSentCookie: true };
  }

  // AC-7 and AC-9: one email through Email Routing, or a friendly failure.
  const missing = [
    deps.fromEmail ? null : "CONTACT_FROM_EMAIL",
    deps.toEmail ? null : "CONTACT_TO_EMAIL",
  ].filter((name): name is string => name !== null);
  if (missing.length > 0) {
    deps.log({ event: "contact.config_missing", missing });
    return state({ status: "send_failed", values });
  }

  try {
    const raw = buildContactEmail({
      from: deps.fromEmail,
      to: deps.toEmail,
      input,
      sentAt: deps.now(),
    });
    await deps.send(deps.fromEmail, deps.toEmail, raw);
  } catch (error) {
    deps.log({
      event: "contact.send_failed",
      error: error instanceof Error ? error.name : "unknown",
    });
    return state({ status: "send_failed", values });
  }

  deps.log({ event: "contact.sent", type: input.type });
  return { kind: "redirect", setSentCookie: true };
}
