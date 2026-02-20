# CLI + Skills Mirroring and Release

This repo remains the source of truth.
External users consume:
- Single mirror repo (for CLI source, skills, and release tags)
- npm package `orizu`

## Workflows

- `.github/workflows/validate-skills.yml`
  - Validates each folder under `skills/` has a valid `SKILL.md` frontmatter.
- `.github/workflows/sync-cli-and-skills.yml`
  - Mirrors `packages/cli`, `skills`, and CLI docs to one mirror repo `main`.
- `.github/workflows/publish-cli.yml`
  - Triggered by tags matching `cli-vX.Y.Z` (or manual dispatch).
  - Verifies `packages/cli/package.json` version matches tag.
  - Builds and publishes `packages/cli` to npm.
  - Pushes `vX.Y.Z` tag to mirror repo.

## Required Repository Secrets

Set these in this source repo:
- `MIRROR_PUSH_TOKEN`: PAT with push access to mirror repo.
- `MIRROR_REPO`: `<owner>/<repo>` for mirror (example: `your-org/orizu-cli`).
- `NPM_TOKEN`: npm automation token for publishing `orizu`.

## Release Process

1. Bump `packages/cli/package.json` version.
2. Merge to `main` (auto-sync mirrors runs).
3. Create tag:
   ```bash
   git tag cli-v0.0.2
   git push origin cli-v0.0.2
   ```
4. `publish-cli.yml` publishes npm and pushes `v0.0.2` to CLI mirror.

## External Consumption

- CLI:
  ```bash
  npx orizu --help
  ```
- Skills:
  ```bash
  npx skills add <owner>/<mirror-repo>
  ```
