# Design system: toyinog.com

The source of truth for how the site looks. Decided in [spec 0003](docs/specs/0003-design-system.md). Tokens live in `src/app/globals.css` (Tailwind `@theme`), and components live in `src/components/ui/`. Change the look here and in the tokens, never ad hoc in a page.

## Direction

**Editorial, on a dark base.** Large serif headlines, generous space, thin rules, and few decorations, set on Carbon Black. Toyin's yellow accents (Bright Lemon, Bright Amber) are used sparingly so they glow: links, focus, the availability badge, the primary button. Case study images carry the rest of the colour.

Mobbin references (layout and typography, not colour):
- Fiasco, selected work grid: https://mobbin.com/sites/sections/4ed7c118-a866-41fa-824c-32a24323c927
- Locomotive, work intro with big serif and rules: https://mobbin.com/sites/sections/77eac98e-ea26-429d-b27e-3d922800c5ff
- Harvest, bio block: https://mobbin.com/sites/sections/3d86c2b4-d5d9-4663-8c1f-9fe475a0bea0
- Cloudstudio, dark selected work with small labels: https://mobbin.com/sites/sections/48890788-7d16-4887-baaa-5b22583ef055
- Antimetal, dark hero with a single bright accent: https://mobbin.com/sites/sections/38557cd6-0834-4d5a-b186-89ac968d8332

## Colour

Toyin's palette: Dust Grey `#D6D6D6`, Bright Lemon `#FFEE32`, Bright Amber `#FFD100`, Carbon Black `#202020`, Graphite `#333533`. Three helper greys and an error red were added only to meet WCAG AA.

| Token | Value | Use | Contrast |
|---|---|---|---|
| `bg` | `#202020` Carbon Black | page background | |
| `surface` | `#333533` Graphite | cards, tags, code, raised areas | |
| `rule` | `#333533` Graphite | dividers (decorative) | |
| `text` | `#D6D6D6` Dust Grey | body text, headings | 11.2:1 on bg, 8.6:1 on surface |
| `text-muted` | `#A3A3A3` | metadata, captions, secondary text | 6.5:1 on bg, 5.0:1 on surface |
| `accent` | `#FFEE32` Bright Lemon | links, focus ring, badge and primary button fill | 13.6:1 on bg |
| `accent-strong` | `#FFD100` Bright Amber | hover and pressed for accent things | 11.1:1 on bg |
| `on-accent` | `#202020` Carbon Black | text on lemon or amber fills | 13.6:1 |
| `border-control` | `#8A8A8A` | input and outline button borders (UI, 3:1 needed) | 4.7:1 on bg |
| `danger` | `#FF8A80` | form errors | 7.1:1 on bg |

Rules: yellow is never body text on a light fill, and never small text on Graphite unless checked. Selection colour is a lemon background with carbon text. Light mode is deferred.

## Type

- **Display / headings**: Instrument Serif (400 and italic), self hosted through `next/font/google`. Used for h1 and h2 and the Home hero.
- **Text / UI**: Inter (variable), self hosted through `next/font/google`. Used for body, h3 and below, navigation, buttons, labels.
- Fluid scale (`clamp`): display 3 to 5.5rem · h1 2.5 to 3.5rem · h2 1.75 to 2.25rem · h3 1.25rem Inter semibold · body 1.0625rem with line height 1.7 · small 0.875rem · label 0.75rem uppercase, letter spacing 0.08em, Inter medium.
- Reading width for prose is 42rem max.

## Space and layout

- Tailwind's 4px spacing scale. Sections are separated by 6rem on desktop and 4rem on mobile, often with a top rule.
- Container: 72rem max, with side padding of 1.5rem on mobile and 2.5rem on desktop.
- Grid: 12 columns from `md` up, 1 column below. Proof widths are 390 (phone) and 1440 (desktop).
- Corners: square by default, with a 2px radius on inputs and buttons only. No shadows. Depth comes from Graphite surfaces and rules.

## Motion

Minimal: 150ms colour and underline transitions only. Everything respects `prefers-reduced-motion`. Page transitions are deferred.

## Components (`src/components/ui/`)

`Container`, `Section` (spacing plus optional rule and label), `Heading` (level and visual size kept separate), `Prose` (styles for rendered Markdown), `TextLink` (underline with offset, external links get an arrow and `rel`), `Button` and `ButtonLink` (primary: lemon fill · secondary: outline), `Badge` (availability), `Tag`, `Card` (media, title, meta, summary, link covering the card), `Rule`, `SkipLink`, `VisuallyHidden`, and the form primitives `Field`, `Input`, `Textarea`, `RadioGroup`, `FieldError`.

Every interactive element shows a 2px lemon focus outline with a 2px offset, is reachable by keyboard, and has a hit area of at least 44px on touch.

A preview only `/styleguide` route shows every token and component. It is excluded in production.
