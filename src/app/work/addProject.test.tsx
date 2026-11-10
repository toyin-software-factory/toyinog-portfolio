import { cpSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { render, screen } from "@testing-library/react";
import { afterAll, beforeEach, describe, expect, it, vi } from "vitest";

import type { AppEnv } from "@/lib/env";
import { type ContentSnapshot, loadContent } from "@/lib/content/load";

import sitemap from "../sitemap";
import { generateStaticParams } from "./[slug]/page";
import WorkPage from "./page";

/**
 * Spec 0005 AC-10 (and the draft rule, AC-3): a project is added by adding one
 * file to content/work/ with its cover. These tests build the content from the
 * loader's valid fixture plus a new file, then check the Work list, the static
 * params and the sitemap, with no code change.
 */

const FIXTURE = path.join(import.meta.dirname, "../../lib/content/__fixtures__/valid");
const root = mkdtempSync(path.join(tmpdir(), "work-add-"));
cpSync(FIXTURE, root, { recursive: true });
writeFileSync(
  path.join(root, "content/work/echo.md"),
  `---
title: "Echo, the new project"
summary: "Added by dropping one file in content/work."
role: Engineer
year: 2026
tags: [New]
cover:
  src: /images/work/alpha.svg
  alt: "Cover for Echo"
order: 9
---

## Problem

Fixture.

## What I did

Fixture.

## Outcome

Fixture.
`,
);

const state = vi.hoisted(() => ({ snapshot: undefined as ContentSnapshot | undefined }));

vi.mock("@/lib/content", () => {
  const projects = () => {
    if (!state.snapshot) throw new Error("load the fixture first");
    return [...state.snapshot.projects];
  };
  return {
    getProjects: projects,
    getProjectSlugs: () => projects().map((project) => project.slug),
    getProject: (slug: string) => projects().find((project) => project.slug === slug) ?? null,
  };
});

const useEnv = (appEnv: AppEnv) => {
  state.snapshot = loadContent({ rootDir: root, appEnv, currentYear: 2026 });
};

afterAll(() => {
  rmSync(root, { recursive: true, force: true });
});

describe("adding a project file (spec 0005, AC-10)", () => {
  beforeEach(() => {
    useEnv("production");
  });

  it("adds a card to /work", () => {
    render(<WorkPage />);
    expect(screen.getByRole("link", { name: "Echo, the new project" })).toHaveAttribute(
      "href",
      "/work/echo",
    );
  });

  it("adds a prebuilt page", () => {
    expect(generateStaticParams()).toContainEqual({ slug: "echo" });
  });

  it("adds it to the sitemap", () => {
    expect(sitemap().map((entry) => entry.url)).toContain("https://toyinog.com/work/echo");
  });
});

describe("drafts (spec 0005, AC-3; spec 0002, AC-4)", () => {
  it("leave a draft out of /work, the static pages and the sitemap in production", () => {
    useEnv("production");
    render(<WorkPage />);
    expect(screen.queryByRole("link", { name: "Delta" })).not.toBeInTheDocument();
    expect(generateStaticParams()).not.toContainEqual({ slug: "delta" });
    expect(sitemap().map((entry) => entry.url)).not.toContain("https://toyinog.com/work/delta");
  });

  it("include it in previews", () => {
    useEnv("preview");
    render(<WorkPage />);
    expect(screen.getByRole("link", { name: "Delta" })).toBeInTheDocument();
    expect(generateStaticParams()).toContainEqual({ slug: "delta" });
    expect(sitemap().map((entry) => entry.url)).toContain("https://toyinog.com/work/delta");
  });
});
