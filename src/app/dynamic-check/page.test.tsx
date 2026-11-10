import { afterEach, describe, expect, it, vi } from "vitest";

import DynamicCheckPage, { dynamic, metadata } from "./page";

describe("/dynamic-check (spec 0004 AC-12)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("is rendered at request time and kept out of search", () => {
    expect(dynamic).toBe("force-dynamic");
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });

  it("is the 404 page in production", async () => {
    vi.stubEnv("APP_ENV", "production");
    await expect(DynamicCheckPage()).rejects.toThrow();
  });
});
