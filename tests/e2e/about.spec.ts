import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { loadContent } from "../../src/lib/content/load";

import { E2E_APP_ENV } from "./env";

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// The same About content as the build under test.
const { about } = loadContent({
  rootDir: process.cwd(),
  appEnv: E2E_APP_ENV,
  currentYear: new Date().getFullYear(),
});

test.describe("/about (spec 0006)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/about");
  });

  test("has the h1, then Experience and Skills sections (AC-1, AC-3, AC-4)", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("About");
    await expect(page.getByRole("region", { name: "Experience" })).toBeVisible();
    await expect(page.getByRole("region", { name: "Skills" })).toBeVisible();
    await expect(
      page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "About" }),
    ).toHaveAttribute("aria-current", "page");
  });

  test("puts the 4:5 photo beside the bio on desktop and above it on phones (AC-1, AC-2)", async ({
    page,
  }) => {
    const photo = page.getByRole("img", { name: about.photo.alt });
    const bio = page.locator(".prose").first();
    const [photoBox, bioBox] = [await photo.boundingBox(), await bio.boundingBox()];
    if (!photoBox || !bioBox) throw new Error("photo or bio not rendered");

    expect(photoBox.width / photoBox.height).toBeCloseTo(0.8, 1);
    const wide = (page.viewportSize()?.width ?? 0) >= 768;
    if (wide) {
      expect(bioBox.x).toBeGreaterThanOrEqual(photoBox.x + photoBox.width);
    } else {
      expect(bioBox.y).toBeGreaterThanOrEqual(photoBox.y + photoBox.height);
    }
  });

  test("lists roles newest first with date ranges and highlights (AC-3)", async ({ page }) => {
    const list = page.getByRole("region", { name: "Experience" }).locator("ol");
    await expect(list.getByRole("heading", { level: 3 })).toHaveText(
      about.experience.map((entry) => entry.role),
    );
    await expect(list.locator("time").first()).toHaveAttribute(
      "datetime",
      about.experience[0]?.start ?? "",
    );
  });

  test("shows each skill group with its skills as tags (AC-4)", async ({ page }) => {
    for (const group of about.skillGroups) {
      await expect(page.getByRole("list", { name: group.name }).getByRole("listitem")).toHaveText(
        group.skills,
      );
    }
  });

  test("downloads the CV as Toyin-Ogunseinde-CV.pdf, from either button (AC-5)", async ({
    page,
  }) => {
    const buttons = page.getByRole("link", { name: "Download CV (PDF)" });
    await expect(buttons).toHaveCount(2);
    await expect(page.getByText(/^Last updated /).first()).toBeVisible();

    for (const index of [0, 1]) {
      const [download] = await Promise.all([
        page.waitForEvent("download"),
        buttons.nth(index).click(),
      ]);
      expect(download.suggestedFilename()).toBe("Toyin-Ogunseinde-CV.pdf");
    }
  });

  test("the CV file is served as a PDF (AC-5)", async ({ request }) => {
    const response = await request.get(about.cv.file);
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("application/pdf");
    expect((await response.body()).subarray(0, 5).toString()).toBe("%PDF-");
  });

  test("sets the title and a short description, and is in the sitemap (AC-6)", async ({
    page,
    request,
  }) => {
    await expect(page).toHaveTitle("About · Toyin Ogunseinde");
    const description = await page.locator('meta[name="description"]').getAttribute("content");
    expect(description?.length ?? 0).toBeGreaterThan(0);
    expect(description?.length ?? 0).toBeLessThanOrEqual(160);
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("<loc>https://toyinog.com/about</loc>");
  });

  test("has no WCAG 2.2 AA violations (AC-7)", async ({ page }) => {
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});
