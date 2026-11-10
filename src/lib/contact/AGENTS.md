# Contact form (spec 0007)

The contact flow: `/contact` posts a server action that validates, checks for spam, and emails Toyin through Cloudflare Email Routing.

## Where things live

- `src/lib/contact/`: the logic, pure and unit tested.
  - `schema.ts`: the zod schema shared by the server and the field errors (`parseContact`), plus the honeypot field name.
  - `handle.ts`: `handleContact(formData, deps)`, the whole flow in order: honeypot, schema, Turnstile, rate limit, then dry run or send. Every side effect comes in through `deps`, so tests pass fakes.
  - `turnstile.ts` (siteverify, fails closed), `rateLimit.ts`, `email.ts` (MIME message via `mimetext`), `log.ts` (typed log events).
- `src/app/contact/`: the route. `actions.ts` is the thin server action that builds `deps` from the Worker env; `sendThroughBinding.ts` holds the only `cloudflare:email` import; `ContactForm.tsx` is the client form; `sent/` is the static thank you page.
- `src/middleware.ts`: the cookie gate for `/contact/sent` (edge middleware): no `contact_sent` cookie redirects to `/contact`, with it the page shows and the cookie is deleted.

## Rules

- Logs never carry the visitor's name, email or message. Add a new event to the `ContactLogEvent` union in `log.ts`, with counts or field names only.
- Outside production (`getAppEnv() !== "production"`) the flow does everything except send, and Turnstile uses Cloudflare's published test keys. Never put a real key or inbox address in the repo: they are Worker secrets (`CONTACT_TO_EMAIL`, `TURNSTILE_SECRET_KEY`) set in Cloudflare.
- `cloudflare:email` exists only in the Workers runtime. Keep its dynamic `import()` with the `.catch()` in `sendThroughBinding.ts`: that is what makes the OpenNext bundler leave it for wrangler. Tests mock that module instead of importing it.
- `/contact/sent` stays static. The root layout reads `content/`, which Workers can't do at request time, so any dynamic route (or a server action that re-renders the page, which `cookies().set()` without a `redirect()` does) fails with a 500. Keep the gate in `src/middleware.ts`, and keep `redirect()` after the action sets the cookie.
- Messages the visitor sees are the exact strings from spec 0007 (`src/app/contact/messages.ts`).

## Testing

- Unit: `src/lib/contact/*.test.ts`, `src/app/contact/*.test.ts(x)`.
- E2E: `tests/e2e/contact.spec.ts` (dry run submit, errors, honeypot, missing token, noscript, axe).
- A real send can be tried locally: build with `APP_ENV=production` and the Turnstile test site key, put a dummy `CONTACT_TO_EMAIL` in `.dev.vars`, run `pnpm preview`; wrangler writes the email to a local `.eml` file.

_Drafted by /sync from the introducing change, worth a quick human pass._
