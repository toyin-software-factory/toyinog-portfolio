import Link from "next/link";
import type { ReactNode } from "react";

import { cx } from "./cx";
import { ArrowUpRightIcon } from "./icons";
import { VisuallyHidden } from "./VisuallyHidden";

type TextLinkProps = {
  readonly href: string;
  /** Another site: opens in a new tab with `rel="noopener noreferrer"` and an arrow. */
  readonly external?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
};

/**
 * An underlined lemon link. The vertical padding widens the touch area without
 * moving the text (inline links also fall under WCAG 2.5.8's inline exception).
 */
export const textLinkClass =
  "py-3 text-accent underline decoration-1 underline-offset-4 transition-[color,text-decoration-thickness] hover:text-accent-strong hover:decoration-2";

export function TextLink({ href, external = false, className, children }: TextLinkProps) {
  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cx(textLinkClass, "inline-flex items-baseline gap-1", className)}
      >
        {children}
        <ArrowUpRightIcon className="size-[0.8em] self-center" />{" "}
        <VisuallyHidden>(opens in new tab)</VisuallyHidden>
      </a>
    );
  }
  return (
    <Link href={href} className={cx(textLinkClass, className)}>
      {children}
    </Link>
  );
}
