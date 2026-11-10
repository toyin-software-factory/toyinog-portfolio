import { cx } from "@/components/ui/cx";

import { StyleguideSection } from "./StyleguideSection";
import { colourTokens } from "./tokens";

export function ColourSection() {
  return (
    <StyleguideSection
      id="colour"
      number="01"
      title="Colour"
      intro="Toyin's palette on a dark base, plus three helper colours added only to meet WCAG AA. Values live in globals.css; use the tokens, never raw colours."
    >
      <ul className="grid grid-cols-1 gap-px bg-rule sm:grid-cols-2 lg:grid-cols-5">
        {colourTokens.map((colour) => (
          <li key={colour.token} className="flex flex-col gap-3 bg-bg p-4">
            <div
              aria-hidden="true"
              className={cx("h-20 w-full border border-border-control", colour.swatch)}
            />
            <div className="flex flex-col gap-1">
              <p className="font-medium text-text">{colour.name}</p>
              <p className="text-small text-accent">
                <code>{colour.token}</code>
              </p>
              <p className="text-small text-text-muted">{colour.use}</p>
              {colour.contrast ? (
                <p className="text-small text-text-muted">{colour.contrast}</p>
              ) : null}
            </div>
          </li>
        ))}
      </ul>
    </StyleguideSection>
  );
}
