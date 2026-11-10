import { Heading, Tag, TagList, TextLink } from "@/components/ui";
import type { Project } from "@/lib/content";

type CaseStudyHeaderProps = {
  readonly project: Pick<
    Project,
    "title" | "summary" | "role" | "client" | "year" | "tags" | "links"
  >;
};

/** The case study title (the page's h1), summary, facts list and project links. */
export function CaseStudyHeader({ project }: CaseStudyHeaderProps) {
  return (
    <header className="grid gap-10 md:grid-cols-12 md:gap-10">
      <div className="flex flex-col gap-6 md:col-span-8">
        <Heading level={1} size="display">
          {project.title}
        </Heading>
        <p className="max-w-prose text-h3 font-normal text-text">{project.summary}</p>
        {project.links.length > 0 ? (
          <ul aria-label="Project links" className="flex flex-wrap gap-x-6">
            {project.links.map((link) => (
              <li key={link.url}>
                <TextLink href={link.url} external>
                  {link.label}
                </TextLink>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      <dl className="grid grid-cols-[auto_1fr] content-start gap-x-6 gap-y-4 border-t border-rule pt-6 md:col-span-4 md:border-t-0 md:border-l md:pt-0 md:pl-8">
        <dt className="text-label text-text-muted uppercase">Role</dt>
        <dd>{project.role}</dd>
        {project.client ? (
          <>
            <dt className="text-label text-text-muted uppercase">Client</dt>
            <dd>{project.client}</dd>
          </>
        ) : null}
        <dt className="text-label text-text-muted uppercase">Year</dt>
        <dd>{project.year}</dd>
        <dt className="text-label text-text-muted uppercase">Tags</dt>
        <dd>
          <TagList>
            {project.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </TagList>
        </dd>
      </dl>
    </header>
  );
}
