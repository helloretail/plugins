### Added

- `tile-extractor` now checks whether the tile's styling changes by page type, either through theme rules keyed on the product page or through stylesheets the category page loads and other pages do not. It reports the category-page values for the shell to restate.

### Changed

- `search-developer` now opens the search from the homepage, category page, product page and cart after the push, and requires the tile's height, image and badge positions to match on all four.
- `search-developer` compares search texts that already look translated with the QA team's translation sheet. It flags every mismatch in the hand-off instead of trusting the existing value.
