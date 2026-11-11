#!/usr/bin/env bash
# Tells the model when to offer the plugin-feedback skill.
#   SessionStart       -> one standing rule for the session.
#   PostToolUseFailure -> on the first failed Hello Retail tool or skill call of the session,
#                         a reminder to offer feedback at the end of the task if the failure
#                         turns out to be a plugin gap.
# Reads the hook JSON on stdin; prints hook JSON on stdout; never blocks anything.
set -euo pipefail

input=$(cat)

field() {
  printf '%s' "$input" | grep -o "\"$1\"[[:space:]]*:[[:space:]]*\"[^\"]*\"" | head -n1 |
    sed -E 's/.*:[[:space:]]*"([^"]*)"/\1/' || true
}

emit() {
  # $1 = hook event name, $2 = context text (no double quotes or backslashes in it)
  printf '{"hookSpecificOutput":{"hookEventName":"%s","additionalContext":"%s"}}\n' "$1" "$2"
}

event=$(field hook_event_name)

case "$event" in
  SessionStart)
    emit SessionStart "Hello Retail plugin: when Hello Retail work hits a gap in the plugin - a step with no hello-retail MCP tool, a tool that errors or cannot do what the step needs, a task no hello-retail skill covers, or a skill instruction that turned out wrong - finish what you can, then at the end of the task offer once to send feedback with the hello-retail:plugin-feedback skill. Do not offer it for operator typos, MCP authorization, browser login, or problems on the customer's own site."
    ;;
  PostToolUseFailure)
    tool=$(field tool_name)
    # Hello Retail MCP tools (plugin, claude.ai connector or local name), the plugin's
    # browsers, and the Skill tool (a missing skill fails here).
    if ! printf '%s' "$tool" | grep -qE '^Skill$|hello-retail|playwright|__(search|recoms|pages|feeds|productData|productAgents|productIntelligence|website|newsletterContent|retailMedia|dataFields|contentData|orders|apiLog|auditLog|docs)_'; then
      exit 0
    fi
    if printf '%s' "$input" | grep -qE '"is_interrupt"[[:space:]]*:[[:space:]]*true'; then
      exit 0
    fi
    session=$(field session_id | tr -cd 'A-Za-z0-9-')
    marker="${TMPDIR:-/tmp}/hr-feedback-nudge-${session:-nosession}"
    if [ -e "$marker" ]; then
      exit 0
    fi
    : >"$marker" 2>/dev/null || true
    emit PostToolUseFailure "Hello Retail plugin: the call to ${tool} failed. Handle it as the running skill says first (check the inputs, retry once, MCP authorization or browser login). If it still turns out to be a plugin gap - no tool for the step, a tool that cannot do what is needed, a server-side error, or a skill that does not exist - then at the END of the task, not now, offer once to send feedback with the hello-retail:plugin-feedback skill."
    ;;
esac
exit 0
