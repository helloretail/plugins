### Added

- `plugin-feedback` sends the plugin team a short gap report — who hit it, the customer, what they were trying to do, what failed and what to add to the MCP or skill — with one API call in the background, no browser. Where it cannot send (Claude chat, Cowork), it shows the title, the description and a link to the feedback form, so the operator can add it by hand.
- The plugin now offers `plugin-feedback` by itself at the end of a task when a Hello Retail tool fails or a step has no tool or skill, at most once per session. This automatic offer works in Claude Code only.
