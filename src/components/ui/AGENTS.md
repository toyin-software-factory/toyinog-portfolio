# src/components/ui

The base components every page is built from. Contract: [spec 0003](../../../docs/specs/0003-design-system.md). Look and rules: [design.md](../../../design.md). Tokens: `src/app/globals.css` (`@theme`).

## Files

- One component per file, named exports, re-exported from `index.ts`: import from `@/components/ui`, never a file path.
- `buttonStyles.ts` (`buttonClass`, `disabledButtonClass`) is shared by `Button` and `ButtonLink`; `controlStyles.ts` (`controlClass`) by `Input` and `Textarea`. Change a look there, not per component.
- `cx.ts` joins class names. `icons.tsx` holds the decorative SVG icons (`aria-hidden`, sized in `em`, `currentColor`).
- `rawColors.ts` plus `rawColors.test.ts`: the guard that fails the tests on a hex value or colour function anywhere in `src/components` or `src/app` outside `globals.css`.

## Rules

- Only token utilities (`bg-bg`, `text-accent`, `text-h1`, `max-w-page`, `rounded-control` …). No raw colours, no Tailwind default palette (it is cleared in the theme). A new colour or size goes into `design.md` and `globals.css` together.
- Every interactive element: the global lemon `:focus-visible` outline (never remove or restyle it per component), full keyboard support, and a 44 by 44 touch target (`min-h-11 min-w-11`; a radio's target is its whole label row).
- Transitions list their properties (`transition-[color,background-color,border-color]`), never `transition-all`, so the focus ring appears at once; `prefers-reduced-motion` turns them off in `globals.css`.
- Form primitives: `Field` wires the label, hint and error ids to its control through a render prop; `RadioGroup` gives each radio the id `<name>-<value>` so error summaries can link to it.
- A new component also gets a Vitest test for its roles and labels, an entry in `design.md`'s component list, and a specimen on `/styleguide` (`src/app/styleguide/`).
- Tests: `*.test.tsx` beside each file; `tests/e2e/styleguide.spec.ts` (focus ring, targets, keyboard, reduced motion, Prose, axe at 390 and 1440).

_Drafted by /sync for PF-T06 from the existing area, worth a quick human pass._
