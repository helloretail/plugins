### Fixed

- `search-developer` now validates the embedded `placement_selector` on the homepage, a category page and a product page, not only the surveyed page, so a content wrapper whose tag changes per template no longer leaves the results panel with no offset on some pages.
- `search-developer` spells out the full TILE FILL rule in the drop-in step (`flex`, `width`, `height` and the native `text-align` together), so a customer tile can no longer ship sized to its own content inside the grid cell.

### Changed

- `search-developer` may add an image `max-width` guard next to the tile-fill rule when the rendered check shows a tile image with an HTML `width` wider than its cell overflowing; it is never added pre-emptively.
