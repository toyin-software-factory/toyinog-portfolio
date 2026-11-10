import type { MetadataRoute } from "next";

import { getAppEnv } from "@/lib/env";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/**
 * Production allows everything and points at the sitemap. Previews, which live on
 * public workers.dev URLs, disallow everything so they never compete with
 * toyinog.com in search (spec 0008 AC-5).
 */
export default function robots(): MetadataRoute.Robots {
  if (getAppEnv() !== "production") {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: new URL("/sitemap.xml", SITE_URL).toString(),
  };
}
