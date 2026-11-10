import Link from "next/link";
import type { ReactNode } from "react";

import { buttonClass, type ButtonVariant } from "./buttonStyles";

type ButtonLinkProps = {
  readonly href: string;
  readonly variant?: ButtonVariant;
  readonly className?: string;
  readonly children: ReactNode;
};

/** A link that looks like a button, for navigation such as "Get in touch". */
export function ButtonLink({ href, variant = "primary", className, children }: ButtonLinkProps) {
  return (
    <Link href={href} className={buttonClass(variant, className)}>
      {children}
    </Link>
  );
}
