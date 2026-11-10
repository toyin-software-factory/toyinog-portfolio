/** One problem found in one content file. */
export interface ContentProblem {
  /** Path of the file, relative to the project root, e.g. `content/work/my-project.md`. */
  file: string;
  /** The front matter field, e.g. `cover.alt` or `experience[1].start`. Empty for whole file problems. */
  field: string;
  /** What is wrong, in plain words. */
  message: string;
}

function formatProblem(problem: ContentProblem): string {
  return problem.field ? `  - ${problem.field}: ${problem.message}` : `  - ${problem.message}`;
}

/** Groups problems by file, in the order the files were first seen. */
export function formatProblems(problems: readonly ContentProblem[]): string {
  const byFile = new Map<string, ContentProblem[]>();
  for (const problem of problems) {
    const list = byFile.get(problem.file) ?? [];
    list.push(problem);
    byFile.set(problem.file, list);
  }
  return [...byFile]
    .map(([file, list]) => [file, ...list.map(formatProblem)].join("\n"))
    .join("\n\n");
}

/**
 * Every problem found across all content files, in one error, so you can fix
 * them all in one pass instead of one build at a time.
 */
export class ContentError extends Error {
  readonly problems: readonly ContentProblem[];

  constructor(problems: readonly ContentProblem[]) {
    const count = problems.length === 1 ? "1 problem" : `${String(problems.length)} problems`;
    super(
      `The content in content/ has ${count}. Fix them and build again.\n\n${formatProblems(problems)}\n`,
    );
    this.name = "ContentError";
    this.problems = problems;
  }
}
