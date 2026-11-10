import { cx } from "@/components/ui/cx";

import { StyleguideSection } from "./StyleguideSection";
import { typeTokens } from "./tokens";

export function TypeSection() {
  return (
    <StyleguideSection
      id="type"
      number="02"
      title="Type"
      intro="Instrument Serif for display and the top two heading levels, Inter for everything else. Sizes are fluid between 390 and 1440 pixels wide."
    >
      <dl className="flex flex-col">
        {typeTokens.map((type) => (
          <div
            key={type.token}
            className="grid grid-cols-1 gap-2 border-t border-rule py-6 md:grid-cols-12 md:gap-6"
          >
            <dt className="flex flex-col gap-1 md:col-span-3">
              <code className="text-small text-accent">text-{type.token}</code>
              <span className="text-small text-text-muted">{type.spec}</span>
            </dt>
            <dd className={cx("text-text md:col-span-9", type.className)}>{type.sample}</dd>
          </div>
        ))}
      </dl>
    </StyleguideSection>
  );
}
