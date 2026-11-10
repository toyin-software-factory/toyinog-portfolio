import { spawnSync } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

/**
 * `pnpm content:check` is the CI step that stops a broken content file before
 * the build (spec 0002, AC-3). These tests run the real script with tsx against
 * a copy of the valid fixture, the way CI runs it against content/.
 */

const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
const SCRIPT = path.join(REPO, "src/lib/content/check.ts");
const TSX = path.join(REPO, "node_modules/.bin/tsx");
const FIXTURES = path.join(import.meta.dirname, "__fixtures__");

const roots: string[] = [];

function fixtureRoot(changes: Record<string, string> = {}): string {
  const root = mkdtempSync(path.join(tmpdir(), "content-check-"));
  roots.push(root);
  cpSync(path.join(FIXTURES, "valid"), root, { recursive: true });
  for (const [file, content] of Object.entries(changes)) {
    writeFileSync(path.join(root, file), content);
  }
  return root;
}

function runCheck(cwd: string, env: Record<string, string> = {}) {
  const result = spawnSync(TSX, ["--tsconfig", path.join(REPO, "tsconfig.json"), SCRIPT], {
    cwd,
    encoding: "utf8",
    env: { ...process.env, APP_ENV: "preview", WORKERS_CI_BRANCH: "", ...env },
  });
  return { code: result.status, out: result.stdout, err: result.stderr };
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

// Each test starts a tsx process, so allow more than the 5 second default on a slow CI runner.
describe("content:check script", { timeout: 30_000 }, () => {
  it("exits 0 and summarises valid content, counting drafts in preview (AC-3, AC-4)", () => {
    const { code, out } = runCheck(fixtureRoot());
    expect(code).toBe(0);
    expect(out).toMatch(/^Content OK \(preview\): \d+ projects visible \(1 draft\)/m);
  });

  it("leaves drafts out in production (AC-4)", () => {
    const { code, out } = runCheck(fixtureRoot(), { APP_ENV: "production" });
    expect(code).toBe(0);
    expect(out).toContain("Content OK (production)");
    expect(out).not.toContain("draft");
  });

  it("exits 1 and prints every problem by file in plain words (AC-3)", () => {
    const badValues = readFileSync(path.join(FIXTURES, "broken", "bad-values.md"), "utf8");
    const { code, err } = runCheck(fixtureRoot({ "content/work/alpha.md": badValues }));
    expect(code).toBe(1);
    expect(err).toContain("Fix them and build again.");
    expect(err).toContain("content/work/alpha.md\n  - year: should be a number");
    // The friendly message, not a stack trace.
    expect(err).not.toMatch(/\n\s+at /);
  });
});
