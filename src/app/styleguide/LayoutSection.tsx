import { Rule } from "@/components/ui";

import { SpecimenLabel, StyleguideSection } from "./StyleguideSection";

export function LayoutSection() {
  return (
    <StyleguideSection
      id="layout"
      number="03"
      title="Space and layout"
      intro="Tailwind's 4px spacing scale. Sections sit 4rem apart on phones and 6rem on desktop, often with a top rule. Square corners, except a 2px radius on controls. No shadows."
    >
      <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
        <div>
          <SpecimenLabel>Containers</SpecimenLabel>
          <ul className="flex flex-col gap-2 text-small text-text-muted">
            <li>
              <code className="text-accent">max-w-page</code> 72rem, gutter 1.5rem to 2.5rem
            </li>
            <li>
              <code className="text-accent">max-w-prose</code> 42rem reading width
            </li>
          </ul>
        </div>
        <div>
          <SpecimenLabel>Radius</SpecimenLabel>
          <div className="flex items-center gap-4">
            <div aria-hidden="true" className="size-16 bg-surface" />
            <div
              aria-hidden="true"
              className="size-16 rounded-control border border-border-control"
            />
          </div>
          <p className="mt-3 text-small text-text-muted">Square surfaces · 2px controls</p>
        </div>
        <div>
          <SpecimenLabel>Rule</SpecimenLabel>
          <Rule className="my-8" />
          <p className="text-small text-text-muted">1px Graphite, decorative</p>
        </div>
      </div>
    </StyleguideSection>
  );
}
