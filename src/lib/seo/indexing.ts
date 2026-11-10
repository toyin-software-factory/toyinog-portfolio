import type { AppEnv } from "../env";

/**
 * Whether search engines may index this build (spec 0008 AC-5). The one place
 * that decides it: `src/app/robots.ts`, the root metadata and the `X-Robots-Tag`
 * header in `next.config.ts` all ask here. Relative imports only, because
 * `next.config.ts` loads this file outside the `@/` alias.
 *
 * Today: production only. Go live (spec 0010) adds its launch switch here.
 */
export function isIndexable(appEnv: AppEnv): boolean {
  return appEnv === "production";
}

/** The `X-Robots-Tag` header for builds that must stay out of search. */
export const NOINDEX_HEADER = { key: "X-Robots-Tag", value: "noindex" } as const;
