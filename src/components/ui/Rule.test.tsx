import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Rule } from "./Rule";

describe("Rule", () => {
  it("is a separator", () => {
    render(<Rule />);
    expect(screen.getByRole("separator")).toHaveClass("border-rule");
  });
});
