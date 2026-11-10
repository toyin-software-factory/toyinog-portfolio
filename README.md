# toyinog-portfolio

Toyin Ogunseinde's portfolio site for toyinog.com, built by the JSM HQ agent team with the [jsmastery-pro/skills](https://github.com/jsmastery-pro/skills) workflow (vendored in `.claude/skills`).

- `ROLE.md`: how the agent team works. HQ loads it into every agent's role.
- `docs/scope/`, `docs/specs/`: what we build and how, written by `/scope` and `/architect`.
- `AGENTS.md` (root and nested) with `CLAUDE.md` pointers: the project's context for AI tools, written by `/audit` once the stack is scaffolded and kept current by `/sync`.

## Contributing

You need Node 26 (`.nvmrc`) and pnpm (the version in `package.json` `packageManager`).

```bash
pnpm install --frozen-lockfile   # install; also sets up the pre-commit hook
pnpm dev                         # dev server (next dev)
pnpm preview                     # OpenNext build + local Workers runtime
pnpm lint && pnpm format:check && pnpm typecheck
pnpm test                        # Vitest
pnpm build:worker                # OpenNext build (what CI and deploys run)
pnpm test:e2e                    # Playwright, desktop + mobile, axe
pnpm cf-typegen                  # regenerate Cloudflare env types
```

On every commit, a pre-commit hook (simple-git-hooks + lint-staged) runs ESLint `--fix` and Prettier on your staged files only. It fixes formatting for you and blocks the commit if ESLint finds an error it can't fix. Typecheck and tests run in CI. If the hook ever goes missing, run `pnpm exec simple-git-hooks` to set it up again.
