import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

test.describe("home page", () => {
  test("has one h1, an h2 per section, and the profile title and description (AC-5, AC-10, AC-11)", async ({
    page,
  }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Toyin Ogunseinde");
    await expect(page.getByRole("heading", { level: 2 })).toHaveText([
      "Selected work",
      "About",
      "Have a role or a project in mind?",
    ]);
    await expect(page).toHaveTitle(/^Toyin Ogunseinde · Placeholder headline/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      /^Placeholder intro/,
    );
  });

  test("hero shows the badge and both actions (AC-5)", async ({ page }) => {
    await page.goto("/");
    const hero = page.getByRole("region", { name: "Toyin Ogunseinde" });
    await expect(hero.getByText("Open to roles and projects")).toBeVisible();
    await expect(hero.getByRole("link", { name: "See my work" })).toHaveAttribute("href", "/work");
    await expect(hero.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  test("Selected work shows the 3 featured projects as cards (AC-6)", async ({ page }) => {
    await page.goto("/");
    const section = page.getByRole("region", { name: "Selected work" });
    const cards = section.getByRole("article");
    await expect(cards).toHaveCount(3);
    await expect(cards.first().getByRole("link")).toHaveAttribute("href", /^\/work\/[a-z0-9-]+$/);
    for (const image of await section.getByRole("img").all()) {
      await expect(image).toHaveAttribute("alt", /\S/);
    }
    await expect(section.getByRole("link", { name: "All work" })).toHaveAttribute("href", "/work");
  });

  test("About teaser and contact call to action link onward (AC-7, AC-8)", async ({ page }) => {
    await page.goto("/");
    const about = page.getByRole("region", { name: "About" });
    await expect(about).toContainText("at Placeholder Company");
    await expect(about.getByRole("link", { name: "More about me" })).toHaveAttribute(
      "href",
      "/about",
    );
    const cta = page.getByRole("region", { name: "Have a role or a project in mind?" });
    await expect(cta.getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  test("has no WCAG AA violations", async ({ page }) => {
    await page.goto("/");
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });

  test("sends the security headers", async ({ request }) => {
    const response = await request.get("/");
    expect(response.ok()).toBe(true);
    const headers = response.headers();
    expect(headers["content-security-policy"]).toContain("default-src 'self'");
    expect(headers["x-content-type-options"]).toBe("nosniff");
    expect(headers["referrer-policy"]).toBe("strict-origin-when-cross-origin");
    expect(headers["permissions-policy"]).toContain("camera=()");
  });
});

test.describe("crawler files", () => {
  test("robots.txt points at the sitemap", async ({ request }) => {
    const response = await request.get("/robots.txt");
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain("Sitemap: https://toyinog.com/sitemap.xml");
  });

  test("sitemap.xml lists the home page", async ({ request }) => {
    const response = await request.get("/sitemap.xml");
    expect(response.ok()).toBe(true);
    expect(await response.text()).toContain("<loc>https://toyinog.com/</loc>");
  });
});
