/**
 * Month formatting for content dates written as "YYYY-MM" (spec 0006). English
 * month names from a fixed list, not `Intl`, so the output is the same on every
 * build machine and runtime.
 */

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

const YEAR_MONTH = /^(\d{4})-(0[1-9]|1[0-2])$/;

export type MonthStyle = "short" | "long";

/**
 * "2024-03" as "Mar 2024" (short) or "March 2024" (long). Throws on anything
 * else, which content validation (spec 0002) already rules out.
 */
export function formatMonth(yearMonth: string, style: MonthStyle = "short"): string {
  const match = YEAR_MONTH.exec(yearMonth);
  const month = match ? MONTHS[Number(match[2]) - 1] : undefined;
  if (!match || !month) throw new Error(`"${yearMonth}" isn't a month written as YYYY-MM`);
  return `${style === "short" ? month.slice(0, 3) : month} ${match[1] ?? ""}`;
}

/** "Mar 2024 to Present" or "Jan 2019 to Feb 2022", for an experience entry. */
export function formatMonthRange(start: string, end: string): string {
  return `${formatMonth(start)} to ${end === "present" ? "Present" : formatMonth(end)}`;
}
