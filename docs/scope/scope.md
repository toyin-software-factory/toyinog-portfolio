# Scope: toyinog.com portfolio

A personal portfolio site for Toyin Ogunseinde at toyinog.com. It serves two kinds of visitors, hiring managers and freelance or consulting clients, shows Toyin's work, and makes it easy for either of them to get in touch. It replaces the old toyinog-website code when it goes live.

**Build approach:** Skateboard (ship the smallest complete site a real visitor can use, deployed early, then grow it pass by pass, shippable at every step).
**Workflow:** GA (after `/develop`: `/check verify`, `/test` where it matters, CodeRabbit stands in for `/check review`, then `/document` and `/sync`). The project default level of rigor. `/architect` is the recommended first stop for a feature with a real decision. Any feature can carry its own tag to do more or less.

**Decided with Toyin:** audience is hiring managers and clients together · four pages (Home, Work with case studies, About with CV download, Contact) · content lives as Markdown files in the repo, no CMS, no login, no database · contact form emails Toyin with spam protection · privacy friendly, cookie free analytics (no cookie banner) · launch target about one month from 2026-11-10 (around 2026-12-10) · the team builds with placeholder content and Toyin writes the real content before launch.
**Decided by the lead:** English only · SEO basics on every public page · WCAG AA accessibility · good Core Web Vitals on mobile.

_These are recommendations to keep the build orderly, not requirements. Skip anything that does not fit._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | in-progress |
| 2 | Coding standards & tooling | Foundation | done |
| 3 | Content model | Foundation | done |
| 4 | Design system & UI foundation | Foundation | in-progress |
| 5 | Site shell & Home | Release 1 | in-progress |
| 6 | Work list & case studies | Release 1 | in-progress |
| 7 | About & CV | Release 1 | in-progress |
| 8 | Contact form | Release 1 | in-progress |
| 9 | SEO & social sharing | Release 2 | in-progress |
| 10 | Visitor analytics | Release 2 | in-progress |
| 11 | Real content & go live | Release 2 | planned |

## Foundations

### 1. Stack & architecture · in-progress
Decide the framework, hosting and how the site deploys, then scaffold a runnable project that deploys to a preview link, so every later page builds on real structure.
**Done when:** the stack and hosting are recorded in a spec, the empty site builds and runs locally, CI runs lint, typecheck, test and build on every PR, and each PR gets a preview deployment.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [x] Scaffold from the decision: `/develop stack & architecture` (PR #9)
- [ ] Verify it: `/check verify stack & architecture`
Spec [0001](../specs/0001-stack-architecture/index.md)

### 2. Coding standards & tooling · done
Capture conventions and tooling choices from the real scaffolded project into root `AGENTS.md`, then install them (TypeScript strict, zod for external input, small accessible components).
**Done when:** root `AGENTS.md` reflects the real stack and its commands, and lint, format and typecheck run clean in CI.
- [x] Capture conventions + tooling choices: `/audit`
- [x] Install the tooling: `/develop tooling`

### 3. Content model · done
The shape of the Markdown content files: projects and case studies, the bio, experience, skills, links, and the CV file. Every page reads from it, and Toyin edits it to update the site.
**Done when:** each content type has a validated schema, a malformed file fails the build with a clear message, and placeholder files exist for every type.
- [x] Design it (spec): `/architect content model`
- [x] Build it: `/develop content model`
   - [x] Schemas, loader and collection rules (AC-1..6, AC-9, AC-10)
   - [x] Markdown rendering pipeline (AC-7)
   - [x] Placeholder content, assets and content README (AC-8)
   - [x] Fixture tests and `content:check` in CI (AC-3..7)
- [x] Verify it: `/check verify content model`
- [x] Test it: `/test content model`
- [x] Review it: CodeRabbit on the PR (#16)
- [x] Document it: `/document content model`
Spec [0002](../specs/0002-content-model.md) · code in `src/lib/content/`, `content/` · verify report [docs/reviews/2026-11-10-verify-content-model.md](../reviews/2026-11-10-verify-content-model.md)

### 4. Design system & UI foundation · in-progress
Visual direction from Mobbin references, plus type, colour, spacing and base components, so all four pages feel like one site and meet WCAG AA.
**Done when:** `design.md` records the direction and its Mobbin references, covers type, colour, spacing and components, and base components handle focus, keyboard and contrast at mobile and desktop widths.
- [x] Design it (spec): `/architect design system & UI foundation`
- [x] Build it: `/develop design system & UI foundation`
   - [x] Tokens, fonts and root layout base (AC-1, AC-2, AC-5)
   - [x] Layout, text and action components (AC-3, AC-4, AC-8)
   - [x] Form primitives (AC-3, AC-4)
   - [x] Styleguide route, token guard, axe at both widths (AC-1, AC-6, AC-7)
- [ ] Verify it: `/check verify design system & UI foundation`
- [ ] Test it: `/test design system & UI foundation`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document design system & UI foundation`
Spec [0003](../specs/0003-design-system.md) · `design.md` · code in `src/components/ui/`, `src/app/styleguide/`

## Release 1: the smallest usable site

All four pages working end to end on placeholder content, deployed to a preview link. A visitor can learn who Toyin is, see the work, and send a message.

### 5. Site shell & Home · in-progress
Shared header, navigation, footer and page layout, plus the Home page: who Toyin is, what Toyin does, featured work, and a clear call to action for both hiring managers and clients.
**Done when:** every page shares the shell, navigation works by keyboard and on mobile, and Home shows the intro, featured projects from the content files, and links to Work and Contact.
- [x] Design it (spec): `/architect site shell & home`
- [x] Build it: `/develop site shell & home`
   - [x] Shell: header, nav, footer, metadata, 404 (AC-1..4, AC-9, AC-10)
   - [x] Home sections: hero, selected work, about teaser, CTA (AC-5..8)
   - [x] Playwright, phone layout, axe, static check (AC-2, AC-3, AC-10, AC-11)
- [x] Verify it: `/check verify site shell & home`
- [x] Test it: `/test site shell & home`
- [ ] Review it: CodeRabbit on the PR
- [x] Document it: `/document site shell & home`
Spec [0004](../specs/0004-site-shell-home.md) · code in `src/components/site/`, `src/app/_home/`, `src/app/layout.tsx` · verify report [docs/reviews/2026-11-10-verify-site-shell-home.md](../reviews/2026-11-10-verify-site-shell-home.md)

### 6. Work list & case studies · in-progress
A list of projects and one case study page per project, generated from the content files.
**Done when:** the Work page lists every project from the content files, each project has its own page at a stable URL, adding a Markdown file adds a project with no code change, and a missing project URL shows a helpful not found page.
- [x] Design it (spec): `/architect work list & case studies`
- [ ] Build it: `/develop work list & case studies`
   - [ ] Work grid page (AC-1, AC-2, AC-8)
   - [ ] Static case study pages (AC-3..8)
   - [ ] Sitemap, fixtures, axe, static check (AC-9..11)
- [ ] Verify it: `/check verify work list & case studies`
- [ ] Test it: `/test work list & case studies`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document work list & case studies`
Spec [0005](../specs/0005-work-case-studies.md)

### 7. About & CV · in-progress
Bio, experience, skills and a CV download, for hiring managers who want the full picture.
**Done when:** the About page renders bio, experience and skills from the content files, and the CV downloads as a PDF from a stable link.
- [x] Design it (spec): `/architect about & cv`
- [ ] Build it: `/develop about & cv`
   - [ ] Intro, bio and CV download (AC-1, AC-2, AC-5, AC-6)
   - [ ] Experience timeline and skills (AC-3, AC-4)
   - [ ] Sitemap, axe, static check (AC-6, AC-7)
- [ ] Verify it: `/check verify about & cv`
- [ ] Test it: `/test about & cv`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document about & cv`
Spec [0006](../specs/0006-about-cv.md)

### 8. Contact form · in-progress
A form (name, email, hiring or project, message) that emails Toyin, with spam protection. Links to email and profiles sit beside it.
**Done when:** a valid submission reaches Toyin's inbox with the hiring or project choice, input is validated on the server, spam and repeat submissions are blocked, and the visitor sees clear success and error states. No keys reach the browser.
- [x] Design it (spec): `/architect contact form`
- [ ] Build it: `/develop contact form`
   - [ ] Schema and static form page (AC-1, AC-2, AC-11)
   - [ ] Server action: honeypot, validation, error summary (AC-3, AC-4)
   - [ ] Turnstile and rate limit (AC-5, AC-6)
   - [ ] Email send, dry run, failure handling, logging (AC-7..9, AC-12)
   - [ ] Sent page and Playwright with axe (AC-10, AC-13)
- [ ] Verify it: `/check verify contact form`
- [ ] Test it: `/test contact form`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document contact form`
Spec [0007](../specs/0007-contact-form.md)

## Release 2: launch ready

### 9. SEO & social sharing · in-progress
Page titles and descriptions, social share cards, a sitemap and robots file, and structured data about Toyin, so the site is found and shares well.
**Done when:** every public page has a unique title, description and share image, the sitemap lists every page including case studies, and share previews render correctly.
- [x] Design it (spec): `/architect seo & social sharing`
- [ ] Build it: `/develop seo & social sharing`
   - [ ] Canonical, titles, Open Graph and default share image (AC-1..3)
   - [ ] JSON-LD Person, WebSite, CreativeWork (AC-4)
   - [ ] robots by environment, sitemap, icons, sitemap wide check (AC-5..8)
- [ ] Verify it: `/check verify seo & social sharing`
- [ ] Test it: `/test seo & social sharing`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document seo & social sharing`
Spec [0008](../specs/0008-seo-social-sharing.md)

### 10. Visitor analytics · in-progress
Privacy friendly, cookie free analytics: page views, referrers, and a contact form conversion event. No cookie banner needed.
**Done when:** page views and contact submissions show in the analytics dashboard, no cookies are set, and the script does not hurt page performance.
- [x] Design it (spec): `/architect visitor analytics`
- [ ] Build it: `/develop visitor analytics`
   - [ ] Production only beacon in the layout (AC-1, AC-2, AC-5)
   - [ ] No cookies, CSP and performance checks (AC-3, AC-4, AC-6)
- [ ] Verify it: `/check verify visitor analytics`
- [ ] Test it: `/test visitor analytics`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document visitor analytics`
Spec [0009](../specs/0009-visitor-analytics.md)

### 11. Real content & go live · needs a decision
Toyin replaces the placeholder content with the real bio, case studies and CV, then toyinog.com points at the new site and the old toyinog-website is retired.
**Done when:** no placeholder content remains, toyinog.com serves the new site over HTTPS, old URLs that mattered redirect sensibly, and a final accessibility and mobile performance check passes.
- [ ] Design it (spec): `/architect real content & go live`

## Deferred
Out of scope for launch, kept so the plan stays honest.
- **Services page**: what Toyin offers clients and how to work together · needs a decision
- **Blog or Writing section**: articles and talks · needs a decision
- **Contact auto reply**: a "thanks, I'll reply soon" email to the sender
- **Book a call link**: a scheduling link beside the contact form
- **Motion and visual polish**: page transitions and richer animation
- **Tag filters on Work**: filter projects by tag once the list grows (from spec 0005)
- **Light mode**: a light theme that follows the visitor's system setting (from spec 0003)

## Legend

**The decision box.** Every feature carries exactly one sub task whose label ends with `(spec)`. Skills find it by that suffix. Every other box is an execution box.

- **Next step** = the first unticked box.
- **needs a decision** = run `/architect` first, then `/develop`. The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here.** The scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `dropped` (de-scoped, kept for history).
- **Workflow tier tag** beside a heading would set that feature's rigor above or below the project default. No tag inherits GA.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
