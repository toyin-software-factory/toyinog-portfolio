import type { ReactNode } from "react";

import { cx } from "./cx";
import { FieldError } from "./FieldError";

/** The props Field hands to its control so the label, hint and error are wired up. */
export type FieldControlProps = {
  readonly id: string;
  readonly "aria-describedby"?: string;
  readonly "aria-invalid"?: true;
};

type FieldProps = {
  readonly label: string;
  readonly id: string;
  readonly hint?: string;
  readonly error?: string;
  /** Shows "(optional)" next to the label when the field isn't required. */
  readonly optional?: boolean;
  readonly className?: string;
  /** Render the control with the given props, for example `(props) => <Input {...props} />`. */
  readonly children: (control: FieldControlProps) => ReactNode;
};

/** A label, an optional hint and error, and the control they describe. */
export function Field({
  label,
  id,
  hint,
  error,
  optional = false,
  className,
  children,
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cx("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small font-medium text-text">
        {label}
        {optional ? (
          <>
            {" "}
            <span className="font-normal text-text-muted">(optional)</span>
          </>
        ) : null}
      </label>
      {hint ? (
        <p id={hintId} className="text-small text-text-muted">
          {hint}
        </p>
      ) : null}
      {children({
        id,
        "aria-describedby": describedBy,
        ...(error ? { "aria-invalid": true as const } : {}),
      })}
      {error && errorId ? <FieldError id={errorId}>{error}</FieldError> : null}
    </div>
  );
}
