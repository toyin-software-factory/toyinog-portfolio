import { SHELL_PROFILE } from "@/lib/content/generated/shell-profile";

/**
 * SEO values made from Toyin's profile (spec 0008), through the build time
 * profile module (spec 0004 AC-12), so they're safe on any route. Kept apart
 * from ./site.ts, which the content loader imports before that module exists.
 */

/** `og:site_name`: Toyin's name. */
export const SITE_NAME = SHELL_PROFILE.name;

/** The default share image (AC-3): 1200 by 630, Carbon Black with the name and headline. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/og/default.png",
  width: 1200,
  height: 630,
  alt: `${SHELL_PROFILE.name}: ${SHELL_PROFILE.headline}`,
} as const;
