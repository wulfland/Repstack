# GitHub Copilot Instructions for Repstack

Read `AGENTS.md` in the repository root first. It is the source of truth for
the stack, commands, file layout, conventions and privacy rules. Training
domain knowledge (volume landmarks, RIR, mesocycles, auto-regulation) is in
`docs/training-model.md`.

The rules below are repeated from `AGENTS.md` because not every Copilot
surface reads it, or they differ for Copilot because it has none of the
Claude Code hooks.

## Before you finish a change

- Run `npm run format`, then `npm run format:check`. Nothing formats your
  edits automatically. Commit only formatted code.
- Run `npm run lint && npm run type-check && npm run test:run` (what CI
  runs). For UI changes also run `npm run test:e2e`.
- Check your diff for keys, tokens and secrets yourself. Nothing blocks
  them for you.

## Never

- Never bump the Dexie schema version in `src/db/index.ts` without an
  upgrade step. Existing users' data depends on it.
- Never write secrets, keys or tokens into the repo.
- Never add usage analytics, tracking or network calls to the free core.
  Future SaaS features may, but only with explicit opt-in consent, off by
  default. Ask before adding the first one.
- Never add a runtime dependency without asking.
- Never ship a user-facing feature without a flag in
  `src/lib/featureFlags.ts` (default `false`).
- Never edit `dist/`, `dev-dist/` or `package-lock.json` by hand.
- Never delete or skip an existing test to make a run pass.
