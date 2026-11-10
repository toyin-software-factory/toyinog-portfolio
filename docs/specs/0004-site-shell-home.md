# 0004. Site shell and Home page

**Date**: 2026-11-10
**Status**: Accepted

## Summary

Every page shares one shell: a header with Toyin's name and three always visible links (Work, About, Contact), the main content area, and a footer with links and a back to top link. The Home page has four sections in order: a hero (name, headline, intro, availability badge, two buttons), Selected work (the 3 featured projects), an About teaser, and a contact call to action. Everything is built from the design system (spec 0003) and reads its text from the content files (spec 0002). The page is static HTML.

## Context

Home is where both audiences land, hiring managers and clients, so it must say who Toyin is and route each visitor within a few seconds. Toyin chose the four section order (Home Q1) and always visible navigation on phones (Home Q2), and accepted the proposed footer. The design system (spec 0003) provides the tokens and components. The content model (spec 0002) provides `getProfile()`, `getFeaturedProjects()` and `getAbout()`. Release 1 follows the Skateboard approach: a complete, usable page on placeholder content.

## Requirements

**User stories**:
- As a hiring manager, I want to see who Toyin is, what they do, and whether they're open to roles, then get to their work or background in one click.
- As a client, I want to see relevant work and a clear way to start a conversation.
- As a keyboard or screen reader user, I want to skip the header and move through a clear heading structure.

**Acceptance criteria**:
- **AC-1**: Every page renders inside the shell from `src/app/layout.tsx`: a `header` (banner) with Toyin's name linking to `/` and a `nav` labelled "Main" with Work, About and Contact links, then `<main id="main">`, then a `footer` (contentinfo).
- **AC-2**: The nav link for the current section has `aria-current="page"` and a visible active style (the lemon underline). `/work/<slug>` counts as Work.
- **AC-3**: At 390px wide the header shows the name and all three links on one or two lines, with no horizontal scrolling, no menu button, and touch targets of at least 44px.
- **AC-4**: The footer shows Toyin's name, the LinkedIn, GitHub and email links from `getProfile()`, "© <build year> <name>", and a "Back to top" link that moves focus to the top of the page.
- **AC-5**: The Home hero shows the profile `name` as the only `h1`, the `headline`, the `intro`, the availability badge (text per the table below, hidden when `none`), a primary button "See my work" to `/work` and a secondary button "Get in touch" to `/contact`.
- **AC-6**: The Selected work section (`h2` "Selected work") shows the featured projects from `getFeaturedProjects()` as `Card`s (cover image with alt, title, `role · year`, summary, up to 3 tags), each linking to `/work/<slug>`, plus an "All work" link to `/work`. With no featured projects, the section is not rendered.
- **AC-7**: The About teaser (`h2` "About") shows the first paragraph of the About bio as plain text (at most 280 characters, cut at a word boundary with an ellipsis), the most recent experience entry as "<role> at <company>", and a "More about me" link to `/about`.
- **AC-8**: The contact call to action shows the line "Have a role or a project in mind?" as a large serif heading (`h2`) and a primary button "Get in touch" to `/contact`.
- **AC-9**: The site has a styled `not-found` page (in the shell) with an `h1` "Page not found" and links to Home and Work, returning HTTP 404.
- **AC-10**: The root metadata sets a title template `%s · <name>`, a default title "<name> · <headline>", and a default description from `intro`, all from `getProfile()`. Home is statically generated (prebuilt HTML, added to `tests/e2e/static.spec.ts`).
- **AC-11**: axe reports zero WCAG 2.2 AA violations on `/` and the 404 page at 390 and 1440 widths, and the headings form a valid outline (one `h1`, `h2` per section).
- **AC-12** (added 2026-11-10): The root layout and every shared shell component get profile values (name, headline, intro, links) from a module generated at build time from `content/pages/profile.md`, never by calling the file reading loader in `src/lib/content/`. A dynamic route (one rendered at request time on Workers) therefore renders the shell with no file access. Checked by an e2e test against `pnpm preview` that requests a small dynamic test route (preview only) and gets 200 with the header and footer.

## Options considered

### Option 1: Always visible links, sections as server components (chosen)

**Pros**: no client JavaScript for navigation, nothing hidden, simplest to make accessible.
**Cons**: a long name and three links must fit at 390px, which needs care with font size and wrapping.

### Option 2: A menu button on phones

**Pros**: a tidier phone header.
**Cons**: adds client state, hides pages behind a tap, and Toyin chose against it.

## Decision

**Chosen option**: Option 1. The shell lives in the root layout. Home sections are server components in `src/app/_home/`, and the nav's active state comes from a tiny client component using `usePathname()`.

## Rationale

With only three destinations, a menu button costs more than it saves. Server components keep Home fully static, which fits spec 0001's static generation rules. The one client piece (the active link) is isolated, so the rest of the shell ships no JavaScript.

Lead calls (each with the runner up): the call to action line is constant in code at `src/app/_home/copy.ts` (runner up: a new profile field, which would change spec 0002's schema for one sentence; revisit if Toyin wants to edit it often); the About teaser is derived from the bio's first paragraph (runner up: a separate teaser field); no photo on Home, since the photo lives on About (runner up: a hero portrait, which competes with the work cards); "Back to top" targets an `id="top"` on the header with `tabIndex={-1}` (runner up: `#main`, which skips the nav a returning user may want).

## Feature design

**Availability badge text**:
| `availability` | Badge |
|---|---|
| `roles` | Open to new roles |
| `projects` | Available for projects |
| `both` | Open to roles and projects |
| `none` | (no badge) |

**Files**: `src/app/layout.tsx` (shell, metadata), `src/components/site/Header.tsx`, `src/components/site/NavLinks.tsx` (client, `usePathname`), `src/components/site/Footer.tsx`, `src/app/not-found.tsx`, `src/app/page.tsx`, `src/app/_home/{Hero,SelectedWork,AboutTeaser,ContactCta,copy}.tsx|ts`, plus `src/lib/content/` helper `firstParagraphText(html, max)` if not already present.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Header, footer, hero | name, headline, intro, availability, links, email | `getProfile()` (spec 0002) |
| Selected work | featured projects, cover, role, year, tags | `getFeaturedProjects()` |
| About teaser | bio first paragraph | derived from `getAbout().bioHtml`, plain text, at most 280 chars |
| About teaser | latest role | `getAbout().experience[0]` (sorted newest first) |
| Footer year | year | build time `new Date().getFullYear()` |
| CTA line | text | `src/app/_home/copy.ts` |
| Active nav | current path | `usePathname()` |

**Key invariants**: exactly one `h1` per page; every image has alt text; no raw colours (spec 0003); Home has no runtime data fetching.

**Security model**: static content only. External profile links use `rel="noopener noreferrer"`.

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: Home renders all four sections from placeholder content, verifies **AC-5** to **AC-8**
- Navigation: Tab order is skip link, name, Work, About, Contact, then main. `aria-current` is set on `/work` and `/work/<slug>`, verifies **AC-1**, **AC-2**
- Phone: 390px shows all links with no overflow, verifies **AC-3**
- Empty state: no featured projects hides Selected work, verifies **AC-6**
- 404: an unknown URL returns 404 with the styled page, verifies **AC-9**
- Accessibility: axe at both widths, verifies **AC-11**

## Build plan

Skateboard: shell first (every later page needs it), then Home top to bottom.

1. Header, NavLinks (active state), Footer and back to top in the root layout. Root metadata from the profile, satisfies **AC-1** to **AC-4**, **AC-10**
2. Not found page, satisfies **AC-9**
3. Home hero and Selected work, satisfies **AC-5**, **AC-6**
4. About teaser (with the first paragraph helper and its unit test) and the contact CTA, satisfies **AC-7**, **AC-8**
5. Playwright: navigation, phone layout, empty state, 404, axe at 390 and 1440, and the static route check, satisfies **AC-2**, **AC-3**, **AC-10**, **AC-11**
6. (Added after build) A build step writes the shell's profile values to a generated module that the layout imports, plus the dynamic route e2e check, satisfies **AC-12**

## Consequences

**Positive**: Release 1's first real page. Every later page gets the shell for free.

**Negative / tradeoffs**:
- A very long name plus links could wrap to two lines on small phones. That's accepted (AC-3 allows two lines).
- The call to action copy lives in code, so changing it is a small code PR.

**Neutral**: `/work`, `/about` and `/contact` 404 until their tasks ship. The nav links still render (Skateboard: the shell is whole first).

## Follow-up

- [x] AC-12 (task RR1-T05). Found in RR1-T04: the root layout called `getProfile()`, which reads `content/` with `node:fs`. That works on prerendered pages but returns 500 on any dynamic route on Workers (it broke `/contact/sent`), against spec 0002 AC-10. RR1-T04 works around it with a middleware cookie gate, so this fix protects future dynamic routes and server action responses.

- [ ] Full SEO (share cards, structured data, sitemap entries) is scope feature 9.
