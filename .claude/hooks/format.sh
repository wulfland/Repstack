#!/usr/bin/env bash
# PostToolUse hook (Edit|Write): run Prettier on the file Claude just touched.
# Prints one line so the formatter is visible in the transcript.
set -u
command -v jq >/dev/null 2>&1 || PATH="/opt/homebrew/bin:$PATH"

input=$(cat)
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')
[ -z "$file" ] && exit 0
[ -f "$file" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0
rel="${file#"$root"/}"

case "$rel" in
  node_modules/*|dist/*|dev-dist/*|package-lock.json) exit 0 ;;
esac

if npx --no-install prettier --write --ignore-unknown "$rel" >/dev/null 2>&1; then
  msg="prettier: formatted $rel"
else
  msg="prettier: could not format $rel"
fi
printf '{"systemMessage": "%s"}\n' "$msg"
exit 0
