import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { VisuallyHidden } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("keeps text available to screen readers but hides it visually", () => {
    render(
      <button type="button">
        <VisuallyHidden>Close menu</VisuallyHidden>
      </button>,
    );
    expect(screen.getByRole("button", { name: "Close menu" })).toBeInTheDocument();
    expect(screen.getByText("Close menu")).toHaveClass("sr-only");
  });
});
