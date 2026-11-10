import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getAbout, getFeaturedProjects, getProfile } from "@/lib/content";

import HomePage from "./page";

describe("HomePage (spec 0004)", () => {
  it("renders one h1 and an h2 per section, and leaves main to the layout (AC-11)", () => {
    render(<HomePage />);

    expect(screen.queryByRole("main")).not.toBeInTheDocument();
    const h1s = screen.getAllByRole("heading", { level: 1 });
    expect(h1s).toHaveLength(1);
    expect(h1s[0]).toHaveTextContent(getProfile().name);
    expect(screen.getAllByRole("heading", { level: 2 }).map((h) => h.textContent)).toEqual([
      "Selected work",
      "About",
      "Have a role or a project in mind?",
    ]);
  });

  it("shows the hero from the profile (AC-5)", () => {
    render(<HomePage />);
    const hero = screen.getByRole("region", { name: getProfile().name });

    expect(hero).toHaveTextContent(getProfile().headline);
    expect(hero).toHaveTextContent(getProfile().intro);
    expect(within(hero).getByRole("link", { name: "See my work" })).toHaveAttribute(
      "href",
      "/work",
    );
    expect(within(hero).getByRole("link", { name: "Get in touch" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("links every featured project (AC-6)", () => {
    render(<HomePage />);
    const section = screen.getByRole("region", { name: "Selected work" });
    const featured = getFeaturedProjects();

    expect(featured.length).toBeGreaterThan(0);
    expect(within(section).getAllByRole("article")).toHaveLength(featured.length);
    for (const project of featured) {
      expect(within(section).getByRole("link", { name: project.title })).toHaveAttribute(
        "href",
        `/work/${project.slug}`,
      );
    }
  });

  it("shows the latest role in the About teaser (AC-7)", () => {
    render(<HomePage />);
    const section = screen.getByRole("region", { name: "About" });
    const latest = getAbout().experience[0];

    expect(latest).toBeDefined();
    expect(section).toHaveTextContent(`${latest?.role ?? ""} at ${latest?.company ?? ""}`);
    expect(within(section).getByRole("link", { name: "More about me" })).toHaveAttribute(
      "href",
      "/about",
    );
  });
});
