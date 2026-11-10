# 0003. Editorial dark design system with Toyin's palette

**Date**: 2026-11-10
**Status**: Proposed

## Summary

The site uses an editorial look (big serif headlines, lots of space, thin rules) on a dark Carbon Black base, with Toyin's yellows used sparingly for links, focus and calls to action. The tokens (colours, type, spacing) are defined once in Tailwind's theme, and a small set of accessible base components in `src/components/ui/` is built from them, so every page looks consistent and meets WCAG AA. `design.md` is the human readable source of truth, and a preview only `/styleguide` page shows everything in one place.

## Context

Every Release 1 page (Home, Work, case studies, About, Contact) needs the same colours, type and components, and Toyin wants a distinctive personal site, not a template. The team must meet WCAG AA (team rule) and prove each UI PR with desktop and phone screenshots.

Toyin chose (Design Q1 to Q4): references pulled from Mobbin, the editorial minimal direction, a fixed five colour palette (Dust Grey, Bright Lemon, Bright Amber, Carbon Black, Graphite), and a dark base. Spec 0001 fixes Tailwind CSS 4 (`@tailwindcss/postcss`, configured in CSS) and Next.js. Yellow on light grey fails contrast badly (1.2:1), which is why the dark base was chosen.

## Requirements

**User stories**:
- As a visitor, I want a readable, consistent, distinctive site on any device.
- As a keyboard or screen reader user, I want every control reachable, visible when focused, and properly labelled.
- As a builder, I want tokens and base components so pages never invent colours or spacing.

**Acceptance criteria**:
- **AC-1**: Every colour, font, type size, spacing and radius in `design.md` exists as a Tailwind theme token in `src/app/globals.css` (`@theme`). There are no raw hex values in components or pages, and a lint or test check enforces this for `src/components` and `src/app`.
- **AC-2**: Instrument Serif and Inter are self hosted through `next/font/google`, exposed as CSS variables, with `display: swap`. No request goes to a third party font host at runtime.
- **AC-3**: The base components listed in `design.md` exist in `src/components/ui/`, typed, with named exports, each with a Vitest test for its roles and labels.
- **AC-4**: Every interactive component shows a visible lemon focus outline for keyboard focus (`:focus-visible`), is fully keyboard operable, and has a touch target of at least 44 by 44 pixels.
- **AC-5**: The root layout applies the base styles (background, text colour, fonts, selection colour), includes a `SkipLink` to `#main`, sets `lang="en"`, and respects `prefers-reduced-motion`.
- **AC-6**: A `/styleguide` route shows every token and component in its states (default, hover description, focus, disabled, error). It is statically generated, returns 404 when `getAppEnv()` is `production`, is `noindex`, and is left out of the sitemap.
- **AC-7**: axe (Playwright) reports zero WCAG 2.2 AA violations on `/styleguide` at 390 and 1440 widths, and no horizontal scrolling at 390.
- **AC-8**: `Prose` styles rendered Markdown (headings, paragraphs, lists, links, blockquotes, inline code, code blocks, images) using only tokens, with a 42rem reading width.

## Options considered

### Option 1: Tailwind v4 theme tokens plus our own small component set (chosen)

**Pros**: no dependency, full control of the look, tokens in one CSS file, fits spec 0001.
**Cons**: we write and test the accessible behaviour ourselves (a small set, mostly native elements).

### Option 2: shadcn/ui or Radix primitives restyled

**Pros**: complex widgets come with accessibility built in.
**Cons**: the site has no complex widgets (no dialogs, menus or comboboxes), so it adds dependencies and a component kit feel for little gain. Toyin chose plain Tailwind in Stack Q6.

## Decision

**Chosen option**: Option 1. Tokens in `@theme`, native HTML based components in `src/components/ui/`, `design.md` as the human source of truth.

## Rationale

The pages are content and links plus one form, and native elements (`a`, `button`, `input`, `fieldset`) already give the right keyboard and screen reader behaviour. A primitives library would solve problems this site doesn't have. Keeping every value in tokens makes the dark palette safe: the contrast pairs are checked once in `design.md`, and pages can't drift.

Lead calls (each with the runner up): Instrument Serif for headings (runner up: Fraunces, heavier and less editorial); Inter for text (runner up: Geist); helper greys `#A3A3A3` for muted text and `#8A8A8A` for control borders, plus `#FF8A80` for errors, added because the palette has no muted text, control border or error colour that meets AA (runner up: Dust Grey at reduced opacity, which is harder to check); square corners with a 2px radius on controls only (runner up: rounded cards, which read less editorial); a navigation pattern of top links on desktop and a disclosure menu button on mobile, decided in the site shell spec.

## Feature design

**Tokens**: exactly the tables in `design.md` (colour, type, space, radius), as `@theme` variables (for example `--color-bg`, `--color-accent`, `--font-display`, `--font-sans`, `--text-display`).

**Components and props** (all in `src/components/ui/`, server components unless they need state):
| Component | Element | Key props | Notes |
|---|---|---|---|
| `Container` | `div` | `size?: 'page' \| 'prose'` | 72rem or 42rem |
| `Section` | `section` | `label?`, `rule?`, `id?`, `aria-labelledby` | spacing scale |
| `Heading` | `h1` to `h4` | `level`, `size?` | level and visual size are separate |
| `Prose` | `div` | `html: string` | renders build time HTML from spec 0002 |
| `TextLink` | `a` / `next/link` | `href`, `external?` | external adds an arrow icon (`aria-hidden`), sr text "opens in new tab" only if `target="_blank"` |
| `Button` | `button` | `variant: 'primary' \| 'secondary'`, `type`, `disabled`, `loading?` | `loading` sets `aria-busy` |
| `ButtonLink` | `a` | `href`, `variant` | |
| `Badge` | `span` | `children` | lemon fill, carbon text |
| `Tag` | `li` in a `ul` | `children` | graphite fill |
| `Card` | `article` | `href`, `title`, `meta`, `summary`, `image {src, alt}` | one link covering the card (pseudo element on the title link) |
| `Rule` | `hr` | | |
| `SkipLink` | `a` | | visible on focus |
| `VisuallyHidden` | `span` | | |
| `Field` | `div` | `label`, `id`, `hint?`, `error?` | wires `aria-describedby` and `aria-invalid` |
| `Input` / `Textarea` | native | standard | `border-control`, focus ring |
| `RadioGroup` | `fieldset` + `legend` | `name`, `options`, `value?` | |
| `FieldError` | `p` | `id`, `children` | `danger` colour plus an icon, not colour alone |

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| `/styleguide` availability | production or not | `getAppEnv()` (spec 0001) |
| Fonts | font files | `next/font/google`, downloaded at build |
| Colours and sizes | token values | `design.md` → `globals.css` |

**Key invariants**: no raw colour values outside `globals.css`; every interactive element has a visible focus style; no information conveyed by colour alone.

**Security model**: none beyond the CSP in spec 0001 (`next/font` self hosts, so no font host is needed in the CSP).

**Configuration required**: none.

**Critical test scenarios**:
- Happy path: `/styleguide` renders every component, verifies **AC-3**, **AC-6**
- Accessibility: axe passes at 390 and 1440, and Tab through the styleguide shows the focus ring on every control, verifies **AC-4**, **AC-7**
- Production gate: `/styleguide` returns 404 in a production build, verifies **AC-6**
- Token guard: a raw hex in a component fails the check, verifies **AC-1**

## Build plan

Skateboard: tokens and layout first, so Release 1 pages can start as soon as possible. Then components.

1. Tokens in `src/app/globals.css` `@theme`, fonts through `next/font`, and root layout base styles, `SkipLink`, `lang`, reduced motion, satisfies **AC-1**, **AC-2**, **AC-5**
2. Layout and text components: `Container`, `Section`, `Heading`, `Rule`, `VisuallyHidden`, `TextLink`, `Prose`, satisfies **AC-3**, **AC-4**, **AC-8**
3. Action and display components: `Button`, `ButtonLink`, `Badge`, `Tag`, `Card`, satisfies **AC-3**, **AC-4**
4. Form primitives: `Field`, `Input`, `Textarea`, `RadioGroup`, `FieldError`, satisfies **AC-3**, **AC-4**
5. `/styleguide` route (production 404, noindex, not in the sitemap), the raw hex guard test, and Playwright plus axe at both widths, satisfies **AC-1**, **AC-6**, **AC-7**

## Consequences

**Positive**: one place to change the look, contrast checked once, and components accessible by construction.

**Negative / tradeoffs**:
- A dark only site at launch. Visitors who prefer light mode don't get it (deferred).
- Instrument Serif has a single weight, so heading hierarchy relies on size and italics, not weight.
- Three helper colours sit outside Toyin's palette (needed for AA). Toyin should know they exist.

**Neutral**: the page specs (5 to 8) compose these components. Navigation behaviour is decided in the site shell spec.

## Follow-up

- [ ] Light mode, deferred: add to the scope's Deferred list.
- [ ] The site shell spec (feature 5) decides navigation and footer composition using these components.
