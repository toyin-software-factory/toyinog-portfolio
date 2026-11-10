# 0008. SEO and social sharing

**Date**: 2026-11-10
**Status**: In Progress

## Summary

Every public page gets a canonical URL, a unique title and description, social share tags (Open Graph and Twitter) and a share image. Home and About carry structured data describing Toyin as a Person, and each case study is described as a CreativeWork. The sitemap lists every page, and `robots.txt` allows indexing only in production, so the workers.dev previews never show up in search. A static default share image and site icons complete it.

## Context

Scope feature 9. Toyin wants the site to be found by recruiters and clients, and to look good when shared on LinkedIn and in chats. The page specs (0004 to 0007) already set basic titles and descriptions and a sitemap. This spec adds the missing pieces consistently. The site runs on Cloudflare Workers with every content page prerendered (spec 0001). Previews live on public `*.workers.dev` URLs, which search engines could index unless told not to.

## Requirements

**Acceptance criteria**:
- **AC-1**: The root metadata sets `metadataBase` to `SITE_URL` (`https://toyinog.com`). Every public page sets `alternates.canonical` to its own path.
- **AC-2**: Every public page has a unique `<title>` and a `description` of 50 to 160 characters. A test checks uniqueness and length across all prerendered routes.
- **AC-3**: Every public page has Open Graph tags (`og:title`, `og:description`, `og:url`, `og:type`, `og:image` with its real `og:image:width` and `og:image:height`, `og:site_name`) and `twitter:card=summary_large_image`. Case studies use their cover as the image at its real size (16:10 per spec 0005; LinkedIn and others crop it to 1.91:1, so cover art keeps key content centred). All other pages use `public/og/default.png` (exactly 1200x630, Carbon Black with Toyin's name and headline, made once by the builder and committed).
- **AC-4**: Home outputs JSON-LD for `WebSite` and `Person` (name, jobTitle from headline, url, `sameAs` LinkedIn and GitHub, image from the About photo). About outputs the same `Person`. Each case study outputs `CreativeWork` (name, description, image, dateCreated from year, author as the Person). All of it validates as schema.org JSON-LD.
- **AC-5** (amended 2026-11-10): When the site is indexable (`getAppEnv()` is `production`, and from spec 0010 also `SITE_LAUNCHED`), `robots.ts` returns allow all plus the sitemap URL. Otherwise it returns allow all with no sitemap, so crawlers can fetch pages and see the noindex. Every page then carries `robots: { index: false }` in the root metadata and an `X-Robots-Tag: noindex` response header (from `next.config.ts` `headers()`, chosen at build time). A `Disallow: /` would hide the noindex from crawlers, so a linked preview URL could still be listed in search.
- **AC-6**: The sitemap includes `/`, `/work`, every published case study, `/about` and `/contact` with `lastModified` (the build date), and excludes `/contact/sent`, `/styleguide` and drafts.
- **AC-7**: The site has a favicon (`src/app/icon.svg`, a lemon "T" on Carbon Black) and an Apple touch icon (`src/app/apple-icon.png`, 180x180).
- **AC-8**: A Playwright test reads every sitemap URL and checks AC-1 to AC-4 on each page, with environment aware robots checks. CI runs it on both builds: the preview build in the `ci` job, and a production style build in the `e2e (production style)` job (`pnpm test:e2e:production`, task PF-T07), because `seo.spec.ts` is listed in `tests/e2e/env.ts`. No hand run is needed.

## Options considered

### Option 1: Static share images and hand built JSON-LD (chosen)

**Pros**: no image generation code in the Worker (no size or CPU risk), simple and testable.
**Cons**: the default share image doesn't change per page (case studies use their covers).

### Option 2: Generated share images with `next/og`

**Pros**: a custom image per page with the title on it.
**Cons**: adds a sizable image library to the Worker bundle (the 3 MiB Free plan gate) and CPU per request on the Free plan's 10 ms limit, for a small benefit.

## Decision

**Chosen option**: Option 1.

## Rationale

The case study cover is the most compelling share image anyway. A single branded default covers the rest without risking the Worker size and CPU limits from spec 0001. The production only robots rule is the important protection: the workers.dev previews must never compete with toyinog.com in search.

## Feature design

**Files**: `src/lib/seo/{site,jsonLd,metadata}.ts` (helpers that build metadata and JSON-LD from content), `src/components/seo/JsonLd.tsx`, `src/app/robots.ts`, `src/app/sitemap.ts`, `src/app/icon.svg`, `src/app/apple-icon.png`, `public/og/default.png`, plus updates to the metadata exports of each page.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Canonical and OG URLs | base URL | `SITE_URL` constant |
| Person | name, headline, links | `getProfile()` |
| Person image | photo | `getAbout().photo` |
| CreativeWork | title, summary, cover, year | `getProject(slug)` |
| robots | environment | `getAppEnv()` |
| Sitemap lastModified | date | build time |

**Security model**: static output only. JSON-LD is serialized with `<` escaped to prevent script breakout.

**Configuration required**: none.

## Build plan

1. SEO helpers, `metadataBase`, canonical URLs, Open Graph and Twitter tags on every page, the default share image, satisfies **AC-1**, **AC-2**, **AC-3**
2. JSON-LD for WebSite, Person and CreativeWork, satisfies **AC-4**
3. robots by environment, sitemap completeness, icons, satisfies **AC-5**, **AC-6**, **AC-7**
4. A Playwright check across every sitemap URL, satisfies **AC-8**

## Consequences

**Positive**: findable, shares well, and previews stay out of search.

**Negative / tradeoffs**: the default share image is static. If Toyin's headline changes, the image has to be remade by hand.

## Follow-up

- [ ] At go live (feature 11): submit the sitemap in Google Search Console (a Toyin action).
