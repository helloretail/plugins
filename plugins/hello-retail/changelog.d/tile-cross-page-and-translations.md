### Added

- `tile-extractor` now checks whether the tile's styling changes by page type, either through theme rules keyed on the product page or through stylesheets the category page loads and other pages do not. It reports the category-page values for the shell to restate.
- `search-developer` and `pages-developer` offer to reuse the tile of a finished recommendation design when one exists, with a new survey of the category page as the default. `tile-extractor` confirms it still matches the category tile, and falls back to a full extraction when it does not.

### Changed

- `search-developer` now opens the search from the homepage, category page, product page and cart after the push, and requires the tile's height, image and badge positions to match on all four.
- `search-developer` compares search texts that already look translated with the QA team's translation sheet. It flags every mismatch in the hand-off instead of trusting the existing value.

### Fixed

- `tile-extractor` and `search-qa` no longer take a tile from one of Hello Retail's own recommendation sliders as the shop's native tile. Those tiles carry the shop's classes and passed the old check.
