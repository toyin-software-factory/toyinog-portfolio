import type { AppEnv } from "../env";
import { SITE_LAUNCHED } from "./site";

/**
 * Whether search engines may index this build (spec 0008 AC-5). The one place
 * that decides it: `src/app/robots.ts`, the root metadata and the `X-Robots-Tag`
 * header in `next.config.ts` all ask here. Relative imports only, because
 * `next.config.ts` loads this file outside the `@/` alias.
 *
 * Indexable only in production after launch (spec 0010 AC-1c): `SITE_LAUNCHED`
 * is the launch switch, passed in here so tests can try both states.
 */
export function isIndexable(appEnv: AppEnv, launched: boolean = SITE_LAUNCHED): boolean {
  return appEnv === "production" && launched;
}

/** The `X-Robots-Tag` header for builds that must stay out of search. */
export const NOINDEX_HEADER = { key: "X-Robots-Tag", value: "noindex" } as const;
