import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { FieldError } from "./FieldError";

describe("FieldError", () => {
  it("shows the message with a decorative icon, not colour alone", () => {
    render(<FieldError id="email-error">Enter a valid email.</FieldError>);
    const message = screen.getByText("Enter a valid email.").parentElement;
    expect(message).toHaveAttribute("id", "email-error");
    expect(message).toHaveClass("text-danger");
    expect(message?.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
