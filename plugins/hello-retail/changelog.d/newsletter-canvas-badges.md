### Changed

- `newsletter-developer` now asks how many tiles sit in a newsletter row and sets the canvas width from it (2 → 298 px, 3 → 198 px, 4 → 147 px).
- `newsletter-developer` reads every badge and label slot the feed fills (for example a second and third badge, or a colour count) instead of only the ones on the first tile it inspects.
- `newsletter-developer` renders a non-sale product, the product with the most badges and one with no variants before saving, and warns that a new design is always created LIVE.

### Fixed

- `newsletter-developer` no longer builds markers with a digit in the name, which the dashboard ignores and which printed as stray text on the tile.
