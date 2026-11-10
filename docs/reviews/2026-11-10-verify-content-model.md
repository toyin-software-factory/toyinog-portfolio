# /check verify content model · PASS

**Date**: 2026-11-10 · **Spec**: [0002](../specs/0002-content-model.md) · **Scope**: feature 3 · **Run by**: Dwight, during RR1-T01

**PASS: all 10 acceptance criteria met on the real app and content.** AC-4 was partly verified on the first run (the routes and sitemap didn't exist yet). It was completed in RR1-T02 on a production build; see [AC-4 re-run](#ac-4-re-run-rr1-t02-2026-11-10) below.

Next: `/test content model` for any gaps, then `/document`.

## How it was run

- `pnpm content:check` on the real content, with `APP_ENV=production` and `APP_ENV=preview`.
- The real content broken on purpose (7 edits across 3 files, restored with `git checkout content/` afterwards), then `pnpm content:check`, `pnpm build` and `pnpm test` run against it.
- A throwaway `tsx` probe calling `loadContent()` and `renderMarkdown()` on the real files (deleted after).
- `pnpm preview` (OpenNext build on the local Workers runtime) and `curl` for response headers. `pnpm test:e2e` (static route check) in the same session.

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-1 | met | Probe: 4 projects parsed, slugs from filenames (`design-system`, `checkout-redesign`, `analytics-dashboard`, `marketing-site`), typed fields `title, summary, role, client, year, tags, cover, links, featured, order, draft, slug, body, html`. |
| AC-2 | met | Probe: profile has `name, headline, intro, location, availability, links, email`. About has 3 experience entries, 3 skill groups and a CV. |
| AC-3 | met | Broken content: `content:check`, `pnpm build` and `pnpm test` all exit 1. One message names each file and field in plain words, for example `content/pages/profile.md · headline: should be text, but it is the number 42`, `locaton: is not a known field. Check the spelling, or remove it`, `cv.file: points to a file that does not exist`, `cv.updated: should be a month written as YYYY-MM`. The build fails while prerendering `/` with the same `ContentError`. |
| AC-4 | met | Loader: `APP_ENV=production pnpm content:check` gives `3 projects visible`. `APP_ENV=preview` gives `4 projects visible (1 draft)`. The probe shows `marketing-site` with `draft true` in preview. Routes and sitemap: see the re-run below. |
| AC-5 | met | Probe order: design-system (order 1), checkout-redesign (2), analytics-dashboard (3), marketing-site (4). Featured: the first three, same order. |
| AC-6 | met | Turning the draft into a 4th featured project fails with `featured: 4 published projects are featured (…), but at most 3 can be`. Duplicate slugs can't be produced from real filenames (the slug is the filename), so that path is covered by the fixture test in `load.test.ts` (passing in this run). |
| AC-7 | met | `renderMarkdown()` output: `<h2 id="hello-world">`; the external link gets `rel="noopener noreferrer"`; the site's own link doesn't; the `javascript:` link loses its `href`; `<script>` is dropped and `<b>raw</b>` comes out as plain `raw`. |
| AC-8 | met | `content/work/` has 4 projects (3 featured, 1 draft). Profile and About are full, with 3 experience entries, 3 skill groups and `/cv/toyin-ogunseinde-cv.pdf`. Every value except the name is marked Placeholder. |
| AC-9 | met | An empty `photo.alt` fails with `photo.alt: is empty. Describe the image in a few words for people using screen readers`. |
| AC-10 | met | `curl localhost:8787/` gives `200`, `x-nextjs-prerender: 1`, `x-opennext-cache: HIT`. `tests/e2e/static.spec.ts` passes on desktop and mobile. No `"use client"` file imports `@/lib/content`. |

Spec surfaces: loader, schemas, Markdown pipeline, placeholder content, the `content:check` script and its CI step all exist. Nothing missing.

## For /check review

- A bad `https` URL gives two messages for one field (`should be a full web address` and `should be a web address starting with https://`). That's clear enough, but one message would read better.
- `pnpm build` prints the `ContentError` twice: once in the friendly format, and once as the raw object Next.js logs. The friendly one comes first.

## AC-4 re-run (RR1-T02, 2026-11-10)

The pending part of AC-4: drafts kept out of the static `/work/<slug>` routes and the sitemap in production.

- Built with `APP_ENV=production pnpm preview` (OpenNext on the local Workers runtime, port 8787) on branch `rr1-t02`.
- `curl localhost:8787/work/marketing-site` (the draft) gives `404`. `/work/design-system` and `/work` give `200`.
- `/work` links only `analytics-dashboard`, `checkout-redesign` and `design-system`.
- `/sitemap.xml` lists `/`, `/work` and the three published case studies, and not `marketing-site`.
- The build's prerendered route cache holds `/work`, `/work/analytics-dashboard`, `/work/checkout-redesign` and `/work/design-system` only.
- The preview build (`APP_ENV=preview`, what CI runs) includes the draft. `tests/e2e/static.spec.ts` covers it as a prerendered route, so previews still show drafts.
- Unit: `src/app/work/addProject.test.tsx` checks a draft fixture is left out of `/work`, the static params and the sitemap in production, and is included in preview.

Result: met. AC-4 is fully verified.

