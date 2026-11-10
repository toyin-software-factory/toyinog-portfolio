import type { InputHTMLAttributes } from "react";

import { controlClass } from "./controlStyles";
import { cx } from "./cx";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

/** A native text input with the control styles. Use inside Field for its label. */
export function Input({ className, type = "text", ...rest }: InputProps) {
  return <input {...rest} type={type} className={cx(controlClass, className)} />;
}
