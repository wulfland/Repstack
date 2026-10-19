@AGENTS.md

## Claude Code specifics

The shared rules are in `AGENTS.md` (imported above). This section covers
only what works differently in Claude Code.

- Prettier runs on every edit (`.claude/hooks/format.sh`). Don't fight it,
  don't reformat by hand.
- `.claude/hooks/block-secrets.sh` refuses writes that look like a key or
  token. If it fires, use an env var or a gitignored local config.
- `/verify`: build, start the app, drive the change in a real browser,
  report PASS/FAIL per step. Run it after UI changes and before a PR.
- `/release-notes`: release notes from merged PRs, in the house format.
- Training-domain questions: read `docs/training-model.md` when the task
  touches training logic. It is not loaded by default.
