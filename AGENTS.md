# Agents

- Use `pnpm` instead of `npm` or `npx` for all commands.
- After any changes, run `pnpm build && pnpm test` to verify the build and tests pass.
- Ensure test coverage reaches 100% for any changes.
- Run `pnpm lint` to check formatting and linting via Biome before committing.
- Node.js >= 20 is required.
- Source code is in `src/`, tests are in `test/`.

## Safe Chain

Package installs in this environment go through Aikido Safe Chain shims. Never bypass them:

- Keep `~/.safe-chain/shims` first on `PATH`.
- Do not call unshimmed `npm`, `pnpm`, `npx`, or `pnpx`.
- Do not install packages with `curl | sh` or by pointing at a package manager outside the shim directory.
