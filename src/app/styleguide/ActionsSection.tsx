import { Button, ButtonLink, TextLink } from "@/components/ui";

import { SpecimenLabel, StyleguideSection } from "./StyleguideSection";

export function ActionsSection() {
  return (
    <StyleguideSection
      id="actions"
      number="04"
      title="Links and buttons"
      intro="Links are lemon and underlined. On hover they turn amber and the underline thickens. Buttons are at least 44px tall. Press Tab to see the 2px lemon focus outline on each one."
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
        <div>
          <SpecimenLabel>Text links · default, hover turns amber</SpecimenLabel>
          <p>
            Read <TextLink href="/">the home page</TextLink> or visit{" "}
            <TextLink href="https://github.com" external>
              GitHub
            </TextLink>
            .
          </p>
        </div>
        <div>
          <SpecimenLabel>Button link</SpecimenLabel>
          <div className="flex flex-wrap gap-4">
            <ButtonLink href="/">Get in touch</ButtonLink>
            <ButtonLink href="/" variant="secondary">
              See the work
            </ButtonLink>
          </div>
        </div>
        <div>
          <SpecimenLabel>Primary · hover turns amber</SpecimenLabel>
          <div className="flex flex-wrap gap-4">
            <Button>Send message</Button>
            <Button loading>Sending</Button>
            <Button disabled>Send message</Button>
          </div>
        </div>
        <div>
          <SpecimenLabel>Secondary · hover draws a lemon outline</SpecimenLabel>
          <div className="flex flex-wrap gap-4">
            <Button variant="secondary">Download CV</Button>
            <Button variant="secondary" disabled>
              Download CV
            </Button>
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
