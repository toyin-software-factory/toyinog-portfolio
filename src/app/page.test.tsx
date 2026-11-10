import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders one level 1 heading inside the main landmark", () => {
    render(<HomePage />);

    const main = screen.getByRole("main");
    const heading = screen.getByRole("heading", { level: 1 });

    expect(main).toContainElement(heading);
    expect(heading).toHaveTextContent("Toyin Ogunseinde");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
