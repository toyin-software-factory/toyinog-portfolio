# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

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
