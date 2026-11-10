import { expect, type Page, test } from "@playwright/test";

import { isIndexable } from "../../src/lib/seo/indexing";

import { E2E_APP_ENV } from "./env";

/**
 * Spec 0008 AC-8: every URL in the sitemap gets checked for AC-1 to AC-4. The
 * expectations follow the environment the build under test was made for
 * (`E2E_APP_ENV` from ./env.ts), so this runs on the preview build and on the
 * production style build (`pnpm test:e2e:production`).
 */

const SITE = "https://toyinog.com";
const indexable = isIndexable(E2E_APP_ENV);

type PageSeo = {
  path: string;
  title: string;
  description: string;
  canonical: string | null;
  og: Record<string, string>;
  twitterCard: string | null;
  robots: string | null;
  /** The X-Robots-Tag response header, if any. */
  robotsHeader: string | null;
  jsonLd: unknown[];
};

async function readSeo(page: Page, path: string): Promise<PageSeo> {
  const response = await page.goto(path);
  expect(response?.status(), `${path} status`).toBe(200);
  return {
    path,
    robotsHeader: response?.headers()["x-robots-tag"] ?? null,
    title: await page.title(),
    ...(await page.evaluate(() => {
      const meta = (selector: string) =>
        document.querySelector(selector)?.getAttribute("content") ?? null;
      const og: Record<string, string> = {};
      for (const tag of document.querySelectorAll('meta[property^="og:"]')) {
        const key = tag.getAttribute("property") ?? "";
        if (!(key in og)) og[key] = tag.getAttribute("content") ?? "";
      }
      return {
        description: meta('meta[name="description"]') ?? "",
        canonical: document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null,
        og,
        twitterCard: meta('meta[name="twitter:card"]'),
        robots: meta('meta[name="robots"]'),
        jsonLd: [...document.querySelectorAll('script[type="application/ld+json"]')].map(
          (script) => JSON.parse(script.textContent) as unknown,
        ),
      };
    })),
  };
}

/** Every JSON-LD node on a page, flattening arrays. */
const nodes = (jsonLd: unknown[]): Record<string, unknown>[] =>
  jsonLd
    .flat()
    .filter((node): node is Record<string, unknown> => typeof node === "object" && node !== null);

/** The minimal schema.org shape AC-4 asks for, per type. Returns problems, empty when valid. */
function jsonLdProblems(node: Record<string, unknown>): string[] {
  const problems: string[] = [];
  const need = (key: string) => {
    if (node[key] === undefined || node[key] === "")
      problems.push(`${String(node["@type"])} has no ${key}`);
  };
  if (node["@context"] !== "https://schema.org") problems.push("@context isn't https://schema.org");
  const absolute = (key: string) => {
    if (typeof node[key] === "string" && !node[key].startsWith(`${SITE}/`)) {
      problems.push(`${String(node["@type"])} ${key} isn't an absolute ${SITE} URL`);
    }
  };
  switch (node["@type"]) {
    case "Person":
      ["name", "jobTitle", "url", "image", "sameAs"].forEach(need);
      ["url", "image"].forEach(absolute);
      break;
    case "WebSite":
      ["name", "url"].forEach(need);
      absolute("url");
      break;
    case "CreativeWork":
      ["name", "description", "image", "dateCreated", "author", "url"].forEach(need);
      ["url", "image"].forEach(absolute);
      if (typeof node.author === "object" && node.author !== null) {
        problems.push(...jsonLdProblems({ "@context": "https://schema.org", ...node.author }));
      }
      break;
    default:
      problems.push(`unexpected @type ${String(node["@type"])}`);
  }
  return problems;
}

/** Compares URLs whether or not the root keeps its trailing slash. */
const trimSlash = (url: string | null) => (url ?? "").replace(/\/$/, "");

let sitemapPaths: string[] = [];

test.beforeAll(async ({ request }) => {
  const xml = await (await request.get("/sitemap.xml")).text();
  sitemapPaths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(
    ([, loc]) => new URL(loc ?? "").pathname,
  );
});

test.describe("sitemap and robots (spec 0008 AC-5, AC-6)", () => {
  // Guards against the test workers and the server disagreeing about the build
  // (main went red when they did): /dynamic-check exists only outside production.
  test(`the server under test is a ${E2E_APP_ENV} build`, async ({ request }) => {
    const status = (await request.get("/dynamic-check")).status();
    expect(status).toBe(E2E_APP_ENV === "production" ? 404 : 200);
  });

  test("the sitemap lists the public pages with lastmod, and nothing private", async ({
    request,
  }) => {
    const xml = await (await request.get("/sitemap.xml")).text();
    expect(sitemapPaths).toEqual(expect.arrayContaining(["/", "/work", "/about", "/contact"]));
    expect(sitemapPaths.some((path) => path.startsWith("/work/"))).toBe(true);
    for (const hidden of ["/contact/sent", "/styleguide", "/dynamic-check"]) {
      expect(sitemapPaths).not.toContain(hidden);
    }
    expect(xml.match(/<lastmod>/g)?.length).toBe(sitemapPaths.length);
  });

  test(`robots.txt ${indexable ? "allows indexing and lists the sitemap" : "allows crawling with no sitemap"} in this build`, async ({
    request,
  }) => {
    const body = await (await request.get("/robots.txt")).text();
    // Never Disallow: crawlers have to read the pages to see their noindex (AC-5).
    expect(body).toContain("Allow: /");
    expect(body).not.toContain("Disallow:");
    if (indexable) expect(body).toContain(`Sitemap: ${SITE}/sitemap.xml`);
    else expect(body).not.toContain("Sitemap:");
  });

  test("/contact/sent stays out of search", async ({ request }) => {
    // Without the sent cookie the middleware redirects; the noindex is on the page itself.
    const html = await (await request.get("/contact/sent", { maxRedirects: 0 })).text();
    expect(html.includes("noindex") || html === "").toBe(true);
  });
});

test.describe("every sitemap page (spec 0008 AC-8)", () => {
  // One browser width is enough: these are head tags, not layout.
  test.skip(({ isMobile }) => isMobile, "head tags don't change with the viewport");

  test("has a canonical, a unique title and description, share tags and valid JSON-LD (AC-1 to AC-4)", async ({
    page,
    request,
  }) => {
    test.setTimeout(120_000);
    expect(sitemapPaths.length).toBeGreaterThan(4);
    const pages: PageSeo[] = [];
    for (const path of sitemapPaths) pages.push(await readSeo(page, path));

    for (const seo of pages) {
      const where = `on ${seo.path}`;
      // AC-1: canonical is this page on the production origin.
      expect(trimSlash(seo.canonical), where).toBe(trimSlash(`${SITE}${seo.path}`));
      // AC-2: description length.
      expect(seo.description.length, `description length ${where}`).toBeGreaterThanOrEqual(50);
      expect(seo.description.length, `description length ${where}`).toBeLessThanOrEqual(160);
      // AC-3: Open Graph and Twitter.
      for (const key of [
        "og:title",
        "og:description",
        "og:url",
        "og:type",
        "og:image",
        "og:site_name",
      ]) {
        expect(seo.og[key], `${key} ${where}`).toBeTruthy();
      }
      expect(trimSlash(seo.og["og:url"] ?? ""), where).toBe(trimSlash(`${SITE}${seo.path}`));
      expect(seo.og["og:site_name"], where).toBe("Toyin Ogunseinde");
      expect(seo.twitterCard, where).toBe("summary_large_image");
      const image = new URL(seo.og["og:image"] ?? "");
      expect(image.origin, where).toBe(SITE);
      expect((await request.get(image.pathname)).status(), `og:image ${where}`).toBe(200);
      if (seo.path.startsWith("/work/")) {
        expect(image.pathname, where).toMatch(/^\/images\/work\//);
        // The cover at its real size (AC-3).
        expect(Number(seo.og["og:image:width"]), `og:image:width ${where}`).toBeGreaterThan(0);
        expect(Number(seo.og["og:image:height"]), `og:image:height ${where}`).toBeGreaterThan(0);
      } else {
        expect(image.pathname, where).toBe("/og/default.png");
        expect(seo.og["og:image:width"], where).toBe("1200");
        expect(seo.og["og:image:height"], where).toBe("630");
      }
      // AC-5: previews say noindex in a meta tag and an X-Robots-Tag header; production says neither.
      if (indexable) {
        expect(seo.robots, where).toBeNull();
        expect(seo.robotsHeader, `X-Robots-Tag ${where}`).toBeNull();
      } else {
        expect(seo.robots, where).toContain("noindex");
        expect(seo.robotsHeader, `X-Robots-Tag ${where}`).toBe("noindex");
      }
      // AC-4: JSON-LD.
      const types = nodes(seo.jsonLd).map((node) => node["@type"]);
      if (seo.path === "/") expect(types, where).toEqual(["WebSite", "Person"]);
      if (seo.path === "/about") expect(types, where).toEqual(["Person"]);
      if (seo.path.startsWith("/work/")) expect(types, where).toEqual(["CreativeWork"]);
      for (const node of nodes(seo.jsonLd)) expect(jsonLdProblems(node), where).toEqual([]);
    }

    // AC-2: unique titles and descriptions across the site.
    const titles = pages.map((seo) => seo.title);
    const descriptions = pages.map((seo) => seo.description);
    expect(new Set(titles).size, `titles: ${titles.join(" | ")}`).toBe(titles.length);
    expect(new Set(descriptions).size, "descriptions are unique").toBe(descriptions.length);

    // Logged for the PR proof.
    console.log(
      `[seo] ${E2E_APP_ENV} build (${indexable ? "indexable" : "not indexable"}), ${String(pages.length)} sitemap pages checked:\n` +
        pages
          .map(
            (seo) =>
              `  ${seo.path}  "${seo.title}"  (${String(seo.description.length)} chars)  og:image ${new URL(seo.og["og:image"] ?? "").pathname} ${seo.og["og:image:width"] ?? "?"}x${seo.og["og:image:height"] ?? "?"}  x-robots-tag ${seo.robotsHeader ?? "none"}  json-ld ${
                nodes(seo.jsonLd)
                  .map((n) => String(n["@type"]))
                  .join("+") || "none"
              }`,
          )
          .join("\n"),
    );
  });
});

test.describe("icons (spec 0008 AC-7)", () => {
  test("serves the SVG favicon and the 180 by 180 Apple touch icon", async ({ page, request }) => {
    await page.goto("/");
    const icon = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute("href");
    const apple = page.locator('link[rel="apple-touch-icon"]');
    await expect(apple).toHaveAttribute("sizes", "180x180");
    for (const href of [icon, await apple.getAttribute("href")]) {
      expect(href).toBeTruthy();
      expect((await request.get(href ?? "")).status()).toBe(200);
    }
  });
});
