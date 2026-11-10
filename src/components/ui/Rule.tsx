import { cx } from "./cx";

/** A thin Graphite divider. */
export function Rule({ className }: { readonly className?: string }) {
  return <hr className={cx("border-0 border-t border-rule", className)} />;
}
