import type { Metadata } from "next";

import { truncateAtWord } from "@/lib/content/text";

import { DEFAULT_SHARE_IMAGE, DESCRIPTION_MAX, SITE_NAME } from "./site";

export type ShareImage = {
  readonly url: string;
  readonly alt: string;
  readonly width?: number;
  readonly height?: number;
};

type PageMetadataInput = {
  /**
   * The page's own title. It goes through the root template ("%s · <name>"), except
   * with `absoluteTitle`, which is used as is (Home).
   */
  readonly title: string;
  readonly absoluteTitle?: boolean;
  /** 50 to 160 characters, unique per page (AC-2). */
  readonly description: string;
  /** The page's own path, for the canonical and `og:url` (AC-1). */
  readonly path: string;
  /** Defaults to the site's default share image (AC-3). */
  readonly image?: ShareImage;
  readonly type?: "website" | "article" | "profile";
};

/**
 * One page's metadata: canonical URL, Open Graph and Twitter tags (spec 0008
 * AC-1 to AC-3). Next.js replaces `openGraph` and `twitter` per page rather than
 * merging them, so every public page builds its full set here.
 */
export function pageMetadata({
  title,
  absoluteTitle = false,
  description,
  path,
  image = DEFAULT_SHARE_IMAGE,
  type = "website",
}: PageMetadataInput): Metadata {
  description = truncateAtWord(description.replace(/\s+/g, " ").trim(), DESCRIPTION_MAX);
  const fullTitle = absoluteTitle ? title : `${title} · ${SITE_NAME}`;
  const images = [{ ...image }];
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      type,
      siteName: SITE_NAME,
      locale: "en",
      images,
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images,
    },
  };
}
