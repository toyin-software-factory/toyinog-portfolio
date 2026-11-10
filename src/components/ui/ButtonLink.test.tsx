import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { ButtonLink } from "./ButtonLink";

describe("ButtonLink", () => {
  it("is a link styled as a button", () => {
    render(<ButtonLink href="/contact">Get in touch</ButtonLink>);
    const link = screen.getByRole("link", { name: "Get in touch" });
    expect(link).toHaveAttribute("href", "/contact");
    expect(link).toHaveClass("min-h-11", "bg-accent");
  });
});
