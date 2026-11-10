import { describe, expect, it, vi } from "vitest";

import { isRateLimited } from "./rateLimit";

describe("isRateLimited (spec 0007, AC-6)", () => {
  it("keys the limiter by client IP", async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    expect(await isRateLimited({ limit }, "203.0.113.7")).toBe(false);
    expect(limit).toHaveBeenCalledWith({ key: "203.0.113.7" });
  });

  it("is limited when the binding says so", async () => {
    expect(
      await isRateLimited({ limit: vi.fn().mockResolvedValue({ success: false }) }, "1.2.3.4"),
    ).toBe(true);
  });

  it("still limits requests without an IP, under one shared key", async () => {
    const limit = vi.fn().mockResolvedValue({ success: true });
    await isRateLimited({ limit }, null);
    expect(limit).toHaveBeenCalledWith({ key: "unknown" });
  });
});
