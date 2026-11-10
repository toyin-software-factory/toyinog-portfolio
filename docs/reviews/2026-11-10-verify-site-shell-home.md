# /check verify site shell & home · PASS

**Date**: 2026-11-10 · **Spec**: [0004](../specs/0004-site-shell-home.md) · **Scope**: feature 5 · **Run by**: Dwight, RR1-T01

**PASS: all 11 acceptance criteria met, every specced surface built.** AC-2 was partly verified on the first run, because the Work pages didn't exist yet. It was completed in RR1-T02; see [AC-2 re-run](#ac-2-re-run-rr1-t02-2026-11-10) below.

Next: `/sync`.

## How it was run

- `pnpm preview` (OpenNext build on the local Workers runtime, port 8787).
- `pnpm exec playwright test`: 44 passed, 4 skipped (the AC-2 Work paths, on desktop 1440 and mobile 390).
- agent-browser (session `dwight-rr1-t01`): full page screenshots of `/` and an unknown URL at 1440 and 390, and a keyboard video (Tab through the header, then Back to top from the footer). The screenshots and video are linked in the PR.
- `pnpm test`: 105 passed.

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-1 | met | e2e `header, Main nav, main and footer are in order` (`body > header + main#main + footer`) and `tab order is skip link, name, Work, About, Contact, then main`, both widths. |
| AC-2 | met | e2e `no nav link is marked current on Home`. Unit `site.test.tsx`: Work gets `aria-current="page"` on `/work` and `/work/design-system`, not on `/workshop`. Real Work pages: see the re-run below. |
| AC-3 | met | e2e at 390: no sideways scroll, no button in the banner, every header link at least 44 by 44 px, banner at most two rows. Mobile screenshot: name on the first row, three links on the second. |
| AC-4 | met | e2e: LinkedIn and GitHub have `rel="noopener noreferrer"`, Email is `mailto:`, `© 2026 Toyin Ogunseinde`, and Back to top focuses `header#top`; the next Tab lands on the name link. The video shows it. |
| AC-5 | met | e2e `hero shows the badge and both actions`; unit tests for all four availability values (badge hidden for `none`). |
| AC-6 | met | e2e: 3 cards linking to `/work/<slug>`, every cover with alt text, All work link to `/work`. Unit: at most 3 tags, and the section renders nothing with no featured projects. |
| AC-7 | met | e2e: `… at Placeholder Company` and More about me to `/about`. Desktop screenshot shows the bio's first top level paragraph (the "Placeholder text" note in a blockquote is skipped). Unit `text.test.ts` covers the 280 character word boundary cut. |
| AC-8 | met | e2e: the CTA region named "Have a role or a project in mind?" with Get in touch to `/contact`. Screenshot: display size serif. |
| AC-9 | met | e2e: an unknown URL returns 404 with h1 "Page not found", Go to Home and See the work links, inside the shell, title `Page not found · Toyin Ogunseinde`. |
| AC-10 | met | e2e: title `Toyin Ogunseinde · Placeholder headline…`, description from the intro, and `/` served with `x-nextjs-prerender: 1` and `x-opennext-cache: HIT` (static.spec). |
| AC-11 | met | axe (WCAG 2.2 AA tags) reports zero violations on `/` and the 404 page at 1440 and 390. Headings: one h1, then h2 Selected work, About, and the CTA. |

Spec surfaces: `layout.tsx` shell and metadata, `Header`, `NavLinks`, `Footer`, `not-found.tsx`, the four Home sections and `copy.ts`, and `firstParagraphText`. Nothing missing.

## For /check review

- Selected work tags sit under each `Card` in the same list item, not inside the card, because `Card` has no slot for them. If cards elsewhere need tags too, a `children` or `tags` slot on `Card` (owned by `src/components/ui/`) would be tidier.
- The 404 page is prebuilt once, so the nav never shows a current link there, even under `/work/…`. That's fine for a 404.

## AC-2 re-run (RR1-T02, 2026-11-10)

With `/work` and `/work/<slug>` built, the e2e checks `Work is marked current on /work` and `Work is marked current on /work/design-system` (in `tests/e2e/shell.spec.ts`) run instead of skipping. They pass at 1440 and 390: Work has `aria-current="page"` and the underline, and About doesn't. `tests/e2e/work.spec.ts` checks the same on a case study. The RR1-T02 case study screenshot shows the lemon underline under Work. Full run: 78 passed, 0 skipped.

Result: met. AC-2 is fully verified.

## AC-12 (added after build, RR1-T05, 2026-11-10)

AC-12: the shell's profile values come from a module generated at build time, so a route rendered at request time on Workers gets the shell with no file access.

- `pnpm content:generate` writes `src/lib/content/generated/shell-profile.ts` (the shell's profile fields and the build year). `build`, `dev`, `lint`, `typecheck` and `test` run it first, and OpenNext's build calls `pnpm build`, so Workers Builds runs it too.
- `src/app/layout.tsx`, `Header`, `NavLinks` and `Footer` import only that module and the pure `shell-profile` types. `src/components/site/noLoader.test.ts` fails if any of them imports the loader or `node:` modules.
- `/dynamic-check` is a `force-dynamic` page that returns 404 in production. On `pnpm preview` (desktop and mobile), `tests/e2e/dynamic.spec.ts` gets 200, no `x-nextjs-prerender` header, a fresh timestamp per request, the header (name and Main nav) and the footer (`© <year> <name>`, Email). Full run: 82 passed.
- Regression check: with main's `layout.tsx` (which calls `getProfile()`) put back temporarily, the same spec gets **500**. It passes with the fix.
- `content:generate` on broken content exits 1 with the same message as `content:check` and writes nothing (`src/lib/content/generate.test.ts`).

Result: met.

