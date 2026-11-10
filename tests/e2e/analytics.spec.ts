import { expect, type Page, test } from "@playwright/test";

import { DUMMY_ANALYTICS_TOKEN, E2E_PRODUCTION } from "./env";

/**
 * Visitor analytics (spec 0009). Environment aware: `pnpm test:e2e` (a preview build)
 * checks there is no beacon; `pnpm test:e2e:production` (a production style build with a
 * dummy token) checks there is exactly one. CI runs both.
 */
const BEACON = "https://static.cloudflareinsights.com/beacon.min.js";
const token = DUMMY_ANALYTICS_TOKEN;
const isProductionStyle = E2E_PRODUCTION;

const PAGES = ["/", "/work", "/about", "/contact", "/does-not-exist"];

/** Collects CSP violations from the page (event) and the console (Chromium's report). */
const watchCsp = async (page: Page): Promise<() => Promise<readonly string[]>> => {
  const fromConsole: string[] = [];
  page.on("console", (message) => {
    if (message.text().includes("Content Security Policy")) fromConsole.push(message.text());
  });
  await page.addInitScript(() => {
    const seen: string[] = [];
    (window as unknown as { cspViolations: string[] }).cspViolations = seen;
    document.addEventListener("securitypolicyviolation", (event) => {
      seen.push(`${event.violatedDirective} ${event.blockedURI}`);
    });
  });
  return async () => [
    ...fromConsole,
    ...(await page.evaluate(
      () => (window as unknown as { cspViolations?: string[] }).cspViolations ?? [],
    )),
  ];
};

/**
 * Loads a page and gives `afterInteractive` scripts time to be added after hydration.
 * (Not `networkidle`: Next keeps prefetching, so the network never goes quiet.)
 */
const SETTLE_MS = 1500;
const visit = async (page: Page, path: string) => {
  await page.goto(path, { waitUntil: "load" });
  await page.waitForTimeout(SETTLE_MS);
};

const beaconCount = (page: Page) => page.locator(`script[src="${BEACON}"]`).count();

test.describe("visitor analytics (spec 0009)", () => {
  for (const path of PAGES) {
    test(`${path}: ${isProductionStyle ? "one beacon" : "no beacon"}, no cookies, no CSP violations (AC-1 to AC-4)`, async ({
      page,
      context,
    }) => {
      const beaconRequests: string[] = [];
      page.on("request", (request) => {
        if (request.url().includes("cloudflareinsights.com")) beaconRequests.push(request.url());
      });
      const cspViolations = await watchCsp(page);

      await visit(page, path);

      if (isProductionStyle) {
        // AC-1: exactly one beacon, deferred, carrying the token.
        await expect.poll(() => beaconCount(page)).toBe(1);
        const beacon = page.locator(`script[src="${BEACON}"]`);
        await expect(beacon).toHaveAttribute("data-cf-beacon", JSON.stringify({ token }));
        expect(await beacon.evaluate((el) => (el as HTMLScriptElement).defer)).toBe(true);
        await expect.poll(() => beaconRequests.includes(BEACON)).toBe(true);
      } else {
        // AC-2: nothing rendered and nothing requested outside production.
        expect(await beaconCount(page)).toBe(0);
        expect(beaconRequests).toEqual([]);
      }

      // AC-3: no cookies on any domain, and nothing in this origin's local storage.
      expect(await context.cookies()).toEqual([]);
      expect(await page.evaluate(() => window.localStorage.length)).toBe(0);

      // AC-4: the CSP allows everything the page loads.
      expect(await cspViolations()).toEqual([]);
    });
  }

  test("the beacon is in the layout once, so client navigation doesn't add another (AC-1, AC-5)", async ({
    page,
  }) => {
    await visit(page, "/");
    await page.getByRole("banner").getByRole("link", { name: "Work" }).click();
    await expect(page).toHaveURL(/\/work$/);
    await page.waitForTimeout(SETTLE_MS);
    expect(await beaconCount(page)).toBe(isProductionStyle ? 1 : 0);
  });
});
