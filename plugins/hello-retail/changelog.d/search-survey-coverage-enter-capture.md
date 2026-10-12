### Changed

- `search-developer` and `tile-extractor` now require at least one ordinary top-level category page in the tile survey besides the reference page, and every tile state (normal, sale, variant / "choose", from-price, sold-out) is captured or explicitly recorded as absent; a campaign page where every tile is on sale no longer passes as the only survey page, and non-sale tiles are compared element-by-element so empty placeholder lines the shop keeps are kept too.
- `search-developer` now checks the theme's own scripts for an Enter handler on the search input and adds a capture-phase Enter interceptor when the shop navigates on `keydown`/`keypress` without a form submit; Enter is verified three ways (paced typing, instant fill, magnifier click) before the push.
