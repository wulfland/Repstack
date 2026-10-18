#!/usr/bin/env bash
# PostToolUse hook (Edit|Write|Bash): run Prettier on the files Claude just
# touched. Prints one line so the formatter is visible in the transcript.
#
# Edit/Write carry the file path in tool_input. Bash does not, so the
# PreToolUse hook mark-bash.sh records when the command started and this
# hook formats every tracked or untracked file that is newer than that mark.
# Without a mark it falls back to all modified and untracked files.
set -u
command -v jq >/dev/null 2>&1 || PATH="/opt/homebrew/bin:$PATH"

input=$(cat)
root="${CLAUDE_PROJECT_DIR:-$(pwd)}"
cd "$root" || exit 0

tool=$(printf '%s' "$input" | jq -r '.tool_name // empty')
file=$(printf '%s' "$input" | jq -r '.tool_input.file_path // empty')

files=()
if [ -n "$file" ]; then
  [ -f "$file" ] && files+=("${file#"$root"/}")
elif [ "$tool" = "Bash" ]; then
  session=$(printf '%s' "$input" | jq -r '.session_id // "default"')
  marker="${TMPDIR:-/tmp}/repstack-bash-${session}.marker"
  while IFS= read -r candidate; do
    [ -f "$candidate" ] || continue
    if [ ! -f "$marker" ] || ! [ "$candidate" -ot "$marker" ]; then
      files+=("$candidate")
    fi
  done < <(git ls-files --modified --others --exclude-standard 2>/dev/null)
  rm -f "$marker" 2>/dev/null
fi

[ "${#files[@]}" -eq 0 ] && exit 0

kept=()
for rel in "${files[@]}"; do
  case "$rel" in
    node_modules/*|dist/*|dev-dist/*|package-lock.json) continue ;;
  esac
  kept+=("$rel")
done
[ "${#kept[@]}" -eq 0 ] && exit 0

# --list-different prints only the files Prettier actually rewrote.
changed=$(npx --no-install prettier --write --list-different --ignore-unknown "${kept[@]}" 2>/dev/null)
status=$?

if [ "$status" -ne 0 ]; then
  msg="prettier: could not format ${kept[*]}"
elif [ -n "$changed" ]; then
  msg="prettier: formatted $(printf '%s' "$changed" | tr '\n' ' ' | sed 's/ $//')"
else
  exit 0
fi
jq -n --arg m "$msg" '{systemMessage: $m}'
exit 0
