import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { config, middleware } from "./middleware";

const visit = (cookie?: string) =>
  middleware(
    new NextRequest("https://toyinog.com/contact/sent", {
      headers: cookie ? { cookie } : {},
    }),
  );

describe("the /contact/sent gate (spec 0007, AC-10)", () => {
  it("runs only on /contact/sent", () => {
    expect(config.matcher).toBe("/contact/sent");
  });

  it("sends visitors without the cookie to /contact", () => {
    const response = visit();
    expect(response.status).toBe(307);
    expect(response.headers.get("location")).toBe("https://toyinog.com/contact");
  });

  it("lets the cookie through once and deletes it on the same response", () => {
    const response = visit("contact_sent=1");
    expect(response.headers.get("location")).toBeNull();
    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("cache-control")).toBe("private, no-store");
    const setCookie = response.headers.get("set-cookie") ?? "";
    expect(setCookie).toMatch(/^contact_sent=;/);
    expect(setCookie).toMatch(/Path=\/contact/);
    expect(setCookie).toMatch(/Max-Age=0/);
    expect(setCookie).toMatch(/Secure/);
    expect(setCookie).toMatch(/HttpOnly/);
  });
});
