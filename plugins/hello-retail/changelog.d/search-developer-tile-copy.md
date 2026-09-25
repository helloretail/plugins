### Changed

- `search-developer` replaces the base design's whole default tile element with the customer's copied tile, so no Hello Retail tile markup reaches a pushed design. It also mirrors the tile skill's cell-level hooks onto the result cell, scope classes only.
- `search-developer` verifies the pushed tile by eye next to the shop's own tile on desktop and at phone width. A difference goes back to the tile skill, becomes a mirrored hook, or is a sanctioned shell edit or the theme's own rule restated, never a CSS rule that re-creates the look. The computed-style diff is a diagnostic only, and a blocked stylesheet is fetched to read the rule.
- `search-developer` consumes the tile skill's FIDELITY, BINDINGS and TEXT INPUTS sections, appends a copy of the customer's CSS only on a proven non-global-CSS shop after the operator answered the global-CSS question, and binds Shopify's copied theme form instead of a Hello Retail form.
