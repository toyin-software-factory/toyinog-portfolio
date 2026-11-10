# 0002. Markdown content model for projects, profile and About

**Date**: 2026-11-10
**Status**: Proposed

## Summary

All site content lives in Markdown files under `content/`, each with a small header (front matter, the `---` block at the top) that is checked with zod when the site builds. There are three kinds of file: one per project case study, one site profile (name, headline, links, availability), and one About file (bio, experience, skills, CV). A file that breaks the rules stops the build with a message naming the file and the field, so a mistake never reaches the live site. Pages never read files themselves. They call a small typed loader in `src/lib/content/`.

## Context

The scope (feature 3) requires that Toyin edit the site by changing Markdown files in the repo, with no CMS or database (spec 0001). Spec 0001 also fixes the tools (`gray-matter`, zod, `unified` / `remark` / `rehype`), the folder (`content/`), and the rule that content is read only at build time, because the site runs on Cloudflare Workers, which cannot read the repo at runtime.

Every page in Release 1 (Home, Work, case studies, About) and the SEO feature read from this content, and the team builds with placeholder text until Toyin writes the real copy before launch. Changing the shape later means editing every content file and every page that reads it, so the shape is decided once, here.

Toyin chose (Content Q1 to Q4): the standard case study, a featured flag plus a manual order (with drafts), an About page with bio, experience timeline, grouped skills and CV, and a site profile with an availability badge and LinkedIn, GitHub and email links.

## Requirements

**User stories**:
- As Toyin, I want to add a project by adding one Markdown file, so the site updates without code changes.
- As Toyin, I want a clear build error when I get a field wrong, so a broken page never goes live.
- As a builder, I want typed, validated content from one loader, so pages never parse files or guess at shapes.

**Acceptance criteria**:
- **AC-1**: Each `content/work/<slug>.md` file is parsed into a typed `Project` matching the schema below. The slug comes from the filename.
- **AC-2**: `content/pages/profile.md` and `content/pages/about.md` are parsed into a typed `Profile` and `About`.
- **AC-3**: Any schema violation (missing required field, wrong type, unknown field, bad date, bad URL, missing image file, missing CV file) fails `pnpm build` and `pnpm test`. The error names the file path and every failing field, with the reason in plain words.
- **AC-4**: Projects with `draft: true` are excluded from every list, every static route and the sitemap in production builds (`APP_ENV=production`). They are included in previews and local dev, with a visible "Draft" flag in the data.
- **AC-5**: `getProjects()` returns published projects sorted by `order` ascending, ties broken by `year` descending, then `title`. `getFeaturedProjects()` returns the featured ones in the same order.
- **AC-6**: More than 3 published featured projects, or duplicate slugs, fail the build with a clear message.
- **AC-7**: Case study Markdown bodies render to HTML at build time, with heading ids, external links opening safely (`rel="noopener noreferrer"`), and no raw HTML passed through (Markdown only, so content can't inject scripts).
- **AC-8**: Placeholder content exists for every type: at least 4 projects (3 featured, 1 draft), a full profile, and a full About with at least 3 experience entries, 3 skill groups and a placeholder CV PDF. All of it is clearly marked as placeholder text.
- **AC-9**: Every image field has a required alt text field next to it. An empty alt text fails the build (WCAG AA).
- **AC-10**: The content loader and the Markdown pipeline are imported only from build time code (server components of statically generated routes), never from client components, and they stay out of the Worker bundle per spec 0001.

## Options considered

### Option 1: One Markdown file per item, front matter for structured data (chosen)

Projects are one file each. Profile and About are single files whose structured parts (links, experience, skills) sit in front matter and whose prose sits in the body.

**Pros**: one format to learn, matches spec 0001's tools, every edit is a small diff.
**Cons**: long lists (experience) in YAML front matter are fiddly to edit, and YAML indentation mistakes are possible (caught by the build).

### Option 2: Markdown for prose, separate YAML or JSON files for lists

`experience.yaml`, `skills.yaml` and `profile.json` alongside the Markdown files.

**Pros**: lists are cleaner on their own.
**Cons**: two or three formats and more files for Toyin to keep track of, for little gain at this size.

### Option 3: TypeScript content files

Content as typed TypeScript objects.

**Pros**: full type checking in the editor.
**Cons**: Toyin would edit code, which goes against the scope's goal of simple text files.

## Decision

**Chosen option**: Option 1: one Markdown file per item, structured data in zod checked front matter, prose in the body.

## Rationale

Toyin asked for simple text files. One format (Markdown with front matter) keeps the editing model to a single idea: copy a file, change the header, write the text. YAML indentation errors are the main risk, and AC-3 turns them into a clear build error instead of a broken page. Strict schemas (unknown keys rejected) catch typos like `feautred` that would otherwise fail silently.

Lead calls (each with the runner up): slug from the filename (runner up: a `slug` field, which can drift from the filename); images in `public/images/` referenced by absolute path and checked to exist at build (runner up: images colocated with the Markdown, which needs a copy step); dates as `YYYY-MM` strings (runner up: full ISO dates, which are more precision than a CV needs); no raw HTML in Markdown (runner up: allow it with sanitizing, which is more code for a feature nobody asked for).

## Feature design

**Data model sketch** (zod schemas in `src/lib/content/schema.ts`, all `.strict()`):

`Project` (file `content/work/<slug>.md`):
| Field | Type | Required | Notes |
|---|---|---|---|
| `slug` | string | derived | from the filename, `^[a-z0-9]+(-[a-z0-9]+)*$` |
| `title` | string, 1 to 80 chars | yes | |
| `summary` | string, 1 to 200 chars | yes | used on cards and in meta descriptions |
| `role` | string | yes | e.g. "Lead frontend engineer" |
| `client` | string | no | company or client name |
| `year` | integer, 2000 to the current year + 1 | yes | |
| `tags` | string[], 1 to 8 | yes | tech or discipline |
| `cover` | `{ src: string, alt: string }` | yes | `src` starts with `/images/work/`, the file must exist in `public/`, `alt` is non empty |
| `links` | `{ label: string, url: URL }[]`, 0 to 2 | no | https only |
| `featured` | boolean | no, default false | at most 3 published |
| `order` | integer ≥ 0 | yes | lower comes first |
| `draft` | boolean | no, default false | |
| `body` | Markdown | yes | should contain `## Problem`, `## What I did`, `## Outcome` (a build warning, not an error, if any is missing) |
| `html` | string | derived | the rendered body |

`Profile` (file `content/pages/profile.md`, front matter only, body ignored):
| Field | Type | Required |
|---|---|---|
| `name` | string | yes |
| `headline` | string, max 100 | yes |
| `intro` | string, max 300 | yes |
| `location` | string | no |
| `availability` | enum `roles` · `projects` · `both` · `none` | yes |
| `links` | `{ linkedin: URL, github: URL }` | yes |
| `email` | email | yes (shown as text on the Contact page only) |

`About` (file `content/pages/about.md`):
| Field | Type | Required |
|---|---|---|
| `photo` | `{ src, alt }` | yes, `src` under `/images/`, the file must exist |
| `experience` | `{ role, company, location?, start: YYYY-MM, end: YYYY-MM or "present", highlights: string[2..4] }[]`, at least 1 | yes, `start` ≤ `end`, rendered newest first by `start` |
| `skillGroups` | `{ name: string, skills: string[1..20] }[]`, at least 1 | yes |
| `cv` | `{ file: string, updated: YYYY-MM }` | yes, `file` under `/cv/`, a `.pdf`, and must exist in `public/` |
| body | Markdown bio | yes |

No relationships between types. Nothing is persisted outside the repo.

**API surface** (build time functions in `src/lib/content/`, server only via `import 'server-only'`):
| Function | Returns | Errors |
|---|---|---|
| `getProjects()` | `Project[]` published, sorted (AC-5) | throws `ContentError` |
| `getFeaturedProjects()` | `Project[]` ≤ 3 | throws |
| `getProject(slug)` | `Project`, or `null` if missing or draft in production | throws on invalid content |
| `getProjectSlugs()` | `string[]` for `generateStaticParams` | |
| `getProfile()` | `Profile` | throws |
| `getAbout()` | `About` with `bioHtml` and sorted experience | throws |

All loaders read and validate everything once per build (memoized at module level). `ContentError` aggregates every problem across all files into one message, so Toyin fixes everything in one pass.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Draft filtering | is this a production build | `APP_ENV` (spec 0001), defaulting to `preview` when unset |
| Year upper bound | current year | the build machine clock at build time |
| Image or CV exists | file presence | `fs` check against `public/` at build |
| Experience order | sort key | `start` descending |
| Slug | identifier | filename without `.md` |

**Key invariants**: at most 3 published featured projects; slugs are unique and URL safe; every image has alt text; every referenced file exists; no raw HTML in rendered output.

**Security model**: content is trusted (it comes from the repo through reviewed PRs), but raw HTML is still disabled to rule out script injection through Markdown. Links are https only. The loader is server only.

**Configuration required**: none new (uses `APP_ENV` from spec 0001).

**Critical test scenarios**:
- Happy path: the placeholder content loads, and projects come back sorted with 3 featured, verifies **AC-1**, **AC-2**, **AC-5**, **AC-8**
- Failure: fixtures with a missing title, an unknown key, a bad date, an empty alt and a missing image produce one error listing each file and field, verifies **AC-3**, **AC-9**
- Rule: 4 featured projects, or a duplicate slug, fails, verifies **AC-6**
- Drafts: hidden with `APP_ENV=production`, present with `preview`, verifies **AC-4**
- Rendering: headings get ids, an external link gets `rel`, and a raw `<script>` in Markdown is not output, verifies **AC-7**

## Build plan

Skateboard: the whole model is small, so build it in one pass that leaves every page able to read real (placeholder) data.

1. zod schemas and types in `src/lib/content/schema.ts`, satisfies **AC-1**, **AC-2**, **AC-9**
2. Loader: read the files, parse front matter, validate, check that files exist, aggregate errors into `ContentError`, memoize, `server-only`, satisfies **AC-1**, **AC-2**, **AC-3**, **AC-10**
3. Collection rules: draft filtering by `APP_ENV`, sorting, featured cap, duplicate slugs, satisfies **AC-4**, **AC-5**, **AC-6**
4. Markdown rendering pipeline (`remark-parse` → `remark-rehype` without `allowDangerousHtml` → `rehype-slug` → external link `rel` → `rehype-stringify`), satisfies **AC-7**
5. Placeholder content and assets: 4 projects with placeholder cover images, profile, about, photo and CV PDF, all marked as placeholder, satisfies **AC-8**
6. Vitest tests with good and broken fixtures in `src/lib/content/__fixtures__/`, and a `content:check` script run in CI, satisfies **AC-3** to **AC-7**

## Consequences

**Positive**:
- One typed source of truth, so pages stay simple and content mistakes are caught before deploy.
- Adding a project is one file plus one image.

**Negative / tradeoffs**:
- Toyin has to write YAML front matter. Indentation mistakes are caught, but they're still friction. A short `content/README.md` with a copyable example is part of step 5.
- Strict schemas mean any new field needs a schema change (a code PR), not just a content edit.
- The image existence check reads `public/` at build. Images can't come from an external URL.

**Neutral**:
- Release 1 page specs (5 to 7) consume these functions, and the SEO feature (9) reads `summary`, `cover` and `Profile`.

## Follow-up

- [ ] `content/README.md` with how to add a project and copyable templates (built in step 5).
- [ ] Toyin replaces the placeholders before launch (scope feature 11).
