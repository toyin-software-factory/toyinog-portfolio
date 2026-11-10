import { cx } from "./cx";

type ProseProps = {
  /**
   * HTML rendered at build time from the repo's own Markdown (spec 0002). Never pass
   * user input here: it is inserted as is.
   */
  readonly html: string;
  readonly className?: string;
};

/** Styles rendered Markdown with the design tokens, at a 42rem reading width. */
export function Prose({ html, className }: ProseProps) {
  return <div className={cx("prose", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
