import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

import { loadContent } from "../../src/lib/content/load";
import { decodeEntities } from "../../src/lib/content/text";
import { getAppEnv } from "../../src/lib/env";

/** Project text comes from content files, so escape it before building a RegExp. */
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const WCAG_AA_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

// The same projects, in the same order, as the build under test.
const { projects } = loadContent({
  rootDir: process.cwd(),
  appEnv: getAppEnv(),
  currentYear: new Date().getFullYear(),
});

const NO_PROJECTS = "content/work has no published projects in this build";

/** The project, or a failure in this one test. Tests skip first when it can't exist. */
function need<T>(project: T | undefined): T {
  if (project === undefined) throw new Error(NO_PROJECTS);
  return project;
}

/** Plain text of each h2 in a project's rendered body: what its case study should show. */
const bodyHeadings = (html: string): string[] =>
  [...html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].map((match) =>
    decodeEntities((match[1] ?? "").replace(/<[^>]+>/g, "")).trim(),
  );

test.describe("/work (spec 0005)", () => {
  test("lists every published project in order, each card linking to its case study (AC-1, AC-2)", async ({
    page,
  }) => {
    test.skip(projects.length === 0, NO_PROJECTS);
    const first = need(projects[0]);
    await page.goto("/work");
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Work");
    await expect(page.getByText("Selected projects, newest thinking first.")).toBeVisible();
    const cards = page.getByRole("article");
    await expect(cards.getByRole("heading", { level: 2 })).toHaveText(
      projects.map((project) => project.title),
    );
    await expect(cards.first().getByRole("link")).toHaveAttribute("href", `/work/${first.slug}`);
    await expect(cards.first()).toContainText(`${first.role} · ${String(first.year)}`);
    await expect(page).toHaveTitle("Work · Toyin Ogunseinde");
  });

  test("uses 1 column on phones and 3 on desktop (AC-1)", async ({ page }) => {
    await page.goto("/work");
    const tops = await page
      .getByRole("article")
      .evaluateAll((cards) => cards.slice(0, 3).map((card) => card.getBoundingClientRect().top));
    const columns = new Set(tops.map(Math.round)).size === 1 ? 3 : 1;
    const width = page.viewportSize()?.width ?? 0;
    expect(columns).toBe(width >= 1024 ? 3 : 1);
  });

  test("has no WCAG 2.2 AA violations (AC-11)", async ({ page }) => {
    await page.goto("/work");
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("case study (spec 0005)", () => {
  test.skip(projects.length === 0, NO_PROJECTS);

  test("a card opens its case study with header, cover and body (AC-2, AC-4 to AC-6)", async ({
    page,
  }) => {
    const first = need(projects[0]);
    await page.goto("/work");
    await page.getByRole("link", { name: first.title, exact: true }).click();
    await expect(page).toHaveURL(`/work/${first.slug}`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(first.title);
    const facts = page.locator("dl");
    await expect(facts.locator("dt")).toContainText(["Role", "Year", "Tags"]);
    await expect(facts).toContainText(first.role);
    for (const link of first.links) {
      await expect(
        page.getByRole("link", { name: new RegExp(escapeRegExp(link.label)) }),
      ).toHaveAttribute("rel", "noopener noreferrer");
    }
    const cover = page.getByRole("img", { name: first.cover.alt });
    await expect(cover).toHaveAttribute("width", /\d+/);
    await expect(cover).toHaveAttribute("height", /\d+/);
    await expect(cover).not.toHaveAttribute("loading", "lazy");
    // The body's ## headings, whatever the author named them, are the page's h2s.
    await expect(page.getByRole("heading", { level: 2 })).toHaveText(bodyHeadings(first.html));
  });

  test("Work is the current nav section on a case study (spec 0004 AC-2)", async ({ page }) => {
    const first = need(projects[0]);
    await page.goto(`/work/${first.slug}`);
    const work = page.getByRole("navigation", { name: "Main" }).getByRole("link", { name: "Work" });
    await expect(work).toHaveAttribute("aria-current", "page");
  });

  test("Next project goes to the following project and wraps; Back to all work returns (AC-7)", async ({
    page,
  }) => {
    test.skip(projects.length < 2, "Next project needs two published projects");
    const first = need(projects[0]);
    const second = need(projects[1]);
    const last = need(projects.at(-1));
    await page.goto(`/work/${first.slug}`);
    await page
      .getByRole("link", { name: new RegExp(`Next project\\s*${escapeRegExp(second.title)}`) })
      .click();
    await expect(page).toHaveURL(`/work/${second.slug}`);

    await page.goto(`/work/${last.slug}`);
    await expect(
      page.getByRole("link", { name: new RegExp(`Next project\\s*${escapeRegExp(first.title)}`) }),
    ).toHaveAttribute("href", `/work/${first.slug}`);

    await page.getByRole("link", { name: "Back to all work" }).click();
    await expect(page).toHaveURL("/work");
  });

  test("sets title, description and share image from the project (AC-8)", async ({ page }) => {
    const first = need(projects[0]);
    await page.goto(`/work/${first.slug}`);
    await expect(page).toHaveTitle(`${first.title} · Toyin Ogunseinde`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      first.summary,
    );
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute(
      "content",
      new RegExp(`${escapeRegExp(first.cover.src)}$`),
    );
  });

  test("an unknown slug returns the 404 page (AC-3)", async ({ page }) => {
    const response = await page.goto("/work/does-not-exist");
    expect(response?.status()).toBe(404);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Page not found");
  });

  test("has no WCAG 2.2 AA violations (AC-11)", async ({ page }) => {
    const first = need(projects[0]);
    await page.goto(`/work/${first.slug}`);
    const results = await new AxeBuilder({ page }).withTags(WCAG_AA_TAGS).analyze();
    expect(results.violations).toEqual([]);
  });
});

test.describe("sitemap (spec 0005)", () => {
  test("lists /work and every published case study (AC-9)", async ({ request }) => {
    const body = await (await request.get("/sitemap.xml")).text();
    for (const route of ["/work", ...projects.map(({ slug }) => `/work/${slug}`)]) {
      expect(body).toContain(`<loc>https://toyinog.com${route}</loc>`);
    }
  });
});
