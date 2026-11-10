import { Badge, Card, Tag, TagList } from "@/components/ui";

import { SpecimenLabel, StyleguideSection } from "./StyleguideSection";

export function DisplaySection() {
  return (
    <StyleguideSection
      id="display"
      number="05"
      title="Badges, tags and cards"
      intro="Badges and tags are labels, not controls. A card is one link: the whole card is clickable, and the focus outline wraps it."
    >
      <div className="flex flex-col gap-12">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <SpecimenLabel>Badge</SpecimenLabel>
            <Badge>Available for work</Badge>
          </div>
          <div>
            <SpecimenLabel>Tags</SpecimenLabel>
            <TagList label="Skills">
              <Tag>Product design</Tag>
              <Tag>TypeScript</Tag>
              <Tag>Design systems</Tag>
            </TagList>
          </div>
        </div>
        <div>
          <SpecimenLabel>Cards · hover underlines the title</SpecimenLabel>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
            <Card
              href="/"
              meta="Fintech · 2026"
              title="A calmer checkout"
              summary="Placeholder case study. Real projects arrive with the content model."
              image={{
                src: "/images/work/checkout-redesign.svg",
                alt: "Placeholder artwork for the checkout redesign case study",
              }}
            />
            <Card
              href="/"
              meta="Design system · 2025"
              title="One kit, four products"
              summary="Placeholder case study showing a second card in the grid."
              image={{
                src: "/images/work/design-system.svg",
                alt: "Placeholder artwork for the design system case study",
              }}
            />
          </div>
        </div>
      </div>
    </StyleguideSection>
  );
}
