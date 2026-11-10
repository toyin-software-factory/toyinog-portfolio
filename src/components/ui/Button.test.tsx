import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Button } from "./Button";

describe("Button", () => {
  it("is a native button, type button by default, at least 44px tall", () => {
    render(<Button>Send</Button>);
    const button = screen.getByRole("button", { name: "Send" });
    expect(button).toHaveAttribute("type", "button");
    expect(button).toHaveClass("min-h-11", "bg-accent");
  });

  it("supports the secondary variant and submit type", () => {
    render(
      <Button variant="secondary" type="submit">
        Submit
      </Button>,
    );
    const button = screen.getByRole("button", { name: "Submit" });
    expect(button).toHaveAttribute("type", "submit");
    expect(button).toHaveClass("border-border-control");
  });

  it("exposes the disabled state", () => {
    render(<Button disabled>Send</Button>);
    expect(screen.getByRole("button", { name: "Send" })).toBeDisabled();
  });

  it("keeps the caller's className when disabled", () => {
    render(
      <Button disabled className="w-full">
        Send
      </Button>,
    );
    expect(screen.getByRole("button", { name: "Send" })).toHaveClass("w-full", "bg-surface");
  });

  it("marks itself busy while loading and stays focusable", () => {
    render(<Button loading>Sending</Button>);
    const button = screen.getByRole("button", { name: "Sending" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toHaveAttribute("aria-disabled", "true");
    expect(button).toBeEnabled();
  });
});
