import { Heading } from "@/components/ui";
import type { ExperienceEntry } from "@/lib/content";
import { formatMonth } from "@/lib/format/date";

type ExperienceListProps = {
  /** Newest first, as `getAbout()` returns them. */
  readonly entries: readonly ExperienceEntry[];
};

/** The dates of one role: "Mar 2022 to Present" with machine readable `<time>`s. */
function DateRange({ start, end }: Pick<ExperienceEntry, "start" | "end">) {
  return (
    <p className="text-small text-text-muted">
      <time dateTime={start}>{formatMonth(start)}</time> to{" "}
      {end === "present" ? "Present" : <time dateTime={end}>{formatMonth(end)}</time>}
    </p>
  );
}

/** Every role, newest first, as an ordered list (spec 0006, AC-3). */
export function ExperienceList({ entries }: ExperienceListProps) {
  return (
    <ol className="flex flex-col">
      {entries.map((entry) => (
        <li
          key={`${entry.company}-${entry.start}`}
          className="grid gap-4 border-t border-rule py-8 md:grid-cols-12 md:gap-10"
        >
          <div className="flex flex-col gap-1 md:col-span-4">
            <DateRange start={entry.start} end={entry.end} />
            <p className="text-text-muted">
              {entry.company}
              {entry.location ? ` · ${entry.location}` : null}
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-8">
            <Heading level={3}>{entry.role}</Heading>
            <ul className="flex list-disc flex-col gap-2 pl-5 text-text marker:text-text-muted">
              {entry.highlights.map((highlight) => (
                <li key={highlight}>{highlight}</li>
              ))}
            </ul>
          </div>
        </li>
      ))}
    </ol>
  );
}
