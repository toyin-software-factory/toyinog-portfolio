/** The part of the Workers Rate Limiting binding this code uses. */
export type RateLimiter = {
  readonly limit: (options: { key: string }) => Promise<{ success: boolean }>;
};

/**
 * True when this client has sent too much (5 per 60 seconds, set in wrangler.jsonc).
 * Keyed by CF-Connecting-IP. Best effort: Cloudflare counts per location (spec 0001).
 */
export async function isRateLimited(limiter: RateLimiter, ip: string | null): Promise<boolean> {
  const { success } = await limiter.limit({ key: ip ?? "unknown" });
  return !success;
}
