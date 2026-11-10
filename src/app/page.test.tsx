import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  // The root layout owns <main id="main">, so the page itself renders no main landmark.
  it("renders one level 1 heading and leaves the main landmark to the layout", () => {
    render(<HomePage />);

    const heading = screen.getByRole("heading", { level: 1 });

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    expect(heading).toHaveTextContent("Toyin Ogunseinde");
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
  });
});
