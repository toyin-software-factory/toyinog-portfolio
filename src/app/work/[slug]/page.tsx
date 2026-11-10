import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Container, Prose } from "@/components/ui";
import { getProject, getProjects, getProjectSlugs } from "@/lib/content";

import { CaseStudyHeader } from "./_components/CaseStudyHeader";
import { NextProject, nextProjectOf } from "./_components/NextProject";

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

/** Title (through the root template), description and share image from the project. */
export async function generateMetadata({ params }: CaseStudyProps): Promise<Metadata> {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.summary,
    alternates: { canonical: `/work/${project.slug}` },
    openGraph: {
      title: project.title,
      description: project.summary,
      type: "article",
      url: `/work/${project.slug}`,
      images: [{ url: project.cover.src, alt: project.cover.alt }],
    },
  };
}

/** A case study: header, cover, the Markdown body and the next project (spec 0005). */
export default async function CaseStudyPage({ params }: CaseStudyProps) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) notFound();

  return (
    <article className="flex flex-col gap-12 py-16 md:gap-16 md:py-24">
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
