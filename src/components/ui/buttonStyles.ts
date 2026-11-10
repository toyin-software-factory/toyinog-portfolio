import { cx } from "./cx";

export type ButtonVariant = "primary" | "secondary";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-accent text-on-accent hover:bg-accent-strong active:bg-accent-strong",
  secondary:
    "border border-border-control text-text hover:border-accent hover:text-accent active:border-accent-strong active:text-accent-strong",
};

/** Shared by Button and ButtonLink so both look the same. 44px tall minimum. */
export const buttonClass = (variant: ButtonVariant, className?: string): string =>
  cx(
    "inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-control px-5 text-small font-medium transition-[color,background-color,border-color]",
    variants[variant],
    className,
  );

/** Muted look for a disabled button: Graphite fill, muted text, no hover change. */
export const disabledButtonClass =
  "inline-flex min-h-11 min-w-11 cursor-not-allowed items-center justify-center gap-2 rounded-control bg-surface px-5 text-small font-medium text-text-muted";
