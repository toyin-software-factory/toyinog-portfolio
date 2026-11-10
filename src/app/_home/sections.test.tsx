import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { AboutTeaser } from "./AboutTeaser";
import { ContactCta } from "./ContactCta";
import { Hero } from "./Hero";
import { SelectedWork } from "./SelectedWork";

const profile = {
  name: "Ada Lovelace",
  headline: "Engineer",
  intro: "I write programs.",
  availability: "both",
} as const;

const project = (slug: string, tags: string[]) => ({
  slug,
  title: `Project ${slug}`,
  role: "Lead engineer",
  year: 2025,
  summary: "A summary.",
  tags,
  cover: { src: "/images/work/a.svg", alt: `Cover of ${slug}` },
});

describe("Hero", () => {
  it.each([
    ["roles", "Open to new roles"],
    ["projects", "Available for projects"],
    ["both", "Open to roles and projects"],
  ] as const)("shows the %s badge as %s (AC-5)", (availability, text) => {
    render(<Hero profile={{ ...profile, availability }} />);
    expect(screen.getByText(text)).toBeInTheDocument();
  });

  it("hides the badge when availability is none (AC-5)", () => {
    const { container } = render(<Hero profile={{ ...profile, availability: "none" }} />);
    expect(container).not.toHaveTextContent(/open to|available for/i);
    expect(screen.getByRole("heading", { level: 1, name: "Ada Lovelace" })).toBeInTheDocument();
  });
});

describe("SelectedWork", () => {
  it("renders nothing when no projects are featured (AC-6)", () => {
    const { container } = render(<SelectedWork projects={[]} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("shows role · year, the cover alt, at most 3 tags, and an All work link (AC-6)", () => {
    render(<SelectedWork projects={[project("a", ["One", "Two", "Three", "Four"])]} />);
    const card = screen.getByRole("article");

    expect(card).toHaveTextContent("Lead engineer · 2025");
    expect(within(card).getByRole("img", { name: "Cover of a" })).toBeInTheDocument();
    expect(
      within(screen.getByRole("list", { name: "Project a tags" })).getAllByRole("listitem"),
    ).toHaveLength(3);
    expect(screen.queryByText("Four")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "All work" })).toHaveAttribute("href", "/work");
  });
});

describe("AboutTeaser", () => {
  it("shows the teaser, the latest role and the More about me link (AC-7)", () => {
    render(<AboutTeaser teaser="Hello there." latest={{ role: "Lead", company: "Acme" }} />);
    expect(screen.getByText("Hello there.")).toBeInTheDocument();
    expect(screen.getByText("Lead at Acme")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "More about me" })).toHaveAttribute("href", "/about");
  });

  it("leaves out the role line when there is no experience", () => {
    render(<AboutTeaser teaser="Hello there." latest={undefined} />);
    expect(screen.queryByText(/ at /)).not.toBeInTheDocument();
  });
});

describe("ContactCta", () => {
  it("shows the heading and a Get in touch button to /contact (AC-8)", () => {
    render(<ContactCta />);
    expect(
      screen.getByRole("heading", { level: 2, name: "Have a role or a project in mind?" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Get in touch" })).toHaveAttribute("href", "/contact");
  });
});
