# /check verify about & cv · PASS

**Date**: 2026-11-10 · **Spec**: [0006](../specs/0006-about-cv.md) · **Scope**: feature 7 · **Run by**: Dwight, RR1-T03

**PASS: all 7 acceptance criteria met, every specced surface built.**

Next: `/sync`, then Review after CodeRabbit.

## How it was run

- `pnpm test:e2e` (OpenNext preview build on the local Workers runtime) gave 120 passed, including 16 new `about.spec.ts` checks at 1440 (desktop) and 390 (mobile).
- agent-browser (session `dwight-rr1-t03`) on `pnpm preview`:
  - full page screenshots of `/about` at 1440 and 390
  - a keyboard video: Tab through the skip link, the name, Work, About and Contact to "Download CV (PDF)", then Enter
- `pnpm test` gave 213 passed (new: `src/lib/format/date.test.ts`, `src/app/about/about.test.tsx`).

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-1 | met | Unit: one h1 "About". The photo has its alt text, `width="800"` and `height="1000"`. e2e: the photo box ratio is 0.8 (4:5). The bio sits right of the photo at 1440 and below it at 390. Screenshots at both widths. |
| AC-2 | met | e2e and screenshots: the bio renders through `Prose` (`.prose`) from `bioHtml`, including the blockquote note and both paragraphs. |
| AC-3 | met | Unit and e2e: an ordered list in the "Experience" region with role h3s in content order (newest first). Each entry has company, optional location, highlights as a list, and dates like "Jan 2023 to Present" and "Jun 2020 to Dec 2022", with `<time datetime="YYYY-MM">`. `date.test.ts` covers "2024-03" to present as "Mar 2024 to Present". |
| AC-4 | met | Unit and e2e: each group name is an h3, with its skills as `Tag`s in a list named after the group. |
| AC-5 | met | e2e: two "Download CV (PDF)" links (after the bio and at the end). Both trigger a download whose suggested file name is `Toyin-Ogunseinde-CV.pdf`. The file is served as `application/pdf` and starts with `%PDF-`. "Last updated November 2026" sits beside each, with `<time datetime="2026-11">`. Video: reached by keyboard in 6 Tabs. |
| AC-6 | met | e2e: title `About · Toyin Ogunseinde`, and a description of at most 160 characters, from the bio's first top level paragraph. `/sitemap.xml` has `/about`. |
| AC-7 | met | `static.spec.ts`: `/about` is served with `x-nextjs-prerender: 1` and `x-opennext-cache: HIT`. axe: zero WCAG 2.2 AA violations at 1440 and 390. |

Spec surfaces: `src/app/about/page.tsx` and `_components/{Intro,ExperienceList,SkillGroups,CvDownload}.tsx`, `src/lib/format/date.ts`, the sitemap entry. Nothing missing.

## For /check review

- The CV button is a plain `<a download>` with the primary button styles (`buttonClass`), not `ButtonLink`. `ButtonLink` wraps `next/link`, which is for pages and has no `download` option. It looks and behaves like the primary button.
- The placeholder photo is square (800 by 800), so the 4:5 frame crops it. `content/README.md` could tell Toyin to crop the real photo to 4:5. That file isn't in this task's list.
