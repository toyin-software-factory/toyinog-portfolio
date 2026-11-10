import Script from "next/script";
import { z } from "zod";

import { getAppEnv } from "@/lib/env";

/** Cloudflare Web Analytics' beacon (spec 0009). Allowed by the CSP in next.config.ts. */
export const BEACON_SRC = "https://static.cloudflareinsights.com/beacon.min.js";

// A Workers Builds build variable, inlined at build time. Blank counts as missing.
const tokenSchema = z.string().trim().min(1).optional().catch(undefined);

/**
 * The cookie free analytics beacon (spec 0009, AC-1, AC-2). Rendered once from the root
 * layout, and only in a production build that has a token: never in previews, local dev
 * or CI. Page views only; the contact conversion is a view of /contact/sent (AC-5).
 */
export function Analytics() {
  const token = tokenSchema.parse(process.env.NEXT_PUBLIC_CF_ANALYTICS_TOKEN);
  if (getAppEnv() !== "production" || token === undefined) return null;

  return (
    <Script
      src={BEACON_SRC}
      strategy="afterInteractive"
      defer
      data-cf-beacon={JSON.stringify({ token })}
    />
  );
}
