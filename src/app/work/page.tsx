import type { Metadata } from "next";

import { Container, Heading } from "@/components/ui";
import { getProjects } from "@/lib/content";

import { ProjectCard } from "./_components/ProjectCard";
import { WORK_DESCRIPTION, WORK_INTRO } from "./copy";

export const dynamic = "force-static";

export const metadata: Metadata = {
  title: "Work",
  description: WORK_DESCRIPTION,
  alternates: { canonical: "/work" },
};

/** Every published project as a card grid, in `getProjects()` order (spec 0005). */
export default function WorkPage() {
  const projects = getProjects();
  return (
    <Container className="flex flex-col gap-12 py-16 md:gap-16 md:py-24">
      <header className="flex flex-col gap-4">
        <Heading level={1}>Work</Heading>
        <p className="max-w-prose text-h3 font-normal text-text-muted">{WORK_INTRO}</p>
      </header>
      <ul className="grid gap-12 md:grid-cols-2 md:gap-x-10 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </ul>
    </Container>
  );
}
