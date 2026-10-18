# Incidents

One file per incident, named `YYYY-MM-DD.md` (add `-2` if there is a second
one on the same day). Written while the logs are still fresh, by whoever
remediated, as part of the PR with the permanent fix. The policy that governs
remediation is the "Incident policy" section in `AGENTS.md`.

## Template

```markdown
# Incident YYYY-MM-DD: <one-line title>

| | |
|---|---|
| Detected | YYYY-MM-DD HH:MM UTC by health-check run <link> |
| Resolved | YYYY-MM-DD HH:MM UTC |
| Duration | N min |
| Issue | #NNN |
| Fix PR | #NNN |

## Timeline (UTC)

- HH:MM PR #NNN merged; deploy run <link> green, e2e stage red.
- HH:MM health-check run <link> fails; incident issue #NNN opened.
- HH:MM diagnosis: <one sentence>.
- HH:MM remediation: redeploy of <sha> via deploy run <link>.
- HH:MM health-check run <link> green.

## Root cause

What changed, why it broke production, and why the pipeline let it through.

## Blast radius

Who or what was affected, for how long. (Repstack is local-first: user data
in IndexedDB is unaffected by a broken deploy; only loading the app failed.)

## Remediation

Which allowed action from the incident policy was taken, by whom, with links.

## Permanent fix

What this PR changes and why that prevents a repeat.

## Follow-ups

- [ ] <guard that would have caught this before deploy>
- [ ] <monitoring or process change>
```
