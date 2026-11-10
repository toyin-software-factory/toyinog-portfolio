import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("site shell (spec 0004)", () => {
  test("header, Main nav, main and footer are in order (AC-1)", async ({ page }) => {
    await page.goto("/");
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
    await expect(page.locator("body > header + main#main + footer")).toHaveCount(1);
    await expect(page.getByRole("contentinfo")).toBeVisible();
  });

  test("tab order is skip link, name, Work, About, Contact, then main (AC-1)", async ({ page }) => {
    await page.goto("/");
    const expected = ["Skip to content", "Toyin Ogunseinde", "Work", "About", "Contact"];
    for (const name of expected) {
      await page.keyboard.press("Tab");
      await expect(page.getByRole("link", { name, exact: true }).first()).toBeFocused();
    }
    await page.keyboard.press("Tab");
    const focusedInMain = await page.evaluate(
      () => document.activeElement?.closest("main") !== null,
    );
    expect(focusedInMain).toBe(true);
  });

  test("no nav link is marked current on Home (AC-2)", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[aria-current="page"]')).toHaveCount(0);
  });

  // /work and /work/<slug> are prebuilt by later tasks. Until then they serve the
  // prebuilt 404 page, which has no current section, so those paths are skipped
  // and this test starts checking them by itself once they ship. The matching rule
  // is unit tested in src/components/site/site.test.tsx.
  for (const path of ["/work", "/work/design-system"]) {
    test(`Work is marked current on ${path} (AC-2)`, async ({ page }) => {
      const response = await page.goto(path);
      test.skip(response?.status() === 404, `${path} isn't built yet`);
      const nav = page.getByRole("navigation", { name: "Main" });
      const work = nav.getByRole("link", { name: "Work" });
      await expect(work).toHaveAttribute("aria-current", "page");
      await expect(work).toHaveCSS("text-decoration-line", "underline");
      await expect(nav.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
    });
  }

  test("header fits at any width: no sideways scroll, no menu button, 44px targets (AC-3)", async ({
    page,
  }) => {
    await page.goto("/");
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
    const banner = page.getByRole("banner");
    await expect(banner.getByRole("button")).toHaveCount(0);
    for (const link of await banner.getByRole("link").all()) {
      await expect(link).toBeVisible();
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
      expect(box?.width).toBeGreaterThanOrEqual(44);
    }
    // Name plus links take at most two rows.
    const bannerBox = await banner.boundingBox();
    expect(bannerBox?.height).toBeLessThanOrEqual(2 * 44 + 48);
  });

  test("footer shows links and copyright, and Back to top moves focus up (AC-4)", async ({
    page,
  }) => {
    await page.goto("/");
    const footer = page.getByRole("contentinfo");
    await expect(footer.getByRole("link", { name: /LinkedIn/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(footer.getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "rel",
      "noopener noreferrer",
    );
    await expect(footer.getByRole("link", { name: "Email" })).toHaveAttribute("href", /^mailto:/);
    await expect(footer).toContainText(`© ${String(new Date().getFullYear())} Toyin Ogunseinde`);

    const backToTop = footer.getByRole("link", { name: "Back to top" });
    await backToTop.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("banner")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("link", { name: "Toyin Ogunseinde" }).first()).toBeFocused();
  });
});

test.describe("not found page (spec 0004)", () => {
  test("an unknown URL returns 404 with the styled page in the shell (AC-9)", async ({ page }) => {
    const response = await page.goto("/this-page-does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
    await expect(page.getByRole("link", { name: "Go to Home" })).toHaveAttribute("href", "/");
    await expect(page.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "/work");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    await expect(page).toHaveTitle("Page not found · Toyin Ogunseinde");
  });

  test("has no WCAG 2.2 AA violations (AC-11)", async ({ page }) => {
    await page.goto("/this-page-does-not-exist");
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
