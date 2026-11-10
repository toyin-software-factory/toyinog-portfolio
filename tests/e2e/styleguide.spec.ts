import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("/styleguide (spec 0003)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/styleguide");
  });

  test("renders every section and is noindex (AC-6)", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1, name: "Styleguide" })).toBeVisible();
    for (const name of ["Colour", "Type", "Links and buttons", "Form fields", "Prose"]) {
      await expect(page.getByRole("region", { name })).toBeVisible();
    }
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  });

  test("has no WCAG 2.2 AA violations (AC-7)", async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("does not scroll sideways (AC-7)", async ({ page }) => {
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(overflow).toBeLessThanOrEqual(0);
  });

  test("loads fonts from the site itself, not a font host (AC-2)", async ({ page }) => {
    const external: string[] = [];
    page.on("request", (request) => {
      const url = new URL(request.url());
      if (url.hostname !== "localhost") external.push(url.href);
    });
    await page.reload();
    await page.evaluate(() => document.fonts.ready);
    expect(external).toEqual([]);
    const families = await page.evaluate(() =>
      [...document.fonts].filter((font) => font.status === "loaded").map((font) => font.family),
    );
    expect(families.join(" ")).toMatch(/Instrument Serif/);
    expect(families.join(" ")).toMatch(/Inter/);
  });

  test("skip link is first and moves focus to main (AC-5)", async ({ page }) => {
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeVisible();
    await page.keyboard.press("Enter");
    await expect(page.locator("main#main")).toBeFocused();
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
  });

  test("every focusable control shows a lemon outline and is at least 44px tall (AC-4)", async ({
    page,
  }) => {
    // Colour transitions would otherwise be measured mid fade.
    await page.emulateMedia({ reducedMotion: "reduce" });
    // Lemon from the theme, read at runtime so the test holds no raw colour.
    const accent = await page.evaluate(() => {
      const probe = document.createElement("span");
      probe.style.color = "var(--color-accent)";
      document.body.appendChild(probe);
      const value = getComputedStyle(probe).color;
      probe.remove();
      return value;
    });

    const controls = page.locator(
      "main a[href], main button:not([disabled]), main input:not([disabled]), main textarea",
    );
    const count = await controls.count();
    expect(count).toBeGreaterThan(10);

    // Tab from the top until focus leaves the last control, checking each stop.
    await page.locator("main#main").focus();
    const seen = new Set<string>();
    for (let step = 0; step < count + 5; step += 1) {
      await page.keyboard.press("Tab");
      const info = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        // A card's focus ring is drawn on the article around its link.
        const ringHost = el.closest("article") ?? el;
        const ring = getComputedStyle(ringHost);
        const box = el.getBoundingClientRect();
        const isInline = getComputedStyle(el).display === "inline";
        return {
          key: `${el.tagName}:${el.getAttribute("href") ?? ""}:${el.id}:${el.textContent.trim()}:${String(box.top)}`,
          tag: el.tagName,
          type: el.getAttribute("type"),
          isInline,
          outlineStyle: ring.outlineStyle,
          outlineWidth: ring.outlineWidth,
          outlineColor: ring.outlineColor,
          height: box.height,
        };
      });
      if (!info || seen.has(info.key)) continue;
      seen.add(info.key);
      expect.soft(info.outlineStyle, info.key).toBe("solid");
      expect.soft(info.outlineWidth, info.key).toBe("2px");
      expect.soft(info.outlineColor, info.key).toBe(accent);
      // Radios get their 44px target from the label row; inline text links use WCAG 2.5.8's inline exception.
      if (info.type !== "radio" && !info.isInline) {
        expect.soft(info.height, info.key).toBeGreaterThanOrEqual(44);
      }
    }
    expect(seen.size).toBeGreaterThan(10);
  });
});
