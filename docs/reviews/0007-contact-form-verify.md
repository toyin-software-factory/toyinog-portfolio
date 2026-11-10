# Verify: Contact form · spec 0007

**Verdict**: PASS (13 of 13 acceptance criteria met, every specced surface built)
**Date**: 2026-11-10
**Task**: RR1-T04 · branch `rr1-t04-contact-form` (first run at `0f9ba42`; AC-10 run again after the rebase onto #25 and #26)
**Approach**: Skateboard. This slice makes the whole form real (validation, Turnstile, rate limit, email send). Outside production it dry runs by design (AC-8), so a real email reaches Toyin's inbox only after the Cloudflare setup (Email Routing, Turnstile widget, secrets), which Toyin will do before launch.

## How it was run

- **Workers Builds preview**: `https://rr1-t04-contact-form-toyinog-portfolio.jnr4u2.workers.dev`, driven with agent-browser (headless Chrome) at 1440 and 390, plus `curl` for headers and the noscript markup. This runs `APP_ENV=preview` with the Turnstile test keys.
- **Local production build**: `APP_ENV=production NEXT_PUBLIC_TURNSTILE_SITE_KEY=<test site key> pnpm preview` (wrangler on `localhost:8787`), for the parts the preview can't reach: a real send through the simulated `SEND_EMAIL` binding, and a send failure. Logs read from the local observability API.
- **Suites on this commit**: `pnpm test` (128 passed), `pnpm test:e2e` (42 passed, desktop and mobile, axe on every contact state), `pnpm build:worker`.

## Acceptance criteria

| AC | Verdict | Evidence |
|---|---|---|
| AC-1 | met ✅ | Preview `/contact`: h1 "Contact"; intro "I'm open to new roles and taking on projects. Tell me what you have in mind." (both availabilities set in the placeholder profile); aside lists the email as text and LinkedIn and GitHub links from the profile. At 390 the aside sits below the form (measured), no horizontal overflow. Screenshots `contact-desktop.png`, `contact-mobile.png`. |
| AC-2 | met ✅ | Preview: labels Name, Email, "What's this about?" with "A role (hiring)" and "A project", Message; honeypot `website` has tabIndex -1, autocomplete off, inside `aria-hidden`; `cf-turnstile-response` field present; button "Send message". |
| AC-3 | met ✅ | Preview empty submit: summary "There are 4 problems with your message", focus on the summary (`role=alert`), links `#name,#email,#type-hiring,#message`, inline errors under each field. A second submit with only Name kept "Verify Bot". Screenshots `contact-error-desktop.png`, `contact-error-mobile.png`. |
| AC-4 | met ✅ | Preview: filling `website` and submitting redirects to `/contact/sent`, which bounces to `/contact` because no cookie is set (see the note below). Log line `contact.honeypot` only, no Turnstile call. |
| AC-5 | met ✅ | Preview: with the token field removed, the alert reads "We couldn't confirm you're human. Please try again."; log `contact.turnstile_failed` reason `missing-token`. A real token from the test site key passes (submits reach `/contact/sent`). Server uses the env secret in production, the test secret elsewhere (`actions.test.ts`). |
| AC-6 | met ✅ | Preview: 7 valid submits in 39 seconds, the 7th showed "Too many messages in a short time. Please wait a minute and try again." Screenshot `contact-rate-limited-desktop.png`. Cloudflare's rate limit binding counts per location and is eventually consistent, so it blocked one submit later than the exact limit of 5; the unit test proves the sixth is blocked when the binding answers. |
| AC-7 | met ✅ | Local production build, real send through the simulated binding: From `toyinog.com contact <contact@toyinog.com>`, To the inbox, Reply-To the visitor, Subject `[toyinog.com] Hiring: Prod Check`, text/plain body with name, email, type, message and UTC time, no Bcc. Header injection: name rejects line breaks (`schema.test.ts`), one of each header (`email.test.ts`). |
| AC-8 | met ✅ | Preview valid submit: redirect to `/contact/sent`, no send, log `{"event":"contact.dry_run","type":"project","messageLength":52}`. |
| AC-9 | met ✅ | Local production build with no inbox configured: alert "Sorry, something went wrong sending your message. Please email me directly at placeholder@example.com.", focus on it, all four values kept; log `contact.config_missing` with the variable name only. Screenshot `contact-send-failed-desktop.png`. A binding error takes the same branch (`handle.test.ts`). |
| AC-10 | met ✅ | Preview (after the middleware gate, see note): after a submit, `/contact/sent` shows h1 "Thanks, your message is on its way" inside the site shell, links "Back to Home" `/` and "See the work" `/work`, `meta robots` "noindex, nofollow"; the next reload lands on `/contact` (cookie cleared). `curl` without the cookie: `307` to `/contact`, `x-robots-tag: noindex`. With the cookie: `200`, `cache-control: private, no-store`, `set-cookie: contact_sent=; Path=/contact; Max-Age=0; Secure; HttpOnly; SameSite=lax`. Not in the sitemap (e2e). Cookie attributes when set (httpOnly, secure, Lax, 60 s, path `/contact`) asserted in `actions.test.ts`. |
| AC-11 | met ✅ | Preview HTML: `<noscript>` "This form needs JavaScript for its spam check. You can email me at placeholder@example.com." Pending state (`aria-busy`, disabled, "Sending…") asserted in `ContactForm.test.tsx`; seen in the flow video. |
| AC-12 | met ✅ | Local production logs after a submit with name "Ada Lovelace", `ada@example.com` and a marked message: zero log rows contain any of them. Every log event is a typed shape with no personal fields (`log.ts`). |
| AC-13 | met ✅ | `pnpm test:e2e`: axe reports zero WCAG 2.2 AA violations on `/contact`, its error state and `/contact/sent`, in the desktop (1440) and mobile (390) projects. `/contact` is in `CONTENT_ROUTES` of `static.spec.ts` and served with `x-opennext-cache: HIT` on the preview. |

## Specced surfaces

- `/contact` (static) and its server action: built, live on the preview.
- `/contact/sent` (dynamic, cookie gated, noindex): built, live on the preview.
- Bindings `SEND_EMAIL` and `CONTACT_RATE_LIMITER` in `wrangler.jsonc`: present; the rate limiter answers on the preview.

Missing: none. Not applied: none.

## Notes for review

- **Found later by spec 0009 AC-4 (RLR-T02)**: `/contact` logged a CSP violation (`script-src` blocked `eval`): zod 4's one time `Function("")` probe, in the browser because `ContactForm.tsx` imported constants from `schema.ts`. Fixed by moving them to the zod free `src/lib/contact/fields.ts`, guarded by `noZodInClient.test.ts`.
- **Cookie gate moved to middleware**: after #25 the root layout reads `content/` on every render, and Workers can't do that at request time, so the dynamic `/contact/sent` returned 500. The page is now static and `src/middleware.ts` (edge middleware, approved by the lead) does the gate. When Next renders the page inside the action's response, the cookie is cleared on the next request instead (locally a reload shows the page once more; on the preview it already went straight to `/contact`). The e2e test accepts both.

- **Honeypot landing**: a bot that fills the honeypot is redirected to `/contact/sent` (AC-4) but gets no cookie, so that page sends it back to `/contact`. That follows AC-10's "after a real send". If you'd rather bots see the thank you page, the action can set the cookie for honeypot hits too.
- **Rate limit precision**: see AC-6. It is best effort flood control by design (spec 0001).
- **Before launch** (Toyin, in Cloudflare): Email Routing with the verified inbox, the Turnstile widget and its keys, and the `CONTACT_TO_EMAIL` and `TURNSTILE_SECRET_KEY` secrets. Until then production would show the AC-9 fallback, which is the safe failure.
