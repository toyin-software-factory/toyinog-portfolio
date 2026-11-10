# /check verify launch guards (spec 0010 AC-1, AC-1b, AC-1c) · PASS

**Date**: 2026-11-10 · **Spec**: [0010](../specs/0010-real-content-go-live.md), AC-1 as amended in #41 · **Scope**: feature 11, first milestone · **Run by**: Dwight, RLR-T03

**PASS: AC-1, AC-1b and AC-1c met.** The rest of spec 0010 (real content, launch) comes in later tasks. The CI step `APP_ENV=production pnpm content:check` runs and reports today's 39 placeholder hits without blocking. The content task makes it required.

## How it was run

- `pnpm test`: 271 passed. The guard tests are `src/lib/content/guards.test.ts`; `load.test.ts`, `check.test.ts` and `generate.test.ts` cover launch guards; `src/lib/seo/seo.test.ts` covers `isIndexable` and robots, launched and not launched.
- `pnpm test:e2e:production` (production style build, as in CI): 25 passed, 1 skipped (the per page sweep on mobile, by design). It printed `[seo] production build (not indexable), 7 sitemap pages checked:`.
- `pnpm test:e2e` (preview): 151 passed, 1 skipped.
- `APP_ENV=production pnpm preview` with `curl` for robots and headers, and `content:check` in both environments (output below).

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-1 | met | `src/lib/content/guards.ts` scans every front matter string (nested, with field paths such as `links[0].url`), every Markdown body, and every file name under `public/images` and `public/cv` for `placeholder` and `example.com`, case insensitive. It runs inside `loadContent`, so `content:generate`, `next build` and `content:check` all use it. **Strict** when `isIndexable()` (production and `SITE_LAUNCHED`): `load.test.ts` mocks `SITE_LAUNCHED = true` and a fixture with a placeholder `cover.alt` fails, naming `content/work/alpha.md` and `cover.alt`. Strict also in `content:check` with `APP_ENV=production`: `check.test.ts` gets exit 1 naming the file and field. A marker in a file name fails too (`load.test.ts`). **Warns** everywhere else: preview, and production before launch (`load.test.ts`, and `generate.test.ts`, where the real build entry exits 0). The production style e2e build printed all 39 hits and passed. |
| AC-1b | met | Covers over 300 KB, the photo over 250 KB and the CV over 5 MB fail in preview and in production (`load.test.ts`, `generate.test.ts`). Messages give the size and the limit, for example `points to /c.webp, which is 300 KB. The limit is 300 KB. Export it smaller`. |
| AC-1c | met | `SITE_LAUNCHED = false` in `src/lib/seo/site.ts` feeds `isIndexable()`, which `robots.ts`, the root metadata and `next.config.ts` share. On a production build: `robots.txt` has `Allow: /` with no sitemap, and every page has the `noindex` meta and `X-Robots-Tag: noindex` (below). The production style e2e checks the same on all 7 sitemap pages. With `SITE_LAUNCHED = true` (mocked in `seo.test.ts`), robots lists the sitemap. `site.ts` no longer imports the generated profile module (that moved to `brand.ts`), so `content:generate` works on a fresh checkout. |

## content:check by environment

```text
$ APP_ENV=production pnpm content:check
The content in content/ has 39 problems. Fix them and build again.

content/work/analytics-dashboard.md
  - title: contains "placeholder". Replace it with real content before it goes live
  - summary: contains "placeholder". Replace it with real content before it goes live
  - cover.alt: contains "placeholder". Replace it with real content before it goes live
  - body: contains "placeholder". Replace it with real content before it goes live

  … (39 hits in all)
exit code: 1

$ pnpm content:check   (preview)
warning: 39 placeholder hits (they fail `APP_ENV=production pnpm content:check` and the launched production build, spec 0010 AC-1):
warning:   content/work/analytics-dashboard.md · title: contains "placeholder". Replace it with real content before it goes live
Content OK (preview): 4 projects visible (1 draft), profile and about valid.
exit code: 0
```

## Production build before launch (SITE_LAUNCHED = false)

```text
== APP_ENV=production pnpm preview, SITE_LAUNCHED = false
-- robots.txt
User-Agent: *
Allow: /


-- X-Robots-Tag and robots meta
/                      X-Robots-Tag: noindex | <meta name="robots" content="noindex"/>
/work                  X-Robots-Tag: noindex | <meta name="robots" content="noindex"/>
/about                 X-Robots-Tag: noindex | <meta name="robots" content="noindex"/>
/work/design-system    X-Robots-Tag: noindex | <meta name="robots" content="noindex"/>
```

## For /check review

- During `next build` the warning list prints once per build worker (three times locally). It's noisy but harmless. If it gets in the way, the warning could print once from `content:generate` instead.
- Spec 0010's "Critical test scenarios" still describe a production build failing on a marker. Under the amended AC-1 that only happens once launched, which is what the tests cover. One line there could be updated.
