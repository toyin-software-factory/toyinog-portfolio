# src/lib/content

Typed, validated site content, read at build time only. Contract: [spec 0002](../../../docs/specs/0002-content-model.md). Author guide: [content/README.md](../../../content/README.md).

## Files

- `index.ts`: the only import for pages. `getProjects`, `getFeaturedProjects`, `getProject(slug)`, `getProjectSlugs`, `getProfile`, `getAbout`, plus `firstParagraphText` and the content types. Marked `server-only`.
- `schema.ts`: zod strict schemas built by `createSchemas({ currentYear, publicFileExists })`. Types come from here.
- `load.ts`: `loadContent({ rootDir, appEnv, currentYear })` reads `content/`, validates, applies collection rules (`MAX_FEATURED` = 3, unique slugs, drafts), sorts. Pure apart from file reads, so tests point it at fixtures.
- `issues.ts` and `errors.ts`: turn zod issues into one `ContentError` with plain word messages grouped by file.
- `markdown.ts`: `renderMarkdown()`, the only Markdown to HTML path (no raw HTML, unsafe URLs stripped, heading ids, `rel="noopener noreferrer"` on external links).
- `text.ts`: plain text helpers over `renderMarkdown()` output (`firstParagraphText`).
- `check.ts`: the `pnpm content:check` script. CI runs it before the unit tests.

## Rules

- Import content only through `@/lib/content` from server components of statically generated routes. Never from a `"use client"` file (a test scans for it) and never at request time: Workers can't read `content/`.
- Every new content route must be prerendered and added to `tests/e2e/static.spec.ts`.
- Drafts depend on `getAppEnv()` (`src/lib/env.ts`), never on `NODE_ENV` or a direct `process.env` read.
- A new or changed field goes into `schema.ts`, the placeholder files, `content/README.md` and spec 0002 together. Error messages stay in plain words and name the file and field.
- Tests use the fixtures in `__fixtures__/` (copied to a temp folder per test), not the real `content/`, except `index.test.ts`, which checks the real placeholder content.

_Drafted by /sync from the introducing change, worth a quick human pass._
