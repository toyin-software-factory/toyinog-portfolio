import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./Heading";

describe("Heading", () => {
  it("renders the requested level", () => {
    render(<Heading level={3}>Approach</Heading>);
    expect(screen.getByRole("heading", { level: 3, name: "Approach" })).toHaveClass("text-h3");
  });

  it("keeps the level and the visual size separate", () => {
    render(
      <Heading level={1} size="display">
        Toyin Ogunseinde
      </Heading>,
    );
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveClass("text-display", "font-display");
    expect(heading).not.toHaveClass("text-h1");
  });
});
