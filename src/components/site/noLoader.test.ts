import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * Spec 0004 AC-12: the root layout and the shell components never call the file
 * reading content loader, so a route rendered at request time on Workers can
 * still render the shell. They may import only the generated module and the
 * pure `shell-profile` types from src/lib/content/.
 */

const REPO = path.resolve(import.meta.dirname, "..", "..", "..");
const ALLOWED = new Set(["@/lib/content/generated/shell-profile", "@/lib/content/shell-profile"]);

const shellFiles = [
  "src/app/layout.tsx",
  ...readdirSync(path.join(REPO, "src/components/site"))
    .filter((name) => /\.tsx?$/.test(name) && !/\.test\.tsx?$/.test(name))
    .map((name) => `src/components/site/${name}`),
];

const imports = (source: string): string[] =>
  [...source.matchAll(/\bfrom\s+["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']/g)].map(
    (match) => match[1] ?? match[2] ?? "",
  );

describe("shell files never use the content loader (spec 0004 AC-12)", () => {
  it.each(shellFiles)("%s", (file) => {
    const used = imports(readFileSync(path.join(REPO, file), "utf8"));
    const offending = used.filter(
      (specifier) =>
        /^node:|^(fs|path)$/.test(specifier) ||
        (specifier.startsWith("@/lib/content") && !ALLOWED.has(specifier)),
    );
    expect(offending).toEqual([]);
  });

  it("checks the layout and every shell component", () => {
    expect(shellFiles).toEqual(
      expect.arrayContaining([
        "src/app/layout.tsx",
        "src/components/site/Header.tsx",
        "src/components/site/Footer.tsx",
        "src/components/site/NavLinks.tsx",
      ]),
    );
  });
});
