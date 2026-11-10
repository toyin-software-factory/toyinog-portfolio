import { SHELL_PROFILE } from "@/lib/content/generated/shell-profile";
import { SITE_URL } from "@/lib/site";

/**
 * Site wide SEO values (spec 0008). Built from the build time profile module
 * (spec 0004 AC-12), so they're safe on any route, prerendered or not.
 */

/** `og:site_name`: Toyin's name. */
export const SITE_NAME = SHELL_PROFILE.name;

/** Shortest and longest page description, in characters (AC-2). */
export const DESCRIPTION_MIN = 50;
export const DESCRIPTION_MAX = 160;

/** The default share image (AC-3): 1200 by 630, Carbon Black with the name and headline. */
export const DEFAULT_SHARE_IMAGE = {
  url: "/og/default.png",
  width: 1200,
  height: 630,
  alt: `${SHELL_PROFILE.name}: ${SHELL_PROFILE.headline}`,
} as const;

/** An absolute URL on the canonical origin, for JSON-LD (metadata uses `metadataBase`). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
