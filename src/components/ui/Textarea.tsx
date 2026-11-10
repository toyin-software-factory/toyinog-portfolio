import type { TextareaHTMLAttributes } from "react";

import { controlClass } from "./controlStyles";
import { cx } from "./cx";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement>;

/** A native textarea with the control styles. Use inside Field for its label. */
export function Textarea({ className, rows = 6, ...rest }: TextareaProps) {
  return <textarea {...rest} rows={rows} className={cx(controlClass, "resize-y", className)} />;
}
