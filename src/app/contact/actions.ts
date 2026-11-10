"use server";

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";

import { type ContactState, handleContact } from "@/lib/contact/handle";
import { logContact } from "@/lib/contact/log";
import { TURNSTILE_TEST_SECRET_KEY, verifyTurnstile } from "@/lib/contact/turnstile";
import { getAppEnv } from "@/lib/env";

import { sendThroughBinding } from "./sendThroughBinding";
import { SENT_COOKIE } from "./sentCookie";

/** The contact form's server action (spec 0007). Thin: the flow lives in handleContact. */
export async function sendContact(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const { env } = await getCloudflareContext({ async: true });
  const requestHeaders = await headers();
  const isProduction = getAppEnv() === "production";

  const outcome = await handleContact(formData, {
    isProduction,
    // CF-Connecting-IP is set by Cloudflare and can't be spoofed by the client (spec 0001).
    clientIp: requestHeaders.get("cf-connecting-ip"),
    verifyTurnstile: (token, ip) =>
      verifyTurnstile({
        token,
        ip,
        // Outside production the published test secret always passes (spec 0001).
        secret: isProduction ? env.TURNSTILE_SECRET_KEY : TURNSTILE_TEST_SECRET_KEY,
      }),
    rateLimiter: env.CONTACT_RATE_LIMITER,
    send: (from, to, raw) => sendThroughBinding(env.SEND_EMAIL, from, to, raw),
    fromEmail: env.CONTACT_FROM_EMAIL,
    toEmail: env.CONTACT_TO_EMAIL,
    now: () => new Date(),
    log: logContact,
  });

  if (outcome.kind === "state") return outcome.state;

  if (outcome.setSentCookie) {
    (await cookies()).set(SENT_COOKIE.name, "1", SENT_COOKIE.options);
  }
  // Next renders /contact/sent inside this response, so src/middleware.ts sees only
  // later requests to it: it clears the cookie on the next visit (or it expires in 60 s).
  redirect("/contact/sent");
}
