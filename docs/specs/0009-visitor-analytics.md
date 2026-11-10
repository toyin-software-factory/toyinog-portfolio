# 0009. Cookie free visitor analytics with Cloudflare Web Analytics

**Date**: 2026-11-10
**Status**: In Progress

## Summary

The live site loads Cloudflare Web Analytics' small beacon script, which counts page views and referrers with no cookies, so no consent banner is needed. It loads only in production, never in previews, local development or CI. A contact conversion is a view of `/contact/sent`, which spec 0007 makes reachable only right after a successful send. The script is deferred so it doesn't slow the page.

## Context

Scope feature 10. Toyin chose Cloudflare Web Analytics (Stack Q5): free, cookie free, the same platform. Spec 0001 records the build variable `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`, the CSP entries (`static.cloudflareinsights.com`, `cloudflareinsights.com`) and the production only rule through `getAppEnv()`. Spec 0007 provides the cookie gated `/contact/sent` page.

## Requirements

**Acceptance criteria**:
- **AC-1**: When `getAppEnv()` is `production` and `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` is set, every page includes the Cloudflare beacon (`https://static.cloudflareinsights.com/beacon.min.js`, `defer`, `data-cf-beacon='{"token":"<token>"}'`) once, through `next/script` with `strategy="afterInteractive"`, from the root layout.
- **AC-2**: Outside production, or when the token is missing, no beacon script is rendered (checked in a preview build e2e test, in CI's `ci` job).
- **AC-3**: The beacon sets no cookies and no local storage (checked in a production style e2e run with a dummy token, inspecting the browser context: CI's `e2e (production style)` job).
- **AC-4**: The CSP allows the beacon and its reporting endpoint, and no CSP violations are logged on any page.
- **AC-5**: `/contact/sent` page views are the conversion metric. No other custom tracking is added.
- **AC-6**: Mobile Lighthouse performance on Home stays at 90 or above with the beacon present (checked on a local production style `pnpm preview` with a dummy token, so the beacon is present, alongside the Workers preview without it for comparison, both recorded in the PR; previews always run as `preview` and have no token). It's checked again on toyinog.com at go live.

## Options considered

### Option 1: The JS beacon from the layout, production only (chosen)

**Pros**: explicit, testable, works on the custom domain and is controlled in code.
**Cons**: one small third party script.

### Option 2: Cloudflare's automatic injection for proxied hostnames

**Pros**: zero code.
**Cons**: invisible in the code, harder to keep out of previews, and it depends on dashboard state.

## Decision

**Chosen option**: Option 1.

## Rationale

Keeping the beacon in code makes the production only rule testable and reviewable, matching how spec 0001 handles every other environment difference.

## Feature design

**Files**: `src/components/site/Analytics.tsx`, the root layout, tests.

**Value sourcing**:
| Value | Source |
|---|---|
| Token | `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` (Workers Builds build variable) |
| Environment | `getAppEnv()` |

**Configuration required**: Toyin creates the Web Analytics site for `toyinog.com` and sets `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` as a build variable (at go live).

## Build plan

1. The `Analytics` component and layout wiring with the production and token guard, satisfies **AC-1**, **AC-2**, **AC-5**
2. e2e checks for no beacon in preview, no cookies, no CSP violations, plus the Lighthouse check recorded in the PR, satisfies **AC-2**, **AC-3**, **AC-4**, **AC-6**

## Consequences

**Positive**: privacy friendly numbers with no banner.

**Negative / tradeoffs**: no custom events. The hiring vs project split isn't visible in analytics (it's in the emails). Ad blockers hide some visits.

## Follow-up

- [ ] At go live (feature 11): run Lighthouse mobile on toyinog.com with the real beacon and confirm AC-6.

- [ ] Toyin creates the Web Analytics site and token at go live.
