# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Cookie free visitor analytics: the live site loads Cloudflare Web Analytics' beacon, which counts page views and referrers with no cookies and no local storage, so no consent banner is needed. It runs only in production with a token set, never in previews, local development or CI. A view of `/contact/sent` counts as a contact conversion (see spec 0009).
- Search and sharing: every public page has its own canonical URL, title, description and share card (Open Graph and Twitter). Pages use a branded 1200x630 share image, and case studies use their cover (see spec 0008).
- Structured data for search engines: Toyin as a Person on Home and About, the site as a WebSite, and each case study as a CreativeWork (see spec 0008).
- Previews on workers.dev are kept out of search: `robots.txt` disallows everything and pages say `noindex` outside production. Production allows indexing and points at the sitemap (see spec 0008).
- The sitemap lists every public page with a last modified date (see spec 0008).
- A site icon (a lemon "T" on Carbon Black) and an Apple touch icon. They replace the default favicon (see spec 0008).
- Design system: Toyin's palette, the Instrument Serif and Inter type scale, spacing and radii as Tailwind tokens in one place, with a test that blocks raw colour values in components and pages (see spec 0003).
- Base components in `src/components/ui/` (layout, headings, Prose for Markdown, links, buttons, badge, tag, card, skip link and form fields), each with a visible lemon focus ring, keyboard support and 44px touch targets (see spec 0003).
- A preview only `/styleguide` page showing every token and component in its states; it returns 404 in production and stays out of search (see spec 0003).
- Self hosted fonts: no request to a font host at runtime (see spec 0003).
- Site skeleton: Next.js on Cloudflare Workers through OpenNext, with security headers, `robots.txt` and a sitemap (see spec 0001).
- CI on every pull request: lint, format, typecheck, content check, unit tests, the Workers build, a 3 MiB Worker size gate, and Playwright end to end tests with axe on the real Workers runtime, at desktop and phone widths (see spec 0001).
- Every pull request gets a preview deployment through Cloudflare Workers Builds; `main` deploys to production. Previews never send email and show draft content (see spec 0001).
- About page at `/about`: photo and bio, an experience timeline (newest first, with dates such as "Mar 2024 to Present"), skills grouped as tags, and a "Download CV (PDF)" button after the bio and at the end, with the CV's last updated month. The CV saves as `Toyin-Ogunseinde-CV.pdf` (see spec 0006).
- `/about` in the sitemap (see spec 0006).
- Work page at `/work`: every published project as a card grid in Toyin's chosen order (see spec 0005).
- A case study page for each project at `/work/<slug>`, with the title, summary, role, client, year, tags, project links, the cover, the case study text and a "Next project" link. Each page has its own title, description and share image (see spec 0005).
- `/work` and every case study are in the sitemap. Adding a Markdown file to `content/work/` adds the card, the page and the sitemap entry on the next build, with no code change (see spec 0005).
- Site shell on every page: a header with Toyin's name and the Work, About and Contact links (always visible, also on phones), a skip link, and a footer with LinkedIn, GitHub, email, copyright and a Back to top link. The current section is marked in the nav (see spec 0004).
- Home page: a hero with name, headline, intro, availability badge and two actions, then Selected work (the featured projects as cards), an About teaser, and a contact call to action. All text comes from the content files (see spec 0004).
- A styled "Page not found" page that returns HTTP 404 and links back to Home and Work (see spec 0004).
- Page titles and the default description now come from the profile: `<name> · <headline>` on Home, `<page> · <name>` elsewhere (see spec 0004).
- Content model: projects, profile and About live as Markdown files in `content/`, validated at build time. A wrong field fails the build with a plain words message naming every file and field to fix. `pnpm content:check` runs the same check without a full build, and CI runs it (see spec 0002).
- Draft projects (`draft: true`) show in previews and local dev but never in production (see spec 0002).
- Case study Markdown renders to safe HTML at build time: heading ids, `rel="noopener noreferrer"` on external links, and no raw HTML (see spec 0002).
- Placeholder content for every type: 4 projects (3 featured, 1 draft), the profile, the About page and a placeholder CV (see spec 0002).
- Contact page at `/contact`: a form (name, email, "a role or a project", message) that emails Toyin, with Toyin's email, LinkedIn and GitHub beside it (see spec 0007).
- Server side validation with an error summary that links to each field and keeps what the visitor typed (see spec 0007).
- Spam protection: Cloudflare Turnstile, a hidden honeypot field, and a rate limit of 5 messages a minute per visitor (see spec 0007).
- A thank you page at `/contact/sent`, shown only after a send and kept out of search results (see spec 0007).
- Outside production the form does a dry run: everything except the email, so previews never send mail (see spec 0007).
- `/contact` in the sitemap.

### Fixed

- `/contact` no longer logs a Content Security Policy violation in the browser. The form's field list no longer pulls the validation library into the page, which also makes `/contact` load about 29 KiB (gzip) less JavaScript (see spec 0009, AC-4).
- Pages rendered on request (not prebuilt) now show the header and footer instead of failing with a server error on Cloudflare Workers. The shell's name, headline, intro and links now come from a small module written at build time (`pnpm content:generate`), so it never reads `content/` while serving a request (see spec 0004, AC-12).
