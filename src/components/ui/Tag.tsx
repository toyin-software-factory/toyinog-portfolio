import type { ReactNode } from "react";

import { cx } from "./cx";

/** A list of tags. Tags are list items, so they must sit inside this list. */
export function TagList({
  label,
  className,
  children,
}: {
  /** Names the list for screen readers, for example "Skills". */
  readonly label?: string;
  readonly className?: string;
  readonly children: ReactNode;
}) {
  return (
    <ul aria-label={label} className={cx("flex flex-wrap gap-2", className)}>
      {children}
    </ul>
  );
}

/** One tag: Graphite fill, small text. Not interactive. */
export function Tag({ children }: { readonly children: ReactNode }) {
  return <li className="bg-surface px-2 py-1 text-small text-text">{children}</li>;
}
