## Incident: production health check failed

The scheduled health check for https://wulfland.github.io/Repstack/ failed.
Nobody wrote this task by hand; `health-check.yml` opened it from the
template in `.github/INCIDENT_TASK.md`.

| | |
|---|---|
| Detected | {{DATE}} (UTC) |
| Failing health-check run | {{HEALTH_RUN_URL}} |
| Latest deploy run | {{DEPLOY_RUN_URL}} |
| Deployed commit | {{DEPLOY_SHA}} |
| Last green deploy run | {{LAST_GREEN_RUN_URL}} |
| Last green commit | {{LAST_GREEN_SHA}} |

### Task

Work strictly within the **Incident policy** in `AGENTS.md`.

1. **Diagnose.** Read the logs of the failing health-check run and the latest
   deploy run above. Find the deploy or change that broke production and say
   why it broke it.
2. **Remediate within policy.** Restore service with one of the allowed
   actions: redeploy the last green commit
   (`gh workflow run deploy.yml -f ref=<sha>`), disable a feature flag in
   `src/lib/featureFlags.ts`, or re-run the health check. Do not touch the
   Dexie schema, secrets or repository settings.
3. **Fix permanently.** Open a pull request with the root-cause fix and an
   incident summary at `incidents/{{DATE}}.md` (template in
   `incidents/README.md`), linking the failing runs above. Reference this
   issue in the PR.

Close this issue only after the health check is green again and the PR is
open.
