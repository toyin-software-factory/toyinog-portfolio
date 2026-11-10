import { readFileSync } from "node:fs";
import path from "node:path";

import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/JsonLd";
import { Container, Prose } from "@/components/ui";
import { getAbout, getProfile, getProject, getProjects, getProjectSlugs } from "@/lib/content";
import { imageSize } from "@/lib/seo/imageSize";
import { creativeWorkJsonLd } from "@/lib/seo/jsonLd";
import { pageMetadata } from "@/lib/seo/metadata";

import { CaseStudyHeader } from "./_components/CaseStudyHeader";
import { NextProject, nextProjectOf } from "./_components/NextProject";

/** Prebuilt HTML only: Workers can't read content/ at request time (spec 0001). */
export const dynamic = "force-static";

/** Only the slugs known at build time exist; anything else is the 404 page (spec 0005, AC-3). */
export const dynamicParams = false;

/** Cover size: every cover is cropped to 16:10 (content/README.md). */
const COVER_WIDTH = 1600;
const COVER_HEIGHT = 1000;

type Params = { readonly slug: string };
type CaseStudyProps = { readonly params: Promise<Params> };

/** One prebuilt page per published project. */
export function generateStaticParams(): Params[] {
  return getProjectSlugs().map((slug) => ({ slug }));
}

/** The cover's real pixel size, read from `public/` at build time (this route is prerendered). */
function coverSize(src: string) {
  return imageSize(src, new Uint8Array(readFileSync(path.join(process.cwd(), "public", src))));
}

/**
 * Title (through the root template), description and share tags from the project.
 * The cover is the share image at its real size, with og:image:width and height
 * (spec 0008 AC-3).
 */
export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return pageMetadata({
    title: project.title,
    description: project.summary,
    path: `/work/${project.slug}`,
    image: { url: project.cover.src, alt: project.cover.alt, ...coverSize(project.cover.src) },
    type: "article",
  });
}

/** A case study: header, cover, the Markdown body and the next project (spec 0005). */
export default async function CaseStudyPage({ params }: CaseStudyProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  const work = creativeWorkJsonLd(
    { ...project, cover: project.cover.src },
    { ...getProfile(), photo: getAbout().photo.src },
  );

  return (
    <article className="flex flex-col gap-12 py-16 md:gap-16 md:py-24">
      <JsonLd data={work} />
      <Container>
        <CaseStudyHeader project={project} />
      </Container>
      <Container>
        <Image
          src={project.cover.src}
          alt={project.cover.alt}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
          sizes="(min-width: 1152px) 1152px, 100vw"
          preload
          fetchPriority="high"
          className="aspect-[16/10] h-auto w-full bg-surface object-cover"
        />
      </Container>
      <Container>
        <Prose html={project.html} className="mx-auto" />
      </Container>
      <Container>
        <NextProject next={nextProjectOf(getProjects(), project.slug)} />
      </Container>
    </article>
  );
}
