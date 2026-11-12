### Changed

- `plugin-feedback` works where it cannot send the report itself, such as Claude chat, Cowork or a session with no shell: it shows the topic and the description as two copy blocks with a link to the feedback form, so the operator can add it by hand. The automatic offer at the end of a task is Claude Code only.
- `plugin-feedback` reports now arrive formatted: bold labels for the reporter, customer and skill, and a bold heading with a blank line before each section (goal, what went wrong, what was tried, suggested fix).
