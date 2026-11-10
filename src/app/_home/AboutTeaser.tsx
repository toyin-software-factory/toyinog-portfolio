import { Container, Heading, Section, TextLink } from "@/components/ui";

type AboutTeaserProps = {
  /** The bio's first paragraph as plain text, already shortened. */
  readonly teaser: string;
  /** The most recent experience entry, if there is one. */
  readonly latest: { readonly role: string; readonly company: string } | undefined;
};

/** A short About block linking to the full About page. */
export function AboutTeaser({ teaser, latest }: AboutTeaserProps) {
  return (
    <Section rule aria-labelledby="about-title">
      <Container className="grid gap-6 md:grid-cols-12 md:gap-10">
        <Heading level={2} id="about-title" className="md:col-span-4">
          About
        </Heading>
        <div className="flex flex-col items-start gap-4 md:col-span-8">
          {latest ? (
            <p className="text-label text-text-muted uppercase">
              {latest.role} at {latest.company}
            </p>
          ) : null}
          {teaser ? <p className="max-w-prose text-h3 font-normal text-text">{teaser}</p> : null}
          <TextLink href="/about">More about me</TextLink>
        </div>
      </Container>
    </Section>
  );
}
