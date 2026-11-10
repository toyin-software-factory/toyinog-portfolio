import type { ButtonHTMLAttributes, ReactNode } from "react";

import { buttonClass, type ButtonVariant, disabledButtonClass } from "./buttonStyles";
import { SpinnerIcon } from "./icons";

type ButtonProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
  readonly variant?: ButtonVariant;
  readonly type?: "button" | "submit" | "reset";
  /**
   * Shows a spinner and sets `aria-busy`. The button stays focusable and is marked
   * `aria-disabled`; the form handling it should ignore repeat submits while busy.
   */
  readonly loading?: boolean;
  readonly className?: string;
  readonly children: ReactNode;
};

/** A native button. Primary is a lemon fill, secondary an outline. */
export function Button({
  variant = "primary",
  type = "button",
  loading = false,
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      type={type}
      disabled={disabled}
      aria-busy={loading || undefined}
      aria-disabled={loading || undefined}
      className={disabled ? disabledButtonClass : buttonClass(variant, className)}
    >
      {loading ? <SpinnerIcon className="size-4 motion-safe:animate-spin" /> : null}
      {children}
    </button>
  );
}
