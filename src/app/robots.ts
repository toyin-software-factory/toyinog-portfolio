import type { MetadataRoute } from "next";

import { getAppEnv } from "@/lib/env";
import { isIndexable } from "@/lib/seo/indexing";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Indexable builds (production) allow everything and point at the sitemap.
 * Other builds (the workers.dev previews) also allow crawling, with no sitemap,
 * so crawlers can read the `noindex` meta and `X-Robots-Tag` header on every
 * page: a `Disallow` would hide that `noindex` from them (spec 0008 AC-5).
 */
export default function robots(): MetadataRoute.Robots {
  if (!isIndexable(getAppEnv())) return { rules: { userAgent: "*", allow: "/" } };
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
