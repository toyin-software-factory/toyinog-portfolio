import { describe, expect, it } from "vitest";

import { findMarker, placeholderProblems, SIZE_LIMITS, sizeProblem } from "./guards";

describe("findMarker (spec 0010 AC-1)", () => {
  it.each([
    ["Placeholder bio", "placeholder"],
    ["PLACEHOLDER", "placeholder"],
    ["see https://Example.COM/x", "example.com"],
    ["me@example.com", "example.com"],
  ])("finds a marker in %j", (text, marker) => {
    expect(findMarker(text)).toBe(marker);
  });

  it.each(["Real bio", "examples.co", "place holder", "https://example.org"])(
    "finds nothing in %j",
    (text) => {
      expect(findMarker(text)).toBeUndefined();
    },
  );
});

describe("placeholderProblems (spec 0010 AC-1)", () => {
  it("lists every hit by file and field, in nested front matter, the body and file names", () => {
    const problems = placeholderProblems(
      [
        {
          file: "content/work/a.md",
          data: {
            title: "Real title",
            cover: { src: "/images/work/a.webp", alt: "Placeholder cover" },
            links: [{ label: "Site", url: "https://example.com/a" }],
            year: 2025,
            started: new Date("2024-01-01"),
          },
          body: "## Problem\n\nA placeholder sentence.",
        },
        { file: "content/pages/profile.md", data: { email: "me@toyin.dev" }, body: "" },
      ],
      [
        "public/images/work/a.webp",
        "public/images/work/Placeholder-cover.webp",
        "public/cv/cv.pdf",
      ],
    );
    expect(problems.map(({ file, field }) => `${file} ${field}`)).toEqual([
      "content/work/a.md cover.alt",
      "content/work/a.md links[0].url",
      "content/work/a.md body",
      "public/images/work/Placeholder-cover.webp ",
    ]);
    expect(problems[0]?.message).toBe(
      'contains "placeholder". Replace it with real content before it goes live',
    );
    expect(problems[3]?.message).toContain('has "placeholder" in its file name');
  });
});

describe("sizeProblem (spec 0010 AC-1b)", () => {
  it("passes a file at the limit and fails one byte over, in plain words", () => {
    expect(sizeProblem("cover", "f.md", "cover.src", "/c.webp", SIZE_LIMITS.cover)).toEqual([]);
    expect(sizeProblem("cover", "f.md", "cover.src", "/c.webp", SIZE_LIMITS.cover + 1)).toEqual([
      {
        file: "f.md",
        field: "cover.src",
        message: "points to /c.webp, which is 300 KB. The limit is 300 KB. Export it smaller",
      },
    ]);
  });

  it("uses 300 KB covers, 250 KB photos and a 5 MB CV", () => {
    expect(SIZE_LIMITS).toEqual({ cover: 307_200, photo: 256_000, cv: 5_242_880 });
    expect(sizeProblem("cv", "a.md", "cv.file", "/cv/a.pdf", 6 * 1024 * 1024)[0]?.message).toBe(
      "points to /cv/a.pdf, which is 6.0 MB. The limit is 5.0 MB. Export it smaller",
    );
  });
});
