# /check verify work list & case studies · PASS

**Date**: 2026-11-10 · **Spec**: [0005](../specs/0005-work-case-studies.md) · **Scope**: feature 6 · **Run by**: Dwight, RR1-T02

**PASS: all 11 acceptance criteria met, every specced surface built.**

Next: `/sync`.

## How it was run

- `pnpm test:e2e` (OpenNext preview build on the local Workers runtime, `APP_ENV` unset so preview, like CI): 78 passed, 0 skipped, at 1440 (desktop) and 390 (mobile).
- `APP_ENV=production pnpm preview`, then `curl` and agent-browser (session `dwight-rr1-t02`): screenshots of `/work` and `/work/design-system` at 1440 and 390, and a video from a card to the case study, to the next project, and back to all work. Linked in the PR.
- `pnpm test`: the new `src/app/work/work.test.tsx` and `addProject.test.tsx` pass.

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-1 | met | e2e: h1 "Work", the intro line, card titles in `getProjects()` order; 1 column at 390 and 3 on desktop (card tops compared). Screenshots at both widths. |
| AC-2 | met | e2e: first card shows "<role> · <year>" and links to `/work/<slug>`. Unit: cover alt, at most 3 tags, one link per card. |
| AC-3 | met | Unit: `dynamicParams` is `false` and static params equal the published slugs. e2e: `/work/does-not-exist` returns 404 with the spec 0004 page. Production build: the draft `/work/marketing-site` returns 404. |
| AC-4 | met | e2e and unit: the title is the only h1, the facts list has Role, Client (when set), Year and Tags, and project links have `rel="noopener noreferrer"` and open in a new tab. |
| AC-5 | met | e2e: the cover has `width` and `height` and isn't lazy loaded (`preload` and `fetchPriority="high"`). It renders full width at 16:10 above the body (screenshots). |
| AC-6 | met | e2e: the body's `##` headings render as h2 (Problem, What I did, Outcome) through `Prose`. axe finds no heading order issue. |
| AC-7 | met | e2e and video: Next project goes from the first to the second project, the last project's Next project wraps to the first, and Back to all work returns to `/work`. |
| AC-8 | met | e2e: case study title `<project> · Toyin Ogunseinde`, description from the summary, `og:image` ending in the cover path. `/work` title `Work · Toyin Ogunseinde` with its own description. |
| AC-9 | met | e2e: `/sitemap.xml` has `/work` and every published `/work/<slug>`. Production build: three case studies, no draft. |
| AC-10 | met | Unit `addProject.test.tsx`: one new fixture file appears on `/work`, in the static params and in the sitemap with no code change. `static.spec.ts` and `work.spec.ts` derive their routes from the content, so a new project is checked automatically. |
| AC-11 | met | `static.spec.ts`: `/work` and every case study are served with `x-nextjs-prerender: 1` and `x-opennext-cache: HIT`. axe: zero WCAG 2.2 AA violations on `/work` and a case study at 1440 and 390. |

Spec surfaces: `src/app/work/page.tsx`, `copy.ts`, `[slug]/page.tsx`, `CaseStudyHeader`, `NextProject`, the sitemap update, and the 16:10 guidance in `content/README.md`. Nothing missing.

## For /check review

- Work cards use the shared `Card`, which crops covers to 4:3, while the case study shows the full 16:10 cover. That matches Home, but the spec's 16:10 call is only applied on the case study. An aspect option on `Card` (owned by `src/components/ui/`) would line them up.
- The card plus tags markup is in `src/app/work/_components/ProjectCard.tsx` and also, in the same shape, in `src/app/_home/SelectedWork.tsx`. Home could reuse `ProjectCard` in a later task.
