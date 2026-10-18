# Repstack agent guide

Open-source hypertrophy training PWA (React 19, TypeScript strict, Vite,
Dexie). Local-first, no backend. Conventions, commands and the "never" list
live in `CLAUDE.md`; read it first. Production is GitHub Pages at
https://wulfland.github.io/Repstack/, deployed from `main` by
`.github/workflows/deploy.yml` and probed every five minutes by
`.github/workflows/health-check.yml`.

## Incident policy

When the health check fails, an issue labeled `incident` is opened from
`.github/INCIDENT_TASK.md`. Whoever picks it up, human or agent, works
within this policy. It was decided once, here, not during the incident.

**MAY**

- Redeploy the last green release: `gh workflow run deploy.yml -f ref=<sha>`.
- Disable a feature flag in `src/lib/featureFlags.ts` (default to `false`).
- Re-run the health check: `gh workflow run health-check.yml`.

**MAY NOT** (as remediation, without a reviewed PR)

- Change the Dexie schema in `src/db/`.
- Change secrets, tokens or repository settings.
- Change anything outside `.github/workflows/` and
  `src/lib/featureFlags.ts`.

**MUST**

- Open a PR with the root cause and the permanent fix.
- Add `incidents/<YYYY-MM-DD>.md` (template: `incidents/README.md`) that
  links the failing health-check run and the deploy run that caused it.
- Leave production green: health check passing before the incident closes.
