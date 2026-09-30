### Fixed

- `search-developer` no longer tells a desktop-embedded build to set `header_logo_url` / `webshop_name` — the embedded design has no header bar and declares neither token. Branding is now limited to the tokens the design actually declares, and the page-background match applies to embedded too, since its panel carries its own background.

### Changed

- `search-developer` isolates the config under test in the on-site widget before the storefront survey, not only at verification, so a LIVE sibling's overlay can no longer be mistaken for the theme's own search. A new `isolate-from-siblings` intake flag, inferred when the operator asks to keep off the existing searches, skips the sibling "same or different?" offer and any read of a sibling's design.
