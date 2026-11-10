import { expect, test } from "@playwright/test";

import { E2E_APP_ENV } from "./env";

/**
 * Spec 0004 AC-12: a route rendered at request time on Workers gets the full
 * shell without reading content/ (the layout takes profile values from a module
 * generated at build time). /dynamic-check exists only outside production.
 */
test.describe("shell on a dynamic route (spec 0004 AC-12)", () => {
  test.skip(E2E_APP_ENV === "production", "/dynamic-check is a 404 in production builds");

  test("returns 200, rendered on request, with the header and footer", async ({ page }) => {
    const response = await page.goto("/dynamic-check");

    expect(response?.status()).toBe(200);
    // Not served from the prerendered cache: this page was rendered for this request.
    expect(response?.headers()["x-nextjs-prerender"]).toBeUndefined();
    expect(response?.headers()["x-opennext-cache"]).not.toBe("HIT");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Dynamic check");
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("link", { name: "Toyin Ogunseinde" })).toHaveAttribute(
      "href",
      "/",
    );
    await expect(banner.getByRole("navigation", { name: "Main" }).getByRole("link")).toHaveText([
      "Work",
      "About",
      "Contact",
    ]);
    const footer = page.getByRole("contentinfo");
    await expect(footer).toContainText(`© ${String(new Date().getFullYear())} Toyin Ogunseinde`);
    await expect(footer.getByRole("link", { name: "Email" })).toHaveAttribute("href", /^mailto:/);
    await expect(page).toHaveTitle("Dynamic check · Toyin Ogunseinde");
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("renders fresh on each request", async ({ request }) => {
    const stamp = async () =>
      /dateTime="([^"]+)"/i.exec(await (await request.get("/dynamic-check")).text())?.[1];
    const first = await stamp();
    const second = await stamp();
    expect(first).toBeDefined();
    expect(second).not.toBe(first);
  });
});
