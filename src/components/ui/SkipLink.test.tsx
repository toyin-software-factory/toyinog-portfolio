import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { SkipLink } from "./SkipLink";

describe("SkipLink", () => {
  it("links to the main content", () => {
    render(<SkipLink />);
    const link = screen.getByRole("link", { name: "Skip to content" });
    expect(link).toHaveAttribute("href", "#main");
    expect(link).toHaveClass("sr-only", "focus:not-sr-only");
  });
});
