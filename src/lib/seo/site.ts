// Relative imports, and nothing generated: next.config.ts and the content loader
// (which writes the generated profile module) both load this file.
import { SITE_URL } from "../site";

/** Site wide SEO values (spec 0008) that don't depend on content. */

/**
 * Whether toyinog.com has launched (spec 0010 AC-1c). Until the go live PR sets it
 * to `true`, even production builds stay out of search (spec 0008 AC-5) and only
 * warn about placeholder content. Only the go live PR changes this line, after
 * Toyin's "go" (spec 0010 AC-7, AC-8).
 */
export const SITE_LAUNCHED: boolean = false;

/** Shortest and longest page description, in characters (AC-2). */
export const DESCRIPTION_MIN = 50;
export const DESCRIPTION_MAX = 160;

/** An absolute URL on the canonical origin, for JSON-LD (metadata uses `metadataBase`). */
export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).toString();
}
