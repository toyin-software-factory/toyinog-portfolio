import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TextLink } from "./TextLink";

describe("TextLink", () => {
  it("renders an internal link in the same tab", () => {
    render(<TextLink href="/work">See the work</TextLink>);
    const link = screen.getByRole("link", { name: "See the work" });
    expect(link).toHaveAttribute("href", "/work");
    expect(link).not.toHaveAttribute("target");
  });

  it("opens an external link in a new tab, safely, and says so", () => {
    render(
      <TextLink href="https://github.com" external>
        GitHub
      </TextLink>,
    );
    const link = screen.getByRole("link", { name: "GitHub (opens in new tab)" });
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });
});
