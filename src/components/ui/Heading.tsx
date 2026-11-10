import type { ReactNode } from "react";

import { cx } from "./cx";

export type HeadingLevel = 1 | 2 | 3 | 4;
export type HeadingSize = "display" | "h1" | "h2" | "h3" | "h4";

const sizes: Record<HeadingSize, string> = {
  display: "font-display text-display",
  h1: "font-display text-h1",
  h2: "font-display text-h2",
  h3: "font-sans text-h3",
  h4: "font-sans text-body font-semibold",
};

const defaultSize: Record<HeadingLevel, HeadingSize> = { 1: "h1", 2: "h2", 3: "h3", 4: "h4" };

type HeadingProps = {
  /** The document outline level. */
  readonly level: HeadingLevel;
  /** The visual size, kept separate from the level. Defaults to match the level. */
  readonly size?: HeadingSize;
  readonly id?: string;
  readonly className?: string;
  readonly children: ReactNode;
};

/** A heading whose outline level and visual size are chosen separately. */
export function Heading({ level, size, id, className, children }: HeadingProps) {
  const Tag = `h${String(level)}` as "h1" | "h2" | "h3" | "h4";
  return (
    <Tag
      id={id}
      className={cx("text-balance text-text", sizes[size ?? defaultSize[level]], className)}
    >
      {children}
    </Tag>
  );
}
