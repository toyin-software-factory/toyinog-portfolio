import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { getProjects } from "@/lib/content";

import { CaseStudyHeader } from "./[slug]/_components/CaseStudyHeader";
import { NextProject, nextProjectOf } from "./[slug]/_components/NextProject";
import CaseStudyPage, {
  dynamicParams,
  generateMetadata,
  generateStaticParams,
} from "./[slug]/page";
import WorkPage, { metadata } from "./page";

/** Project text comes from content files, so escape it before building a RegExp. */
const escapeRegExp = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const renderCaseStudy = async (slug: string) =>
  render(await CaseStudyPage({ params: Promise.resolve({ slug }) }));

describe("WorkPage (spec 0005)", () => {
  it("has the h1, the intro and every published project in order (AC-1)", () => {
    render(<WorkPage />);
    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual([
      "Work",
    ]);
    expect(screen.getByText("Selected projects, newest thinking first.")).toBeInTheDocument();
    const titles = screen
      .getAllByRole("article")
      .map((card) => within(card).getByRole("heading", { level: 2 }).textContent);
    expect(titles).toEqual(getProjects().map((project) => project.title));
  });

  it("shows role · year, cover alt, at most 3 tags and links each card (AC-2)", () => {
    render(<WorkPage />);
    const [first] = getProjects();
    if (!first) throw new Error("no projects");
    const card = screen.getAllByRole("article")[0];
    if (!card) throw new Error("no card");
    expect(card).toHaveTextContent(`${first.role} · ${String(first.year)}`);
    expect(within(card).getByRole("img", { name: first.cover.alt })).toBeInTheDocument();
    expect(within(card).getByRole("link", { name: first.title })).toHaveAttribute(
      "href",
      `/work/${first.slug}`,
    );
    const tags = within(screen.getByRole("list", { name: `${first.title} tags` })).getAllByRole(
      "listitem",
    );
    expect(tags.length).toBeLessThanOrEqual(3);
  });

  it("sets its own title and description (AC-8)", () => {
    expect(metadata.title).toBe("Work");
    expect(metadata.description).toBeTruthy();
  });
});

describe("case study route (spec 0005)", () => {
  it("prebuilds every published slug and nothing else (AC-3)", () => {
    expect(dynamicParams).toBe(false);
    expect(generateStaticParams()).toEqual(getProjects().map(({ slug }) => ({ slug })));
  });

  it("renders the header, cover, body outline and next project (AC-4 to AC-7)", async () => {
    const [first, second] = getProjects();
    if (!first || !second) throw new Error("need two projects");
    await renderCaseStudy(first.slug);

    expect(screen.getAllByRole("heading", { level: 1 }).map((h) => h.textContent)).toEqual([
      first.title,
    ]);
    const cover = screen.getByRole("img", { name: first.cover.alt });
    expect(cover).toHaveAttribute("width");
    expect(cover).toHaveAttribute("height");
    expect(cover).not.toHaveAttribute("loading", "lazy");
    // The body's ## headings, whatever they're called, render as the page's h2s.
    const expected = [...first.html.matchAll(/<h2\b[^>]*>([\s\S]*?)<\/h2>/g)].length;
    expect(screen.queryAllByRole("heading", { level: 2 })).toHaveLength(expected);
    expect(
      screen.getByRole("link", { name: new RegExp(escapeRegExp(second.title)) }),
    ).toHaveAttribute("href", `/work/${second.slug}`);
    expect(screen.getByRole("link", { name: "Back to all work" })).toHaveAttribute("href", "/work");
  });

  it("sets title, description and the cover as the share image (AC-8)", async () => {
    const [first] = getProjects();
    if (!first) throw new Error("no projects");
    const meta = await generateMetadata({ params: Promise.resolve({ slug: first.slug }) });
    expect(meta.title).toBe(first.title);
    expect(meta.description).toBe(first.summary);
    expect(meta.openGraph?.images).toEqual([{ url: first.cover.src, alt: first.cover.alt }]);
  });

  it("calls notFound for an unknown slug (AC-3)", async () => {
    await expect(renderCaseStudy("does-not-exist")).rejects.toThrow();
  });
});

describe("CaseStudyHeader (AC-4)", () => {
  const project = {
    title: "Ledger",
    summary: "Faster reconciling.",
    role: "Lead engineer",
    client: "Acme",
    year: 2025,
    tags: ["React", "Testing"],
    links: [{ label: "Live site", url: "https://example.com" }],
  };

  it("lists role, client, year and tags, with external project links", () => {
    render(<CaseStudyHeader project={project} />);
    const terms = screen.getAllByRole("term").map((term) => term.textContent);
    expect(terms).toEqual(["Role", "Client", "Year", "Tags"]);
    const link = screen.getByRole("link", { name: /Live site/ });
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(link).toHaveAttribute("target", "_blank");
  });

  it("leaves out Client and the links list when not set", () => {
    render(<CaseStudyHeader project={{ ...project, client: undefined, links: [] }} />);
    expect(screen.getAllByRole("term").map((term) => term.textContent)).toEqual([
      "Role",
      "Year",
      "Tags",
    ]);
    expect(screen.queryByRole("list", { name: "Project links" })).not.toBeInTheDocument();
  });
});

describe("nextProjectOf (AC-7)", () => {
  const list = [{ slug: "a" }, { slug: "b" }, { slug: "c" }];

  it("returns the following project and wraps to the first", () => {
    expect(nextProjectOf(list, "a")).toEqual({ slug: "b" });
    expect(nextProjectOf(list, "c")).toEqual({ slug: "a" });
  });

  it("returns null for a single project or an unknown slug", () => {
    expect(nextProjectOf([{ slug: "a" }], "a")).toBeNull();
    expect(nextProjectOf(list, "zzz")).toBeNull();
  });

  it("hides the Next project link when there is none", () => {
    render(<NextProject next={null} />);
    expect(screen.queryByText("Next project")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to all work" })).toBeInTheDocument();
  });
});
