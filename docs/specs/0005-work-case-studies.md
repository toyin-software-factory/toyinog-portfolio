# 0005. Work list and case study pages

**Date**: 2026-11-10
**Status**: Proposed

## Summary

`/work` lists every published project as a grid of cards in Toyin's chosen order. Each project gets its own static page at `/work/<slug>` with a header (title, summary, role, client, year, tags, links), the cover image, the case study text (Problem, What I did, Outcome), and a link to the next project. Adding a Markdown file to `content/work/` adds a project, with no code change.

## Context

Scope feature 6. Both audiences judge Toyin mostly on the work. The content model (spec 0002) provides `getProjects()`, `getProject(slug)` and `getProjectSlugs()`, sorted and with drafts hidden in production. The design system (spec 0003) provides `Card`, `Tag`, `Prose` and the layout components, and the shell comes from spec 0004. Pages must be prebuilt (spec 0001).

## Requirements

**User stories**:
- As a visitor, I want to scan all projects and open the ones that interest me.
- As a hiring manager, I want each case study to show the problem, Toyin's role and the outcome quickly.
- As Toyin, I want to publish a project by adding one file.

**Acceptance criteria**:
- **AC-1**: `/work` has an `h1` "Work", a one line intro ("Selected projects, newest thinking first." in `src/app/work/copy.ts`), and a grid of `Card`s for every published project in `getProjects()` order (1 column at 390, 2 at `md`, 3 at `lg`).
- **AC-2**: Each card shows the cover (with alt), title, "<role> · <year>", summary and up to 3 tags, and the whole card links to `/work/<slug>`.
- **AC-3**: `/work/<slug>` is statically generated for every slug from `getProjectSlugs()`, with `dynamicParams = false`. Unknown or draft (in production) slugs return the 404 page from spec 0004.
- **AC-4**: The case study header shows the title (`h1`), summary, a definition list of Role, Client (if set), Year and Tags, and the project links as external `TextLink`s.
- **AC-5**: The cover image renders full width above the body, with alt text, explicit width and height (no layout shift), loaded eagerly as the main image.
- **AC-6**: The body renders through `Prose` from the build time HTML (spec 0002). Its `##` headings become `h2`s, so the page outline is valid.
- **AC-7**: The page ends with "Next project" linking to the following project in `getProjects()` order (wrapping to the first), and a "Back to all work" link.
- **AC-8**: Each case study sets `title` (the project title, through the template) and `description` (the summary), plus `openGraph.images` set to the cover. `/work` sets its own title and description.
- **AC-9**: The sitemap (`src/app/sitemap.ts`) lists `/work` and every published `/work/<slug>`.
- **AC-10**: Adding a valid file to `content/work/` (with its cover) adds it to `/work`, the sitemap and a new page on the next build with no code change. A test proves it with a fixture.
- **AC-11**: `/work` and every case study route are in the static route check, and axe reports zero WCAG 2.2 AA violations on `/work` and one case study at 390 and 1440.

## Options considered

### Option 1: A simple grid, no filtering (chosen)

**Pros**: a handful of projects doesn't need filters; fast and simple.
**Cons**: if the list grows past about 12 projects, filtering by tag becomes useful (deferred).

### Option 2: A grid with tag filters

**Pros**: helps browsing a large portfolio.
**Cons**: needs client state or extra static routes for a list that's small today.

## Decision

**Chosen option**: Option 1, a static grid plus static case study pages.

## Rationale

The Skateboard goal is a complete, usable Work section on launch. With up to roughly 10 projects, a single ordered grid is the fastest path to the work, and Toyin controls the order. Filtering goes to Deferred until the list grows.

Lead calls (each with the runner up): the cover uses `next/image` with `unoptimized` (spec 0001) and a fixed 16:10 aspect ratio (runner up: natural ratios, which make the grid uneven); "Next project" wraps around (runner up: previous and next, more chrome for little gain); the page intro lives in code (runner up: a content field).

## Feature design

**Files**: `src/app/work/page.tsx`, `src/app/work/copy.ts`, `src/app/work/[slug]/page.tsx`, `src/app/work/[slug]/_components/{CaseStudyHeader,NextProject}.tsx`, an update to `src/app/sitemap.ts`, and tests.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Work grid | projects and order | `getProjects()` |
| Case study | project fields and HTML | `getProject(slug)` |
| Static params | slugs | `getProjectSlugs()` |
| Next project | following slug | index in `getProjects()`, wrapping |
| Metadata | title, description, image | project `title`, `summary`, `cover.src` |
| Sitemap URLs | absolute URLs | `SITE_URL` constant (spec 0001) plus slugs |

**Key invariants**: no runtime data access; one `h1` per page; drafts never appear in production output.

**Security model**: project links are https only (validated in spec 0002) and open with `rel="noopener noreferrer"`.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: `/work` shows all placeholder projects in order, and a card opens its case study, verifies **AC-1**, **AC-2**, **AC-4** to **AC-7**
- Not found: `/work/does-not-exist` returns 404, verifies **AC-3**
- Drafts: a draft fixture is absent in a production build, present in preview, verifies **AC-3**
- Add a project: a fixture file appears in the list, sitemap and routes, verifies **AC-9**, **AC-10**
- Accessibility and static: axe and the prebuilt check, verifies **AC-11**

## Build plan

1. `/work` list page with the card grid and metadata, satisfies **AC-1**, **AC-2**, **AC-8**
2. `/work/[slug]` static page: header, cover, prose body, next project, metadata, satisfies **AC-3** to **AC-8**
3. Sitemap entries, satisfies **AC-9**
4. Tests: the add a project fixture, drafts, 404, Playwright with axe at both widths, static route check, satisfies **AC-3**, **AC-10**, **AC-11**

## Consequences

**Positive**: the core of the portfolio, fully static and fast.

**Negative / tradeoffs**: no filtering or search. Every cover must be cropped to 16:10 by Toyin (documented in `content/README.md`).

**Neutral**: the SEO feature (9) extends these pages with structured data.

## Follow-up

- [ ] Add "Tag filters on Work" to the scope's Deferred list.
- [ ] Add the 16:10 cover guidance to `content/README.md` (part of the build).
