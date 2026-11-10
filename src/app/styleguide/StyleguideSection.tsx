import type { ReactNode } from "react";

import { Heading, Section } from "@/components/ui";

type StyleguideSectionProps = {
  readonly id: string;
  readonly number: string;
  readonly title: string;
  readonly intro?: string;
  readonly children: ReactNode;
};

/** One numbered section of the styleguide: label, rule, heading, intro, then the specimens. */
export function StyleguideSection({ id, number, title, intro, children }: StyleguideSectionProps) {
  const headingId = `${id}-title`;
  return (
    <Section id={id} aria-labelledby={headingId} label={number} rule>
      <div className="mb-10 flex max-w-prose flex-col gap-3">
        <Heading level={2} id={headingId}>
          {title}
        </Heading>
        {intro ? <p className="text-text-muted">{intro}</p> : null}
      </div>
      {children}
    </Section>
  );
}

/** A small caption naming a specimen and the state it shows. */
export function SpecimenLabel({ children }: { readonly children: ReactNode }) {
  return <p className="mb-3 text-label text-text-muted uppercase">{children}</p>;
}
