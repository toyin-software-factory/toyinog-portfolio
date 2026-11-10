import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";
import type { NextConfig } from "next";

import { resolveAppEnv } from "./src/lib/env";
import { isIndexable, NOINDEX_HEADER } from "./src/lib/seo/indexing";

// Production or preview, fixed per build (spec 0001): APP_ENV if set, else
// production when Workers Builds builds main, else preview. Code reads it with getAppEnv().
const appEnv = resolveAppEnv(process.env);

const isDev = process.env.NODE_ENV === "development";

// Static pages can't carry per request nonces, so inline scripts and styles
// are allowed. Third parties: Turnstile (challenges.cloudflare.com) and
// Cloudflare Web Analytics (static.cloudflareinsights.com, cloudflareinsights.com).
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://challenges.cloudflare.com https://static.cloudflareinsights.com`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self' https://cloudflareinsights.com",
  "frame-src https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join("; ");

const securityHeaders = [
  { key: "Content-Security-Policy", value: contentSecurityPolicy },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  env: { APP_ENV: appEnv },
  // OpenNext on Workers has no built in image optimizer; images are pre sized.
  images: { unoptimized: true },
  poweredByHeader: false,
  // Stop `next dev` writing its own AGENTS.md. Root AGENTS.md is owned by /audit.
  agentRules: false,
  headers() {
    // Builds that mustn't be indexed (previews) also send X-Robots-Tag: noindex
    // on every routed response (spec 0008 AC-5). Decided once, at build time.
    const headers = isIndexable(appEnv) ? securityHeaders : [...securityHeaders, NOINDEX_HEADER];
    return Promise.resolve([{ source: "/:path*", headers }]);
  },
};

export default nextConfig;

// Makes Cloudflare bindings available through getCloudflareContext() in `next dev`.
void initOpenNextCloudflareForDev();
