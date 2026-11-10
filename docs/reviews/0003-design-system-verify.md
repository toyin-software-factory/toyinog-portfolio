# Verify: Design system & UI foundation · spec 0003

**Verdict**: PASS (8 of 8 acceptance criteria met, every specced surface built)
**Date**: 2026-11-10
**Task**: PF-T06 · branch `pf-t06` on `main` at `856090e` (after #27)
**Approach**: Skateboard. Feature 4 promised the tokens, fonts, base components and a preview only styleguide that every page builds on. Pages since then (shell, Home, Work, Contact) use it, so this run also looked at it in use.

## How it was run

- Live deploys: the Workers Builds preview alias `https://rr1-t04-contact-form-toyinog-portfolio.jnr4u2.workers.dev` (`APP_ENV=preview`) and production `https://toyinog-portfolio.jnr4u2.workers.dev`, read with `curl`.
- `pnpm test:e2e` on this branch: Playwright against `pnpm preview` (the Workers runtime), desktop (1440) and mobile (390), 106 passed, including 20 on `/styleguide` (10 per width).
- `pnpm test`: 185 passed.

## Acceptance criteria

| AC | Verdict | Evidence |
|---|---|---|
| AC-1 | met ✅ | Tokens live in `src/app/globals.css` `@theme`, with Tailwind's default colours, sizes, radii and shadows cleared. `src/components/ui/rawColors.test.ts` scans `src/components` and `src/app` for hex values and colour functions (only `globals.css` and the guard's own pattern file are allowed): passes. A `grep` for hex values outside those files finds only `#main` fragment links. |
| AC-2 | met ✅ | Production `/` HTML has no `fonts.googleapis.com` or `fonts.gstatic.com`; it preloads 3 `woff2` files from `/_next/static/media/`. e2e "loads fonts from the site itself, not a font host" passes at both widths. |
| AC-3 | met ✅ | Every component `design.md` lists exists in `src/components/ui/` with named exports and a Vitest test: Container, Section, Heading, Prose, TextLink, Button, ButtonLink, Badge, Tag, Card, Rule, SkipLink, VisuallyHidden, Field, Input, Textarea, RadioGroup, FieldError. Gaps found and filled here: `icons.tsx` (now tested: decorative, `aria-hidden`, sized in `em`, `currentColor`) and `cx.ts`. |
| AC-4 | met ✅, with the inline link exception | e2e on `/styleguide`: tabbing through every control shows a solid 2px outline in the lemon token. New in this run: buttons and button links measure at least 44 by 44, each radio row (the label that wraps the radio) is at least 44px tall, and radio groups work by keyboard (focus the group, ArrowDown and ArrowUp move the choice and focus). **Exception**: links inside running text are not 44px (measured on the PF-T06 preview: "the home page", 121 by 20). That is WCAG 2.5.8's inline exception, and the e2e test skips them on purpose. Card title links measure 37px tall at 390, but each one stretches over its whole card, so the tap target is the card. Spec 0003's AC-4 wording doesn't name the inline exception, so it is flagged for `/architect` below. |
| AC-5 | met ✅ | Production `/`: `<html lang="en">`, the first focusable element is "Skip to content" (`href="#main"`); e2e "skip link is first and moves focus to main" passes. New in this run: with `prefers-reduced-motion: reduce` a button has no transition (`0s`), without it the colours ease over `0.15s`. Base background, text colour, fonts and selection colour come from `body` and `::selection` in `globals.css`. |
| AC-6 | met ✅ | Preview `/styleguide`: `200`, `x-nextjs-prerender: 1`, `<meta name="robots" content="noindex, nofollow">`. Production `/styleguide`: `404`. Not in the preview sitemap. e2e "renders every section and is noindex" passes. |
| AC-7 | met ✅ | e2e: axe reports zero WCAG 2.2 AA violations on `/styleguide` at 390 and 1440, and "does not scroll sideways" passes at 390. |
| AC-8 | met ✅ | New in this run (e2e on the styleguide's Prose sample): max width is exactly 42rem, links and the blockquote rule use the lemon token, code blocks use the surface token, `h2` uses Instrument Serif, lists use discs. `Prose.test.tsx` checks the rendered structure. |

## Flagged for /architect

- Spec 0003 AC-4 says every interactive component has a 44 by 44 target. Links in running text can't, and WCAG 2.2 (2.5.8) exempts them. The AC should name that exception, as the e2e test already does. The behaviour is not a gap.

## Specced surfaces

- Tokens in `globals.css`, fonts in the root layout, `src/components/ui/` and `/styleguide`: all built and live.

Missing: none. Not applied: none.

## What this run added

The behaviour already met the spec; these checks were missing, so they now stay enforced:

- `tests/e2e/styleguide.spec.ts`: 44 by 44 targets and radio rows (AC-4), keyboard radio groups (AC-4), reduced motion (AC-5), Prose width and token styling (AC-8).
- `src/components/ui/icons.test.tsx`, `src/components/ui/cx.test.ts`.
