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
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | Content model | Foundation | in-progress |
| 4 | Design system & UI foundation | Foundation | planned |
| 5 | Site shell & Home | Release 1 | planned |
| 6 | Work list & case studies | Release 1 | planned |
| 7 | About & CV | Release 1 | planned |
| 8 | Contact form | Release 1 | planned |
| 9 | SEO & social sharing | Release 2 | planned |
| 10 | Visitor analytics | Release 2 | planned |
| 11 | Real content & go live | Release 2 | planned |

## Foundations

### 1. Stack & architecture · in-progress
Decide the framework, hosting and how the site deploys, then scaffold a runnable project that deploys to a preview link, so every later page builds on real structure.
**Done when:** the stack and hosting are recorded in a spec, the empty site builds and runs locally, CI runs lint, typecheck, test and build on every PR, and each PR gets a preview deployment.
- [x] Decide the stack (spec): `/architect stack & architecture`
- [ ] Scaffold from the decision: `/develop stack & architecture`
- [ ] Verify it: `/check verify stack & architecture`
Spec [0001](../specs/0001-stack-architecture/index.md)

### 2. Coding standards & tooling
Capture conventions and tooling choices from the real scaffolded project into root `AGENTS.md`, then install them (TypeScript strict, zod for external input, small accessible components).
**Done when:** root `AGENTS.md` reflects the real stack and its commands, and lint, format and typecheck run clean in CI.
- [ ] Capture conventions + tooling choices: `/audit`

### 3. Content model · in-progress
The shape of the Markdown content files: projects and case studies, the bio, experience, skills, links, and the CV file. Every page reads from it, and Toyin edits it to update the site.
**Done when:** each content type has a validated schema, a malformed file fails the build with a clear message, and placeholder files exist for every type.
- [x] Design it (spec): `/architect content model`
- [ ] Build it: `/develop content model`
   - [ ] Schemas, loader and collection rules (AC-1..6, AC-9, AC-10)
   - [ ] Markdown rendering pipeline (AC-7)
   - [ ] Placeholder content, assets and content README (AC-8)
   - [ ] Fixture tests and `content:check` in CI (AC-3..7)
- [ ] Verify it: `/check verify content model`
- [ ] Test it: `/test content model`
- [ ] Review it: CodeRabbit on the PR
- [ ] Document it: `/document content model`
Spec [0002](../specs/0002-content-model.md)

### 4. Design system & UI foundation · needs a decision
Visual direction from Mobbin references, plus type, colour, spacing and base components, so all four pages feel like one site and meet WCAG AA.
**Done when:** `design.md` records the direction and its Mobbin references, covers type, colour, spacing and components, and base components handle focus, keyboard and contrast at mobile and desktop widths.
- [ ] Design it (spec): `/architect design system & UI foundation`

## Release 1: the smallest usable site

All four pages working end to end on placeholder content, deployed to a preview link. A visitor can learn who Toyin is, see the work, and send a message.

### 5. Site shell & Home · needs a decision
Shared header, navigation, footer and page layout, plus the Home page: who Toyin is, what Toyin does, featured work, and a clear call to action for both hiring managers and clients.
**Done when:** every page shares the shell, navigation works by keyboard and on mobile, and Home shows the intro, featured projects from the content files, and links to Work and Contact.
- [ ] Design it (spec): `/architect site shell & home`

### 6. Work list & case studies · needs a decision
A list of projects and one case study page per project, generated from the content files.
**Done when:** the Work page lists every project from the content files, each project has its own page at a stable URL, adding a Markdown file adds a project with no code change, and a missing project URL shows a helpful not found page.
- [ ] Design it (spec): `/architect work list & case studies`

### 7. About & CV · needs a decision
Bio, experience, skills and a CV download, for hiring managers who want the full picture.
**Done when:** the About page renders bio, experience and skills from the content files, and the CV downloads as a PDF from a stable link.
- [ ] Design it (spec): `/architect about & cv`

### 8. Contact form · needs a decision
A form (name, email, hiring or project, message) that emails Toyin, with spam protection. Links to email and profiles sit beside it.
**Done when:** a valid submission reaches Toyin's inbox with the hiring or project choice, input is validated on the server, spam and repeat submissions are blocked, and the visitor sees clear success and error states. No keys reach the browser.
- [ ] Design it (spec): `/architect contact form`

## Release 2: launch ready

### 9. SEO & social sharing · needs a decision
Page titles and descriptions, social share cards, a sitemap and robots file, and structured data about Toyin, so the site is found and shares well.
**Done when:** every public page has a unique title, description and share image, the sitemap lists every page including case studies, and share previews render correctly.
- [ ] Design it (spec): `/architect seo & social sharing`

### 10. Visitor analytics · needs a decision
Privacy friendly, cookie free analytics: page views, referrers, and a contact form conversion event. No cookie banner needed.
**Done when:** page views and contact submissions show in the analytics dashboard, no cookies are set, and the script does not hurt page performance.
- [ ] Design it (spec): `/architect visitor analytics`

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

## Legend

**The decision box.** Every feature carries exactly one sub task whose label ends with `(spec)`. Skills find it by that suffix. Every other box is an execution box.

- **Next step** = the first unticked box.
- **needs a decision** = run `/architect` first, then `/develop`. The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here.** The scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `dropped` (de-scoped, kept for history).
- **Workflow tier tag** beside a heading would set that feature's rigor above or below the project default. No tag inherits GA.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
