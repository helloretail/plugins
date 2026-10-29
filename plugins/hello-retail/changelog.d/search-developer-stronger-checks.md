### Changed

- `search-developer` now clicks every control on the product tile (wishlist, compare, size select, add to cart) in the search overlay and compares its state after each click with the shop's own tile before handing off, so a wishlist heart that never toggles is caught in the build instead of in QA.
