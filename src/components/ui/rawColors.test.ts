import { readdirSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

import { describe, expect, it } from "vitest";

import { findRawColours } from "./rawColors";

const root = join(import.meta.dirname, "..", "..", "..");
const scanned = ["src/components", "src/app"];
// The token file is the one place raw colour values belong. The guard's own pattern is the other.
const allowed = new Set(["src/app/globals.css", "src/components/ui/rawColors.ts"]);

const sourceFiles = (dir: string): string[] =>
  readdirSync(join(root, dir), { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(path);
    return /\.(tsx?|css|mdx?)$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [path] : [];
  });

describe("raw colour guard (spec 0003, AC-1)", () => {
  it("flags hex and colour functions", () => {
    expect(findRawColours('className="bg-[#FFEE32]"')).toEqual(["#FFEE32"]);
    expect(findRawColours("color: #fff;")).toEqual(["#fff"]);
    expect(findRawColours("fill: rgb(0 0 0)")).toEqual(["rgb("]);
  });

  it("ignores fragment links and ids", () => {
    expect(findRawColours('href="#main" id="#cafe-menu"')).toEqual([]);
  });

  it.each(scanned)("finds no raw colours in %s outside globals.css", (dir) => {
    const offenders = sourceFiles(dir)
      .filter((path) => !allowed.has(relative(root, join(root, path)).replaceAll("\\", "/")))
      .flatMap((path) =>
        findRawColours(readFileSync(join(root, path), "utf8")).map(
          (colour) => `${path}: ${colour}`,
        ),
      );
    expect(offenders).toEqual([]);
  });
});
