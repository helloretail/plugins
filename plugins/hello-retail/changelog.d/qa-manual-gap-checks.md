### Added

- `search-qa` and `pages-qa` now remove each applied filter one at a time (price filter plus two other filters) and fail when the wrong filter goes or the price filter stays behind; "clear all" working is no longer a pass.
- `search-qa` and `pages-qa` now check that every filter dropdown's arrow flips while the dropdown is open, and that the price slider's min and max labels stay aligned with the slider at tablet width.
- `search-qa` now checks every content-tab item (such as Inspiration) for a missing, broken or non-image file, on every domain.
- `search-qa`, `recom-qa` and `pages-qa` now compare each tile's variants with the product page (same set and order, nothing hidden or swapped), the casing of the VAT, stock and SKU labels, and the CTA text alignment against the shop's own tile.
- `search-qa`, `recom-qa` and `pages-qa` now compare the cart price with the tile price after adding a product, and report a different price basis as an observation for the CSM instead of passing it as the shop's native pattern.
- `search-qa`, `recom-qa` and `pages-qa` now diff the same checks across a customer's sibling domains, check the favicon and page title on every page type visited, and test an issue named in a manual report or card comment two different ways before closing it as not reproduced.

### Changed

- `search-qa` and `pages-qa` now type the price filter's min and max in both orders (Tab between fields) and accept "not reproduced" only after both orders pass.
