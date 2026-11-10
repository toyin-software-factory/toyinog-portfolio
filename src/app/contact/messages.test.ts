import { describe, expect, it } from "vitest";

import { formMessage } from "./messages";

const values = { name: "", email: "", type: "", message: "" };

describe("formMessage (spec 0007)", () => {
  it("uses the spec's wording for each failure", () => {
    expect(formMessage({ status: "turnstile", values }, "me@x.io")).toBe(
      "We couldn't confirm you're human. Please try again.",
    );
    expect(formMessage({ status: "rate_limited", values }, "me@x.io")).toBe(
      "Too many messages in a short time. Please wait a minute and try again.",
    );
    expect(formMessage({ status: "send_failed", values }, "me@x.io")).toBe(
      "Sorry, something went wrong sending your message. Please email me directly at me@x.io.",
    );
  });

  it("has no form level message when idle or for field errors", () => {
    expect(formMessage({ status: "idle" }, "me@x.io")).toBeNull();
    expect(formMessage({ status: "invalid", errors: {}, values }, "me@x.io")).toBeNull();
  });
});
