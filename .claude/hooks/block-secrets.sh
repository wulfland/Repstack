#!/usr/bin/env bash
# PreToolUse hook (Edit|Write|Bash): refuse to write anything that looks like a
# credential. Returns a JSON deny (shown to the user and the model).
set -u
command -v jq >/dev/null 2>&1 || PATH="/opt/homebrew/bin:$PATH"

input=$(cat)
payload=$(printf '%s' "$input" | jq -r '
  [ .tool_input.content,
    .tool_input.new_string,
    .tool_input.command,
    (.tool_input.edits[]?.new_string) ]
  | map(select(. != null)) | join("\n")')
[ -z "$payload" ] && exit 0

patterns=(
  'sk_(live|test)_[A-Za-z0-9]{8,}'           # Stripe
  'sk-ant-[A-Za-z0-9_-]{20,}'                # Anthropic
  'sk-[A-Za-z0-9]{32,}'                      # OpenAI (classic)
  'ghp_[A-Za-z0-9]{30,}'                     # GitHub PAT
  'github_pat_[A-Za-z0-9_]{20,}'             # GitHub fine-grained PAT
  'AKIA[0-9A-Z]{16}'                         # AWS access key
  'xox[baprs]-[A-Za-z0-9-]{10,}'             # Slack
  'AIza[0-9A-Za-z_-]{35}'                    # Google API key
  '-----BEGIN [A-Z ]*PRIVATE KEY-----'       # PEM
)

for re in "${patterns[@]}"; do
  match=$(printf '%s' "$payload" | grep -oE -e "$re" | head -n1 || true)
  if [ -n "$match" ]; then
    masked="${match:0:8}…"
    reason="BLOCKED: looks like a secret ($masked). Secrets never go into the repo; use an environment variable or a local, gitignored config instead."
    if command -v jq >/dev/null 2>&1; then
      # Documented form: deny via JSON (exit 0); systemMessage is shown to the user.
      jq -n --arg r "$reason" '{
        hookSpecificOutput: {
          hookEventName: "PreToolUse",
          permissionDecision: "deny",
          permissionDecisionReason: $r
        },
        systemMessage: $r
      }'
      exit 0
    fi
    # Fallback without jq: exit 2 blocks and sends stderr to the model.
    printf '%s\n' "$reason" >&2
    exit 2
  fi
done
exit 0
