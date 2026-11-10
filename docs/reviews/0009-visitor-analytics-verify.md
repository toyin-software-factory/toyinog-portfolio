# Verify: Visitor analytics · spec 0009

**Verdict**: PASS (6 of 6 acceptance criteria met; one gap found on `/contact` and fixed in this PR)
**Date**: 2026-11-10
**Task**: RLR-T02 · branch `rlr-t02`
**Approach**: Skateboard. The beacon is real code, but it only goes live once Toyin creates the Web Analytics site and sets `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` at go live. So this run proves the production behaviour on a production style build with a dummy token, and the preview behaviour on the normal build.

## How it was run

- **Preview case (what CI runs)**: `pnpm test:e2e`, Playwright against `pnpm preview` (Workers runtime, `APP_ENV=preview`), desktop and mobile. 140 passed, including `tests/e2e/analytics.spec.ts`.
- **Production style case (by hand)**: `APP_ENV=production NEXT_PUBLIC_CF_ANALYTICS_TOKEN=<dummy> pnpm exec playwright test analytics`, which builds and serves a production build. The real beacon loads from `static.cloudflareinsights.com`.
- **Lighthouse 13.6.0**, mobile, performance only, Home, 5 runs each: the local production style `pnpm preview` (beacon present) and the Workers preview `https://rlr-t02-toyinog-portfolio.jnr4u2.workers.dev` (no beacon).
- **Unit**: `src/components/site/Analytics.test.tsx`.

## Acceptance criteria

| AC | Verdict | Evidence |
|---|---|---|
| AC-1 | met ✅ | Production style e2e on `/`, `/work`, `/about`, `/contact` and a 404, at both widths: exactly one `script[src="https://static.cloudflareinsights.com/beacon.min.js"]`, `defer`, `data-cf-beacon='{"token":"<dummy>"}'`, and the script is fetched. Client navigation from Home to Work keeps one beacon. It comes from the root layout (`<Analytics />`) through `next/script` `afterInteractive` (unit test checks the props). The prerendered `/contact/sent` carries it too. |
| AC-2 | met ✅ | Preview e2e on the same pages: no beacon element and no request to `cloudflareinsights.com`. Unit tests: nothing rendered for a preview build with a token, production without a token, or production with a blank token. |
| AC-3 | met ✅ | Production style e2e, after the beacon loaded and reported: `context.cookies()` is empty (all domains) and `localStorage` is empty, on every page and width. |
| AC-4 | met ✅, after a fix | Every page in both runs: no `securitypolicyviolation` events and no CSP console errors. Lighthouse's network log shows the beacon (10,478 B, 200) and its report to `https://cloudflareinsights.com/cdn-cgi/rum` (200), so `script-src` and `connect-src` allow both. **Gap found and fixed**: `/contact` logged `script-src` blocked `eval` in both builds, from zod 4's one-time `Function("")` probe. Zod was in the browser only because `ContactForm.tsx` imported constants from `schema.ts`. The constants now live in the zod-free `src/lib/contact/fields.ts`, and `noZodInClient.test.ts` keeps zod out of every client component. |
| AC-5 | met ✅ | No custom events: `Analytics` renders only the beacon, and nothing else in `src/` calls it. The conversion is a page view of `/contact/sent`, which spec 0007 gates with the one-time cookie. |
| AC-6 | met ✅ | Mobile performance on Home. Local production style with the beacon: 89, 91, 97, 98, 100, **median 97**. Workers preview without the beacon: 90, 92, 93, 97, 98, **median 93**. FCP and LCP 0.8 s locally and 1.0 s on the preview, CLS 0. The spread comes from total blocking time on a shared sandbox CPU, not from the beacon. It is checked again on toyinog.com at go live. |

## Specced surfaces

- `src/components/site/Analytics.tsx`, rendered from `src/app/layout.tsx`: built.
- CSP entries for `static.cloudflareinsights.com` and `cloudflareinsights.com` (from spec 0001): present and exercised.

Missing: none. Not applied: none.

## Owed outside the code

- Toyin creates the Web Analytics site for `toyinog.com` and sets `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` as a Workers Builds build variable at go live. Until then production renders no beacon (AC-2's "token missing" case).
