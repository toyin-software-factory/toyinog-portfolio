# 0006. About page and CV download

**Date**: 2026-11-10
**Status**: In Progress

## Summary

`/about` shows Toyin's photo and bio, an experience timeline (newest first, each role with 2 to 4 highlights), skills grouped into short lists, and a clear "Download CV" button for a PDF with its last updated date. Everything comes from `content/pages/about.md` and the CV file in `public/cv/`, and the page is static.

## Context

Scope feature 7. Hiring managers want the full picture, and clients use it as a credibility check. Toyin chose the About contents in Content Q3 (bio with photo, timeline, grouped skills, CV PDF). Spec 0002 provides `getAbout()` (bio HTML, sorted experience, skill groups, CV path and date). Spec 0003 provides the components, and spec 0004 the shell.

## Requirements

**User stories**:
- As a hiring manager, I want Toyin's experience at a glance and the CV in one click.
- As a client, I want to understand Toyin's background and skills.

**Acceptance criteria**:
- **AC-1**: `/about` has an `h1` "About", then a two column intro at `md` and up (photo on one side, bio on the other), stacked on phones. The photo has its alt text, explicit dimensions, and a 4:5 aspect ratio.
- **AC-2**: The bio renders through `Prose` from `getAbout().bioHtml`.
- **AC-3**: An "Experience" section (`h2`) lists every entry newest first as an ordered list. Each entry shows the role (`h3`), company, optional location, a date range ("Mar 2022 to Present" or "Jan 2019 to Feb 2022", with `<time datetime>`), and its highlights as a list.
- **AC-4**: A "Skills" section (`h2`) shows each group name (`h3`) with its skills as `Tag`s in a list.
- **AC-5**: A "Download CV" primary `ButtonLink` points at the CV file with the `download` attribute and a file name of `Toyin-Ogunseinde-CV.pdf`. Its accessible name includes "PDF", and "Last updated <Month YYYY>" shows beside it. The button appears near the top (after the bio) and again at the end of the page.
- **AC-6**: `/about` sets its title ("About") and description (the bio's first paragraph, plain text, at most 160 characters), and is listed in the sitemap.
- **AC-7**: `/about` is in the static route check, and axe reports zero WCAG 2.2 AA violations at 390 and 1440.

## Options considered

### Option 1: One long page with sections (chosen)

**Pros**: everything scannable in one place; simple; good for print or PDF reading.
**Cons**: a long timeline makes for a long page on phones.

### Option 2: Tabs (Bio, Experience, Skills)

**Pros**: shorter at a glance.
**Cons**: hides content, adds client state, and is worse for search and screen readers.

## Decision

**Chosen option**: Option 1, a single static page with sections.

## Rationale

Hiring managers scan, and hidden tab content gets missed. A single page with clear `h2` sections is the most accessible and most search friendly layout. Repeating the CV button at the end saves scrolling back.

Lead calls (each with the runner up): dates formatted as "Mon YYYY" in English with "Present" for current roles (runner up: years only, too coarse for recent roles); a fixed CV download name (runner up: the stored file name, which may be cryptic); skills as tags (runner up: comma separated text, less scannable).

## Feature design

**Files**: `src/app/about/page.tsx`, `src/app/about/_components/{Intro,ExperienceList,SkillGroups,CvDownload}.tsx`, `src/lib/format/date.ts` (formats "YYYY-MM" as "Mon YYYY"), an update to `src/app/sitemap.ts`, and tests.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Intro | photo, alt, bio HTML | `getAbout()` |
| Experience | entries sorted newest first | `getAbout().experience` |
| Date range | display text | `formatMonth(start)` to `formatMonth(end)` or "Present" |
| Skills | groups and skills | `getAbout().skillGroups` |
| CV | file path, updated month | `getAbout().cv` |
| Description | first paragraph | derived from `bioHtml`, at most 160 chars |

**Key invariants**: one `h1`; dates always paired with `<time datetime>`; the CV link always points at an existing file (spec 0002 checks it at build).

**Security model**: static content only.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: all sections render from placeholder content, and the CV downloads, verifies **AC-1** to **AC-5**
- Dates: "2024-03" to "present" renders "Mar 2024 to Present", verifies **AC-3**
- Accessibility and static: axe at both widths and the prebuilt check, verifies **AC-7**

## Build plan

1. Intro (photo and bio) and the CV download component, with page metadata, satisfies **AC-1**, **AC-2**, **AC-5**, **AC-6**
2. Experience list with the date formatter and its unit tests, satisfies **AC-3**
3. Skill groups, satisfies **AC-4**
4. Sitemap entry, Playwright with axe at both widths, static route check, satisfies **AC-6**, **AC-7**

## Consequences

**Positive**: the full background in one accessible page, with the CV one click away.

**Negative / tradeoffs**: a long page on phones when the timeline is long.

**Neutral**: the SEO feature (9) adds Person structured data here.

## Follow-up

- [ ] None.
