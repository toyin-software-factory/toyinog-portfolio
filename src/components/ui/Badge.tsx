import type { ReactNode } from "react";

/** A small lemon label, for example availability. Not interactive. */
export function Badge({ children }: { readonly children: ReactNode }) {
  return (
    <span className="inline-flex items-center bg-accent px-2 py-1 text-label text-on-accent uppercase">
      {children}
    </span>
  );
}
