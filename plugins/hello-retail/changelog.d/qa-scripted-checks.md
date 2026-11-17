### Added

- `search-qa` and `recom-qa` measure price text on every HR tile against the shop's own tiles
  with a new price script, and check tracking code and the click and cart requests with a new
  tracking script, so the same site gives the same verdicts on every run.

### Changed

- `recom-qa` now runs the tile style comparison script on recom tiles too, not only `search-qa`
  on the search overlay.
