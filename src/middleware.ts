import { type NextRequest, NextResponse } from "next/server";

import { SENT_COOKIE } from "@/app/contact/sentCookie";

/**
 * The /contact/sent gate (spec 0007, AC-10). The page itself is static; this decides
 * who sees it. No `contact_sent` cookie: back to /contact, so direct visits don't count.
 * With the cookie: show the page once and delete the cookie on that same response.
 *
 * Edge middleware (`middleware.ts`), not Next 16's `proxy.ts`: proxy runs on the
 * Node runtime, which @opennextjs/cloudflare marks experimental on workerd.
 */
export function middleware(request: NextRequest): NextResponse {
  if (!request.cookies.has(SENT_COOKIE.name)) {
    return NextResponse.redirect(new URL("/contact", request.url));
  }
  const response = NextResponse.next();
  response.headers.set("Cache-Control", "private, no-store");
  // Same attributes as when it was set (Secure included), or the browser keeps the old one.
  response.cookies.set(SENT_COOKIE.name, "", { ...SENT_COOKIE.options, maxAge: 0 });
  return response;
}

export const config = { matcher: "/contact/sent" };
