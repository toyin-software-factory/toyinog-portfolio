# src/components/site

The site shell shared by every page: `Header`, `NavLinks` and `Footer`, rendered by `src/app/layout.tsx` around `<main id="main">`. Contract: [spec 0004](../../../docs/specs/0004-site-shell-home.md). Built only from `src/components/ui/` and the design tokens (`design.md`).

## Rules

- The nav has exactly three always visible links (`NAV_ITEMS` in `NavLinks.tsx`), with no menu button, at 390px too. Adding a destination changes spec 0004 first.
- `NavLinks` is the only client component in the shell (it reads `usePathname()`). A link is current for its path and every path below it (`/work/<slug>` is Work). Keep everything else server rendered.
- The header is the "Back to top" target (`id="top"`, `tabIndex={-1}`); the footer links to it with a plain `<a>`, not `next/link`, so the browser moves focus.
- Header and footer text comes from `getProfile()` through the layout; nothing here reads content directly.
- Pages render no `<main>` of their own and exactly one `h1`. The 404 page is `src/app/not-found.tsx`.
- Tests: `site.test.tsx` (unit) and `tests/e2e/shell.spec.ts` (keyboard, phone layout, 404, axe).

_Drafted by /sync from the introducing change, worth a quick human pass._
