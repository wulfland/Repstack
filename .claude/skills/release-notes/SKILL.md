---
name: release-notes
description: Draft Repstack release notes from merged pull requests, in the house format. Use when asked for release notes, a changelog, or "what shipped since".
---

# Release notes

Write release notes the way Repstack writes them: for the person who trains
with the app, not for the person who wrote the code. Work from git and GitHub
metadata only. Do not read source files; this must finish in under 30 seconds.

## Steps

1. **Range.** `$ARGUMENTS` may name a ref ("v0.4.0", "abc123") or a count
   ("last 15"). Otherwise use everything since the latest tag
   (`git describe --tags --abbrev=0`), and if there is no tag, the last
   10 merged PRs.
2. **Collect.** One call:
   `command gh pr list --state merged --base main --limit 30 --json number,title,labels,mergedAt,headRefName`
   If `gh` is unavailable, fall back to
   `git log --first-parent --merges --format='%h %ad %s' --date=short main`
   and take the PR number and branch from "Merge pull request #N from
   owner/branch". Skip "Merge branch 'main' into …" entries.
3. **Classify** each PR into exactly one section:
   - **Added** – something the user can do now that they could not before
   - **Fixed** – a bug a user could have hit
   - **Changed** – behaviour that existed and is now different
   - **Internal** – dependencies, CI, docs, tests, refactors, README
4. **Write** in the format below and print it to the conversation. Do not
   create or edit a file unless the user asks for one.

## Format

```markdown
## Repstack <version | Unreleased> — <YYYY-MM-DD>

### Added
- Copy a finished workout as Markdown from the workout detail view. (#91)

### Fixed
- Exercise selection no longer loses the chosen exercise on slow devices. (#87)

### Changed
- …

### Internal
- 6 dependency updates, 1 CI fix, README refresh.
```

## House rules

- One line per PR, present tense, max 14 words, ends with `(#N)`.
- Say what the user can do, not what the code does. "Add `useFoo` hook" is
  wrong; "Rest timer keeps running when the screen locks" is right.
- No branch names, no author names, no "this PR", no "we".
- Dependabot and CI PRs are counted in one Internal line, never itemised.
- Omit empty sections.
- If a title is too vague to classify, put it under Changed and mark it
  `(check #N)` so the maintainer can decide.
