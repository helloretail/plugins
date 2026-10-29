### Fixed

- `search-developer` now always adds the content-heading rule when it removes the overlay's reset block, so the "Categories" and "Brands" headings line up with "Products" instead of sitting lower once a content feed is configured.

- `search-developer` now translates the three English screen-reader labels the default mobile search builds in its JavaScript (" filters selected" and the two recent-search labels); a new scan lists every such string before the push.

### Changed

- `search-developer` now clicks every control on the product tile (wishlist, compare, size select, add to cart) in the search overlay and compares its state after each click with the shop's own tile before handing off, so a wishlist heart that never toggles is caught in the build instead of in QA.
- `search-developer` recommends 12 initial products for a mobile search in grid layout instead of 10, so the first panel has no single orphan tile at tablet width (three columns).
- `search-developer` now tests the hardest tiles to fit (longest titles, size dropdowns with many options, price ranges, every badge) at the search overlay's real column width, on desktop and at 375 px, and fixes any tile that grows past its column and overlaps its neighbour.
