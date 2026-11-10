import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import { ContentError } from "./errors";
import { type ContentSnapshot, type LoadOptions, loadContent } from "./load";

const FIXTURES = path.join(import.meta.dirname, "__fixtures__");
const VALID = path.join(FIXTURES, "valid");
const broken = (name: string) => readFileSync(path.join(FIXTURES, "broken", name), "utf8");

const roots: string[] = [];

/** Copies the valid fixture to a temp folder, then writes or deletes the given files. */
function fixtureRoot(changes: Record<string, string | null> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), "content-"));
  roots.push(root);
  cpSync(VALID, root, { recursive: true });
  for (const [file, content] of Object.entries(changes)) {
    const target = path.join(root, file);
    if (content === null) rmSync(target);
    else writeFileSync(target, content);
  }
  return root;
}

function load(rootDir: string, overrides: Partial<LoadOptions> = {}): ContentSnapshot {
  return loadContent({ rootDir, appEnv: "preview", currentYear: 2026, ...overrides });
}

function problemsFor(rootDir: string, overrides: Partial<LoadOptions> = {}) {
  try {
    load(rootDir, overrides);
  } catch (error) {
    if (error instanceof ContentError) return error;
    throw error;
  }
  throw new Error("expected a ContentError");
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

describe("loadContent: valid content", () => {
  it("parses projects with the slug from the filename and rendered HTML (AC-1)", () => {
    const { projects } = load(VALID);
    const alpha = projects.find((project) => project.slug === "alpha");

    expect(alpha).toMatchObject({
      slug: "alpha",
      title: "Alpha",
      client: "Fixture Co",
      year: 2021,
      tags: ["Testing"],
      cover: { src: "/images/work/alpha.svg", alt: "Cover for Alpha" },
      links: [{ label: "Live site", url: "https://example.com/alpha" }],
      featured: true,
      draft: false,
      order: 2,
    });
    expect(alpha?.html).toContain('<h2 id="problem">Problem</h2>');
    expect(alpha?.body).toContain("## What I did");
  });

  it("applies defaults for optional fields", () => {
    const charlie = load(VALID).projects.find((project) => project.slug === "charlie");
    expect(charlie?.links).toEqual([]);
    expect(charlie?.client).toBeUndefined();
  });

  it("parses the profile and about, with experience newest first and the bio rendered (AC-2)", () => {
    const { profile, about } = load(VALID);

    expect(profile).toEqual({
      name: "Fixture Person",
      headline: "Fixture headline",
      intro: "Fixture intro.",
      availability: "roles",
      links: { linkedin: "https://example.com/linkedin", github: "https://example.com/github" },
      email: "fixture@example.com",
    });
    expect(about.experience.map((entry) => entry.role)).toEqual([
      "Current role",
      "Middle role",
      "Older role",
    ]);
    expect(about.cv).toEqual({ file: "/cv/cv.pdf", updated: "2026-01" });
    expect(about.bioHtml).toBe('<h2 id="hello">Hello</h2>\n<p>Fixture bio.</p>');
  });

  it("sorts by order, then newest year, then title (AC-5)", () => {
    expect(load(VALID).projects.map((project) => project.slug)).toEqual([
      "delta",
      "bravo",
      "charlie",
      "alpha",
    ]);
  });
});

describe("loadContent: drafts (AC-4)", () => {
  it("keeps drafts, flagged, outside production", () => {
    const delta = load(VALID).projects.find((project) => project.slug === "delta");
    expect(delta?.draft).toBe(true);
  });

  it("drops drafts in production", () => {
    const slugs = load(VALID, { appEnv: "production" }).projects.map((project) => project.slug);
    expect(slugs).toEqual(["bravo", "charlie", "alpha"]);
  });
});

describe("loadContent: collection rules (AC-6)", () => {
  it("fails when more than 3 published projects are featured", () => {
    const featured = (slug: string) =>
      readFileSync(path.join(VALID, "content/work", `${slug}.md`), "utf8").replace(
        "featured: false",
        "featured: true",
      );
    const extra = featured("charlie").replace('title: "Charlie"', 'title: "Echo"');
    const root = fixtureRoot({
      "content/work/charlie.md": featured("charlie"),
      "content/work/echo.md": extra,
    });

    const error = problemsFor(root);
    expect(error.problems).toEqual([
      {
        file: "content/work",
        field: "featured",
        message: expect.stringContaining(
          "4 published projects are featured (alpha, bravo, charlie, echo), but at most 3 can be",
        ) as string,
      },
    ]);
  });

  it("does not count featured drafts toward the limit", () => {
    // alpha, bravo and charlie featured plus the featured draft delta: still valid.
    const charlie = readFileSync(path.join(VALID, "content/work/charlie.md"), "utf8");
    const root = fixtureRoot({
      "content/work/charlie.md": charlie.replace("featured: false", "featured: true"),
    });
    expect(() => load(root)).not.toThrow();
  });

  it("fails on duplicate slugs", () => {
    const alpha = readFileSync(path.join(VALID, "content/work/alpha.md"), "utf8");
    const root = fixtureRoot({ "content/work/alpha.MD": alpha });

    const error = problemsFor(root);
    expect(error.message).toContain('has the same slug "alpha" as content/work/alpha.MD');
  });

  it("fails on a filename that can't be a slug", () => {
    const alpha = readFileSync(path.join(VALID, "content/work/alpha.md"), "utf8");
    const root = fixtureRoot({
      "content/work/alpha.md": null,
      "content/work/My Project.md": alpha,
    });

    expect(problemsFor(root).problems).toContainEqual({
      file: "content/work/My Project.md",
      field: "",
      message: expect.stringContaining("filename that can't be used in a web address") as string,
    });
  });
});

describe("loadContent: invalid content (AC-3, AC-9)", () => {
  it("reports every problem in every file in one error", () => {
    const root = fixtureRoot({
      "content/work/missing-title.md": broken("missing-title-unknown-key.md"),
      "content/work/bad-values.md": broken("bad-values.md"),
      "content/work/bad-yaml.md": broken("bad-yaml.md"),
      "content/pages/about.md": broken("about-bad.md"),
      "content/pages/profile.md": broken("profile-bad.md"),
    });

    const error = problemsFor(root);
    const found = error.problems.map(({ file, field }) => `${file} ${field}`);

    expect(found).toEqual(
      expect.arrayContaining([
        // missing required field, unknown key
        "content/work/missing-title.md title",
        "content/work/missing-title.md feautred",
        // wrong type, empty list, empty alt, missing image, http URL, negative order
        "content/work/bad-values.md year",
        "content/work/bad-values.md tags",
        "content/work/bad-values.md cover.src",
        "content/work/bad-values.md cover.alt",
        "content/work/bad-values.md links[0].url",
        "content/work/bad-values.md order",
        // broken YAML
        "content/work/bad-yaml.md ",
        // bad dates, end before start, too few highlights, empty alt, missing CV file
        "content/pages/about.md photo.alt",
        "content/pages/about.md experience[0].start",
        "content/pages/about.md experience[0].highlights",
        "content/pages/about.md experience[1].end",
        "content/pages/about.md skillGroups",
        "content/pages/about.md cv.file",
        // bad enum, missing field, bad email
        "content/pages/profile.md availability",
        "content/pages/profile.md links.github",
        "content/pages/profile.md email",
      ]),
    );
    // A bad start month is reported once, without a confusing "end is before start" too.
    expect(found).not.toContain("content/pages/about.md experience[0].end");
  });

  it("writes the reasons in plain words, grouped under each file path", () => {
    const root = fixtureRoot({
      "content/work/missing-title.md": broken("missing-title-unknown-key.md"),
      "content/work/bad-values.md": broken("bad-values.md"),
    });

    const { message } = problemsFor(root);

    expect(message).toContain("has 8 problems");
    expect(message).toContain(
      'content/work/bad-values.md\n  - year: should be a number, but it is the text "soon"',
    );
    expect(message).toContain(
      "cover.alt: is empty. Describe the image in a few words for people using screen readers",
    );
    expect(message).toContain(
      "cover.src: points to a file that does not exist. Add the file under public/ or fix the path",
    );
    expect(message).toContain("links[0].url: should be a web address starting with https://");
    expect(message).toContain("tags: should have at least 1 item");
    expect(message).toContain("order: should be 0 or more");
    expect(message).toContain("title: is missing. Add it");
    expect(message).toContain("feautred: is not a known field. Check the spelling, or remove it");
  });

  it("explains broken YAML", () => {
    const root = fixtureRoot({ "content/work/bad-yaml.md": broken("bad-yaml.md") });
    expect(problemsFor(root).message).toContain("has front matter that isn't valid YAML");
  });

  it("rejects a year after next year and before 2000", () => {
    const alpha = readFileSync(path.join(VALID, "content/work/alpha.md"), "utf8");
    const root = fixtureRoot({
      "content/work/alpha.md": alpha.replace("year: 2021", "year: 2028"),
      "content/work/bravo.md": readFileSync(
        path.join(VALID, "content/work/bravo.md"),
        "utf8",
      ).replace("year: 2024", "year: 1999"),
    });

    const fields = problemsFor(root).problems.map(({ file, field }) => `${file} ${field}`);
    expect(fields).toEqual(["content/work/alpha.md year", "content/work/bravo.md year"]);
    expect(() =>
      load(fixtureRoot({ "content/work/alpha.md": alpha.replace("year: 2021", "year: 2027") })),
    ).not.toThrow();
  });

  it("rejects image paths outside the allowed folder or with path tricks", () => {
    const alpha = readFileSync(path.join(VALID, "content/work/alpha.md"), "utf8");
    for (const src of [
      "/images/about/me.svg",
      "/images/work/../about/me.svg",
      "images/work/alpha.svg",
      "/cv/cv.pdf",
    ]) {
      const root = fixtureRoot({
        "content/work/alpha.md": alpha.replace("/images/work/alpha.svg", src),
      });
      expect(problemsFor(root).problems.map((problem) => problem.field)).toEqual(["cover.src"]);
    }
  });

  it("requires a body for projects and the About bio", () => {
    const alpha = readFileSync(path.join(VALID, "content/work/alpha.md"), "utf8");
    const about = readFileSync(path.join(VALID, "content/pages/about.md"), "utf8");
    const root = fixtureRoot({
      "content/work/alpha.md": alpha.slice(0, alpha.indexOf("## Problem")),
      "content/pages/about.md": about.slice(0, about.indexOf("## Hello")),
    });

    expect(problemsFor(root).problems).toEqual([
      expect.objectContaining({ file: "content/work/alpha.md", field: "body" }),
      expect.objectContaining({ file: "content/pages/about.md", field: "body" }),
    ]);
  });

  it("reports missing profile and about files", () => {
    const root = fixtureRoot({ "content/pages/profile.md": null, "content/pages/about.md": null });

    expect(problemsFor(root).problems).toEqual([
      { file: "content/pages/profile.md", field: "", message: "is missing. Create this file" },
      { file: "content/pages/about.md", field: "", message: "is missing. Create this file" },
    ]);
  });
});

describe("loadContent: warnings", () => {
  it("warns, without failing, when a case study misses a recommended section", () => {
    const alpha = readFileSync(path.join(VALID, "content/work/alpha.md"), "utf8");
    const root = fixtureRoot({
      "content/work/alpha.md": alpha.replace("## Outcome", "## Results"),
    });

    expect(load(root).warnings).toEqual([
      'content/work/alpha.md: the case study has no "## Outcome" section. Recommended, not required.',
    ]);
  });
});
