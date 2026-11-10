import type { MetadataRoute } from "next";

import { getProjectSlugs } from "@/lib/content";
import { SITE_URL } from "@/lib/site";

export const dynamic = "force-static";

/** Public routes. Later features add theirs here. */
const STATIC_ROUTES = ["/", "/work"];

/**
 * Every public page as an absolute URL. Case studies come from the content
 * (published projects only, so drafts never appear in production).
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const routes = [...STATIC_ROUTES, ...getProjectSlugs().map((slug) => `/work/${slug}`)];
  return routes.map((path) => ({ url: new URL(path, SITE_URL).toString() }));
}
