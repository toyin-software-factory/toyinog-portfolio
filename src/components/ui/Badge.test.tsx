import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Badge } from "./Badge";

describe("Badge", () => {
  it("renders its text with the lemon fill", () => {
    render(<Badge>Available for work</Badge>);
    expect(screen.getByText("Available for work")).toHaveClass("bg-accent", "text-on-accent");
  });
});
