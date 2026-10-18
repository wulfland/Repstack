#!/usr/bin/env bash
# PreToolUse hook (Bash): remember when this Bash call started so the
# PostToolUse formatter can find the files the command wrote.
set -u
command -v jq >/dev/null 2>&1 || PATH="/opt/homebrew/bin:$PATH"

input=$(cat)
session=$(printf '%s' "$input" | jq -r '.session_id // "default"')
marker="${TMPDIR:-/tmp}/repstack-bash-${session}.marker"
touch "$marker" 2>/dev/null
exit 0
