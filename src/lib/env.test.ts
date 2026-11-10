import { afterEach, describe, expect, it, vi } from "vitest";

import { getAppEnv, resolveAppEnv } from "./env";

describe("resolveAppEnv", () => {
  it("uses APP_ENV when it is set", () => {
    expect(resolveAppEnv({ APP_ENV: "production" })).toBe("production");
    expect(resolveAppEnv({ APP_ENV: "preview", WORKERS_CI_BRANCH: "main" })).toBe("preview");
  });

  it("is production when Workers Builds builds main", () => {
    expect(resolveAppEnv({ WORKERS_CI_BRANCH: "main" })).toBe("production");
  });

  it("is preview everywhere else", () => {
    expect(resolveAppEnv({})).toBe("preview");
    expect(resolveAppEnv({ WORKERS_CI_BRANCH: "pf-t02" })).toBe("preview");
    expect(resolveAppEnv({ APP_ENV: "  " })).toBe("preview");
  });

  it("rejects an unknown APP_ENV", () => {
    expect(() => resolveAppEnv({ APP_ENV: "staging" })).toThrow(
      'APP_ENV is "staging", which isn\'t a known environment',
    );
  });
});

describe("getAppEnv", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("reads the process environment", () => {
    vi.stubEnv("APP_ENV", "");
    vi.stubEnv("WORKERS_CI_BRANCH", "main");
    expect(getAppEnv()).toBe("production");
  });
});
