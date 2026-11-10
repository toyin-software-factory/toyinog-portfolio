import { expect, test } from "@playwright/test";

import { loadContent } from "../../src/lib/content/load";
import { getAppEnv } from "../../src/lib/env";

/**
 * Every content route must be prerendered HTML (spec 0001, spec 0002 AC-10).
 * The Worker can't read content/ at runtime, so a route that turned dynamic
 * would break in production. OpenNext marks a response served from the
 * prerendered cache with `x-opennext-cache: HIT`, and Next.js marks a
 * prerendered page with `x-nextjs-prerender: 1`.
 *
 * Case studies come from the content, resolved the same way as the build
 * (`getAppEnv()`), so a new project is covered without touching this file.
 * Later page tasks: add your fixed routes to FIXED_ROUTES.
 */
const FIXED_ROUTES = ["/", "/work", "/about", "/contact"];

const { projects } = loadContent({
  rootDir: process.cwd(),
  appEnv: getAppEnv(),
  currentYear: new Date().getFullYear(),
});

const CONTENT_ROUTES = [...FIXED_ROUTES, ...projects.map(({ slug }) => `/work/${slug}`)];

for (const route of CONTENT_ROUTES) {
  test(`${route} is served as prerendered HTML`, async ({ request }) => {
    const response = await request.get(route);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["x-opennext-cache"]).toBe("HIT");
    expect(response.headers()["x-nextjs-prerender"]).toBe("1");
  });
}
