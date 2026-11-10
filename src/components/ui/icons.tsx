import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

const base = {
  width: "1em",
  height: "1em",
  viewBox: "0 0 16 16",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

/** Arrow pointing up and right, used for external links. Decorative. */
export function ArrowUpRightIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M5 11 11 5M6 5h5v5" />
    </svg>
  );
}

/** Exclamation in a circle, used beside error text. Decorative. */
export function AlertIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <circle cx="8" cy="8" r="6.25" />
      <path d="M8 4.75v3.75M8 11h.01" />
    </svg>
  );
}

/** Spinning ring, used while a button is busy. Decorative. */
export function SpinnerIcon(props: IconProps) {
  return (
    <svg {...base} {...props}>
      <path d="M8 1.75A6.25 6.25 0 1 1 1.75 8" />
    </svg>
  );
}
