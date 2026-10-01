### Fixed

- `search-developer` and `recom-qa` now reliably find the QA team's translation for a store: the translation file is keyed by language name (`Danish`, `Swedish`, …) instead of codes, and a table maps every code, domain and `<html lang>` value (`dk`/`da`, `se`/`sv`, `kr`/`ko`, `cn`/`zh`, …) to that name.
