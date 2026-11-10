import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Heading } from "./Heading";
import { Section } from "./Section";

describe("Section", () => {
  it("is a region named by its heading", () => {
    render(
      <Section aria-labelledby="work-title" label="Selected work" rule>
        <Heading level={2} id="work-title">
          Work
        </Heading>
      </Section>,
    );
    const region = screen.getByRole("region", { name: "Work" });
    expect(region).toHaveClass("border-t");
    expect(screen.getByText("Selected work")).toBeInTheDocument();
  });

  it("has no top rule unless asked", () => {
    render(<Section aria-labelledby="x">body</Section>);
    expect(screen.getByText("body")).not.toHaveClass("border-t");
  });
});
