/**
 * Which build the e2e run targets (spec 0001, CI contract).
 *
 * - `pnpm test:e2e`: a preview build (`APP_ENV=preview`), every spec.
 * - `pnpm test:e2e:production`: a production style build (`APP_ENV=production`, a dummy
 *   analytics token, Turnstile test keys), only the environment aware specs (below).
 *
 * The contact action can never send for real in either: `.dev.vars` leaves
 * `CONTACT_TO_EMAIL` empty, so a production style submit takes the AC-9 fallback.
 */
export const E2E_PRODUCTION = process.env.E2E_ENV === "production";

/**
 * The APP_ENV the server under test was built with. playwright.config.ts sets it on
 * the webServer only (production for the production style run, preview otherwise),
 * so the test workers never see it in process.env. Specs read this instead of
 * calling getAppEnv(), which would fall back to "preview" in the workers.
 */
export const E2E_APP_ENV: "production" | "preview" = E2E_PRODUCTION ? "production" : "preview";

/** Not a real token: the beacon accepts any value and it only reaches Cloudflare's endpoint. */
export const DUMMY_ANALYTICS_TOKEN = "0123456789abcdef0123456789abcdef";

/** Cloudflare's published Turnstile test site key (always passes). */
export const TURNSTILE_TEST_SITE_KEY = "1x00000000000000000000AA";

/** Tag a single test that should also run against the production style build. */
export const PROD_ENV_TAG = "@prod-env";

/**
 * Spec files that run whole against the production style build: each one checks the
 * right behaviour for whichever build it runs on. Add a file here when it becomes
 * environment aware; `seo.spec.ts` (spec 0008 AC-5, AC-8) is listed ahead of landing.
 */
export const PROD_ENV_FILES = ["analytics.spec.ts", "seo.spec.ts"] as const;
