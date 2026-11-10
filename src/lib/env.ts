import { z } from "zod";

const appEnvSchema = z.enum(["production", "preview"]);

export type AppEnv = z.infer<typeof appEnvSchema>;

type EnvSource = Readonly<Record<string, string | undefined>>;

/**
 * Resolves the environment from build variables:
 *
 * 1. `APP_ENV` when it is set (`production` or `preview`).
 * 2. Otherwise `production` when Workers Builds is building `main` (`WORKERS_CI_BRANCH`).
 * 3. Otherwise `preview` (local dev, CI and preview branches).
 *
 * `next.config.ts` calls this once per build and bakes the result into the
 * bundle through the Next.js `env` config, because preview versions share
 * production's runtime vars (spec 0001).
 */
export function resolveAppEnv(env: EnvSource): AppEnv {
  const explicit = env.APP_ENV?.trim();
  if (!explicit) return env.WORKERS_CI_BRANCH === "main" ? "production" : "preview";

  const parsed = appEnvSchema.safeParse(explicit);
  if (!parsed.success) {
    throw new Error(
      `APP_ENV is "${explicit}", which isn't a known environment. Use "production" or "preview", or leave it unset.`,
    );
  }
  return parsed.data;
}

/**
 * Production or preview for this build. The only place code should read it from.
 *
 * Inside Next.js `process.env.APP_ENV` is the value `next.config.ts` baked in at
 * build time. Outside Next.js (the `content:check` script, tests) nothing is
 * baked in, so the same rules are resolved from the real environment.
 */
export function getAppEnv(): AppEnv {
  return resolveAppEnv({
    APP_ENV: process.env.APP_ENV,
    WORKERS_CI_BRANCH: process.env.WORKERS_CI_BRANCH,
  });
}
