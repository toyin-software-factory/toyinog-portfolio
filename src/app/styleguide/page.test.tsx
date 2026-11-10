import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getAppEnv } from "@/lib/env";

import StyleguidePage, { metadata } from "./page";

vi.mock("@/lib/env", () => ({ getAppEnv: vi.fn() }));

describe("/styleguide", () => {
  afterEach(() => {
    vi.mocked(getAppEnv).mockReset();
  });

  it("is a 404 in production (spec 0003, AC-6)", () => {
    vi.mocked(getAppEnv).mockReturnValue("production");
    expect(() => render(<StyleguidePage />)).toThrow(/NEXT_HTTP_ERROR_FALLBACK;404/);
  });

  it("renders in preview with one h1 and a section per area", () => {
    vi.mocked(getAppEnv).mockReturnValue("preview");
    render(<StyleguidePage />);
    expect(screen.getByRole("heading", { level: 1, name: "Styleguide" })).toBeInTheDocument();
    for (const name of [
      "Colour",
      "Type",
      "Space and layout",
      "Links and buttons",
      "Badges, tags and cards",
      "Form fields",
      "Prose",
    ]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });

  it("asks search engines not to index it", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
