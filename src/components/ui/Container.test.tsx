import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Container } from "./Container";

describe("Container", () => {
  it("uses the page width by default", () => {
    render(<Container>content</Container>);
    expect(screen.getByText("content")).toHaveClass("max-w-page", "mx-auto");
  });

  it("uses the prose width when asked", () => {
    render(<Container size="prose">content</Container>);
    expect(screen.getByText("content")).toHaveClass("max-w-prose");
  });
});
