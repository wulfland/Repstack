# Repstack

Open-source hypertrophy training PWA. React 19, TypeScript strict, Vite.
Local-first: all user data lives in IndexedDB (Dexie). No backend, no
accounts, works offline on iOS, Android and desktop.

This file is the shared source of truth for every coding agent (Claude Code,
GitHub Copilot, others). Tool-specific notes live in `CLAUDE.md` and
`.github/copilot-instructions.md`.

## Run and test

- `npm run dev`: app on http://localhost:5173
- `npm run test:run`: unit tests (Vitest, jsdom, fake-indexeddb)
- `npm run test:e2e`: Playwright against `npm run preview` on :4173
- `npm run lint && npm run type-check && npm run format:check`: what CI runs
- `npm run format`: fix formatting

## Where things live

- `src/components/<feature>/`: UI. One component per file, its CSS beside it.
- `src/hooks/`: React hooks. DB access goes through `useDatabase`.
- `src/lib/`: pure logic. This is what gets unit-tested.
- `src/db/`: Dexie schema (`index.ts`) and CRUD (`service.ts`).
- `src/types/models.ts`: all domain types.
- `e2e/`: Playwright specs and helpers (`skip-onboarding`, `seed-workout`).
- `docs/`: `training-model.md` (domain), `ACCESSIBILITY.md`,
  `OFFLINE_FUNCTIONALITY.md`, `TESTING.md`.

## Conventions

- Logic goes in `src/lib/` as pure functions with a `*.test.ts` next to it.
  Components stay thin and are not unit-tested.
- New user-facing features ship behind a flag in `src/lib/featureFlags.ts`,
  default `false`. Enable locally with `?ff=<flag>` in the URL.
- Reuse before adding: clipboard → `src/lib/clipboard.ts`, toasts →
  `useToast`, dialogs → `components/common/`, input checks and sanitizing →
  `src/lib/validation.ts`.
- No new runtime dependencies without asking. Four is the whole list.
- Write code a newcomer can follow. Comment the why, not the what, and match
  the comment density of the file you are in. Exported `src/lib/` functions
  get a short doc comment.
- Buttons have visible text or an `aria-label`; everything is keyboard
  reachable. WCAG 2.1 AA is a shipped feature, not a backlog item.
- Commit messages: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`, `chore:`,
  optionally scoped (`docs(verify):`).

## Privacy: core vs. SaaS

Repstack has a free open-source core and may later get an optional paid SaaS
layer (cloud sync, advanced analytics, coaching). The rules differ:

- **Core** (everything that exists today): no usage analytics, telemetry,
  tracking or network calls, ever. It works fully offline and the user can
  export and import all of their data.
- **Progress analytics are not usage analytics.** Charts, 1RM, volume and
  PRs computed locally from the user's own data are a core feature.
- **SaaS** (not built yet): may use the network and collect usage analytics,
  but only after explicit opt-in, off by default, and only for users who
  turned that SaaS feature on. Core behaves the same with SaaS off or offline.
- There is no SaaS code yet. Before adding the first piece (or any network
  call or analytics SDK), ask: where it lives, how consent is stored, and how
  it stays out of the core bundle are maintainer decisions.

## Data and security

- User data goes in IndexedDB only. `localStorage` is for per-device UI
  preferences (theme, feature-flag overrides), never for training data.
- Validate and sanitize user input before it is stored (`validation.ts`).
- Must stay fast with 1000+ workouts. Targets: first load under 3 s on 3G,
  interactive under 5 s, small JS bundles.

## Testing

- Unit tests for `src/lib/` logic: training calculations, progression,
  validation.
- Playwright in `e2e/` for critical user paths: onboarding, logging a
  workout, mesocycles, offline, accessibility.
- See `docs/TESTING.md` for details.

## Planning a feature

Ask before writing code:

- Is it core (free) or SaaS (paid)? See the privacy rules above.
- How does it work offline, and where is its data stored?
- Is it sound hypertrophy training? See `docs/training-model.md`.
- Does it work on a phone first, then tablet and desktop?
- Is it accessible, and what are the edge cases and error states?

Write requirements as user stories ("As a …, I want …, so that …") with
acceptance criteria as a checklist. Training features document their
scientific basis in `docs/training-model.md`. User-facing features update
the feature list in `README.md`.

## Incident policy

Production is GitHub Pages at https://wulfland.github.io/Repstack/,
deployed from `main` by `.github/workflows/deploy.yml` and probed every
five minutes by `.github/workflows/health-check.yml`.

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

## Never

- Never bump the Dexie schema version in `src/db/index.ts` without an
  upgrade step. Existing users' data depends on it.
- Never write secrets, keys or tokens into the repo.
- Never add analytics, tracking or network calls to the core. SaaS features
  follow the opt-in rules above.
- Never edit `dist/`, `dev-dist/` or `package-lock.json` by hand.
- Never delete or skip an existing test to make a run pass.
