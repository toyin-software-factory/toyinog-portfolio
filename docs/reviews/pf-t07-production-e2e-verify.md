# Verify: production style e2e in CI · spec 0001 (CI contract), 0008 AC-8, 0009 AC-2/AC-3

**Verdict**: PASS
**Date**: 2026-11-10
**Task**: PF-T07 · branch `pf-t07` · CI run 42825343208

## What was checked

| Done when | Verdict | Evidence |
|---|---|---|
| CI runs preview and production style e2e on every PR, both green | met ✅ | CI run 42825343208 on #37: job `ci` ran `pnpm test:e2e` with `APP_ENV=preview` and **142 passed (1.1m)**; job `e2e (production style)` ran `pnpm test:e2e:production` and **14 passed (40.8s)**, in parallel (1m27s for the whole job, `ci` took 2m53s). |
| Spec 0009 AC-2 and AC-3 checked in CI, no hand run | met ✅ | `analytics.spec.ts` runs in both jobs: in `ci` it asserts no beacon and no request to `cloudflareinsights.com`; in `e2e (production style)` it asserts exactly one beacon carrying the dummy token, no cookies on any domain, empty `localStorage` and no CSP violations, on 5 pages at both widths. |
| Spec 0008 AC-8 checked in CI | ready ⚠️ | `seo.spec.ts` is listed in `PROD_ENV_FILES` (`tests/e2e/env.ts`), so it runs in the production style job as soon as RLR-T01 lands it; nothing here changes then. Re-check the job's test count after that merge. |
| The contact action never sends | met ✅ | The job copies `.dev.vars.example` and fails unless `CONTACT_TO_EMAIL=` is empty (step passed). The `@prod-env` contact test: in the production style build a valid submit shows the AC-9 fallback and stays on `/contact`; in the preview build it dry runs to `/contact/sent`. Both green. |
| Spec 0001 CI contract and spec 0008 AC-8 note updated | met ✅ | Spec 0001 step 6 and required checks; spec 0008 AC-8 note; spec 0009 AC-2/AC-3. |

## Notes

- The production style run uses its own port (8788) and never reuses an existing server, so a local preview server can't be mistaken for a production build.
- Locally the same commands give the same counts: production style 14 passed, preview 142 passed.
