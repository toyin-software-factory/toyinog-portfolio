import { Card, Container, Heading, Section, Tag, TagList, TextLink } from "@/components/ui";
import type { Project } from "@/lib/content";

import { MAX_CARD_TAGS } from "./copy";

type SelectedWorkProps = {
  readonly projects: readonly Pick<
    Project,
    "slug" | "title" | "role" | "year" | "summary" | "tags" | "cover"
  >[];
};

/** The featured projects as cards, plus a link to all work. Renders nothing when none are featured. */
export function SelectedWork({ projects }: SelectedWorkProps) {
  if (projects.length === 0) return null;
  return (
    <Section rule aria-labelledby="selected-work-title">
      <Container className="flex flex-col gap-10 md:gap-14">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <Heading level={2} id="selected-work-title">
            Selected work
          </Heading>
          <TextLink href="/work">All work</TextLink>
        </div>
        <ul className="grid gap-12 md:grid-cols-2 md:gap-x-10 lg:grid-cols-3">
          {projects.map((project) => (
            <li key={project.slug} className="flex flex-col gap-4">
              <Card
                href={`/work/${project.slug}`}
                title={project.title}
                meta={`${project.role} · ${String(project.year)}`}
                summary={project.summary}
                image={project.cover}
              />
              <TagList label={`${project.title} tags`}>
                {project.tags.slice(0, MAX_CARD_TAGS).map((tag) => (
                  <Tag key={tag}>{tag}</Tag>
                ))}
              </TagList>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
