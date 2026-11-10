import type { ContentProblem } from "./errors";
import { formatPath } from "./issues";

/**
 * Launch guards (spec 0010 AC-1, AC-1b). Pure: the loader passes in what it
 * read, these return problems. Whether placeholder hits fail the build or only
 * warn is the caller's choice (`PlaceholderMode`); size limits always fail.
 */

/** Words that mean "not real content yet". Matched case insensitively, no exceptions. */
export const PLACEHOLDER_MARKERS = ["placeholder", "example.com"] as const;

/** `error` fails the build (production), `warn` lists the hits and passes (previews, local). */
export type PlaceholderMode = "error" | "warn";

/** Largest file sizes in bytes (AC-1b). */
export const SIZE_LIMITS = {
  cover: 300 * 1024,
  photo: 250 * 1024,
  cv: 5 * 1024 * 1024,
} as const;

/** One content file as read: front matter and Markdown body. */
export type ReadContentFile = {
  readonly file: string;
  readonly data: unknown;
  readonly body: string;
};

/** The first marker in `text`, or undefined. */
export function findMarker(text: string): string | undefined {
  const lower = text.toLowerCase();
  return PLACEHOLDER_MARKERS.find((marker) => lower.includes(marker));
}

const markerMessage = (marker: string) =>
  `contains "${marker}". Replace it with real content before it goes live`;

/** Every string in a front matter value, with its field path (for example `links[0].url`). */
function strings(value: unknown, path: (string | number)[] = []): [string, string][] {
  if (typeof value === "string") return [[formatPath(path), value]];
  if (Array.isArray(value)) return value.flatMap((item, index) => strings(item, [...path, index]));
  if (value && typeof value === "object" && !(value instanceof Date)) {
    return Object.entries(value).flatMap(([key, item]) => strings(item, [...path, key]));
  }
  return [];
}

/**
 * Placeholder hits in front matter strings, Markdown bodies and public file
 * names (AC-1). `publicFiles` are paths like `public/images/work/a.webp`.
 */
export function placeholderProblems(
  files: readonly ReadContentFile[],
  publicFiles: readonly string[],
): ContentProblem[] {
  const problems: ContentProblem[] = [];
  for (const { file, data, body } of files) {
    for (const [field, text] of strings(data)) {
      const marker = findMarker(text);
      if (marker) problems.push({ file, field, message: markerMessage(marker) });
    }
    const marker = findMarker(body);
    if (marker) problems.push({ file, field: "body", message: markerMessage(marker) });
  }
  for (const file of publicFiles) {
    const marker = findMarker(file.slice(file.lastIndexOf("/") + 1));
    if (marker) {
      problems.push({
        file,
        field: "",
        message: `has "${marker}" in its file name. Rename or replace the file before it goes live`,
      });
    }
  }
  return problems;
}

const formatSize = (bytes: number) =>
  bytes >= 1024 * 1024
    ? `${(bytes / (1024 * 1024)).toFixed(1)} MB`
    : `${String(Math.round(bytes / 1024))} KB`;

/** One file over its limit, or nothing. `sitePath` is like `/images/work/a.webp`. */
export function sizeProblem(
  kind: keyof typeof SIZE_LIMITS,
  file: string,
  field: string,
  sitePath: string,
  bytes: number,
): ContentProblem[] {
  const limit = SIZE_LIMITS[kind];
  if (bytes <= limit) return [];
  return [
    {
      file,
      field,
      message: `points to ${sitePath}, which is ${formatSize(bytes)}. The limit is ${formatSize(limit)}. Export it smaller`,
    },
  ];
}
