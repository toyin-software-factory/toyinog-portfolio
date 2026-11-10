import type { ReactNode } from "react";

import { AlertIcon } from "./icons";

/** An error message for a field: danger colour plus an icon, so colour is never the only cue. */
export function FieldError({
  id,
  children,
}: {
  readonly id: string;
  readonly children: ReactNode;
}) {
  return (
    <p id={id} className="flex items-start gap-2 text-small text-danger">
      <AlertIcon className="mt-[0.2em] size-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}
