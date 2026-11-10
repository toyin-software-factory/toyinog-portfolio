import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Card } from "./Card";

describe("Card", () => {
  it("is an article with one link, named by the title", () => {
    render(
      <Card
        href="/work/ledger"
        title="Ledger"
        meta="Fintech · 2025"
        summary="A faster way to reconcile payments."
        image={{ src: "/placeholder.png", alt: "Ledger dashboard" }}
      />,
    );
    const article = screen.getByRole("article");
    expect(screen.getAllByRole("link")).toHaveLength(1);
    expect(screen.getByRole("link", { name: "Ledger" })).toHaveAttribute("href", "/work/ledger");
    expect(screen.getByRole("heading", { level: 3, name: "Ledger" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ledger dashboard" })).toBeInTheDocument();
    expect(article).toHaveTextContent("Fintech · 2025");
  });

  it("can use a level 2 title and no image", () => {
    render(<Card href="/work/a" title="A" headingLevel={2} />);
    expect(screen.getByRole("heading", { level: 2, name: "A" })).toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });
});
