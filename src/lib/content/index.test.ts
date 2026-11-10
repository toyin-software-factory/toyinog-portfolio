import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The public getters against the real files in content/. If anyone breaks a
 * content file, these fail, so `pnpm test` fails as well as `pnpm build` (AC-3).
 */

async function loadModule(appEnv: "preview" | "production") {
  vi.stubEnv("APP_ENV", appEnv);
  vi.resetModules();
  return import("./index");
}

beforeEach(() => {
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("content getters on the real content", () => {
  it("has full placeholder content for every type (AC-8)", async () => {
    const content = await loadModule("preview");
    const projects = content.getProjects();
    const about = content.getAbout();

    expect(projects.length).toBeGreaterThanOrEqual(4);
    expect(content.getFeaturedProjects()).toHaveLength(3);
    expect(projects.filter((project) => project.draft)).toHaveLength(1);
    for (const project of projects) expect(project.title).toMatch(/placeholder/i);

    expect(content.getProfile().headline).toMatch(/placeholder/i);
    expect(about.experience.length).toBeGreaterThanOrEqual(3);
    expect(about.skillGroups.length).toBeGreaterThanOrEqual(3);
    expect(about.cv.file).toMatch(/\.pdf$/);
    expect(about.bio).toMatch(/placeholder/i);
  });

  it("returns projects sorted, with featured in the same order (AC-5)", async () => {
    const content = await loadModule("preview");
    const projects = content.getProjects();
    const orders = projects.map((project) => project.order);

    expect(orders).toEqual([...orders].sort((a, b) => a - b));
    expect(content.getFeaturedProjects().map((project) => project.slug)).toEqual(
      projects.filter((project) => project.featured && !project.draft).map((p) => p.slug),
    );
  });

  it("shows the draft in previews (AC-4)", async () => {
    const preview = await loadModule("preview");
    const draft = preview.getProjects().find((project) => project.draft);
    expect(draft).toBeDefined();
    if (!draft) return;
    expect(preview.getProject(draft.slug)?.draft).toBe(true);
    expect(preview.getProjectSlugs()).toContain(draft.slug);
    expect(preview.getProject("no-such-project")).toBeNull();
  });

  // Drafts hidden in production are covered on fixtures in load.test.ts and addProject.test.tsx.
  // Today's real content is placeholder, so a production load stops on it (spec 0010 AC-1).
  it("refuses today's placeholder content in production (spec 0010 AC-1)", async () => {
    const production = await loadModule("production");
    expect(() => production.getProjects()).toThrow(/contains "placeholder"/);
  });

  it("gives each getter call its own array", async () => {
    const content = await loadModule("preview");
    content.getProjects().pop();
    expect(content.getProjects().length).toBeGreaterThanOrEqual(4);
  });
});

describe("the loader stays on the server (AC-10)", () => {
  it("is marked server-only", () => {
    const source = readFileSync(path.join(import.meta.dirname, "index.ts"), "utf8");
    expect(source.startsWith('import "server-only";')).toBe(true);
  });

  it("is never imported from a client component", () => {
    const srcDir = path.join(import.meta.dirname, "..", "..");
    const files = readdirSync(srcDir, { recursive: true, encoding: "utf8" }).filter((file) =>
      /\.(ts|tsx)$/.test(file),
    );
    const offenders = files.filter((file) => {
      const source = readFileSync(path.join(srcDir, file), "utf8");
      return (
        /^\s*["']use client["']/m.test(source) &&
        /from\s+["'](@\/lib\/content|\.{1,2}\/[^"']*content)[^"']*["']/.test(source)
      );
    });
    expect(offenders).toEqual([]);
  });
});
