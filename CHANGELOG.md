# Changelog

All notable changes to this project are documented in this file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Site shell on every page: a header with Toyin's name and the Work, About and Contact links (always visible, also on phones), a skip link, and a footer with LinkedIn, GitHub, email, copyright and a Back to top link. The current section is marked in the nav (see spec 0004).
- Home page: a hero with name, headline, intro, availability badge and two actions, then Selected work (the featured projects as cards), an About teaser, and a contact call to action. All text comes from the content files (see spec 0004).
- A styled "Page not found" page that returns HTTP 404 and links back to Home and Work (see spec 0004).
- Page titles and the default description now come from the profile: `<name> · <headline>` on Home, `<page> · <name>` elsewhere (see spec 0004).
- Content model: projects, profile and About live as Markdown files in `content/`, validated at build time. A wrong field fails the build with a plain words message naming every file and field to fix. `pnpm content:check` runs the same check without a full build, and CI runs it (see spec 0002).
- Draft projects (`draft: true`) show in previews and local dev but never in production (see spec 0002).
- Case study Markdown renders to safe HTML at build time: heading ids, `rel="noopener noreferrer"` on external links, and no raw HTML (see spec 0002).
- Placeholder content for every type: 4 projects (3 featured, 1 draft), the profile, the About page and a placeholder CV (see spec 0002).
