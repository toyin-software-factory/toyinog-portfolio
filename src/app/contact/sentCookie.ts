/**
 * The short lived cookie that lets /contact/sent render (spec 0007, AC-10). It only
 * gates the thank you page, so direct visits don't count as conversions. Strictly
 * necessary, so no consent banner is needed.
 */
export const SENT_COOKIE = {
  name: "contact_sent",
  options: {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60,
    path: "/contact",
  },
} as const;
