# 0007. Contact form with Email Routing, Turnstile and rate limiting

**Date**: 2026-11-10
**Status**: In Progress

## Summary

`/contact` has a short form (name, email, "hiring or project?", message) plus Toyin's email, LinkedIn and GitHub. Submitting runs a Next.js server action on Cloudflare Workers. It validates the input with zod, silently drops bots that fill a hidden honeypot field, checks Cloudflare Turnstile, applies a per IP rate limit, and emails Toyin through Email Routing with the visitor as reply to. On success the visitor is sent to `/contact/sent`, a thank you page that counts as the analytics conversion. Outside production nothing is emailed: the action logs a dry run instead.

## Context

Scope feature 8. Decided earlier: a form that emails Toyin with spam protection (Q4), Cloudflare Email Routing's `send_email` binding (Stack Q3), Turnstile plus honeypot plus rate limiting (Stack Q4), cookie free analytics with `/contact/sent` as the conversion (Stack Q5). Toyin confirmed toyinog.com is on Cloudflare and receives no mail today, so Email Routing is safe. Spec 0001 fixes the bindings (`SEND_EMAIL`, `CONTACT_RATE_LIMITER`), the secrets (`CONTACT_TO_EMAIL`, `TURNSTILE_SECRET_KEY`), `CONTACT_FROM_EMAIL`, `getAppEnv()`, `mimetext` for building the email, and the CSP for Turnstile. The form collects personal data (name, email, message), but nothing is stored: it goes straight to Toyin's inbox.

## Requirements

**User stories**:
- As a hiring manager or client, I want to send Toyin a message without leaving the site.
- As Toyin, I want each message in my inbox, marked hiring or project, so I can reply directly.
- As Toyin, I want bots and floods kept out.

**Acceptance criteria**:
- **AC-1**: `/contact` has an `h1` "Contact", a one line intro that reflects the profile availability, the form, and beside it (below it on phones) Toyin's email as plain text, plus LinkedIn and GitHub links from `getProfile()`.
- **AC-2**: The form has labelled fields Name (required, 1 to 100 characters, no line breaks), Email (required, valid, at most 254 characters), "What's this about?" as a radio group with "A role (hiring)" and "A project" (required), and Message (required, 20 to 5000 characters). It also has a visually hidden honeypot field (`website`, `tabIndex={-1}`, `autocomplete="off"`, `aria-hidden`), the Turnstile widget, and a "Send message" primary button.
- **AC-3**: Invalid input returns field errors from the same zod schema on the server (and the browser's native checks are allowed too). Errors show inline through `FieldError`, the entered values are kept, an error summary at the top of the form lists the errors as links to the fields, and focus moves to that summary.
- **AC-4**: If the honeypot is filled, the action skips everything else and redirects to `/contact/sent` without sending (bots see success).
- **AC-5**: The Turnstile token is verified server side against the siteverify API with `TURNSTILE_SECRET_KEY` and the client IP (`CF-Connecting-IP`). A failed or missing token shows "We couldn't confirm you're human. Please try again." and resets the widget. Nothing is sent.
- **AC-6**: The rate limiter (`CONTACT_RATE_LIMITER`, keyed by client IP, 5 per 60 seconds) is checked before sending. Over the limit shows "Too many messages in a short time. Please wait a minute and try again." Nothing is sent.
- **AC-7**: On valid input in production, one email is sent through `SEND_EMAIL`: From `CONTACT_FROM_EMAIL` (display name "toyinog.com contact"), To `CONTACT_TO_EMAIL`, Reply-To the visitor's email, Subject "[toyinog.com] Hiring: <name>" or "[toyinog.com] Project: <name>". The plain text body has the name, email, type, message and the UTC send time. Header values are free of line breaks (header injection is impossible).
- **AC-8**: Outside production (`getAppEnv() !== 'production'`), the action does everything except send. It logs a structured dry run line (type and message length only, no personal data) and redirects to `/contact/sent`. Turnstile uses the test keys outside production (spec 0001).
- **AC-9**: If sending fails, the visitor sees "Sorry, something went wrong sending your message. Please email me directly at <email>." with the address as text, their input is kept, and a structured error is logged with no message content.
- **AC-10**: After a real send, the action sets a short lived, httpOnly, secure, `SameSite=Lax` cookie `contact_sent` (60 seconds) and redirects to `/contact/sent`. That page renders a thank you message (`h1` "Thanks, your message is on its way") and links back Home and to Work, only when the cookie is present, then clears it. Without the cookie it redirects to `/contact`. The page is `noindex` and not in the sitemap. This cookie is strictly necessary, so no consent banner is needed.
- **AC-11**: Without JavaScript, a `noscript` note explains the form needs JavaScript for the spam check and shows the email address. The submit button shows a pending state (`aria-busy`, disabled, "Sending…") while submitting.
- **AC-12**: Logs and analytics never contain the visitor's name, email or message.
- **AC-13**: axe reports zero WCAG 2.2 AA violations on `/contact` (including the error state) and `/contact/sent` at 390 and 1440. `/contact` is in the static route check (the page is static, the action is dynamic).

## Options considered

### Option 1: A server action with progressive enhancement (chosen)

**Pros**: one file for the form logic, native form posting, typed with zod, no separate API route.
**Cons**: server actions on OpenNext and Workers must be proven in the preview (the scaffold already runs on workerd in CI).

### Option 2: A route handler (`POST /api/contact`) called with fetch

**Pros**: an explicit HTTP endpoint, easy to test with curl.
**Cons**: needs client side fetch and state code for every error case, and duplicates what server actions provide.

## Decision

**Chosen option**: Option 1. A server action in `src/app/contact/actions.ts`, using `useActionState` in a small client form component.

## Rationale

The form is the only server code on the site. A server action keeps it to one validated function, with the page still prerendered. The order (honeypot, then zod, then Turnstile, then rate limit, then send) does the cheapest checks first and spends the rate limit only on human looking requests. Pretending success for honeypot hits gives bots no signal. The dry run outside production follows spec 0001, so previews never email Toyin.

Lead calls (each with the runner up): message minimum 20 characters to cut "hi" spam (runner up: 1); a cookie gate on `/contact/sent` so direct visits don't inflate conversions (runner up: a query flag, which is trivially faked and shareable); a plain text email only (runner up: HTML email, more code for no gain); the time shown in UTC (runner up: Toyin's local time zone, which needs a setting).

## Feature design

**Files**: `src/app/contact/page.tsx` (static), `src/app/contact/ContactForm.tsx` (client), `src/app/contact/actions.ts` (server action), `src/app/contact/sent/page.tsx` (dynamic, reads the cookie), `src/lib/contact/{schema,turnstile,email,rateLimit}.ts`, and tests. Turnstile loads through `next/script` from `challenges.cloudflare.com` (already allowed in the CSP).

**Action flow**:
1. Parse `FormData` into an object. If `website` is non empty, redirect to `/contact/sent` (AC-4).
2. `contactSchema.safeParse` fails: return `{ status: 'invalid', errors, values }` (AC-3).
3. Verify Turnstile. On failure return `{ status: 'turnstile', values }` (AC-5).
4. Rate limit on `CF-Connecting-IP`. If over the limit return `{ status: 'rate_limited', values }` (AC-6).
5. Not production: log the dry run, set the cookie, redirect (AC-8, AC-10).
6. Build the MIME message with `mimetext` and call `env.SEND_EMAIL.send(new EmailMessage(from, to, raw))`. On error return `{ status: 'send_failed', values }` and log (AC-9).
7. Set the cookie and redirect to `/contact/sent` (AC-10).

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Send | recipient | `CONTACT_TO_EMAIL` Worker secret (via `getCloudflareContext().env`) |
| Send | sender | `CONTACT_FROM_EMAIL` var (`wrangler.jsonc`) |
| Send | subject type and name | validated form input |
| Send | timestamp | `new Date().toISOString()` at send |
| Turnstile | secret, client IP | `TURNSTILE_SECRET_KEY`, `CF-Connecting-IP` header |
| Turnstile widget | site key | `NEXT_PUBLIC_TURNSTILE_SITE_KEY` (build variable) |
| Rate limit | key | `CF-Connecting-IP` |
| Production or preview | env | `getAppEnv()` |
| Fallback email shown | address | `getProfile().email` |
| Intro line | availability | `getProfile().availability` |

**Key invariants**: nothing is sent unless every check passes in production; personal data is never logged or stored; secrets never reach the client.

**Security model**: public, unauthenticated form. Abuse controls are the honeypot, Turnstile and the rate limit. Server side validation is the source of truth. Header injection is prevented by the schema (no CR or LF in the name, a strict email format) and by `mimetext`. GDPR: personal data is processed only to deliver the message, with no storage on the site. The Contact page states "Your message goes straight to my inbox and isn't stored on this site."

**Configuration required** (Toyin actions, before production use):
- Email Routing enabled on toyinog.com, and the destination inbox verified.
- Worker secrets `CONTACT_TO_EMAIL` and `TURNSTILE_SECRET_KEY`. Build variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY`. A Turnstile widget for `toyinog.com` (plus the workers.dev host if wanted).
- `CONTACT_FROM_EMAIL` (for example `contact@toyinog.com`) in `wrangler.jsonc` vars.

**Critical test scenarios**:
- Happy path (preview): a valid submit with the Turnstile test key goes to `/contact/sent`, and the dry run is logged, verifies **AC-7** (unit, with the binding mocked), **AC-8**, **AC-10**
- Validation: an empty submit shows the summary, focus moves to it, values are kept, verifies **AC-3**
- Honeypot: a filled honeypot redirects with no send, verifies **AC-4**
- Turnstile failure: the always fail test key shows the human check error, verifies **AC-5**
- Rate limit: the sixth submit within 60 seconds (mocked limiter) shows the limit message, verifies **AC-6**
- Send failure: a mocked binding throws, and the fallback message shows the email, verifies **AC-9**
- Sent page: a direct visit without the cookie redirects to `/contact`, verifies **AC-10**
- Privacy: log assertions contain no name, email or message, verifies **AC-12**
- Accessibility: axe on the default, error and sent states at both widths, verifies **AC-13**

## Build plan

1. `contactSchema` (zod) and its unit tests, and the static `/contact` page with the form UI (no action yet), satisfies **AC-1**, **AC-2**, **AC-11**
2. Server action: honeypot, validation errors, error summary and focus, satisfies **AC-3**, **AC-4**
3. Turnstile widget plus server verification, and the rate limiter, satisfies **AC-5**, **AC-6**
4. Email building with `mimetext`, the send through the binding, the dry run outside production, failure handling and logging rules, satisfies **AC-7**, **AC-8**, **AC-9**, **AC-12**
5. `/contact/sent` with the cookie gate, `noindex`. Playwright for every state, axe at both widths, satisfies **AC-10**, **AC-13**

## Consequences

**Positive**: messages land in Toyin's inbox with one tap reply, there's no database or stored personal data, and spam controls are layered.

**Negative / tradeoffs**:
- The form needs JavaScript (Turnstile). The `noscript` fallback shows the email.
- The rate limiter is approximate (per Cloudflare location, spec 0001).
- A real send can only be proven in production after Toyin's Email Routing setup. Previews prove everything up to the send.

**Neutral**: the analytics feature (10) counts `/contact/sent` views.

## Follow-up

- [ ] Toyin's setup (Email Routing, the verified inbox, secrets, Turnstile widget) as an action item when this task starts.
- [ ] After go live, send one real test message from production and check deliverability to Gmail (scope feature 11).
