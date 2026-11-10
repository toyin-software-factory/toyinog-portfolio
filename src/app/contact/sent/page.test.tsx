import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import ContactSentPage, { dynamic, metadata } from "./page";

describe("/contact/sent (spec 0007, AC-10)", () => {
  it("thanks the visitor and links Home and Work", () => {
    render(<ContactSentPage />);
    expect(
      screen.getByRole("heading", { level: 1, name: "Thanks, your message is on its way" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "/work");
  });

  it("is static (the cookie gate is in src/middleware.ts) and noindex", () => {
    expect(dynamic).toBe("force-static");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
