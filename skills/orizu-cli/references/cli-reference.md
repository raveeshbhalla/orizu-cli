# Orizu CLI Reference

## Command Matrix

### Authentication

```bash
orizu login
orizu whoami
orizu logout
```

### Teams

```bash
orizu teams list
orizu teams create --name "My Team"
orizu teams members list --team my-team
orizu teams members add --email person@example.com --team my-team
orizu teams members remove --email person@example.com --team my-team
orizu teams members role --team my-team --email person@example.com --role admin
```

Allowed roles:
- `admin`
- `member`

### Projects

```bash
orizu projects list
orizu projects list --team my-team
orizu projects create --name "Quality Eval" --team my-team
```

### Apps

```bash
orizu apps list --project my-team/quality-eval
```

Create from file:

```bash
orizu apps create \
  --project my-team/quality-eval \
  --name "Labeling App" \
  --file ./apps/LabelingApp.tsx \
  --input-schema ./schemas/input.json \
  --output-schema ./schemas/output.json
```

Update from file:

```bash
orizu apps update \
  --app <appId> \
  --file ./apps/LabelingApp.v2.tsx \
  --input-schema ./schemas/input.json \
  --output-schema ./schemas/output.json
```

Link dataset:

```bash
orizu apps link-dataset --app <appId> --dataset <datasetId>
```

### Datasets

```bash
orizu datasets upload --file ./data.csv --project my-team/quality-eval --name "Batch 1"
```

Supported file types:
- `.csv`
- `.json` (array of objects)
- `.jsonl` (one object per line)

### Tasks

```bash
orizu tasks list
orizu tasks list --project my-team/quality-eval
```

Create:

```bash
orizu tasks create \
  --project my-team/quality-eval \
  --dataset <datasetId> \
  --app <appId> \
  --title "Round 1 labeling" \
  --instructions "Follow rubric v1" \
  --labels-per-item 2
```

Assign:

```bash
orizu tasks assign --task <taskId> --assignees <userId1,userId2>
```

Status:

```bash
orizu tasks status --task <taskId>
orizu tasks status --task <taskId> --json
```

Export:

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

## End-to-End Flows

### New Team to Export

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

### Interactive-First Shortcuts

```bash
orizu apps list
orizu teams members add --email new-person@example.com
orizu datasets upload --file ./data.csv
orizu tasks export
```

Use these shortcuts only in TTY environments where prompts can run.

## Notes and Limits

- `tasks assign` expects user IDs, not emails.
- Login currently requires callback availability on `127.0.0.1:43123`.
- In non-interactive contexts, pass explicit selection flags.
