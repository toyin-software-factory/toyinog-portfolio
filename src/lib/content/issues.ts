import type { z } from "zod";

import type { ContentProblem } from "./errors";

type Issue = z.core.$ZodIssue;
type PathSegment = Issue["path"][number];

/** `["experience", 1, "start"]` → `experience[1].start` */
export function formatPath(path: readonly PathSegment[]): string {
  return path.reduce<string>((out, segment) => {
    if (typeof segment === "number") return `${out}[${String(segment)}]`;
    const name = String(segment);
    return out ? `${out}.${name}` : name;
  }, "");
}

/** Describes a front matter value in plain words, for "but it is …" messages. */
function describe(value: unknown): string {
  if (value === null) return "empty";
  if (value instanceof Date) return "a full date";
  if (Array.isArray(value)) return "a list";
  switch (typeof value) {
    case "string":
      return `the text "${value}"`;
    case "number":
      return `the number ${String(value)}`;
    case "boolean":
      return String(value);
    case "object":
      return "a group of fields";
    default:
      return typeof value;
  }
}

const EXPECTED: Record<string, string> = {
  string: "text",
  number: "a number",
  int: "a whole number",
  boolean: "true or false",
  array: "a list",
  object: "a group of fields",
};

/** A plain words message for a too short or too long text, list or number. */
function sizeMessage(
  origin: string,
  limit: number | bigint,
  direction: "at least" | "at most",
): string {
  const n = String(limit);
  switch (origin) {
    case "string":
      return direction === "at least" && n === "1"
        ? "is empty. Add a value"
        : `should be ${direction} ${n} characters long`;
    case "array":
      return `should have ${direction} ${n} item${n === "1" ? "" : "s"}`;
    default:
      return direction === "at least" ? `should be ${n} or more` : `should be ${n} or less`;
  }
}

/** The plain words reason for one zod issue. Custom messages from the schema pass through. */
function message(issue: Issue): string {
  switch (issue.code) {
    case "invalid_type":
      if (issue.input === undefined) return "is missing. Add it";
      if (issue.input === null) return "is empty. Add a value";
      return `should be ${EXPECTED[issue.expected] ?? issue.expected}, but it is ${describe(issue.input)}`;
    case "too_small":
      return sizeMessage(issue.origin, issue.minimum, "at least");
    case "too_big":
      return sizeMessage(issue.origin, issue.maximum, "at most");
    case "invalid_format":
      if (issue.format === "url") return "should be a full web address, like https://example.com";
      if (issue.format === "email") return "should be an email address, like name@example.com";
      return issue.message;
    case "invalid_value":
      return `should be one of ${issue.values.map((value) => JSON.stringify(value)).join(", ")}`;
    default:
      return issue.message;
  }
}

/** Turns zod issues into plain word problems for one file. Unknown keys become one problem each. */
export function issuesToProblems(file: string, issues: readonly Issue[]): ContentProblem[] {
  return issues.flatMap((issue): ContentProblem[] => {
    const field = formatPath(issue.path);
    if (issue.code === "unrecognized_keys") {
      return issue.keys.map((key) => ({
        file,
        field: field ? `${field}.${key}` : key,
        message: "is not a known field. Check the spelling, or remove it",
      }));
    }
    return [{ file, field, message: message(issue) }];
  });
}
