import { render, screen } from "@testing-library/react";
import { cookies } from "next/headers";
import { describe, expect, it, vi } from "vitest";

import ContactSentPage, { metadata } from "./page";

vi.mock("next/headers", () => ({ cookies: vi.fn() }));
vi.mock("../actions", () => ({ clearSentCookie: vi.fn() }));

const withCookie = (present: boolean) => {
  vi.mocked(cookies).mockResolvedValue({ has: () => present } as unknown as Awaited<
    ReturnType<typeof cookies>
  >);
};

describe("/contact/sent (spec 0007, AC-10)", () => {
  it("redirects to /contact without the cookie", async () => {
    withCookie(false);
    await expect(ContactSentPage()).rejects.toMatchObject({
      digest: expect.stringMatching(/^NEXT_REDIRECT;replace;\/contact;/) as unknown,
    });
  });

  it("thanks the visitor and links Home and Work with the cookie", async () => {
    withCookie(true);
    render(await ContactSentPage());
    expect(
      screen.getByRole("heading", { level: 1, name: "Thanks, your message is on its way" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Back to Home" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "See the work" })).toHaveAttribute("href", "/work");
  });

  it("is noindex", () => {
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
