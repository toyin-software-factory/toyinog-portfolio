import { z } from "zod";

/**
 * zod schemas for the front matter of every content file (spec 0002).
 * Every object is strict, so a typo such as `feautred` fails the build
 * instead of being silently ignored.
 */

/** Filename based slug: lowercase letters and digits, single hyphens between words. */
export const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const YEAR_MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
const IMAGE_EXTENSIONS = [".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"] as const;
const SAFE_PUBLIC_PATH = /^\/[A-Za-z0-9._/-]+$/;

export interface SchemaOptions {
  /** The current year from the build machine clock. Project years can go up to the next year. */
  currentYear: number;
  /** Whether a file exists in `public/`, given its site path such as `/images/work/a.webp`. */
  publicFileExists: (sitePath: string) => boolean;
}

const text = z.string().trim().min(1);

const yearMonth = z
  .string()
  .regex(YEAR_MONTH_PATTERN, "should be a month written as YYYY-MM, for example 2024-03");

const httpsUrl = z
  .url()
  .refine(
    (value) => value.startsWith("https://"),
    "should be a web address starting with https://",
  );

function publicFile(
  options: SchemaOptions,
  folder: string,
  extensions: readonly string[],
  kind: string,
) {
  return z
    .string()
    .refine(
      (value) =>
        value.startsWith(folder) && SAFE_PUBLIC_PATH.test(value) && !value.includes("/../"),
      { message: `should be a path that starts with ${folder}`, abort: true },
    )
    .refine((value) => extensions.some((extension) => value.toLowerCase().endsWith(extension)), {
      message: `should be ${kind} file ending in ${extensions.join(", ")}`,
      abort: true,
    })
    .refine((value) => options.publicFileExists(value), {
      message: "points to a file that does not exist. Add the file under public/ or fix the path",
    });
}

function image(options: SchemaOptions, folder: string) {
  return z.strictObject({
    src: publicFile(options, folder, IMAGE_EXTENSIONS, "an image"),
    alt: z
      .string()
      .refine(
        (value) => value.trim().length > 0,
        "is empty. Describe the image in a few words for people using screen readers",
      ),
  });
}

export function createSchemas(options: SchemaOptions) {
  const project = z.strictObject({
    title: text.max(80),
    summary: text.max(200),
    role: text,
    client: text.optional(),
    year: z
      .int()
      .min(2000)
      .max(options.currentYear + 1),
    tags: z.array(text).min(1).max(8),
    cover: image(options, "/images/work/"),
    links: z
      .array(z.strictObject({ label: text, url: httpsUrl }))
      .max(2)
      .default([]),
    featured: z.boolean().default(false),
    order: z.int().min(0),
    draft: z.boolean().default(false),
  });

  const profile = z.strictObject({
    name: text,
    headline: text.max(100),
    intro: text.max(300),
    location: text.optional(),
    availability: z.enum(["roles", "projects", "both", "none"]),
    links: z.strictObject({ linkedin: httpsUrl, github: httpsUrl }),
    email: z.email(),
  });

  const experience = z
    .strictObject({
      role: text,
      company: text,
      location: text.optional(),
      start: yearMonth,
      end: z.union([yearMonth, z.literal("present")], {
        error: "should be a month written as YYYY-MM, or the word present",
      }),
      highlights: z.array(text).min(2).max(4),
    })
    .refine(
      // A badly written start is already reported; only compare two valid months.
      (entry) =>
        entry.end === "present" ||
        !YEAR_MONTH_PATTERN.test(entry.start) ||
        entry.start <= entry.end,
      {
        message: "is before start. The end month should be the same as start or later",
        path: ["end"],
      },
    );

  const about = z.strictObject({
    photo: image(options, "/images/"),
    experience: z.array(experience).min(1),
    skillGroups: z
      .array(z.strictObject({ name: text, skills: z.array(text).min(1).max(20) }))
      .min(1),
    cv: z.strictObject({
      file: publicFile(options, "/cv/", [".pdf"], "a PDF"),
      updated: yearMonth,
    }),
  });

  return { project, profile, about };
}

type Schemas = ReturnType<typeof createSchemas>;

export type ProjectFrontMatter = z.output<Schemas["project"]>;
export type ProfileFrontMatter = z.output<Schemas["profile"]>;
export type AboutFrontMatter = z.output<Schemas["about"]>;

export type ImageRef = ProjectFrontMatter["cover"];
export type ProjectLink = ProjectFrontMatter["links"][number];
export type ExperienceEntry = AboutFrontMatter["experience"][number];
export type SkillGroup = AboutFrontMatter["skillGroups"][number];
export type Availability = ProfileFrontMatter["availability"];

/** A case study from `content/work/<slug>.md`. */
export interface Project extends ProjectFrontMatter {
  /** From the filename, without `.md`. */
  slug: string;
  /** The Markdown body as written. */
  body: string;
  /** The body rendered to HTML at build time. */
  html: string;
}

/** The site profile from `content/pages/profile.md`. */
export type Profile = ProfileFrontMatter;

/** The About page from `content/pages/about.md`, experience sorted newest first. */
export interface About extends AboutFrontMatter {
  /** The Markdown bio as written. */
  bio: string;
  /** The bio rendered to HTML at build time. */
  bioHtml: string;
}
