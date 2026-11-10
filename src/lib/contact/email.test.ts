import { describe, expect, it } from "vitest";

import { buildContactEmail, contactBody, contactSubject } from "./email";
import type { ContactInput } from "./schema";

const input: ContactInput = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  type: "project",
  message: "Could you help us rebuild our marketing site?",
};
const sentAt = new Date("2026-11-10T09:30:00.000Z");

/** Splits a raw MIME message into its header block, unfolded, with encoded words decoded. */
const headerBlock = (raw: string): string =>
  (raw.split(/\r?\n\r?\n/)[0] ?? "")
    .replace(/\r?\n[ \t]+/g, " ")
    .replace(/=\?utf-8\?B\?([^?]*)\?=/gi, (_match, b64: string) =>
      Buffer.from(b64, "base64").toString("utf8"),
    );

describe("contact email (spec 0007, AC-7)", () => {
  it("uses the subject format for each type", () => {
    expect(contactSubject({ type: "hiring", name: "Ada" })).toBe("[toyinog.com] Hiring: Ada");
    expect(contactSubject({ type: "project", name: "Ada" })).toBe("[toyinog.com] Project: Ada");
  });

  it("puts name, email, type, message and the UTC time in the body", () => {
    expect(contactBody(input, sentAt)).toBe(
      [
        "Name: Ada Lovelace",
        "Email: ada@example.com",
        "About: A project",
        "Sent: 2026-11-10T09:30:00.000Z (UTC)",
        "",
        "Could you help us rebuild our marketing site?",
        "",
      ].join("\n"),
    );
  });

  it("builds a plain text MIME message with the right headers", () => {
    const raw = buildContactEmail({
      from: "contact@toyinog.com",
      to: "inbox@example.org",
      input,
      sentAt,
    });
    const headers = headerBlock(raw);

    expect(headers).toMatch(/^From: toyinog\.com contact <contact@toyinog\.com>$/m);
    expect(headers).toMatch(/^To: <inbox@example\.org>$/m);
    expect(headers).toMatch(/^Reply-To: <ada@example\.com>$/m);
    expect(headers).toMatch(/^Subject: \[toyinog\.com\] Project: Ada Lovelace$/m);
    expect(raw).toMatch(/Content-Type: text\/plain/);
    // One Subject, From and To each: nothing smuggled in.
    for (const name of ["Subject", "From", "To", "Reply-To"]) {
      expect(headers.match(new RegExp(`^${name}:`, "gm"))).toHaveLength(1);
    }
    expect(headers).not.toMatch(/^Bcc:/im);
  });
});
