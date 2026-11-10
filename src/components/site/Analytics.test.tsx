import { render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getAppEnv } from "@/lib/env";

import { Analytics, BEACON_SRC } from "./Analytics";

vi.mock("@/lib/env", () => ({ getAppEnv: vi.fn() }));
// next/script injects after hydration; a plain <script> shows exactly what it was given.
vi.mock("next/script", () => ({
  default: ({ strategy, ...props }: Record<string, unknown>) => (
    <script data-strategy={String(strategy)} {...props} />
  ),
}));

const DUMMY_TOKEN = "0123456789abcdef0123456789abcdef";

const renderWith = (env: "production" | "preview", token: string | undefined) => {
  vi.mocked(getAppEnv).mockReturnValue(env);
  vi.stubEnv("NEXT_PUBLIC_CF_ANALYTICS_TOKEN", token);
  return render(<Analytics />).container;
};

describe("Analytics (spec 0009)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("renders the beacon once in production with a token (AC-1)", () => {
    const scripts = renderWith("production", DUMMY_TOKEN).querySelectorAll("script");
    expect(scripts).toHaveLength(1);
    const [script] = scripts;
    expect(script).toHaveAttribute("src", BEACON_SRC);
    expect(script).toHaveAttribute("data-strategy", "afterInteractive");
    expect(script).toHaveAttribute("data-cf-beacon", JSON.stringify({ token: DUMMY_TOKEN }));
    expect(script?.defer).toBe(true);
  });

  it("trims the token", () => {
    const script = renderWith("production", `  ${DUMMY_TOKEN}\n`).querySelector("script");
    expect(script).toHaveAttribute("data-cf-beacon", JSON.stringify({ token: DUMMY_TOKEN }));
  });

  it.each([
    ["a preview build, even with a token", "preview", DUMMY_TOKEN],
    ["production without a token", "production", undefined],
    ["production with a blank token", "production", "   "],
  ] as const)("renders nothing in %s (AC-2)", (_case, env, token) => {
    expect(renderWith(env, token).innerHTML).toBe("");
  });
});
