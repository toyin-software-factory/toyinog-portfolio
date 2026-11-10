import type { ReactNode } from "react";

import { cx } from "./cx";

type SectionProps = {
  /** A small uppercase label above the content, for example "Selected work". */
  readonly label?: string;
  /** Draws a top rule, the editorial divider between sections. */
  readonly rule?: boolean;
  readonly id?: string;
  /** Names the region for assistive tech; point it at the section's heading id. */
  readonly "aria-labelledby"?: string;
  readonly className?: string;
  readonly children: ReactNode;
};

/** A page section with the standard vertical rhythm (4rem mobile, 6rem desktop). */
export function Section({
  label,
  rule = false,
  id,
  "aria-labelledby": labelledBy,
  className,
  children,
}: SectionProps) {
  return (
    <section
      id={id}
      aria-labelledby={labelledBy}
      className={cx("py-16 md:py-24", rule && "border-t border-rule", className)}
    >
      {label ? <p className="mb-6 text-label text-text-muted uppercase">{label}</p> : null}
      {children}
    </section>
  );
}
