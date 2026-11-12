#!/usr/bin/env bash
# Sends one plugin-feedback report to the plugin team's feedback form with a single HTTPS call.
# No browser. Needs only bash, curl, sed and awk.
#
# Usage:  send-feedback.sh < report.txt
#   The report's first line is "TOPIC: <skill-name> - <title>"; every later line is the body.
# DRY_RUN=1 prints the JSON payload instead of sending it.
# Prints "sent", or "saved to <path>: <reason>" and exits 1 when sending failed.
set -euo pipefail

WORKSPACE_ID="2515745"
FORM_ID="2crt1-44615"
FORM_TOKEN="XOMFWZK3ADDFQ3I7NX"
DEFAULT_API_BASE="https://frontdoor-prod-eu-west-1-3.clickup.com"

report=$(cat)
first_line=$(printf '%s\n' "$report" | head -n1)
topic=$(printf '%s' "$first_line" | sed -E 's/^TOPIC:[[:space:]]*//')
body=$(printf '%s\n' "$report" | tail -n +2 | sed -e '/^[[:space:]]*$/d')

save() {
  dir="output/feedback"
  mkdir -p "$dir"
  path="$dir/$(date +%Y-%m-%d-%H%M%S).md"
  printf '%s\n' "$report" >"$path"
  echo "saved to $path: $1"
  exit 1
}

case "$first_line" in
  TOPIC:*) ;;
  *) save "the first line must start with TOPIC:" ;;
esac
[ -n "$topic" ] || save "the TOPIC line is empty"
[ -n "$body" ] || save "the report has no body"
command -v curl >/dev/null 2>&1 || save "curl is not installed"

# JSON-escape a string: backslash, quote, tab, CR, other control characters; newlines become \n.
json_escape() {
  printf '%s' "$1" |
    sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -e 's/\r//g' |
    tr -d '\000-\010\013\014\016-\037' |
    awk 'BEGIN { ORS = "" } NR > 1 { print "\\n" } { print }'
}

# The form's API host depends on the workspace's shard; ask for it, fall back to the known one.
api_base=$(curl -fsS --max-time 10 "https://id.app.clickup.com/shard/v1/handshake/${WORKSPACE_ID}" 2>/dev/null |
  grep -o '"apiUrlBase":"[^"]*"' | head -n1 | sed -E 's/.*:"([^"]*)"/\1/' || true)
api_base=${api_base:-$DEFAULT_API_BASE}
case "$api_base" in
  https://*.clickup.com) ;;
  *) api_base=$DEFAULT_API_BASE ;;
esac

# Turn the body into rich-text ops the form's editor understands:
#   "Label: value" lines (Reporter, Customer, …) -> bold label, plain value
#   GOAL / WHAT WENT WRONG / WHAT WAS TRIED / SUGGESTED FIX -> a blank line, a bold heading
#   on its own line, then the text below it
#   any other line -> plain text
body_ops() {
  printf '%s\n' "$1" |
    sed -e 's/\\/\\\\/g' -e 's/"/\\"/g' -e 's/\t/\\t/g' -e 's/\r//g' |
    tr -d '\000-\010\013\014\016-\037' |
    awk '
      function op(text, bold) {
        if (bold) printf "%s{\"insert\":\"%s\",\"attributes\":{\"bold\":true}}", sep, text
        else printf "%s{\"insert\":\"%s\"}", sep, text
        sep = ","
      }
      function title(key) {
        if (key == "GOAL") return "What the operator was trying to do"
        if (key == "WHAT WENT WRONG") return "What went wrong"
        if (key == "WHAT WAS TRIED") return "What was tried"
        if (key == "SUGGESTED FIX") return "Suggested fix"
        return ""
      }
      {
        line = $0
        if (match(line, /^[A-Z][A-Za-z ]*:/) && RLENGTH <= 32) {
          key = substr(line, 1, RLENGTH - 1)
          rest = substr(line, RLENGTH + 1)
          sub(/^ +/, "", rest)
          if (title(key) != "") {
            op("\\n", 0)
            op(title(key), 1)
            op("\\n", 0)
            if (rest != "") op(rest "\\n", 0)
            next
          }
          op(key ":", 1)
          op(" " rest "\\n", 0)
          next
        }
        op(line "\\n", 0)
      }'
}

payload=$(printf '{"customFields":[],"timezone":"UTC","assignees":[],"group_assignees":[],"name":"%s","content":{"ops":[%s]}}' \
  "$(json_escape "$topic")" "$(body_ops "$body")")

if [ "${DRY_RUN:-}" = "1" ]; then
  printf '%s\n' "$payload"
  exit 0
fi

url="${api_base}/ui/v3/workspaces/${WORKSPACE_ID}/forms/${FORM_ID}/submit?token=${FORM_TOKEN}"
status=$(printf '%s' "$payload" | curl -sS --max-time 30 -o /dev/null -w '%{http_code}' \
  -X POST "$url" \
  -H 'content-type: application/json' \
  -H 'accept: application/json' \
  -H 'x-csrf: 1' \
  -H "x-workspace-id: ${WORKSPACE_ID}" \
  -H 'origin: https://forms.clickup.com' \
  -H 'referer: https://forms.clickup.com/' \
  --data-binary @- 2>/dev/null || echo "000")

if [ "$status" = "200" ] || [ "$status" = "201" ]; then
  echo "sent"
  exit 0
fi
save "the feedback form answered HTTP $status"
