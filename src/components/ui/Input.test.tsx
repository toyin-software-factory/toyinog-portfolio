import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Input } from "./Input";

describe("Input", () => {
  it("is a text input by default with the control styles", () => {
    render(<Input aria-label="Name" />);
    const input = screen.getByRole("textbox", { name: "Name" });
    expect(input).toHaveAttribute("type", "text");
    expect(input).toHaveClass("min-h-11", "border-border-control", "rounded-control");
  });

  it("passes native attributes through", () => {
    render(<Input aria-label="Email" type="email" required disabled />);
    const input = screen.getByRole("textbox", { name: "Email" });
    expect(input).toBeRequired();
    expect(input).toBeDisabled();
  });
});
