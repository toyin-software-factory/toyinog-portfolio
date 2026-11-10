# 0010. Real content and go live on toyinog.com

**Date**: 2026-11-10
**Status**: In Progress

## Summary

Toyin sends raw material (CV, photo, LinkedIn, short notes on 3 projects). The team drafts the real profile, About page and 3 case studies from it, and Toyin approves every word on the preview. A check inside every build makes sure no placeholder text can reach the live site, and the site stays hidden from search engines until launch. When every launch check passes, Toyin says "go". A small go live PR then attaches toyinog.com, turns on search indexing and switches off the workers.dev copy of the live site, all in one step that one revert undoes. The old toyinog-website stays as it is for now.

## Context

Scope feature 11. Features 1 to 10 built the whole site on placeholder content (marked "Placeholder" in `content/`, with `example.com` links and a placeholder email). The site has to launch with Toyin's real bio, headline, links, CV, photo and case studies, then serve on `https://toyinog.com` (the apex is canonical, and `www` redirects to it, per spec 0001).

What we know (2026-11-10): toyinog.com is in Toyin's Cloudflare account and shows nothing today (no site, no mail), so there is no live traffic and there are no old URLs to keep working. The old `toyin-software-factory/toyinog-website` repo (Astro) only ever held placeholder content, and its routes match the new site's paths anyway. The contact form's Cloudflare setup is done (Email Routing, the Turnstile widget, runtime secrets `CONTACT_TO_EMAIL` and `TURNSTILE_SECRET_KEY`, and build variable `NEXT_PUBLIC_TURNSTILE_SITE_KEY`). The analytics token (spec 0009) and the Search Console submission (spec 0008) are still Toyin actions owed at go live.

Toyin's answers (2026-11-10): Q1, Toyin sends raw material and the team drafts, with Toyin approving on the preview. Q2, 3 case studies at launch. Q3, toyinog.com shows nothing today. Q4, Toyin gives the final "go" after reviewing the preview and the checklist. Q5, keep the old repo and Worker as they are, and decide later.

The risks are content quality (it represents Toyin to employers and clients), placeholder text leaking into production, and a launch step done out of order (for example, indexing turned on before the content is real).

## Requirements

**User stories**:
- As a hiring manager or client, I want to read Toyin's real story, work and CV, so I can decide whether to get in touch.
- As Toyin, I want to approve every word before it's public, without having to write Markdown myself.
- As Toyin, I want toyinog.com to go live only when I say so, with nothing half finished on show.

**Acceptance criteria**:
- **AC-1**: The placeholder guard lives in the content loader in `src/lib/content/`, which every build path uses (`content:generate`, `next build`, `content:check`). It is strict when the build is indexable (`isIndexable()` in `src/lib/seo/indexing.ts`: production and `SITE_LAUNCHED`), and also when `pnpm content:check` runs with `APP_ENV=production`. Strict means it fails when any marker appears in any front matter string (titles, alt text, links and email included), any Markdown body, or any file name under `public/images/` and `public/cv/`. The markers are `placeholder` and `example.com`, case insensitive, with no exceptions. Each hit is listed by file and field. Every other build prints the same list as a warning and passes. That covers previews, local builds, the production style e2e job and production on workers.dev before launch, so placeholder content can still be reviewed and main keeps deploying until the content lands. CI runs `APP_ENV=production pnpm content:check` on every PR (required from the content task on), so a leak fails before merge. The go live build is strict, so it can never attach the domain to placeholder content.
- **AC-1b**: The content checker fails (in every environment) when a cover image is over 300 KB, the About photo is over 250 KB, or the CV is over 5 MB. Shapes and pixel sizes are checked by hand and recorded in the launch report.
- **AC-1c**: Until launch, production stays out of search: `robots.ts` returns allow all plus the sitemap URL only when `getAppEnv() === 'production'` and the build time constant `SITE_LAUNCHED` (in `src/lib/seo/site.ts`) is `true`. Otherwise the site is in the non indexable state from spec 0008 AC-5: robots allows crawling with no sitemap, and every page carries the `noindex` meta and the `X-Robots-Tag: noindex` header. `SITE_LAUNCHED` is `false` until the go live PR. This amends spec 0008 AC-5.
- **AC-2**: `content/pages/profile.md` holds Toyin's real name, headline, intro, availability, contact email and real LinkedIn and GitHub URLs (all from Toyin's raw material). Every page that shows them (shell, Home, About, Contact, JSON-LD) shows the real values through the build time profile module (spec 0004 AC-12).
- **AC-3**: `content/pages/about.md` holds Toyin's real bio, experience, skills and photo, plus the real CV at `public/cv/` (downloaded as `Toyin-Ogunseinde-CV.pdf`, spec 0006). The photo is WebP, cropped 4:5, at most 1200 by 1500 pixels and 250 KB, with alt text describing Toyin.
- **AC-4**: Exactly 3 published case studies, drafted from Toyin's notes, each with every spec 0002 field filled in honestly, and a 16:10 cover in WebP (1600 by 1000 pixels) with real alt text. Slugs, `/work` order and featured flags are proposed by the builder from the notes and approved by Toyin with the content. The 4 placeholder projects and their images are deleted. No case study claims a metric, client name or date Toyin didn't provide.
- **AC-4b**: The default share image `public/og/default.png` (spec 0008 AC-3) is made again with Toyin's approved name and headline.
- **AC-5**: Toyin approves the drafted content on the Workers preview of the content PR before it merges. The PR description records it as `Approved by Toyin: <YYYY-MM-DD>, HQ reply <thread ref>`, and every correction Toyin asked for is applied.
- **AC-6**: Before launch, a production style build (`APP_ENV=production` with a dummy `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`, run by `pnpm preview`) with the real content passes:
  - the AC-1 and AC-1b checks
  - axe with zero WCAG 2.2 AA violations on every sitemap URL at 390 and 1440
  - mobile Lighthouse performance of 90 or above (Lighthouse CLI default mobile settings, the median of 3 runs) on Home and on the first case study in `/work` order
  - the production style e2e suite (PF-T07)

  The results go in a launch report, `docs/reviews/<date>-launch-report.md`.
- **AC-7**: Toyin gives an explicit "go" (through HQ) after seeing the preview link, the launch report and the Toyin checklist below. Michael records it in the launch report (`Go from Toyin: <YYYY-MM-DD HH:MM UTC>, HQ reply <thread ref>`). Nothing attaches the domain or sets `SITE_LAUNCHED` before that "go".
- **AC-8**: The go live PR changes only `wrangler.jsonc` and `src/lib/seo/site.ts`:
  - It adds the custom domain (`routes: [{ "pattern": "toyinog.com", "custom_domain": true }]`).
  - It sets `workers_dev: false` and `preview_urls: true`, so the production site is served only on `https://toyinog.com` while branch previews keep working.
  - It sets `SITE_LAUNCHED = true`.

  The production deploy from main then serves the site, indexable, on `https://toyinog.com`. The builder proves, on a throwaway branch before the go live PR, that previews still build and get URLs with these settings.
- **AC-9**: `https://www.toyinog.com/<path>` answers with a 301 to `https://toyinog.com/<path>` (path and query kept), and `http://` requests on either host end on `https://toyinog.com`.
- **AC-10**: Within an hour of launch, a smoke check on `https://toyinog.com` passes: every sitemap URL returns 200, `robots.txt` allows indexing and lists the sitemap, the analytics beacon appears once (token set), and one real contact message sent from the live form (with real Turnstile) reaches Toyin's inbox with the right subject and Reply-To. The result is appended to the launch report.
- **AC-11**: The old toyinog-website repo and Worker are left unchanged (Toyin's choice). They don't serve toyinog.com, and nothing in this repo depends on them.

## Options considered

### Option 1: Domain attached in code by a go live PR (chosen)

The custom domain lives in `wrangler.jsonc`. The "go" is merging one small PR, which the Workers Builds production deploy applies.

**Pros**: reviewable, recorded in git, and reversible by reverting one PR. The launch moment is exactly the merge.
**Cons**: needs a deploy to change, and a failed production build blocks the launch until it's fixed.

### Option 2: Toyin attaches the domain in the Cloudflare dashboard

**Pros**: no code change, takes about a minute.
**Cons**: invisible in the repo (spec 0001 keeps environment state in code), easy to do before the content is ready, and a later `wrangler deploy` could disagree with the dashboard state.

### Option 3: Soft launch hidden from search, then open indexing

**Pros**: real world feedback before search engines see it.
**Cons**: Toyin chose a single approved launch (Q4), and it adds a second release step and a temporary robots state to manage.

## Decision

**Chosen option**: Option 1. Content is drafted from Toyin's material and approved on the preview, a production build check blocks placeholder text, and toyinog.com is attached by a go live PR merged only after Toyin's "go".

**Implementation skills**: `agent-browser` (`vercel-labs/agent-browser`, `.claude/skills/agent-browser/`) for the preview review proof and the post launch smoke check.

## Rationale

Toyin wants to approve, not write (Q1), so the content flow is: the team drafts, Toyin corrects on the real preview, then it merges. The placeholder check makes "no placeholder content remains" (the scope's done when) a build rule rather than a hope. It's strict only in production, so drafts can still be previewed.

Because toyinog.com serves nothing today (Q3), there is no traffic to protect and no old URLs to redirect, beyond `www` to the apex. That lets the launch be one reviewable PR (Option 1), which fits spec 0001's rule that environment state lives in code, and gives a one revert rollback. Toyin's "go" (Q4) is the merge gate. Keeping the old repo and Worker (Q5) costs nothing, because they don't touch the domain.

Lead calls (each with its runner up): the `www` redirect is a Cloudflare Single Redirect rule set by Toyin, because it costs no Worker time on every request (runner up: a second custom domain plus a redirect in middleware, which runs code on every `www` hit). Images are converted by the builder with a local tool such as `cwebp`, not a project dependency, since `sharp` builds are disabled in `pnpm-workspace.yaml` (runner up: committing originals, which would fail the Lighthouse target). The placeholder markers are a fixed list in the content checker (runner up: a front matter `draft` flag on pages, which is more schema for a one time launch need).

## Feature design

**Data model sketch**: no schema change. The content files keep the spec 0002 schemas. Changes are values only: `profile.md`, `about.md`, 3 new `content/work/<slug>.md`, the 4 placeholder projects deleted, and the new images and CV under `public/`. New rules in `src/lib/content/`:
- the placeholder markers (`PLACEHOLDER_MARKERS = ['placeholder', 'example.com']`, case insensitive), applied as AC-1 describes
- the file size limits from AC-1b

One new constant, `SITE_LAUNCHED`, in `src/lib/seo/site.ts` (AC-1c).

**State transitions**: the launch flow runs in this order, each step only after the one before it:
1. Raw material received.
2. Drafts on the preview.
3. Toyin approves (AC-5).
4. Content PR merged. Production on workers.dev now has the real content but stays `noindex` (AC-1c).
5. Pre launch checks pass (AC-6).
6. Toyin says "go" (AC-7).
7. Toyin's dashboard steps are done, including the analytics token, so the go live build bakes it in.
8. Go live PR merged and deployed (AC-8, AC-9).
9. Smoke check passed (AC-10).

**Rollback**: if the smoke check fails or Toyin asks, Michael opens and merges a revert of the go live PR (branch protection applies, so it needs CI and the Workers Builds check). The next production deploy, about 5 minutes later, detaches toyinog.com, brings back the workers.dev production URL and sets `noindex` again. A content problem is fixed by a normal content PR, with no domain change.

**API surface**: none new. The contact action (spec 0007) and the analytics beacon (spec 0009) switch to their production behaviour by configuration only.

**Value sourcing**:
| Action | Value | Source |
|---|---|---|
| Profile | name, headline, intro, availability | Toyin's raw material (CV, LinkedIn, notes), drafted and approved by Toyin |
| Profile | public contact email | Toyin's raw material (asked for explicitly at intake; it may differ from `CONTACT_TO_EMAIL`) |
| Profile | LinkedIn, GitHub URLs | Toyin's raw material (the old site used `github.com/toyinogun`, which must be confirmed at intake, not assumed) |
| About | bio, experience, skills | Toyin's CV and LinkedIn plus notes, approved by Toyin |
| About | photo, CV file | files Toyin sends; the photo is converted to WebP by the builder |
| Case study | title, summary, role, client, year, tags, body, links | Toyin's notes per project; anything missing is asked, never invented |
| Case study | cover image | Toyin's screenshot or image; if none, a plain designed cover per design.md, which Toyin approves |
| Case study | slug, `/work` order, featured flags | proposed by the builder from the notes, approved by Toyin with the content (AC-4) |
| Default share image | name, headline | the approved profile values (AC-4b) |
| Lighthouse target page | case study | the first case study in `/work` order |
| Indexing switch | `SITE_LAUNCHED` | constant in `src/lib/seo/site.ts`, `false` until the go live PR |
| Placeholder check | environment | `getAppEnv()` (spec 0001) |
| Approval | date, thread reference | Toyin's HQ reply, recorded in the PR |
| Domain | hostname | `toyinog.com` (spec 0001 canonical host) |
| Analytics | token | `NEXT_PUBLIC_CF_ANALYTICS_TOKEN`, a build variable Toyin sets (spec 0009) |
| Smoke send | inbox | `CONTACT_TO_EMAIL` runtime secret (already set) |

**Key invariants**: a production build never contains a placeholder marker; the domain is attached only after Toyin's recorded "go"; nothing Toyin didn't provide or approve is published as fact.

**Security model**: content is public by design. Toyin's raw notes stay out of the repo, and only the approved, published content is committed. The CV PDF is public on purpose; the builder strips PDF metadata Toyin wouldn't want public (author path, edit history) if present. No new secrets.

**Configuration required** (Toyin actions in the launch checklist, sent after AC-6 and done before the go live PR merges):
- Confirm the toyinog.com zone is in the same Cloudflare account as the `toyinog-portfolio` Worker, and that the apex has no existing DNS record (a custom domain can't attach over one). Delete any leftover apex record.
- Confirm the Workers Builds API token can manage Workers routes and custom domains on the toyinog.com zone (the default token created by Workers Builds for an account owner normally can).
- Create the Web Analytics site for toyinog.com, and set `NEXT_PUBLIC_CF_ANALYTICS_TOKEN` as a Workers Builds build variable. It's baked in at build time, so it must exist before the go live PR builds. Beacon hits from previews won't count, which is expected.
- Add a proxied DNS record `www` (type AAAA, content `100::`, proxied), then add a Single Redirect rule for hostname `www.toyinog.com`: dynamic target `concat("https://toyinog.com", http.request.uri.path)`, status 301, preserve query string on.
- Turn on "Always Use HTTPS" for the zone.
- Check the Turnstile widget's hostnames include `toyinog.com` and `www.toyinog.com` (set up earlier).
- After launch: submit `https://toyinog.com/sitemap.xml` in Google Search Console.

**Critical test scenarios**:
- Placeholder guard: a production build on a fixture with `Placeholder` in a summary (and, separately, in an image file name) fails and names the file and field; the same fixture in preview only warns, verifies **AC-1**
- Size guard: an oversized cover fails the check in every environment, verifies **AC-1b**
- Hidden until launch: a production build with `SITE_LAUNCHED = false` serves `robots.txt` without a sitemap, the `noindex` meta and the `X-Robots-Tag: noindex` header; with `true` it serves the sitemap and drops both, verifies **AC-1c**
- Content complete: the production style build passes with the real content; the profile values appear on Home, About and Contact and in JSON-LD; there are 3 case studies and no deleted slugs in the sitemap, verifies **AC-2**, **AC-3**, **AC-4**
- Pre launch suite: axe, Lighthouse and production style e2e results recorded, verifies **AC-6**
- Domain: after the go live deploy, `curl -I` on the apex gives 200, and on `www` and `http://` gives a 301 to the https apex with the path kept, verifies **AC-8**, **AC-9**
- Smoke: a sitemap walk, robots, the beacon and one real contact message on the live site, verifies **AC-10**

## Build plan

Skateboard: the guard first (so nothing placeholder can ever ship), then the content as one reviewable whole, then the launch as the smallest possible final step.

1. Launch guards (one PR, before any real content):
   - the placeholder guard in the content loader, plus the size limits
   - the required CI step `APP_ENV=production pnpm content:check` (expected to fail on today's placeholder content, so it lands as a non blocking warning step, then flips to required in task 3)
   - `SITE_LAUNCHED = false` in robots and metadata
   - unit tests for each, and a production build fixture test

   Satisfies **AC-1**, **AC-1b**, **AC-1c**
2. Content intake (lead): Michael asks Toyin for the raw material: CV, photo, LinkedIn, public email, GitHub, and notes and images for 3 projects. Michael passes it to the builder (text in the task, files committed to the content branch, since they will be public anyway), satisfies **AC-2**, **AC-3**, **AC-4**
3. Draft the content on one content branch with a Workers preview:
   - the profile, About, CV and photo
   - the 3 case studies with covers and proposed slugs and order
   - the remade share image
   - the placeholder projects deleted
   - the CI content check flipped to required

   Satisfies **AC-2**, **AC-3**, **AC-4**, **AC-4b**, **AC-1**
4. Toyin reviews the preview, the builder applies every correction, approval is recorded, then merge, satisfies **AC-5**
5. Pre launch checks on the production style build, written to the launch report. Also prove on a throwaway branch that previews keep working with `workers_dev: false` and `preview_urls: true`. Satisfies **AC-6**, **AC-8**
6. Launch: Michael sends Toyin the preview, the report and the dashboard checklist. After Toyin's "go" (recorded) and the dashboard steps, merge the go live PR, which touches only `wrangler.jsonc` and `SITE_LAUNCHED`. Satisfies **AC-7**, **AC-8**, **AC-9**, **AC-11**
7. Smoke check on toyinog.com, appended to the launch report, then Toyin submits the sitemap, satisfies **AC-10**

## Consequences

**Positive**:
- Launch is one reviewed PR with a one revert rollback.
- Placeholder text can't reach production by accident.
- Toyin approves every published word without editing Markdown.

**Negative / tradeoffs**:
- The schedule depends on Toyin sending raw material and reviewing drafts, which is the real critical path.
- Drafted copy needs careful review; the team writes in Toyin's voice from notes.
- The `www` redirect and HTTPS setting live in the Cloudflare dashboard, not in code (documented here and in the launch report).
- Keeping the old Worker leaves a stale placeholder site on its workers.dev URL until Toyin decides.

**Neutral**:
- Previews keep `robots: noindex` (spec 0008); only the production deploy on toyinog.com is indexable.

## Follow-up

- [ ] After launch, decide the old toyinog-website repo and Worker (archive or delete). Toyin chose to decide later (Q5).
- [ ] Spec 0008 AC-5 gains the `SITE_LAUNCHED` condition (AC-1c here). Add a one line pointer in spec 0008 when task 1 lands.
- [ ] Spec 0001 says the workers.dev production URL stays enabled. That changes at go live (AC-8), so update spec 0001 in the go live PR.
- [ ] Cross check (2026-11-10, a second model): 6 gaps were found and fixed before acceptance (public exposure before "go", where the guard runs, the marker rules, size enforcement, missing value sources, and launch runbook details).
- [ ] Spec 0007 follow-up (one real production send) is covered by AC-10.
- [ ] Spec 0008 and 0009 go live follow-ups (Search Console, the analytics token, the live Lighthouse check) are covered by the configuration list and AC-10.
