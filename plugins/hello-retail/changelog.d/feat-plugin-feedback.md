### Added

- `plugin-feedback` sends the plugin team a short gap report — who hit it, the customer, what they were trying to do, what failed and what to add to the MCP or skill — with one API call in the background, no browser. It runs from Bash or, on Windows without Git Bash, PowerShell; in Claude chat, where sending may be blocked, it shows the report to copy instead.
- The plugin now offers `plugin-feedback` by itself at the end of a task when a Hello Retail tool fails or a step has no tool or skill, at most once per session. This automatic offer works in Claude Code only.
