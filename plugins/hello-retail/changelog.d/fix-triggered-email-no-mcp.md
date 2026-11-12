### Changed

- `triggered-email-developer` now says in its first reply that the Hello Retail MCP has no Triggered Email tools yet, so the operator pastes the designs into the dashboard. It offers to send that gap to the plugin team with `plugin-feedback` in the same question as the design picker.

### Fixed

- `triggered-email-developer` reads its default templates from the plugin itself instead of asking the operator to paste them, which happened in Claude chat.
- `triggered-email-developer` no longer offers to open the My Hello Retail dashboard in a browser to paste a design, including in Claude chat and Cowork where no plugin hook blocks it.
