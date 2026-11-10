# Verify: Stack & architecture · spec 0001

**Verdict**: PASS (the feature's done when is met, and every contract the spec pins was checked on the running system)
**Date**: 2026-11-10
**Task**: PF-T06 · branch `pf-t06` on `main` at `856090e` (after #27)
**Approach**: Skateboard. Feature 1 promised a runnable skeleton that builds, runs on the Workers runtime, is checked by CI on every PR and gets a preview per branch. Spec 0001 is a decision spec with no numbered ACs, so this report checks its done when plus the contracts it pins (CI, previews, size gate, `APP_ENV`, configuration).

## How it was run

- `pnpm build:worker` and the CI size gate script (copied from `.github/workflows/ci.yml`) on this branch.
- The live Workers Builds deploys: production `https://toyinog-portfolio.jnr4u2.workers.dev` (from `main`) and the preview alias `https://rr1-t04-contact-form-toyinog-portfolio.jnr4u2.workers.dev` (from a PR branch), read with `curl`.
- GitHub Actions runs and check runs read with `gh`.

## Done when

| Item | Verdict | Evidence |
|---|---|---|
| Stack and hosting recorded in a spec | met ✅ | `docs/specs/0001-stack-architecture/index.md` and `rationale.md`. |
| The site builds and runs locally | met ✅ | `pnpm build:worker` exit 0 on this branch. `pnpm test:e2e` starts `pnpm preview` (the real Workers runtime) and passed 98 of 98 earlier today on the same code (#27 head). |
| CI runs lint, typecheck, test and build on every PR | met ✅ | `ci.yml` triggers on `pull_request` and pushes to `main`, Node from `.nvmrc`. CI run 42815887354 (PR #27): Install, Lint, Format, Typecheck, Content check, Unit tests, OpenNext build, Worker size gate, Playwright install, End to end tests (98 passed), report upload, all success. |
| Each PR gets a preview deployment | met ✅ | Workers Builds check on #27's head: success, `Preview URL: https://83a6bbd8-toyinog-portfolio.jnr4u2.workers.dev`, `Preview Alias URL: https://rr1-t04-contact-form-toyinog-portfolio.jnr4u2.workers.dev`. |

## Pinned contracts

| Contract | Verdict | Evidence |
|---|---|---|
| Size gate fails over 3 MiB | met ✅ | Gate script on this build: `Compressed Worker: 1535.54 KiB (limit 3072 KiB)`, exit 0. With `WORKER_SIZE_LIMIT_KIB=1000`: `::error::Compressed Worker is 1535.54 KiB, over the 1000 KiB …`, exit 1. CI on #27 logged `Total Upload: 7261.31 KiB / gzip: 1535.46 KiB`. |
| `APP_ENV` resolution (explicit, else `production` on `main` via `WORKERS_CI_BRANCH`, else `preview`) | met ✅ | Live: production `/work` lists 3 projects (the draft `marketing-site` hidden), the preview lists 4 (draft shown), so each build got its own `APP_ENV`. The preview contact form dry runs (contact verify, `contact.dry_run` log). `src/lib/env.test.ts` 5 of 5 pass (explicit value, `main`, other branches, unknown value rejected, process env). |
| Production deploys from `main` | met ✅ | Workers Builds check on `856090e` (the #27 merge on `main`): success; production serves the merged site. |
| Security headers | met ✅ | Production `/`: `content-security-policy` (self plus `challenges.cloudflare.com`, `static.cloudflareinsights.com`, `cloudflareinsights.com`), `x-content-type-options: nosniff`, `referrer-policy: strict-origin-when-cross-origin`, `permissions-policy`, `x-frame-options: DENY`. |
| Versions and toolchain | met ✅ | `next` 16.4.5, `react` 19.3.1, `@opennextjs/cloudflare` 1.20.16, `wrangler` 4.158.0, TypeScript 6.0.3; `.nvmrc` 26.13.0 matches `engines`; `packageManager` `pnpm@12.18.0`. Dependabot weekly, with `next`, `react`, `react-dom`, `@opennextjs/cloudflare` and `wrangler` grouped. |
| Scripts | met ✅ | `dev`, `build`, `build:worker`, `preview`, `deploy`, `upload`, `lint`, `format`, `format:check`, `typecheck`, `test`, `test:e2e`, `cf-typegen` all present (plus `content:check` from spec 0002). |
| `wrangler.jsonc` | met ✅ | `name` `toyinog-portfolio`, `main` `.open-next/worker.js`, `compatibility_date` 2026-11-01, `nodejs_compat`, assets binding `ASSETS`, `observability.enabled`, `send_email` `SEND_EMAIL` with no destination, `ratelimits` `CONTACT_RATE_LIMITER` 5 per 60 s, `vars.CONTACT_FROM_EMAIL`. No personal data. |
| Caching and dev bindings | met ✅ | `open-next.config.ts` uses the static assets incremental cache. `next.config.ts` calls `initOpenNextCloudflareForDev()`, `images.unoptimized: true`. |
| Static generation | met ✅ | `tests/e2e/static.spec.ts` checks `/`, `/work`, `/contact` and every case study are served prerendered (`x-opennext-cache: HIT`, `x-nextjs-prerender: 1`). |
| Secrets stay out of the repo | met ✅ | `.dev.vars.example` and `.env.example` list names only; `.dev.vars` and `.env.local` are git ignored. |
| `robots.ts` and `sitemap.ts` | met ✅ | Both present; the sitemap lists `/`, `/work`, the case studies and `/contact`. |

## Owed, outside the code (Toyin actions in spec 0001's follow up)

- **Branch protection on `main` is off** (`gh api …/branches/main`: `protected: false`). The spec wants `ci` and the Workers Builds check required. This is a Toyin action in the GitHub settings, not a code gap.
- **Production Turnstile site key**: production `/contact` renders an empty site key because `NEXT_PUBLIC_TURNSTILE_SITE_KEY` isn't set in Workers Builds yet. That is part of the open contact setup action item (Email Routing, Turnstile widget, secrets) that Toyin will do before launch.

Neither blocks feature 1: the skeleton, CI and previews all work.
