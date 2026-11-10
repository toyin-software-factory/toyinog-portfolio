import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AlertIcon, ArrowUpRightIcon, SpinnerIcon } from "./icons";

describe("icons (spec 0003)", () => {
  it.each([
    ["ArrowUpRightIcon", ArrowUpRightIcon],
    ["AlertIcon", AlertIcon],
    ["SpinnerIcon", SpinnerIcon],
  ])("%s is decorative, sized to the text and drawn in the text colour", (_name, Icon) => {
    const { container } = render(<Icon className="size-5" />);
    const svg = container.querySelector("svg");
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("focusable", "false");
    expect(svg).toHaveAttribute("width", "1em");
    expect(svg).toHaveAttribute("stroke", "currentColor");
    expect(svg).toHaveClass("size-5");
  });
});
