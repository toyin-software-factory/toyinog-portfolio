import type { ReactNode } from "react";

/** Text for screen readers only. */
export function VisuallyHidden({ children }: { readonly children: ReactNode }) {
  return <span className="sr-only">{children}</span>;
}
