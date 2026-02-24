# Orizu CLI Guide

This document explains how to use the `orizu` CLI end-to-end.

## What The CLI Covers

The CLI supports:

- Authentication (`login`, `logout`, `whoami`)
- Team management (list/create, members list/add/remove/role)
- Project management (list/create)
- App management (list/create/update/link dataset)
- Task management (list/create/assign/status/export)
- Dataset upload (`csv`, `json`, `jsonl`)

## Prerequisites

- Node.js 20+
- Running Orizu web app/API (default: `https://orizu.ai`)
- Valid Orizu account

Optional environment variable:

- `ORIZU_BASE_URL` (example: `https://your-orizu-domain.com`)

If not set, CLI uses `https://orizu.ai`.

Override examples:

```bash
# local development
ORIZU_BASE_URL=http://localhost:3000 orizu login

# preview branch / ephemeral deploy
ORIZU_BASE_URL=https://<preview-domain> orizu login
```

## Install / Build

From this repository:

```bash
bun install
bun x tsc -p packages/cli/tsconfig.json
node packages/cli/dist/index.js --help
```

If installed globally as `orizu`, you can run commands directly.  
From source, use:

```bash
node packages/cli/dist/index.js <command> ...
```

## Authentication

### Login

```bash
orizu login
```

What happens:

1. CLI starts a localhost callback server on `127.0.0.1:43123`.
2. CLI opens browser for approval.
3. After approval, CLI exchanges auth code for tokens.
4. Credentials are stored at:
   - `~/.config/orizu/credentials.json`

### Who Am I

```bash
orizu whoami
```

### Logout

```bash
orizu logout
```

## Command Reference

## Teams

### List teams

```bash
orizu teams list
```

### Create team

```bash
orizu teams create --name "My Team"
```

Interactive fallback:
- If `--name` is omitted in a TTY, CLI prompts for team name.

### List team members

```bash
orizu teams members list --team my-team
```

Interactive fallback:
- If `--team` is omitted, CLI prompts for team selection.

### Add team member

```bash
orizu teams members add --email person@example.com --team my-team
```

Interactive fallback:
- If `--team` is omitted, CLI prompts for team.

Behavior:
- If user does not exist yet, invite flow is used (user creation + invitation email + membership).

### Remove team member

```bash
orizu teams members remove --email person@example.com --team my-team
```

Interactive fallback:
- If `--team` is omitted, CLI prompts for team.

### Change member role

```bash
orizu teams members role --team my-team --email person@example.com --role admin
```

Allowed roles:
- `admin`
- `member`

## Projects

### List projects

```bash
orizu projects list
orizu projects list --team my-team
```

### Create project

```bash
orizu projects create --name "Quality Eval" --team my-team
```

Interactive fallback:
- If `--team` is omitted, CLI prompts for team.

## Apps

### List apps

```bash
orizu apps list --project my-team/quality-eval
```

Interactive fallback:
- If `--project` is omitted, CLI prompts for team then project.

### Create app from file

```bash
orizu apps create \
  --project my-team/quality-eval \
  --name "Labeling App" \
  --file ./apps/LabelingApp.tsx \
  --input-schema ./schemas/input.json \
  --output-schema ./schemas/output.json
```

Optional:
- `--component <ComponentName>`

Requirements:
- Source file must pass component contract validation.
- `input-schema` and `output-schema` are required JSON object files.

### Update app from file (new version)

```bash
orizu apps update \
  --app <appId> \
  --file ./apps/LabelingApp.v2.tsx \
  --input-schema ./schemas/input.json \
  --output-schema ./schemas/output.json
```

Optional:
- `--project my-team/quality-eval`
- `--component <ComponentName>`

Interactive fallback:
- If `--app` is omitted, CLI prompts for app selection.

### Link dataset to app version (for preview/data-backed behavior)

```bash
orizu apps link-dataset --app <appId> --dataset <datasetId>
```

Optional:
- `--version <n>` (defaults to latest app version)
- `--project my-team/quality-eval` (used when selecting app interactively)

Interactive fallback:
- If `--app` is omitted, CLI prompts for app selection.

## Datasets

### Upload dataset

```bash
orizu datasets upload --file ./data.csv --project my-team/quality-eval --name "Batch 1"
```

Supported file types:
- `.csv`
- `.json` (array of objects)
- `.jsonl` (one object per line)

Interactive fallback:
- If `--project` is omitted, CLI prompts for team then project.

Output:
- dataset id
- row count
- dataset URL

## Tasks

### List tasks

```bash
orizu tasks list
orizu tasks list --project my-team/quality-eval
```

### Create task

```bash
orizu tasks create \
  --project my-team/quality-eval \
  --dataset <datasetId> \
  --app <appId> \
  --title "Round 1 labeling" \
  --instructions "Follow rubric v1" \
  --labels-per-item 2
```

### Assign task

```bash
orizu tasks assign --task <taskId> --assignees <userId1,userId2>
```

Note:
- `--assignees` currently expects user IDs (comma-separated), not emails.

### Task status

```bash
orizu tasks status --task <taskId>
orizu tasks status --task <taskId> --json
```

Includes:
- task metadata
- progress counts
- per-assignee breakdown

### Export task outputs

```bash
orizu tasks export --task <taskId> --format jsonl --out ./labels.jsonl
```

Formats:
- `csv`
- `json`
- `jsonl`

Defaults:
- format defaults to `jsonl`
- output file defaults to `<taskId>.<format>`
- if `--task` omitted, CLI prompts interactively

## End-to-End Examples

### Example 1: New Team -> Project -> App -> Dataset -> Task

```bash
orizu login
orizu teams create --name "Ops Eval"
orizu projects create --name "Support QA" --team ops-eval

orizu apps create \
  --project ops-eval/support-qa \
  --name "Support Labeler" \
  --file ./apps/SupportLabeler.tsx \
  --input-schema ./schemas/support-input.json \
  --output-schema ./schemas/support-output.json

orizu datasets upload --project ops-eval/support-qa --file ./datasets/support.jsonl --name "Support Batch 1"

# Link app version to dataset for preview behavior
orizu apps link-dataset --app <appId> --dataset <datasetId>

orizu tasks create \
  --project ops-eval/support-qa \
  --dataset <datasetId> \
  --app <appId> \
  --title "Support QA Round 1" \
  --labels-per-item 2

orizu tasks status --task <taskId>
orizu tasks export --task <taskId> --format csv --out ./support-round1.csv
```

### Example 2: Interactive-first workflow

```bash
orizu apps list
orizu teams members add --email new-person@example.com
orizu datasets upload --file ./data.csv
orizu tasks export
```

The commands above will prompt for team/project/task selection where needed.

## Error Handling Notes

- Missing auth:
  - `Not logged in. Run 'orizu login' first.`
- Non-interactive environments:
  - For required selections, provide explicit flags (team/project/app/task).
- Validation errors:
  - App create/update rejects invalid component contract and invalid schema files.

## Current Limitations

- `tasks assign` accepts assignee user IDs, not emails.
- Login flow currently expects localhost callback availability (`127.0.0.1:43123`).
- CLI package publishing/distribution is separate from this usage doc (examples assume local build or installed binary).
