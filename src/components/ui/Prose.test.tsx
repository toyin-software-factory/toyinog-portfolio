import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Prose } from "./Prose";

describe("Prose", () => {
  it("renders build time HTML with its structure intact", () => {
    render(
      <Prose html='<h2>Approach</h2><p>Text with <a href="/about">a link</a>.</p><ul><li>One</li></ul><blockquote><p>Quote</p></blockquote>' />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Approach" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "a link" })).toHaveAttribute("href", "/about");
    expect(screen.getByRole("list")).toBeInTheDocument();
    expect(screen.getByRole("blockquote")).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2 }).parentElement).toHaveClass("prose");
  });
});
