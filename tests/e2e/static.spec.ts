import { expect, test } from "@playwright/test";

/**
 * Every content route must be prerendered HTML (spec 0001, spec 0002 AC-10).
 * The Worker can't read content/ at runtime, so a route that turned dynamic
 * would break in production. OpenNext marks a response served from the
 * prerendered cache with `x-opennext-cache: HIT`, and Next.js marks a
 * prerendered page with `x-nextjs-prerender: 1`.
 *
 * Later page tasks: add your content routes here. When the case study route
 * exists, add `/work/<slug>` for every published project, derived from the
 * content (for example `loadContent()` from src/lib/content/load.ts with
 * appEnv "preview"), so new projects are covered automatically.
 */
const CONTENT_ROUTES = ["/"];

for (const route of CONTENT_ROUTES) {
  test(`${route} is served as prerendered HTML`, async ({ request }) => {
    const response = await request.get(route);

    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("text/html");
    expect(response.headers()["x-opennext-cache"]).toBe("HIT");
    expect(response.headers()["x-nextjs-prerender"]).toBe("1");
  });
}
