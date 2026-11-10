import { ButtonLink, Container, Heading, Section } from "@/components/ui";

import { CONTACT_CTA_HEADING } from "./copy";

/** The closing call to action: a large serif line and one primary button. */
export function ContactCta() {
  return (
    <Section rule aria-labelledby="contact-cta-title">
      <Container className="flex flex-col items-start gap-8">
        <Heading level={2} size="display" id="contact-cta-title" className="max-w-4xl">
          {CONTACT_CTA_HEADING}
        </Heading>
        <ButtonLink href="/contact">Get in touch</ButtonLink>
      </Container>
    </Section>
  );
}
