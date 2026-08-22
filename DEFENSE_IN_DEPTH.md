# Defense in Depth

Tracking against https://github.com/jaredwray/agentic/blob/main/skills/security/defense-in-depth-nodejs/SKILL.md.

Profile: npm library · public

## 1. Security docs

- [x] `SECURITY.md` present — contact info + "How this repository is secured" summary — PR #71
- [x] `DEFENSE_IN_DEPTH.md` present (this file) — PR #71

## 2. CODEOWNERS and cloud bootstrap

- [x] `.github/CODEOWNERS` covers `/.github/`, `/.cursor/`, `/.devcontainer/`, `/scripts/` with owners the maintainer names — PR #72
- [x] Codespaces and Cursor Cloud Agents bootstrap Aikido Safe Chain via scripts/setup-cloud-environment.sh (--ci shims, frozen lockfile) — PR #72

## 3. Dependencies (pnpm)

- [x] `packageManager: pnpm@11.3+` pinned in `package.json` — verified `pnpm@11.5.3`
- [x] 7-day cooldown: `minimumReleaseAge: 10080`, `minimumReleaseAgeStrict: true`, `minimumReleaseAgeIgnoreMissingTime: false`; no first-party `minimumReleaseAgeExclude` — PR #73
- [x] `trustPolicy: no-downgrade`; no first-party `trustPolicyExclude` — PR #73
- [x] Lifecycle scripts blocked: `strictDepBuilds: true`, `dangerouslyAllowAllBuilds: false`, `allowBuilds: {}` baseline — PR #73 (third-party `allowBuilds` exception: esbuild)
- [x] `blockExoticSubdeps: true` — PR #73
- [x] Lockfile committed; CI installs with `pnpm install --frozen-lockfile` — PR #73
- [x] No `.github/dependabot.yml`; other dependency-update tools (if any) open PRs only — never auto-merge — verified

## 4. GitHub Actions

- [x] `permissions: contents: read` (or `{}` + per-job grants) on every workflow — verified
- [x] No `contents: write` except jobs whose purpose is mutating the repo (GitHub Release, Changesets version PR); generated output is a workflow artifact, never committed back from CI — verified
- [x] Every action pinned to a full commit SHA (`pnpm dlx actions-up`) — PR #74
- [x] Every job installs Socket Firewall (`SocketDev/action` SHA-pinned, `firewall-version` pinned); `pnpm install` / `npm install` run as `sfw pnpm install` / `sfw npm install` — PR #74
- [x] `.github/workflows/check-workflows.yaml` lints workflows with zizmor on every PR — PR #74
- [x] `persist-credentials: false` on checkouts that don't push — PR #74
- [x] No `pull_request_target` on workflows that run untrusted PR code — verified
- [x] Artifact-publishing workflows disable `actions/setup-node` default caching (`package-manager-cache: false`) to prevent cache poisoning — PR #74
- [x] No npm tokens (or other registry credentials) in Actions secrets — verified (maintainer; OIDC stage-only, no npm/registry tokens)

## 5. npm publishing — npm libraries only

- [x] OIDC trusted publishing configured **stage-only** on npmjs.com for the publish workflow — it can stage, never publish live — verified (maintainer)
- [x] `.github/workflows/release.yml` packs then stages with `pnpm stage publish ./packed/*.tgz --no-git-checks` — PR #74
- [x] Maintainer promotes staged versions with 2FA — verified (maintainer)
- [x] Drydock connected — staged releases reviewed before promotion — verified (maintainer)
- [x] No direct publish rights: package requires 2FA and disallows tokens — verified (maintainer)
- [x] `package.json` `repository.url` accurate so provenance maps to this repo — verified `https://github.com/jaredwray/hashery.git`

## 6. Security tooling

- [x] Aikido runs on every build — verified (Aikido Security GitHub app on pull requests)
- [x] Aikido release gate: the release workflow's stage-publish job `needs:` a passing `scan-release` — PR #74
- [x] Socket reviews every PR that changes dependencies — verified (Socket Security GitHub app on pull requests)

## 7. Repository lockdown

- [ ] `lockdown-repo.sh` applied; `--check` with `--required-checks "tests,zizmor"` and `--allowed-actions "codecov/*"` passes (PRs required on the default branch, merges blocked unless required status checks pass, tag ruleset, immutable releases, fork-PR approval (public repos), read-only workflow tokens, Actions allowlist, secret scanning, Dependabot disabled, private vulnerability reporting (public repos)) (PR #75 pending)
- [x] Phishing-resistant 2FA (passkeys / hardware keys) on the GitHub and npm accounts — verified (maintainer)
- [x] Recovery codes stored offline in a password manager — verified (maintainer)
