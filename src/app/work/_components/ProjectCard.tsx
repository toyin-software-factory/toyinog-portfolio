import { Card, Tag, TagList } from "@/components/ui";
import type { Project } from "@/lib/content";

import { MAX_CARD_TAGS } from "../copy";

export type ProjectCardData = Pick<
  Project,
  "slug" | "title" | "role" | "year" | "summary" | "tags" | "cover"
>;

/**
 * One project in the Work grid: a `Card` (cover, "<role> · <year>", title, summary,
 * one link covering the card) with up to 3 tags under it. Renders an `li`.
 */
export function ProjectCard({ project }: { readonly project: ProjectCardData }) {
  return (
    <li className="flex flex-col gap-4">
      <Card
        href={`/work/${project.slug}`}
        title={project.title}
        meta={`${project.role} · ${String(project.year)}`}
        summary={project.summary}
        image={project.cover}
        headingLevel={2}
      />
      <TagList label={`${project.title} tags`}>
        {project.tags.slice(0, MAX_CARD_TAGS).map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
      </TagList>
    </li>
  );
}
