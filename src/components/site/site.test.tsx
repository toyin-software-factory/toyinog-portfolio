import { render, screen, within } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Footer } from "./Footer";
import { Header } from "./Header";
import { isCurrentSection, NavLinks } from "./NavLinks";

const pathname = vi.hoisted(() => ({ value: "/" }));
vi.mock("next/navigation", () => ({ usePathname: () => pathname.value }));

describe("isCurrentSection", () => {
  it("matches the section and pages inside it, not lookalikes", () => {
    expect(isCurrentSection("/work", "/work")).toBe(true);
    expect(isCurrentSection("/work/design-system", "/work")).toBe(true);
    expect(isCurrentSection("/workshop", "/work")).toBe(false);
    expect(isCurrentSection("/", "/work")).toBe(false);
  });
});

describe("NavLinks", () => {
  beforeEach(() => {
    pathname.value = "/";
  });

  it("marks no link current on Home", () => {
    render(<NavLinks />);
    for (const link of screen.getAllByRole("link")) {
      expect(link).not.toHaveAttribute("aria-current");
    }
  });

  it.each(["/work", "/work/design-system"])("marks Work current on %s (AC-2)", (path) => {
    pathname.value = path;
    render(<NavLinks />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "About" })).not.toHaveAttribute("aria-current");
  });
});

describe("Header", () => {
  it("is a focusable banner with the name home link and the Main nav (AC-1)", () => {
    render(<Header name="Ada Lovelace" />);
    const banner = screen.getByRole("banner");

    expect(banner).toHaveAttribute("id", "top");
    expect(banner).toHaveAttribute("tabindex", "-1");
    expect(within(banner).getByRole("link", { name: "Ada Lovelace" })).toHaveAttribute("href", "/");
    const nav = within(banner).getByRole("navigation", { name: "Main" });
    expect(
      within(nav)
        .getAllByRole("link")
        .map((link) => link.textContent),
    ).toEqual(["Work", "About", "Contact"]);
  });
});

describe("Footer", () => {
  it("shows profile links, the copyright line and Back to top (AC-4)", () => {
    render(
      <Footer
        profile={{
          name: "Ada Lovelace",
          links: { linkedin: "https://linkedin.example/ada", github: "https://github.example/ada" },
          email: "ada@example.com",
        }}
        year={2026}
      />,
    );
    const footer = screen.getByRole("contentinfo");

    const linkedin = within(footer).getByRole("link", { name: /LinkedIn/ });
    expect(linkedin).toHaveAttribute("href", "https://linkedin.example/ada");
    expect(linkedin).toHaveAttribute("rel", "noopener noreferrer");
    expect(within(footer).getByRole("link", { name: /GitHub/ })).toHaveAttribute(
      "href",
      "https://github.example/ada",
    );
    expect(within(footer).getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      "mailto:ada@example.com",
    );
    expect(footer).toHaveTextContent("© 2026 Ada Lovelace");
    expect(within(footer).getByRole("link", { name: "Back to top" })).toHaveAttribute(
      "href",
      "#top",
    );
  });
});
