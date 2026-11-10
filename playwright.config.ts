import { defineConfig, devices } from "@playwright/test";

import {
  DUMMY_ANALYTICS_TOKEN,
  E2E_PRODUCTION,
  PROD_ENV_FILES,
  PROD_ENV_TAG,
  TURNSTILE_TEST_SITE_KEY,
} from "./tests/e2e/env";

// The production style run gets its own port, so it never reuses a preview server.
const PORT = E2E_PRODUCTION ? 8788 : 8787;
const baseURL = `http://localhost:${String(PORT)}`;
const isCI = Boolean(process.env.CI);

const escape = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** Playwright matches `grep` against the file path and title (tags included). */
const prodEnvOnly = new RegExp(
  [...PROD_ENV_FILES.map((file) => `\\b${escape(file)}\\b`), escape(PROD_ENV_TAG)].join("|"),
);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  grep: E2E_PRODUCTION ? prodEnvOnly : undefined,
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [
    {
      name: "desktop",
      use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 7"], viewport: { width: 390, height: 844 } },
    },
  ],
  // The real Workers runtime (OpenNext build + wrangler), not `next dev`.
  webServer: {
    command: `pnpm preview --port ${String(PORT)}`,
    url: baseURL,
    // A production style run always builds fresh, so it never tests a preview build.
    reuseExistingServer: !isCI && !E2E_PRODUCTION,
    timeout: 300_000,
    stdout: "pipe",
    env: E2E_PRODUCTION
      ? {
          APP_ENV: "production",
          NEXT_PUBLIC_CF_ANALYTICS_TOKEN: DUMMY_ANALYTICS_TOKEN,
          NEXT_PUBLIC_TURNSTILE_SITE_KEY: TURNSTILE_TEST_SITE_KEY,
        }
      : { APP_ENV: "preview" },
  },
});
