import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import matter from "gray-matter";
import type { z } from "zod";

import type { AppEnv } from "@/lib/env";

import { ContentError, type ContentProblem } from "./errors";
import { issuesToProblems } from "./issues";
import { renderMarkdown } from "./markdown";
import { type About, createSchemas, type Profile, type Project, SLUG_PATTERN } from "./schema";

/**
 * The content loader core. It reads every file, validates it, applies the
 * collection rules, and throws one `ContentError` listing every problem.
 * It has no `server-only` guard so the `content:check` script and tests can
 * run it in plain Node. Pages use `./index.ts`, which adds the guard.
 */

export const MAX_FEATURED = 3;
const REQUIRED_SECTIONS = ["Problem", "What I did", "Outcome"] as const;

export interface LoadOptions {
  /** The folder that holds `content/` and `public/`. */
  rootDir: string;
  /** `production` hides drafts. */
  appEnv: AppEnv;
  /** The build machine's current year, for the project year upper bound. */
  currentYear: number;
}

export interface ContentSnapshot {
  /** Projects visible in this environment, sorted (AC-5). Drafts only outside production. */
  projects: Project[];
  profile: Profile;
  about: About;
  /** Non blocking notes, such as a case study missing a recommended section. */
  warnings: string[];
}

interface ParsedFile {
  data: unknown;
  body: string;
}

function toPosix(file: string): string {
  return file.split(path.sep).join("/");
}

/** Compares projects by `order` ascending, then `year` descending, then `title`. */
export function compareProjects(a: Project, b: Project): number {
  return a.order - b.order || b.year - a.year || a.title.localeCompare(b.title, "en");
}

function yamlReason(error: unknown): string {
  if (error instanceof Error) {
    const detail = error as Error & { reason?: unknown; mark?: { line?: unknown } };
    const reason = typeof detail.reason === "string" ? detail.reason : error.message;
    const line =
      typeof detail.mark?.line === "number" ? `, line ${String(detail.mark.line + 1)}` : "";
    return `${reason}${line}`;
  }
  return String(error);
}

export function loadContent(options: LoadOptions): ContentSnapshot {
  const { rootDir, appEnv, currentYear } = options;
  const publicDir = path.join(rootDir, "public");
  const problems: ContentProblem[] = [];
  const warnings: string[] = [];

  const relative = (absolute: string) => toPosix(path.relative(rootDir, absolute));

  const publicFileExists = (sitePath: string): boolean => {
    const absolute = path.resolve(publicDir, `.${sitePath}`);
    if (!absolute.startsWith(publicDir + path.sep)) return false;
    try {
      return statSync(absolute).isFile();
    } catch {
      return false;
    }
  };

  const schemas = createSchemas({ currentYear, publicFileExists });

  const readFile = (absolute: string): ParsedFile | undefined => {
    const file = relative(absolute);
    if (!existsSync(absolute)) {
      problems.push({ file, field: "", message: "is missing. Create this file" });
      return undefined;
    }
    try {
      // Passing options turns off gray-matter's cache, so every read is fresh.
      const parsed = matter(readFileSync(absolute, "utf8"), {});
      const data: unknown = parsed.data;
      return { data, body: parsed.content };
    } catch (error) {
      problems.push({
        file,
        field: "",
        message: `has front matter that isn't valid YAML (${yamlReason(error)}). Check the indentation and the colons`,
      });
      return undefined;
    }
  };

  function validate<Schema extends z.ZodType>(
    schema: Schema,
    absolute: string,
    data: unknown,
  ): z.output<Schema> | undefined {
    const result = schema.safeParse(data, { reportInput: true });
    if (result.success) return result.data;
    problems.push(...issuesToProblems(relative(absolute), result.error.issues));
    return undefined;
  }

  const requireBody = (absolute: string, body: string, what: string): boolean => {
    if (body.trim()) return true;
    problems.push({
      file: relative(absolute),
      field: "body",
      message: `is empty. Write ${what} below the front matter`,
    });
    return false;
  };

  // Projects: one file per case study in content/work/.
  const workDir = path.join(rootDir, "content", "work");
  const projects: Project[] = [];
  const filesBySlug = new Map<string, string>();
  const workFiles = existsSync(workDir)
    ? readdirSync(workDir)
        .filter((name) => name.toLowerCase().endsWith(".md") && name.toLowerCase() !== "readme.md")
        .sort()
    : [];
  if (!existsSync(workDir)) {
    problems.push({ file: "content/work", field: "", message: "folder is missing. Create it" });
  }

  for (const name of workFiles) {
    const absolute = path.join(workDir, name);
    const file = relative(absolute);
    const slug = name.slice(0, -".md".length);

    if (!SLUG_PATTERN.test(slug)) {
      problems.push({
        file,
        field: "",
        message: `has a filename that can't be used in a web address. Use lowercase letters, digits and single hyphens, like my-project.md`,
      });
    }
    const existing = filesBySlug.get(slug);
    if (existing) {
      problems.push({
        file,
        field: "",
        message: `has the same slug "${slug}" as ${existing}. Every project needs its own filename`,
      });
    } else {
      filesBySlug.set(slug, file);
    }

    const parsed = readFile(absolute);
    if (!parsed) continue;
    const frontMatter = validate(schemas.project, absolute, parsed.data);
    const hasBody = requireBody(absolute, parsed.body, "the case study");
    if (!frontMatter || !hasBody) continue;

    const missing = REQUIRED_SECTIONS.filter(
      (section) => !new RegExp(`^##\\s+${section}\\s*$`, "im").test(parsed.body),
    );
    if (missing.length > 0) {
      warnings.push(
        `${file}: the case study has no ${missing.map((s) => `"## ${s}"`).join(", ")} section. Recommended, not required.`,
      );
    }
    projects.push({ ...frontMatter, slug, body: parsed.body, html: renderMarkdown(parsed.body) });
  }

  const featured = projects.filter((project) => project.featured && !project.draft);
  if (featured.length > MAX_FEATURED) {
    problems.push({
      file: "content/work",
      field: "featured",
      message: `${String(featured.length)} published projects are featured (${featured
        .map((project) => project.slug)
        .join(
          ", ",
        )}), but at most ${String(MAX_FEATURED)} can be. Set featured: false on the extra ones`,
    });
  }

  // Profile: front matter only.
  const profilePath = path.join(rootDir, "content", "pages", "profile.md");
  const profileFile = readFile(profilePath);
  const profile = profileFile
    ? validate(schemas.profile, profilePath, profileFile.data)
    : undefined;

  // About: front matter plus the Markdown bio.
  const aboutPath = path.join(rootDir, "content", "pages", "about.md");
  const aboutFile = readFile(aboutPath);
  let about: About | undefined;
  if (aboutFile) {
    const frontMatter = validate(schemas.about, aboutPath, aboutFile.data);
    const hasBio = requireBody(aboutPath, aboutFile.body, "the bio");
    if (frontMatter && hasBio) {
      about = {
        ...frontMatter,
        // Newest first by start month. YYYY-MM strings sort correctly as text.
        experience: [...frontMatter.experience].sort((a, b) => b.start.localeCompare(a.start)),
        bio: aboutFile.body,
        bioHtml: renderMarkdown(aboutFile.body),
      };
    }
  }

  if (problems.length > 0 || !profile || !about) {
    throw new ContentError(problems);
  }

  const visible = projects
    .filter((project) => appEnv !== "production" || !project.draft)
    .sort(compareProjects);

  return { projects: visible, profile, about, warnings };
}
