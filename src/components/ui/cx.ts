/** Joins class names, skipping empty ones. */
export const cx = (...classes: readonly (string | false | null | undefined)[]): string =>
  classes.filter(Boolean).join(" ");
