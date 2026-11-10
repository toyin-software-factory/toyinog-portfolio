import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Textarea } from "./Textarea";

describe("Textarea", () => {
  it("is a multi line text box with the control styles", () => {
    render(<Textarea aria-label="Message" required />);
    const textarea = screen.getByRole("textbox", { name: "Message" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toBeRequired();
    expect(textarea).toHaveClass("border-border-control");
  });
});
