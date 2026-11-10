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

  test("buttons are at least 44 by 44 and each radio row is a 44px target (AC-4)", async ({
    page,
  }) => {
    const buttons = page.locator("main button:not([disabled]), main a.inline-flex");
    expect(await buttons.count()).toBeGreaterThan(3);
    for (const box of await buttons.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect()),
    )) {
      expect.soft(box.width).toBeGreaterThanOrEqual(44);
      expect.soft(box.height).toBeGreaterThanOrEqual(44);
    }
    // The label wraps the radio, so the whole row is the touch target.
    const rows = page.locator("main fieldset label:has(input[type=radio])");
    expect(await rows.count()).toBeGreaterThan(1);
    for (const height of await rows.evaluateAll((els) =>
      els.map((el) => el.getBoundingClientRect().height),
    )) {
      expect.soft(height).toBeGreaterThanOrEqual(44);
    }
  });

  test("radio groups work with the keyboard: Tab in, arrow keys move the choice (AC-4)", async ({
    page,
  }) => {
    const group = page.getByRole("group", { name: "What brings you here?" });
    const radios = group.getByRole("radio");
    await radios.first().focus();
    await expect(radios.first()).toBeChecked();
    await page.keyboard.press("ArrowDown");
    await expect(radios.nth(1)).toBeChecked();
    await expect(radios.nth(1)).toBeFocused();
    await page.keyboard.press("ArrowUp");
    await expect(radios.first()).toBeChecked();
  });

  test("with reduced motion nothing animates; otherwise colours ease over 150ms (AC-5)", async ({
    page,
  }) => {
    const button = page.locator("main button:not([disabled])").first();
    const timing = () =>
      button.evaluate((el) => {
        const style = getComputedStyle(el);
        return `${style.transitionProperty} ${style.transitionDuration}`;
      });

    expect(await timing()).toMatch(/color.* 0\.15s/);
    await page.emulateMedia({ reducedMotion: "reduce" });
    expect(await timing()).toMatch(/^(none|all) 0s$/);
  });

  test("Prose keeps a 42rem reading width and styles Markdown with tokens (AC-8)", async ({
    page,
  }) => {
    const prose = page.locator("main .prose").first();
    const styles = await prose.evaluate((el) => {
      const rem = parseFloat(getComputedStyle(document.documentElement).fontSize);
      const token = (name: string) => {
        const probe = document.createElement("span");
        probe.style.color = `var(${name})`;
        document.body.appendChild(probe);
        const value = getComputedStyle(probe).color;
        probe.remove();
        return value;
      };
      const pick = (selector: string) => {
        const found = el.querySelector(selector);
        return found ? getComputedStyle(found) : null;
      };
      return {
        maxWidthRem: parseFloat(getComputedStyle(el).maxWidth) / rem,
        link: pick("a")?.color,
        accent: token("--color-accent"),
        blockquoteBorder: pick("blockquote")?.borderLeftColor,
        codeBackground: pick("pre")?.backgroundColor,
        surface: (() => {
          const probe = document.createElement("span");
          probe.style.backgroundColor = "var(--color-surface)";
          document.body.appendChild(probe);
          const value = getComputedStyle(probe).backgroundColor;
          probe.remove();
          return value;
        })(),
        h2Font: pick("h2")?.fontFamily,
        listStyle: pick("ul")?.listStyleType,
      };
    });

    expect(styles.maxWidthRem).toBe(42);
    expect(styles.link).toBe(styles.accent);
    expect(styles.blockquoteBorder).toBe(styles.accent);
    expect(styles.codeBackground).toBe(styles.surface);
    expect(styles.h2Font).toMatch(/Instrument Serif/i);
    expect(styles.listStyle).toBe("disc");
  });
});
