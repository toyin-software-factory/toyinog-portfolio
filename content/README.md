# Site content

Everything the site says lives in this folder as Markdown files. You change the site by editing these files and opening a pull request. There is no CMS and no database.

Each file starts with a header between two `---` lines (the front matter, written in YAML). The build checks every header. If something is wrong, the build stops and lists every file and field to fix, so a mistake never reaches the live site.

You can run the same check on your machine before you push:

```bash
pnpm content:check
```

The full rules are in [spec 0002](../docs/specs/0002-content-model.md).

## The files

| File | What it holds |
|---|---|
| `work/<slug>.md` | One project case study. The filename becomes the web address: `work/checkout-redesign.md` is `/work/checkout-redesign`. |
| `pages/profile.md` | Your name, headline, intro, availability, links and email. Header only, any text below it is ignored. |
| `pages/about.md` | Photo, experience, skills and CV in the header, your bio below it. |

Images go in `public/images/` and the CV goes in `public/cv/`. Refer to them by their path on the site, starting with `/`: the file `public/images/work/shop.webp` is `/images/work/shop.webp`. The build checks that every file you point to exists.

Everything here now is **placeholder text**, marked with "Placeholder". Replace it before launch.

## Add a project

1. Pick a slug: lowercase letters, digits and single hyphens, like `checkout-redesign`.
2. Add a cover image at `public/images/work/<slug>.webp` (or `.jpg`, `.png`, `.avif`, `.svg`). Crop it to 16:10, for example 1600 by 1000 pixels: the case study shows it at that shape, so other shapes get trimmed at the edges.
3. Copy this into `content/work/<slug>.md` and fill it in:

```markdown
---
title: "Checkout redesign" # required, up to 80 characters
summary: "One or two sentences for cards and search results." # required, up to 200 characters
role: Frontend engineer # required
client: Example Shop # optional
year: 2025 # required, a whole number
tags: [Next.js, Accessibility] # required, 1 to 8
cover:
  src: /images/work/checkout-redesign.webp # required, must exist under public/
  alt: "The new checkout on a phone" # required, describe the image
links: # optional, up to 2, https only
  - label: Live site
    url: https://example.com
featured: false # optional, at most 3 published projects can be featured
order: 5 # required, lower numbers come first
draft: false # optional, true hides it on the live site but shows it in previews
---

## Problem

What was wrong, for whom, and why it mattered.

## What I did

Your part of the work.

## Outcome

What changed, with a number if you have one.
```

That's all: on the next build the project shows on `/work`, gets its own page at `/work/<slug>`, and joins the sitemap. No code change is needed.

The three sections (`## Problem`, `## What I did`, `## Outcome`) are recommended. Leaving one out prints a warning, not an error.

Projects are listed by `order` (lowest first), then newest `year`, then `title`.

## Profile template (`pages/profile.md`)

```markdown
---
name: Your Name
headline: "Up to 100 characters"
intro: "Up to 300 characters"
location: City, Country # optional
availability: both # roles, projects, both or none
links:
  linkedin: https://www.linkedin.com/in/you
  github: https://github.com/you
email: you@example.com # shown as text on the Contact page only
---
```

## About template (`pages/about.md`)

```markdown
---
photo:
  src: /images/about/photo.webp
  alt: "Describe the photo"
experience: # at least 1, shown newest first
  - role: Lead frontend engineer
    company: Example Co
    location: Remote # optional
    start: 2023-01 # YYYY-MM
    end: present # YYYY-MM or present
    highlights: # 2 to 4
      - One thing you achieved.
      - Another thing you achieved.
skillGroups: # at least 1
  - name: Frontend
    skills: [TypeScript, React] # 1 to 20
cv:
  file: /cv/your-cv.pdf # a PDF under public/cv/
  updated: 2026-11 # YYYY-MM
---

Your bio, in Markdown.
```

## Writing Markdown

- Headings, lists, links, bold, italics, quotes and images all work.
- Raw HTML is not allowed and is removed, so content can't add scripts.
- Links to other sites are marked `rel="noopener noreferrer"` automatically.
- Watch the indentation in the header: use two spaces, never tabs. A wrong indent is the most common mistake, and the build error says which line.
