import type { ReactNode } from "react";

import { cx } from "./cx";

const widths = { page: "max-w-page", prose: "max-w-prose" } as const;

type ContainerProps = {
  readonly size?: keyof typeof widths;
  readonly className?: string;
  readonly children: ReactNode;
};

/** Centres content with the page gutter: 72rem for pages, 42rem for reading. */
export function Container({ size = "page", className, children }: ContainerProps) {
  return (
    <div className={cx("mx-auto w-full px-6 md:px-10", widths[size], className)}>{children}</div>
  );
}
