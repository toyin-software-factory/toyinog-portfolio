import { describe, expect, it } from "vitest";

import { type ContactValues, isHoneypotFilled, parseContact, readContactValues } from "./schema";

const valid: ContactValues = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  type: "hiring",
  message: "We're hiring a frontend lead for a small team.",
};

describe("parseContact (spec 0007, AC-2, AC-3)", () => {
  it("accepts valid input and trims it", () => {
    const result = parseContact({ ...valid, name: "  Ada Lovelace  " });
    expect(result).toEqual({ ok: true, data: { ...valid, name: "Ada Lovelace" } });
  });

  it("reports one message per missing field", () => {
    const result = parseContact({ name: "", email: "", type: "", message: "" });
    expect(result).toEqual({
      ok: false,
      errors: {
        name: "Enter your name.",
        email: "Enter your email address.",
        type: "Choose what this is about.",
        message: "Enter a message.",
      },
    });
  });

  it.each([
    ["name", "a".repeat(101), "Your name must be 100 characters or fewer."],
    ["name", "Ada\r\nBcc: victim@example.com", "Your name can't contain line breaks."],
    ["email", "not-an-email", "Enter an email address like name@example.com."],
    ["email", `${"a".repeat(250)}@x.io`, "Your email address must be 254 characters or fewer."],
    [
      "email",
      "ada@example.com\r\nBcc: victim@example.com",
      "Enter an email address like name@example.com.",
    ],
    ["type", "other", "Choose what this is about."],
    ["message", "too short", "Your message needs at least 20 characters."],
    ["message", "a".repeat(5001), "Your message must be 5000 characters or fewer."],
  ] as const)("rejects a bad %s", (field, value, message) => {
    const result = parseContact({ ...valid, [field]: value });
    expect(result).toEqual({ ok: false, errors: { [field]: message } });
  });

  it("accepts the edges of each range", () => {
    expect(parseContact({ ...valid, name: "a".repeat(100), message: "a".repeat(20) }).ok).toBe(
      true,
    );
    expect(parseContact({ ...valid, type: "project", message: "a".repeat(5000) }).ok).toBe(true);
  });
});

describe("form helpers", () => {
  it("reads missing fields as empty strings", () => {
    const formData = new FormData();
    formData.set("name", "Ada");
    expect(readContactValues(formData)).toEqual({ name: "Ada", email: "", type: "", message: "" });
  });

  it("spots a filled honeypot", () => {
    const formData = new FormData();
    expect(isHoneypotFilled(formData)).toBe(false);
    formData.set("website", "https://spam.example");
    expect(isHoneypotFilled(formData)).toBe(true);
  });
});
