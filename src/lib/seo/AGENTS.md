# src/lib/seo

Search and sharing metadata for every public page. Contract: [spec 0008](../../../docs/specs/0008-seo-social-sharing.md).

## Files

- `metadata.ts`: `pageMetadata({ title, description, path, image?, type?, absoluteTitle? })` builds a page's canonical URL and its Open Graph and Twitter tags. It trims the description to 160 characters at a word boundary.
- `site.ts`: `SITE_NAME`, the description limits (50 to 160), `DEFAULT_SHARE_IMAGE` (`/og/default.png`, 1200 by 630) and `absoluteUrl()`. Built from the generated shell profile module, so it is safe on any route.
- `jsonLd.ts`: pure schema.org builders (`personJsonLd`, `websiteJsonLd`, `creativeWorkJsonLd`) and `serializeJsonLd`, which escapes `<`. Render them with `src/components/seo/JsonLd.tsx`.
- `indexing.ts`: `isIndexable(appEnv)`, the only place that decides whether a build may be indexed. `src/app/robots.ts`, the root metadata and the `X-Robots-Tag` header in `next.config.ts` all use it. Relative imports only, because `next.config.ts` loads it. Go live (spec 0010) adds its launch switch here.
- `imageSize.ts`: reads a cover's pixel size from its file header (PNG, JPEG, WebP, GIF, AVIF, SVG) for `og:image:width` and `og:image:height`. The case study route reads the file at build time.

## Rules

- Every public page exports its metadata through `pageMetadata()`. Next.js replaces `openGraph` and `twitter` per page rather than merging them, so a page that sets only a title loses its share tags.
- Titles and descriptions must be unique across the sitemap. `tests/e2e/seo.spec.ts` checks every sitemap URL (canonical, title, description, share tags, JSON-LD, robots by environment).
- Indexing follows `isIndexable()`. Builds that aren't indexable get `noindex` in a meta tag and an `X-Robots-Tag` header, and a `robots.txt` that allows crawling with no sitemap. Never `Disallow`, because crawlers must read the pages to see `noindex`. Private pages (`/contact/sent`, `/styleguide`, `/dynamic-check`) set their own `noindex` and stay out of `src/app/sitemap.ts`.
- `public/og/default.png` and `src/app/apple-icon.png` are made by `scripts/make-share-images.ts` from the built fonts. Remake and commit them when the name or headline changes.

_Drafted by /sync from the introducing change, worth a quick human pass._
