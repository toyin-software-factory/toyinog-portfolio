import { describe, expect, it } from "vitest";

import { formatMonth, formatMonthRange } from "./date";

describe("formatMonth", () => {
  it.each([
    ["2024-03", "Mar 2024"],
    ["2019-01", "Jan 2019"],
    ["2022-12", "Dec 2022"],
    ["2023-09", "Sep 2023"],
  ])("formats %s as %s", (input, expected) => {
    expect(formatMonth(input)).toBe(expected);
  });

  it("writes the full month name in the long style", () => {
    expect(formatMonth("2026-11", "long")).toBe("November 2026");
    expect(formatMonth("2024-05", "long")).toBe("May 2024");
  });

  it.each(["2024-13", "2024-00", "2024-3", "March 2024", "", "present"])("rejects %j", (input) => {
    expect(() => formatMonth(input)).toThrow("isn't a month written as YYYY-MM");
  });
});

describe("formatMonthRange (spec 0006, AC-3)", () => {
  it('writes "present" as Present', () => {
    expect(formatMonthRange("2024-03", "present")).toBe("Mar 2024 to Present");
  });

  it("formats both ends of a finished role", () => {
    expect(formatMonthRange("2019-01", "2022-02")).toBe("Jan 2019 to Feb 2022");
  });
});
