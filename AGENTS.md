# toyinog-portfolio

## Stack

- **Language / Runtime**: TypeScript (strict) on Node 26 LTS (`.nvmrc`), deployed to Cloudflare Workers
- **Framework**: Next.js 16 App Router via `@opennextjs/cloudflare`, React 19, Tailwind CSS 4
- **Key dependencies**: zod (all external input), gray-matter + unified/remark/rehype (Markdown at build time), Vitest + Testing Library, Playwright + axe
- **Package manager**: pnpm (version in `packageManager`)
- Full decision: [spec 0001](docs/specs/0001-stack-architecture/index.md). Content shape: [spec 0002](docs/specs/0002-content-model.md).

## Build approach

Skateboard: ship the smallest complete site a real visitor can use, deployed early, then grow it pass by pass, shippable at every step.

## Commands

```bash
pnpm install --frozen-lockfile   # install
pnpm dev                         # dev server (next dev)
pnpm preview                     # OpenNext build + local Workers runtime
pnpm lint && pnpm format:check && pnpm typecheck
pnpm test                        # Vitest
pnpm build:worker                # OpenNext build (what CI and deploys run)
pnpm test:e2e                    # Playwright, desktop + mobile, axe
pnpm cf-typegen                  # regenerate Cloudflare env types
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md` (or `NNNN-title/index.md`). Scope: `docs/scope/scope.md`.

## Rules

- Functional style: small pure functions and components, no classes, immutable data (`const`, `readonly`). Side effects (file reads, email, network) stay at the edges (content loader, server actions).
- TypeScript strict: no `any`, no `@ts-ignore` / `@ts-expect-error` without a comment saying why.
- Validate every external input with zod: form data, content front matter, environment variables (checked at startup or build).
- Folder by feature: route specific components live beside their route in `src/app/<route>/`. Shared UI in `src/components/`, shared logic in `src/lib/`.
- Named exports only, except where Next.js requires a default export (pages, layouts, route files, config).
- Content routes are statically generated. Content is read only at build time through `src/lib/content/` (server only). Never read files at runtime on Workers.
- Production vs preview comes from `getAppEnv()` in `src/lib/env.ts` only.
- Accessible by default (WCAG AA): semantic HTML, full keyboard support, visible focus, AA contrast, alt text on every image.
- Tests: unit tests for logic, a Playwright spec per page and flow with an axe check.
- Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`). PR titles `[TASK-ID] …`. Secrets only in env vars or Worker secrets, never committed.

## Tooling

- ESLint flat config (Next core web vitals, `jsx-a11y`, `typescript-eslint` strict) plus Prettier (Tailwind plugin).
- Pre-commit: a light hook that runs Prettier and ESLint on staged files only. Typecheck and tests run in CI (`.github/workflows/ci.yml`).

## Git

- integration: on
- branch prefix: one branch per task, named for the task id
- commit: per-milestone

## Agent skills

- [agent-browser](.claude/skills/agent-browser/): `vercel-labs/agent-browser`, drives a real browser for `/check verify` and PR proof (screenshots and video)

## Context files

<!-- Nested AGENTS.md files are listed here as they are created -->
- [src/lib/content/AGENTS.md](src/lib/content/AGENTS.md): content loader, schemas, Markdown pipeline and their build time only rules
- [src/components/site/AGENTS.md](src/components/site/AGENTS.md): the site shell (header, nav, footer) and its rules

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
