# Demo 3: planting and rolling back the break

A recipe for a production break that is real, diagnosable from Actions logs,
and reversible with one command. Used for the CODE Magazine webinar demo
"From alert to deployed fix, no editor". Nothing here is needed to run the
app.

## The break (one line in `vite.config.ts`)

Production is served from `https://wulfland.github.io/Repstack/`. The build
gets its base path from the `BASE_URL` environment variable that
`deploy.yml` sets. Renaming that variable on the Vite side, but not in the
workflow, makes Vite fall back to `/`: the build is green, the deploy is
green, `index.html` is served with HTTP 200, and every `<script>` and
`<link>` in it points at `/assets/...`, which does not exist on
`wulfland.github.io`. The page renders blank.

Change line 6 of `vite.config.ts`

```ts
const base = process.env.BASE_URL || '/';
```

to

```ts
const base = process.env.PUBLIC_BASE_URL || '/';
```

Why this line and not `deploy.yml`: a `workflow_dispatch` run always uses
the workflow file from `main`. If the break lived in `deploy.yml`, the
rollback below would rebuild the old commit with the broken workflow and
produce the same blank page. A break in the checked-out code rolls back
cleanly.

What the pipeline does with it:

| Stage                         | Result | Why                                                    |
| ----------------------------- | ------ | ------------------------------------------------------ |
| CI on the PR (`ci.yml`)       | green  | builds without `BASE_URL`, so `/` was already the base |
| `deploy.yml` build + deploy   | green  | Vite builds fine with base `/`                         |
| `deploy.yml` e2e stage        | red    | assets 404, app never renders                          |
| `health-check.yml` HTTP probe | green  | `index.html` is still served                           |
| `health-check.yml` smoke test | red    | `.status-bar` never appears, JS/CSS 404                |

The deploy log shows `BASE_URL=/Repstack/` being set and the Vite output
listing `dist/assets/...`; `curl https://wulfland.github.io/Repstack/`
shows `src="/assets/index-….js"`. That is the trail the agent follows.

## Plant it as a normal PR (the night before)

Make it look like housekeeping, not sabotage. From a clean `main`:

```bash
git switch -c chore/vite-public-base-url main
sed -i.bak 's/process.env.BASE_URL || /process.env.PUBLIC_BASE_URL || /' vite.config.ts && rm vite.config.ts.bak
git commit -am "chore(build): read base path from PUBLIC_BASE_URL"
git push -u origin chore/vite-public-base-url
gh pr create --title "chore(build): read base path from PUBLIC_BASE_URL" \
  --body "Align the env var name with the Vite \`PUBLIC_*\` convention."
```

Wait for CI (green), approve and merge. The merge triggers `deploy.yml`;
its e2e stage fails, and within five minutes `health-check.yml` fails and
opens the `incident` issue. The same run redeploys the last green commit
and records that in the issue, then assigns Copilot (if
`COPILOT_ASSIGN_TOKEN` is set) to diagnose and fix. Open the Pages URL in a
**private window** to see the blank page: your normal browser may still
show the cached PWA.

Before planting, note the last green commit so the rollback is instant:

```bash
gh run list --workflow deploy.yml --branch main --status success --limit 3 \
  --json headSha,url,createdAt
```

## Roll back

`health-check.yml` rolls back on its own when it opens a new incident. It
runs `gh workflow run deploy.yml -f ref=<last-green-sha>` with the
workflow's token. The agent does not redeploy; it could not dispatch a
workflow from its sandbox anyway. To show a manual rollback instead, set
the repository variable `AUTO_ROLLBACK` to `false` before planting:

```bash
gh variable set AUTO_ROLLBACK --body false
```

By hand (rollback skipped, or after `AUTO_ROLLBACK=false`):

```bash
gh workflow run deploy.yml -f ref=<last-green-sha>
```

Then watch it and confirm:

```bash
gh run watch "$(gh run list --workflow deploy.yml --limit 1 --json databaseId --jq '.[0].databaseId')"
gh workflow run health-check.yml
```

`main` still carries the break after the rollback. The permanent fix is a
PR that either reverts the rename or renames the variable in `deploy.yml`
as well, plus `incidents/<date>.md`. Merging it redeploys `main`, green.

## Reset between pre-run and take

1. Merge (or close) the fix PR so `main` is healthy and deploys green.
2. Close the pre-run `incident` issue; keep its link for the runbook. The
   automatic rollback only runs when a new incident is opened.
3. Re-plant the break with a fresh branch name
   (`chore/vite-public-base-url-2`).
4. After the recording: `gh workflow disable health-check.yml` to stop the
   five-minute schedule, or leave it on if you want the monitoring.
