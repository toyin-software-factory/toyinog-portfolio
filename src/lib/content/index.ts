import "server-only";

import { getAppEnv } from "@/lib/env";

import { type ContentSnapshot, loadContent } from "./load";
import type { About, Profile, Project } from "./schema";

export { ContentError, type ContentProblem } from "./errors";
export type {
  About,
  Availability,
  ExperienceEntry,
  ImageRef,
  Profile,
  Project,
  ProjectLink,
  SkillGroup,
} from "./schema";

/**
 * Typed content for pages (spec 0002). Build time only: import these from
 * server components of statically generated routes, never from client code.
 * Everything is read and validated once per build; any problem throws one
 * `ContentError` that lists every file and field to fix.
 */

let cached: ContentSnapshot | undefined;

function content(): ContentSnapshot {
  // In `next dev` read fresh each time, so content edits show without a restart.
  if (cached && process.env.NODE_ENV !== "development") return cached;
  const snapshot = loadContent({
    rootDir: process.cwd(),
    appEnv: getAppEnv(),
    currentYear: new Date().getFullYear(),
  });
  if (!cached) {
    for (const warning of snapshot.warnings) console.warn(`[content] ${warning}`);
  }
  cached = snapshot;
  return snapshot;
}

/** Projects visible in this build, sorted by `order`, then newest `year`, then `title`. */
export function getProjects(): Project[] {
  return [...content().projects];
}

/**
 * The featured projects, in the same order as `getProjects()`. Drafts never count,
 * even in previews, so this is always at most 3.
 */
export function getFeaturedProjects(): Project[] {
  return getProjects().filter((project) => project.featured && !project.draft);
}

/** One project by slug, or `null` when it doesn't exist or is a draft in production. */
export function getProject(slug: string): Project | null {
  return getProjects().find((project) => project.slug === slug) ?? null;
}

/** Slugs for `generateStaticParams` on the case study route. */
export function getProjectSlugs(): string[] {
  return getProjects().map((project) => project.slug);
}

export function getProfile(): Profile {
  return content().profile;
}

/** The About page, with `bioHtml` and experience sorted newest first. */
export function getAbout(): About {
  return content().about;
}
