import { describe, expect, it } from "vitest";

import { contactIntro } from "./intro";

describe("contactIntro (spec 0007, AC-1)", () => {
  it.each([
    ["roles", /open to new roles/],
    ["projects", /taking on new projects/],
    ["both", /roles and taking on projects/],
    ["none", /not taking on new work/],
  ] as const)("reflects availability %s", (availability, text) => {
    expect(contactIntro(availability)).toMatch(text);
  });
});
