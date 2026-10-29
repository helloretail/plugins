### Changed

- `search-developer` now clicks every control on the product tile (wishlist, compare, size select, add to cart) in the search overlay and compares its state after each click with the shop's own tile before handing off, so a wishlist heart that never toggles is caught in the build instead of in QA.
- `search-developer` now tests the hardest tiles to fit (longest titles, size dropdowns with many options, price ranges, every badge) at the search overlay's real column width, on desktop and at 375 px, and fixes any tile that grows past its column and overlaps its neighbour.
