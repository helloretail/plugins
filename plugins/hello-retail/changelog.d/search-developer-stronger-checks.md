### Added

- `tile-extractor` copies the shop's tile styling that only applies inside the category-page product list (for example `ul.products li.product …`) and rewrites it for the search tile, so the card no longer renders unstyled in the overlay; it also checks the tile on the account page and a 404 page.
- `search-developer` has a parity sweep that compares every product tile in the search overlay with the same product's tile on the shop's category pages, and lists any tile wider than its column; the build runs it over several broad searches instead of checking a handful of tiles.

### Changed

- `tile-extractor` now checks what the whole product card does on hover (a zoom, lift or shadow), not only the elements inside it, and reports it so the search tile can do the same.
- `search-developer` now clicks every control on the product tile (wishlist, compare, size select, add to cart) in the search overlay and compares its state after each click with the shop's own tile before handing off, so a wishlist heart that never toggles is caught in the build instead of in QA.
- `search-developer` recommends 12 initial products for a mobile search in grid layout instead of 10, so the first panel has no single orphan tile at tablet width (three columns).
- `search-developer` now tests the hardest tiles to fit (longest titles, size dropdowns with many options, price ranges, every badge) at the search overlay's real column width, on desktop and at 375 px, and fixes any tile that grows past its column and overlaps its neighbour.
- `search-developer` measures the same search tile from the account page and a 404 page too, not only the homepage, category page, product page and cart.

### Fixed

- `search-developer` now always adds the content-heading rule when it removes the overlay's reset block, so the "Categories" and "Brands" headings line up with "Products" instead of sitting lower once a content feed is configured.
- `search-developer` now translates the three English screen-reader labels the default mobile search builds in its JavaScript (" filters selected" and the two recent-search labels); a new scan lists every such string before the push.
- `search-developer` gives the embedded search panel a fully solid background (matching the page colour) instead of 97 % opacity, so the page's headings and banners no longer show faintly through the results.
- `search-developer` now keeps the desktop filters exactly as wide as the product tiles below them: a fixed column count is applied to the filter row as well, and the filter row of the default embedded design (which sizes each filter to its text) is put on the same grid as the tiles.
