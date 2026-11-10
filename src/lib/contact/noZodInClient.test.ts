import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

/**
 * No client component may pull zod into the browser, directly or through a local
 * module. Zod 4 probes `Function("")` on first use, and the CSP blocks that as eval,
 * which spec 0009 AC-4 forbids. Server code may use zod freely.
 */

const SRC = path.resolve(import.meta.dirname, "..", "..");

const sourceFiles = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.tsx?$/.test(entry.name) && !/\.test\.tsx?$/.test(entry.name) ? [full] : [];
  });

/** Runtime imports and re-exports (`import type` / `export type` are erased, so skipped). */
const runtimeImports = (source: string): string[] =>
  [
    ...source.matchAll(
      /^\s*(?:import|export)\s+(?!type\b)(?:[^"';]*?\sfrom\s+)?["']([^"']+)["']|\bimport\s*\(\s*["']([^"']+)["']/gm,
    ),
  ].map((match) => match[1] ?? match[2] ?? "");

/** Resolves `@/…` and relative specifiers to a file in src; packages return null. */
const resolveLocal = (from: string, specifier: string): string | null => {
  const base = specifier.startsWith("@/")
    ? path.join(SRC, specifier.slice(2))
    : specifier.startsWith(".")
      ? path.resolve(path.dirname(from), specifier)
      : null;
  if (base === null) return null;
  const candidates = [base, `${base}.ts`, `${base}.tsx`, path.join(base, "index.ts")];
  return candidates.find((file) => existsSync(file) && statSync(file).isFile()) ?? null;
};

const isServerActions = (file: string) => /^\s*["']use server["']/.test(readFileSync(file, "utf8"));

/**
 * The import chain from `file` to zod, or null if there is none. A "use server" module
 * stops the walk: the client bundle gets only references to its actions, not its code.
 */
const pathToZod = (file: string, seen = new Set<string>()): string[] | null => {
  if (seen.has(file) || (seen.size > 0 && isServerActions(file))) return null;
  seen.add(file);
  for (const specifier of runtimeImports(readFileSync(file, "utf8"))) {
    if (specifier === "zod" || specifier.startsWith("zod/")) return [file, "zod"];
    const next = resolveLocal(file, specifier);
    const chain = next ? pathToZod(next, seen) : null;
    if (chain) return [file, ...chain];
  }
  return null;
};

const isClient = (file: string) => /^\s*["']use client["']/.test(readFileSync(file, "utf8"));
const clientFiles = sourceFiles(SRC).filter(isClient);
const relative = (file: string) => path.relative(path.dirname(SRC), file);

describe("no zod in client components (spec 0009 AC-4)", () => {
  it("finds the client components", () => {
    expect(clientFiles.map(relative)).toEqual(
      expect.arrayContaining(["src/app/contact/ContactForm.tsx"]),
    );
  });

  it.each(clientFiles.map(relative))("%s doesn't reach zod", (file) => {
    const chain = pathToZod(path.join(path.dirname(SRC), file));
    expect(chain?.map((step) => (step === "zod" ? step : relative(step))) ?? null).toBeNull();
  });

  it("would catch zod through a local module", () => {
    expect(runtimeImports('import { z } from "zod";')).toEqual(["zod"]);
    expect(runtimeImports('export { a } from "./schema";')).toEqual(["./schema"]);
    expect(runtimeImports('import type { A } from "./schema";')).toEqual([]);
    expect(pathToZod(path.join(SRC, "lib/contact/schema.ts"))).not.toBeNull();
    expect(pathToZod(path.join(SRC, "lib/contact/fields.ts"))).toBeNull();
  });
});
