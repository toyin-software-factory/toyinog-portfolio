# 0001. Next.js on Cloudflare Workers as the portfolio stack

**Date**: 2026-11-10
**Status**: In Progress

## Summary

The toyinog.com portfolio is one Next.js app written in strict TypeScript and styled with Tailwind CSS. It runs on Cloudflare Workers through the OpenNext adapter (a tool that lets Next.js run on Cloudflare). Content comes from Markdown files in the repo that are checked with zod when the site is built. Nearly every page is prebuilt as static HTML. The only server code is the contact form, which uses Cloudflare's own services: Email Routing to send the message, Turnstile to block bots, and a rate limit. There is no database, no login and no separate backend, so there is very little to run or pay for.

## Requirements

This is a decision spec: it records the stack. The scaffold sub task of scope feature 1 builds it, and `/develop` works out the scaffold steps from `## Proposed stack` at build time.

**Done when** (from scope feature 1): the stack and hosting are recorded here; the empty site builds and runs locally; CI runs lint, typecheck, test and build on every PR; and each PR gets a preview deployment.

## Decision

**Chosen option**: Option 1: Next.js (App Router) on Cloudflare Workers via OpenNext, with Cloudflare platform services.

You build one Next.js monolith (a single deployable app) that renders content pages as static HTML at build time and runs only the contact form as server code on Cloudflare Workers.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Architecture | One Next.js app (monolith). Content pages are statically generated, and the only server code is the contact form | A personal site with one team needs the simplest thing that can ship. Static pages are fast, cheap and good for SEO |
| Language | TypeScript, `strict` on, Node.js current LTS for tooling | Team rule. Catches errors before they ship |
| Framework | Next.js, latest stable major that `@opennextjs/cloudflare` supports, App Router | Static generation plus server actions in one codebase, with the largest ecosystem (Toyin's pick) |
| Hosting | Cloudflare Workers via the OpenNext Cloudflare adapter (`@opennextjs/cloudflare`), configured with `wrangler.jsonc` | Toyin's pick. A fast global network and a generous free tier |
| Deploys and previews | Cloudflare Workers Builds (Git integration): `main` deploys to production, and every PR branch gets a preview URL | Previews with no deploy token kept in GitHub (Toyin's pick) |
| CI | GitHub Actions running `pnpm lint`, `pnpm typecheck`, `pnpm test`, `pnpm build`, and Playwright end to end tests, on every PR | The team's required checks, kept separate from deploys |
| Package manager | pnpm (version pinned in `package.json` `packageManager`) | Fast and strict about dependencies (Toyin's pick) |
| Lint and format | ESLint (Next.js core web vitals config, `jsx-a11y`, `typescript-eslint` strict) plus Prettier (with the Tailwind class sorting plugin) | Bug and accessibility rules plus consistent formatting (Toyin's pick) |
| Styling | Tailwind CSS (current major), design tokens defined once in the theme | One source of truth for the design system (Toyin's pick). The tokens themselves are decided in the design system spec (scope feature 4) |
| Content | Markdown files in `content/`, front matter parsed with `gray-matter`, validated with zod, body rendered with `unified` / `remark` / `rehype` at build time. A malformed file fails the build | No CMS, no database, and Workers can't read files at runtime, so everything is resolved at build (Toyin's pick). The schema is decided in the content model spec (scope feature 3) |
| Primary database | None | Content lives in the repo, and contact messages go straight to email and are not stored |
| Auth | None | There are no logged in users. Toyin edits content through pull requests |
| Contact email | Cloudflare Email Routing `send_email` Worker binding, sending from an address on toyinog.com to Toyin's verified inbox, with the visitor's address as reply to. The MIME message is built with `mimetext` (the Workers runtime has no MIME builder) | Stays inside Cloudflare and is free (Toyin's pick). It requires toyinog.com on Cloudflare with Email Routing (MX) enabled |
| Spam protection | Cloudflare Turnstile (verified server side) plus a hidden honeypot field plus the Workers Rate Limiting binding keyed by client IP | Free, sets no tracking cookies, and covers smart bots, dumb bots and floods (Toyin's pick) |
| Input validation | zod on every server input (the contact form) and on all content front matter | Team rule |
| Analytics | Cloudflare Web Analytics (cookie free beacon). A contact conversion counts as a page view of `/contact/sent` | Free, no cookie banner, same platform (Toyin's pick) |
| Images | Static, pre sized images in `public/`, served by Next.js with `images.unoptimized: true` (OpenNext on Workers has no built in image optimizer) | A small site doesn't need a paid image service. Revisit if a case study needs many large images |
| Observability | Cloudflare Workers Logs (enabled in `wrangler.jsonc`) with structured `console` logs from the contact action. No PII in logs beyond what the email needs | Enough for one server action. A hosted error tracker is a later follow up if errors appear |
| Testing | Vitest plus Testing Library (unit and component), Playwright with `@axe-core/playwright` (end to end, accessibility, and desktop plus mobile proof screenshots) | Covers logic, real pages and WCAG AA in CI (Toyin's pick) |

## Versions

Pin exact versions in `package.json` when you scaffold, and record them in root `AGENTS.md` through `/audit`. Choose them in this order: first the latest `@opennextjs/cloudflare`, then the newest Next.js major it officially supports, then the React version that Next.js pins. Everything else takes its current stable major. Set Node.js to the current LTS in `.nvmrc` and in `engines`, and set the pnpm version in `packageManager`. Turn on Dependabot (weekly) and group `next`, `react`, `react-dom`, `@opennextjs/cloudflare` and `wrangler` into one update, so the adapter and the framework always move together.

Toolchain specifics:
- ESLint uses flat config (`eslint.config.mjs`), and `pnpm lint` runs `eslint .` (recent Next.js versions removed `next lint`).
- Tailwind runs through `@tailwindcss/postcss` (Tailwind v4 style, configured in CSS). `prettier-plugin-tailwindcss` points at the global stylesheet.

## Directory layout and scripts

Every later spec and PR uses these names.

```
src/app/                 routes (App Router)
src/components/          shared UI components
src/lib/content/         content loading + zod schemas (build time only)
src/lib/                 other server and shared helpers
content/work/            one Markdown file per project
content/pages/           bio, experience, skills and similar
public/                  static assets (images, cv.pdf)
tests/e2e/               Playwright specs
src/**/*.test.ts(x)      Vitest unit and component tests, next to the code
wrangler.jsonc, open-next.config.ts, next.config.ts, .nvmrc
```

`package.json` scripts: `dev` (next dev), `build` (next build), `build:worker` (`opennextjs-cloudflare build`), `preview` (`opennextjs-cloudflare build && opennextjs-cloudflare preview`, which runs the real Workers runtime locally), `deploy` (`opennextjs-cloudflare deploy`), `upload` (`opennextjs-cloudflare upload`, for preview versions), `lint`, `format`, `format:check`, `typecheck` (`tsc --noEmit`), `test` (Vitest only), `test:e2e` (Playwright), `cf-typegen` (`wrangler types`, so the Cloudflare `env` is strictly typed).

## Static generation rules

- Content is loaded only at build time. Every content route is statically generated: case study routes export `generateStaticParams` and `dynamicParams = false`, and content routes set `export const dynamic = 'force-static'`. A content route that turns dynamic would try to read `content/` on Workers at runtime and fail. An e2e test checks that every content route is served as prebuilt HTML.
- The Markdown pipeline (`gray-matter`, `unified`, `remark`, `rehype`) is imported only from server code of prerendered routes and never runs at request time. OpenNext still bundles it into the Worker (about 150 KiB gzip, measured in PF-T02), which is accepted. The CI size gate guards the total, and if the bundle nears about 2.5 MiB, move content to a build time JSON step.
- `open-next.config.ts` uses the static assets incremental cache. There is no R2 and no other cache store.
- `next.config.ts` calls `initOpenNextCloudflareForDev()`, so bindings work in `next dev`.

## Cloudflare configuration

`wrangler.jsonc` (committed, with no personal data in it): worker `name` `toyinog-portfolio`, `main` `.open-next/worker.js`, a recent `compatibility_date`, `compatibility_flags: ["nodejs_compat"]`, `assets` (directory `.open-next/assets`, binding `ASSETS`), `observability.enabled: true`, `send_email` binding `SEND_EMAIL` with no `destination_address` (the address comes from a secret), `ratelimits` binding `CONTACT_RATE_LIMITER` (its own `namespace_id`, `limit: 5`, `period: 60`), `vars` holding `CONTACT_FROM_EMAIL`. The custom domain route for toyinog.com is added at go live.

Workers Builds settings (the Toyin action):
- Production branch `main`. Build command `pnpm opennextjs-cloudflare build`, deploy command `pnpm opennextjs-cloudflare deploy`.
- Non production branches enabled. Deploy command `pnpm opennextjs-cloudflare upload`, which creates a preview version with its own URL.
- The workers.dev subdomain and preview URLs are enabled.
- Build variables: `NODE_VERSION`, plus the two `NEXT_PUBLIC_*` values below. No `APP_ENV` build variable (it is derived from the branch).

**Server code reads bindings and secrets** through `getCloudflareContext().env` from `@opennextjs/cloudflare`, typed by `cf-typegen`. Client IP for rate limiting comes from the `CF-Connecting-IP` header, never `x-forwarded-for`. The rate limiter is best effort (counted per Cloudflare location). Turnstile and the honeypot are the real abuse defence.

**Production vs preview (`APP_ENV`).** Previews run the same Worker with the same runtime vars and bindings as production, and Workers Builds uses one build command for every branch. So `APP_ENV` is a build time value, baked into each branch's build: `next.config.ts` resolves it (explicit `APP_ENV` if set, else `production` when `WORKERS_CI_BRANCH` is `main`, a variable Workers Builds sets, else `preview`) and exposes it through the Next.js `env` config. Code reads it only through `getAppEnv()` in `src/lib/env.ts` (zod validated). It is never a `wrangler.jsonc` var. It drives these rules:
- Outside production, the contact action does not send real email. It logs a dry run and returns success, so preview testing never emails Toyin.
- Outside production, Turnstile uses Cloudflare's published test keys (always pass), so previews on `*.workers.dev` work without adding preview hostnames to the widget.
- The analytics beacon renders only in production.

## Configuration required

Names only, never values in the repo. Plain dashboard variables are wiped by each `wrangler deploy` (unless `keep_vars` is set), so anything not in `wrangler.jsonc` is a secret.

| Name | Kind | Where it is set |
|---|---|---|
| `CONTACT_TO_EMAIL` | Worker secret (Toyin's verified inbox; secret so the address isn't committed) | Cloudflare secret. Local: `.dev.vars` |
| `CONTACT_FROM_EMAIL` | Plain var, e.g. `contact@toyinog.com` | `wrangler.jsonc` `vars` |
| `APP_ENV` | Build time value: `production` or `preview` | Resolved in `next.config.ts` from `APP_ENV` or `WORKERS_CI_BRANCH` (see above). Not set in Workers Builds. Local and CI: unset, so `preview` |
| `TURNSTILE_SECRET_KEY` | Worker secret | Cloudflare secret. Local and CI: the Turnstile test secret |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Public, inlined at build | Workers Builds build variable. Local and CI: the Turnstile test site key |
| `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` | Public, inlined at build | Workers Builds build variable. Unset locally and in CI (no beacon) |

`.dev.vars` and `.env.local` are git ignored. A committed `.dev.vars.example` and `.env.example` list the names.

## CI contract

GitHub Actions workflow `ci.yml`, on every PR and on pushes to `main`, Node from `.nvmrc`, pnpm with cache:
1. `pnpm install --frozen-lockfile`
2. `pnpm lint`, `pnpm format:check`, `pnpm typecheck`
3. `pnpm test` (Vitest)
4. `pnpm build:worker` (the OpenNext build, so adapter failures are caught, not only `next build`), followed by a bundle size gate: `wrangler deploy --dry-run --outdir` and fail if the compressed Worker goes over 3 MiB (the Workers Free plan limit)
5. `pnpm exec playwright install --with-deps chromium`, then `pnpm test:e2e` against `pnpm preview` (the real Workers runtime) with the Turnstile test keys and `APP_ENV=preview`. Playwright has a desktop project and a mobile project (a phone viewport), and runs axe on every page. The HTML report is uploaded as an artifact.

Required checks on `main` (branch protection, a Toyin action): `ci` and the Workers Builds check.

## Domain, SEO and security basics

- Canonical host: `https://toyinog.com` (apex). `www.toyinog.com` redirects to it with a 301, set up at go live.
- `src/app/sitemap.ts` and `src/app/robots.ts` come with the scaffold. Each page sets a canonical URL from one `SITE_URL` constant.
- Security headers come from `next.config.ts` `headers()`: a content security policy allowing self plus `challenges.cloudflare.com` (Turnstile), `static.cloudflareinsights.com` and `cloudflareinsights.com` (analytics), plus `X-Content-Type-Options`, `Referrer-Policy` and `Permissions-Policy`.

## Consequences

**Positive**:
- Almost nothing to operate: no database, no server to patch, no login to secure. Email, spam protection and analytics are free. Hosting is free as long as the Worker stays under the Free plan limits (3 MiB compressed bundle, 10 ms CPU per request). A Next.js Worker can outgrow those limits, in which case Workers Paid costs about 5 USD a month (see Follow-up).
- Static pages give fast loads and strong SEO by default.
- One vendor account (Cloudflare) covers hosting, DNS, email, Turnstile and analytics.

**Negative / tradeoffs**:
- Next.js on Workers goes through an adapter. Some Next.js features lag or need workarounds (no built in image optimization, and the Node.js API surface is limited to Workers compatibility). Pin versions that OpenNext supports, and upgrade Next.js only after checking OpenNext's support.
- Email Routing takes over toyinog.com's MX records. That's safe today (Toyin confirmed the domain is on Cloudflare and receives no mail), but adding a mailbox provider for @toyinog.com later would have to coexist with Email Routing or replace it.
- Email Routing's `send_email` binding sends only to verified addresses. That fits a contact form, but the deferred auto reply to visitors would need Cloudflare's newer email sending service or a different provider (check the current docs then). Deliverability to Gmail and Outlook must be tested before launch.
- Cloudflare Web Analytics has no custom events, so conversions are approximated by a page view of `/contact/sent`. The contact spec makes that page `noindex` and reachable only right after a successful send, so direct visits don't inflate the count. The hiring vs project split shows in the emails, not in analytics.
- The rate limiter is approximate (counted per Cloudflare location), so it slows floods but is not a hard guarantee.
- Vendor concentration: an outage or account problem at Cloudflare takes out everything at once.

**Neutral**:
- Content changes ship through pull requests, so every edit runs CI and gets a preview.
- Two pipelines: GitHub Actions for checks, and Cloudflare Workers Builds for deploys. Both must be green before merge.

## Follow-up

- [x] DNS and mail check (2026-11-10): toyinog.com is already in Toyin's Cloudflare account and receives no mail today, so Email Routing can take over the MX records safely.
- [ ] Toyin action at scaffold time: create or confirm the Cloudflare account, connect the GitHub repo through Workers Builds with the settings above, enable preview URLs, and set branch protection on `main`.
- [ ] If the CI size gate fails on the Free plan (likely for Next.js on Workers), Toyin decides whether to upgrade to Workers Paid (about 5 USD a month). The scaffold PR reports the measured bundle size.
- [ ] Toyin action at contact form time: enable Email Routing on toyinog.com, verify the destination inbox, and create the Turnstile widget.
- [ ] Toyin action at analytics time: create the Web Analytics site and share the beacon token as a variable.
- [ ] `/audit` after the scaffold: record these commands and conventions in root `AGENTS.md`.
- [ ] Revisit images if case studies need many large images (Cloudflare Images or build time optimization).

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
