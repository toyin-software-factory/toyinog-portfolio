# /check verify seo & social sharing · PASS

**Date**: 2026-11-10 · **Spec**: [0008](../specs/0008-seo-social-sharing.md) · **Scope**: feature 9 · **Run by**: Dwight, RLR-T01

**PASS: all 8 acceptance criteria met, every specced surface built.** The production style run below is recorded here until CI gains its own production style e2e job (PF-T07), as AC-8 says.

Next: `/sync`, then Review after CodeRabbit.

## How it was run

- **Preview build** (`pnpm preview`, like CI): full `pnpm test:e2e` gave 147 passed and 1 skipped, after the rebase onto analytics (#35) and the AC-5 change below. The skip is the per page SEO sweep on the mobile project, because head tags don't depend on the viewport.
- **Production style build** (`APP_ENV=production pnpm preview`): `APP_ENV=production pnpm exec playwright test tests/e2e/seo.spec.ts tests/e2e/static.spec.ts --project=desktop` gave 12 passed. Its output, `robots.txt`, the sitemap and the JSON-LD are below.
- `pnpm test`: all unit tests pass, including `src/lib/seo/seo.test.ts` (metadata, JSON-LD, robots by environment, sitemap) and `src/lib/seo/imageSize.test.ts`.
- Share preview: a local page that draws a LinkedIn style card from the real `og:` tags of `/` and `/work/design-system` on the production build (screenshot in the PR).

## Acceptance criteria

| AC | Result | Evidence |
|---|---|---|
| AC-1 | met | Root `metadataBase` is `https://toyinog.com`. The sitemap wide check finds each page's canonical equal to its own path on that origin, on both builds. |
| AC-2 | met | The sitemap wide check finds unique titles and descriptions of 58 to 116 characters (range 50 to 160) on all 7 production pages, and 8 on the preview build, which includes the draft. `pageMetadata()` trims descriptions to 160 at a word boundary. |
| AC-3 | met | Every sitemap page has `og:title`, `og:description`, `og:url`, `og:type`, `og:image` with width and height, `og:site_name`, and `twitter:card=summary_large_image`. Pages that aren't case studies use `/og/default.png` at exactly 1200x630, which the unit test confirms by reading the PNG header. Case studies use their cover at its real size (1200x750 for the placeholders). Every image URL returns 200. |
| AC-4 | met | `/` has WebSite and Person, `/about` has Person, and each case study has CreativeWork with a Person author. The check validates the schema.org context, the required properties per type and absolute URLs. `serializeJsonLd` escapes `<` (unit test). The JSON-LD is below. |
| AC-5 | met | One helper, `isIndexable()` in `src/lib/seo/indexing.ts`, decides it for `robots.ts`, the root metadata and `next.config.ts`. Production: `robots.txt` says `Allow: /` with the sitemap, and there is no robots meta and no `X-Robots-Tag`. Preview: `robots.txt` says `Allow: /` with no sitemap (never `Disallow`, so crawlers can read the noindex), every page has `<meta name="robots" content="noindex">`, and every routed response carries `X-Robots-Tag: noindex`. That covers prerendered pages, the 404, `robots.txt` and `sitemap.xml`. Files under `public/` and `/_next/static` skip it, which is expected. The amended AC-5 is from PR #40, after CodeRabbit's review. |
| AC-6 | met | The production sitemap has `/`, `/work`, `/about`, `/contact` and the 3 published case studies, each with `lastmod`. It has no draft, `/contact/sent`, `/styleguide` or `/dynamic-check`. |
| AC-7 | met | `src/app/icon.svg` (a lemon T on Carbon Black) and `src/app/apple-icon.png` (180x180). e2e: `link[rel=icon][type=image/svg+xml]` and `apple-touch-icon sizes=180x180` both resolve with 200. `favicon.ico` is removed. |
| AC-8 | met | `tests/e2e/seo.spec.ts` reads every sitemap URL and checks AC-1 to AC-4. Its robots checks follow the environment. Passing runs on preview (CI) and production style (below). |

## Production style run (`APP_ENV=production pnpm preview`)

```text
✓   1 [desktop] › tests/e2e/seo.spec.ts:112:3 › sitemap and robots (spec 0008 AC-5, AC-6) › the sitemap lists the public pages with lastmod, and nothing private
  ✓   3 [desktop] › tests/e2e/seo.spec.ts:124:3 › sitemap and robots (spec 0008 AC-5, AC-6) › robots.txt allows indexing and lists the sitemap in this build
  ✓   4 [desktop] › tests/e2e/seo.spec.ts:135:3 › sitemap and robots (spec 0008 AC-5, AC-6) › /contact/sent stays out of search
  ✓   5 [desktop] › tests/e2e/static.spec.ts:28:3 › / is served as prerendered HTML
  ✓   6 [desktop] › tests/e2e/static.spec.ts:28:3 › /work is served as prerendered HTML
  ✓   7 [desktop] › tests/e2e/static.spec.ts:28:3 › /about is served as prerendered HTML
  ✓   8 [desktop] › tests/e2e/static.spec.ts:28:3 › /contact is served as prerendered HTML
  ✓   9 [desktop] › tests/e2e/static.spec.ts:28:3 › /work/design-system is served as prerendered HTML
  ✓  10 [desktop] › tests/e2e/static.spec.ts:28:3 › /work/checkout-redesign is served as prerendered HTML
  ✓  11 [desktop] › tests/e2e/static.spec.ts:28:3 › /work/analytics-dashboard is served as prerendered HTML
[seo] production build, 7 sitemap pages checked:
  /  "Toyin Ogunseinde · Placeholder headline: frontend engineer who builds fast, accessible websites"  (86 chars)  og:image /og/default.png 1200x630  x-robots-tag none  json-ld WebSite+Person
  /work  "Work · Toyin Ogunseinde"  (76 chars)  og:image /og/default.png 1200x630  x-robots-tag none  json-ld none
  /about  "About · Toyin Ogunseinde"  (110 chars)  og:image /og/default.png 1200x630  x-robots-tag none  json-ld Person
  /contact  "Contact · Toyin Ogunseinde"  (58 chars)  og:image /og/default.png 1200x630  x-robots-tag none  json-ld none
  /work/design-system  "Placeholder: Design system for a product team · Toyin Ogunseinde"  (116 chars)  og:image /images/work/design-system.svg 1200x750  x-robots-tag none  json-ld CreativeWork
  /work/checkout-redesign  "Placeholder: Checkout redesign · Toyin Ogunseinde"  (90 chars)  og:image /images/work/checkout-redesign.svg 1200x750  x-robots-tag none  json-ld CreativeWork
  /work/analytics-dashboard  "Placeholder: Analytics dashboard · Toyin Ogunseinde"  (97 chars)  og:image /images/work/analytics-dashboard.svg 1200x750  x-robots-tag none  json-ld CreativeWork
  ✓   2 [desktop] › tests/e2e/seo.spec.ts:146:3 › every sitemap page (spec 0008 AC-8) › has a canonical, a unique title and description, share tags and valid JSON-LD (AC-1 to AC-4)
  ✓  12 [desktop] › tests/e2e/seo.spec.ts:229:3 › icons (spec 0008 AC-7) › serves the SVG favicon and the 180 by 180 Apple touch icon
  12 passed
```

## robots.txt: production vs preview

```text
== X-Robots-Tag on a production style build (APP_ENV=production pnpm preview)
/                                        200  
/work                                    200  
/work/design-system                      200  
/about                                   200  
/contact                                 200  
/robots.txt                              200  
/sitemap.xml                             200  

== robots.txt (production style build)
User-Agent: *
Allow: /

Sitemap: https://toyinog.com/sitemap.xml

== X-Robots-Tag on a preview build (pnpm preview)
/                                        200  X-Robots-Tag: noindex
/work                                    200  X-Robots-Tag: noindex
/work/design-system                      200  X-Robots-Tag: noindex
/about                                   200  X-Robots-Tag: noindex
/contact                                 200  X-Robots-Tag: noindex
/does-not-exist                          404  x-robots-tag: noindex
/robots.txt                              200  X-Robots-Tag: noindex
/sitemap.xml                             200  X-Robots-Tag: noindex
/og/default.png                          200  
/images/work/design-system.svg           200  
/_next/static/chunks/0q98e509jymfp.css   200  

== robots.txt (preview build)
User-Agent: *
Allow: /
```

## JSON-LD on the production build

```text
== JSON-LD on / (production)
[
    {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "@id": "https://toyinog.com/#website",
        "name": "Toyin Ogunseinde",
        "url": "https://toyinog.com/",
        "inLanguage": "en",
        "publisher": {
            "@id": "https://toyinog.com/#person"
        }
    },
    {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://toyinog.com/#person",
        "name": "Toyin Ogunseinde",
        "jobTitle": "Placeholder headline: frontend engineer who builds fast, accessible websites",
        "url": "https://toyinog.com/",
        "image": "https://toyinog.com/images/about/photo.svg",
        "sameAs": [
            "https://example.com/placeholder-linkedin",
            "https://example.com/placeholder-github"
        ]
    }
]
== JSON-LD on /about (production)
{
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": "https://toyinog.com/#person",
    "name": "Toyin Ogunseinde",
    "jobTitle": "Placeholder headline: frontend engineer who builds fast, accessible websites",
    "url": "https://toyinog.com/",
    "image": "https://toyinog.com/images/about/photo.svg",
    "sameAs": [
        "https://example.com/placeholder-linkedin",
        "https://example.com/placeholder-github"
    ]
}
== JSON-LD on /work/design-system (production)
{
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    "name": "Placeholder: Design system for a product team",
    "description": "Placeholder summary. A shared component library that helped several product teams ship faster and more consistently.",
    "url": "https://toyinog.com/work/design-system",
    "image": "https://toyinog.com/images/work/design-system.svg",
    "dateCreated": "2025",
    "author": {
        "@context": "https://schema.org",
        "@type": "Person",
        "@id": "https://toyinog.com/#person",
        "name": "Toyin Ogunseinde",
        "jobTitle": "Placeholder headline: frontend engineer who builds fast, accessible websites",
        "url": "https://toyinog.com/",
        "image": "https://toyinog.com/images/about/photo.svg",
        "sameAs": [
            "https://example.com/placeholder-linkedin",
            "https://example.com/placeholder-github"
        ]
    }
}
```

## For /check review

- The placeholder covers are SVG. LinkedIn, Facebook and X don't accept SVG share images, so Toyin's real covers should be JPG, PNG or WebP. `content/README.md` could say so; it isn't in this task's list.
- The share image shows the placeholder headline. When Toyin's real headline lands, run `pnpm build && pnpm exec tsx scripts/make-share-images.ts` and commit `public/og/default.png`.
