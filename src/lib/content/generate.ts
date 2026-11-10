/**
 * `pnpm content:generate`: writes the shell's profile values to a module that the
 * root layout imports (spec 0004 AC-12). It validates all content with the same
 * loader as `pnpm content:check`, so broken content stops here with the same message.
 */
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

import { getAppEnv } from "@/lib/env";

import { ContentError } from "./errors";
import { loadContent } from "./load";
import {
  SHELL_PROFILE_MODULE_PATH,
  shellProfileModuleSource,
  toShellProfile,
} from "./shell-profile";

try {
  const rootDir = process.cwd();
  const currentYear = new Date().getFullYear();
  const { profile } = loadContent({ rootDir, appEnv: getAppEnv(), currentYear });
  const target = path.join(rootDir, SHELL_PROFILE_MODULE_PATH);
  mkdirSync(path.dirname(target), { recursive: true });
  writeFileSync(target, shellProfileModuleSource(toShellProfile(profile), currentYear));
  console.log(`Wrote ${SHELL_PROFILE_MODULE_PATH}`);
} catch (error) {
  console.error(error instanceof ContentError ? error.message : error);
  process.exitCode = 1;
}
