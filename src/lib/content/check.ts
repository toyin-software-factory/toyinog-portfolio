/**
 * `pnpm content:check`: validates everything in content/ without a full build.
 * Exits with code 1 and lists every problem when anything is wrong.
 */
import { getAppEnv } from "@/lib/env";

import { ContentError } from "./errors";
import { loadContent } from "./load";

try {
  const appEnv = getAppEnv();
  const snapshot = loadContent({
    rootDir: process.cwd(),
    appEnv,
    currentYear: new Date().getFullYear(),
  });
  for (const warning of snapshot.warnings) console.warn(`warning: ${warning}`);
  const drafts = snapshot.projects.filter((project) => project.draft).length;
  console.log(
    `Content OK (${appEnv}): ${String(snapshot.projects.length)} projects visible` +
      (drafts > 0 ? ` (${String(drafts)} draft)` : "") +
      `, profile and about valid.`,
  );
} catch (error) {
  console.error(error instanceof ContentError ? error.message : error);
  process.exitCode = 1;
}
