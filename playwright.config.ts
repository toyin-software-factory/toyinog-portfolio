import { defineConfig, devices } from "@playwright/test";

const PORT = 8787;
const baseURL = `http://localhost:${String(PORT)}`;
const isCI = Boolean(process.env.CI);

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 1 : 0,
  reporter: isCI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
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
    command: "pnpm preview",
    url: baseURL,
    reuseExistingServer: !isCI,
    timeout: 300_000,
    stdout: "pipe",
  },
});
