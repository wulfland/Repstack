# Repstack

Open-source hypertrophy training PWA. React 19, TypeScript strict, Vite.
Local-first: all user data lives in IndexedDB (Dexie). No backend, no
accounts, works offline. Core features stay free and nothing phones home.

## Run and test

- `npm run dev` — app on http://localhost:5173
- `npm run test:run` — unit tests (Vitest, jsdom, fake-indexeddb)
- `npm run test:e2e` — Playwright against `npm run preview` on :4173
- `npm run lint && npm run type-check && npm run format:check` — what CI runs
- `/verify` — build, start the app, drive the change in a real browser,
  report PASS/FAIL per step

## Where things live

- `src/components/<feature>/` — UI. One component per file, its CSS beside it.
- `src/hooks/` — React hooks. DB access goes through `useDatabase`.
- `src/lib/` — pure logic. This is what gets unit-tested.
- `src/db/` — Dexie schema (`index.ts`) and CRUD (`service.ts`).
- `src/types/models.ts` — all domain types.
- `e2e/` — Playwright specs and helpers (`skip-onboarding`, `seed-workout`).

## Conventions

- Logic goes in `src/lib/` as pure functions with a `*.test.ts` next to it.
  Components stay thin and are not unit-tested.
- New user-facing features ship behind a flag in `src/lib/featureFlags.ts`,
  default `false`. Enable locally with `?ff=<flag>` in the URL.
- Reuse before adding: clipboard → `src/lib/clipboard.ts`, toasts →
  `useToast`, dialogs → `components/common/`.
- No new runtime dependencies without asking. Four is the whole list.
- Prettier runs on every edit (hook). Don't fight it, don't reformat by hand.
- Buttons have visible text or an `aria-label`; everything is keyboard
  reachable. WCAG 2.1 AA is a shipped feature, not a backlog item.
- Commit messages: `feat:`, `fix:`, `test:`, `docs:`, `refactor:`.

## Never

- Never bump the Dexie schema version in `src/db/index.ts` without an
  upgrade step. Existing users' data depends on it.
- Never write secrets, keys or tokens into the repo. A hook will block it.
- Never add analytics, tracking or network calls. Privacy is a product promise.
- Never edit `dist/`, `dev-dist/` or `package-lock.json` by hand.
- Never delete or skip an existing test to make a run pass.
