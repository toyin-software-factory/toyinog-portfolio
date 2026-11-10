import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  SHELL_PROFILE_MODULE_PATH,
  type ShellProfile,
  shellProfileModuleSource,
  toShellProfile,
} from "./shell-profile";

/**
 * Spec 0004 AC-12: the shell's profile values come from a module generated at
 * build time. These tests cover the pure pieces and run the real
 * `pnpm content:generate` script against a copy of the valid fixture.
 */

const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
const SCRIPT = path.join(REPO, "src/lib/content/generate.ts");
const TSX = path.join(REPO, "node_modules/.bin/tsx");
const FIXTURES = path.join(import.meta.dirname, "__fixtures__");

const roots: string[] = [];

function fixtureRoot(changes: Record<string, string> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), "content-generate-"));
  roots.push(root);
  cpSync(path.join(FIXTURES, "valid"), root, { recursive: true });
  for (const [file, content] of Object.entries(changes)) {
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

function runGenerate(cwd: string, appEnv: "preview" | "production" = "preview") {
  const result = spawnSync(TSX, ["--tsconfig", path.join(REPO, "tsconfig.json"), SCRIPT], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, APP_ENV: appEnv, WORKERS_CI_BRANCH: "" },
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

const profile: ShellProfile = {
  name: 'Ada "The Countess" Lovelace',
  headline: "Engineer </script> & writer",
  intro: "Line one.\nLine two.",
  email: "ada@example.com",
  links: { linkedin: "https://example.com/in/ada", github: "https://example.com/ada" },
};

describe("toShellProfile", () => {
  it("keeps only the shell's fields", () => {
    const shell = toShellProfile({
      ...profile,
      location: "London",
      availability: "roles",
      links: { ...profile.links },
    });
    expect(Object.keys(shell).sort()).toEqual(["email", "headline", "intro", "links", "name"]);
    expect(shell).toEqual(profile);
  });
});

describe("shellProfileModuleSource", () => {
  it("encodes every value as JSON, so quotes and markup can't break the module", () => {
    const source = shellProfileModuleSource(profile, 2026);
    const json = /SHELL_PROFILE: ShellProfile = (\{[\s\S]*?\n\});/.exec(source)?.[1];
    expect(json).toBeDefined();
    expect(JSON.parse(json ?? "")).toEqual(profile);
    expect(source).toContain("export const BUILD_YEAR: number = 2026;");
    expect(source).toContain('import type { ShellProfile } from "../shell-profile";');
  });
});

describe("content:generate script", { timeout: 30_000 }, () => {
  it("writes the module from content/pages/profile.md", () => {
    const root = fixtureRoot();
    const { code, out } = runGenerate(root);

    expect(code).toBe(0);
    expect(out).toContain(`Wrote ${SHELL_PROFILE_MODULE_PATH}`);
    const source = readFileSync(path.join(root, SHELL_PROFILE_MODULE_PATH), "utf8");
    expect(source).toContain('"name": "Fixture Person"');
    expect(source).toContain('"email": "fixture@fixture.test"');
    expect(source).toContain(`BUILD_YEAR: number = ${String(new Date().getFullYear())}`);
    // Nothing beyond the shell's fields.
    expect(source).not.toContain("availability");
  });

  it("stops on broken content with the same message as content:check, writing nothing", () => {
    const badValues = readFileSync(path.join(FIXTURES, "broken", "bad-values.md"), "utf8");
    const root = fixtureRoot({ "content/work/alpha.md": badValues });
    const { code, err } = runGenerate(root);

    expect(code).toBe(1);
    expect(err).toContain("Fix them and build again.");
    expect(err).toContain("content/work/alpha.md\n  - year: should be a number");
    expect(existsSync(path.join(root, SHELL_PROFILE_MODULE_PATH))).toBe(false);
  });

  // content:generate is the first step of `pnpm build`, so this is a production build failing.
  it("stops a production build on placeholder content, and lets a preview build through (spec 0010 AC-1)", () => {
    const alpha = readFileSync(path.join(FIXTURES, "valid/content/work/alpha.md"), "utf8");
    const changes = {
      "content/work/alpha.md": alpha.replace(/title: "[^"]*"/, 'title: "Placeholder title"'),
    };

    const production = runGenerate(fixtureRoot(changes), "production");
    expect(production.code).toBe(1);
    expect(production.err).toContain('content/work/alpha.md\n  - title: contains "placeholder"');

    const previewRoot = fixtureRoot(changes);
    const preview = runGenerate(previewRoot, "preview");
    expect(preview.code).toBe(0);
    expect(existsSync(path.join(previewRoot, SHELL_PROFILE_MODULE_PATH))).toBe(true);
  });
});
