## Incident: production health check failed

The scheduled health check for https://wulfland.github.io/Repstack/ failed.
Nobody wrote this task by hand; `health-check.yml` opened it from the
template in `.github/INCIDENT_TASK.md`.

|                          |                        |
| ------------------------ | ---------------------- |
| Detected                 | {{DATE}} (UTC)         |
| Failing health-check run | {{HEALTH_RUN_URL}}     |
| Latest deploy run        | {{DEPLOY_RUN_URL}}     |
| Deployed commit          | {{DEPLOY_SHA}}         |
| Last green deploy run    | {{LAST_GREEN_RUN_URL}} |
| Last green commit        | {{LAST_GREEN_SHA}}     |
| Automatic rollback       | {{ROLLBACK}}           |

### Task

Work strictly within the **Incident policy** in `AGENTS.md`. The pipeline
already took care of the rollback (see the table). Do not redeploy or
dispatch workflows yourself.

1. **Diagnose.** Read the logs of the failing health-check run and the latest
   deploy run above. Find the deploy or change that broke production and say
   why it broke it.
2. **Check the rollback.** The comments below list every health check that
   failed after this issue was opened. If the rollback ran and later checks
   stop failing, service is restored. If it was skipped, failed, or
   production stays red, say so in the PR so a human can step in. If a
   feature flag caused the break, turn it off (default `false`) in your fix.
   Do not touch the Dexie schema, secrets or repository settings.
3. **Fix permanently.** Open a pull request with the root-cause fix and an
   incident summary at `incidents/{{DATE}}.md` (template in
   `incidents/README.md`), linking the failing runs above and the rollback.
   Reference this issue in the PR.

Merging the fix PR closes this issue. Before it is merged, the health check
must be green again.
