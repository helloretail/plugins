### Added

- `search-qa` and `recom-qa` now show offer end dates, countdowns and "New" labels in every time state on screen, by moving the test browser's clock forward, instead of passing them from the code.
- `recom-qa` now opens one category of each product type and checks that the category box shows products from that category, comparing the box's category filter with the feed's own category values.
- `search-qa` and `recom-qa` now redo a check the same way on every domain of a multi-domain run when one domain tested it more thoroughly.
- `search-qa` and `recom-qa` now report a box or element that the card, an earlier manual QA or a sibling domain expects but that is missing, and grade checks on something absent as N/A instead of PASS.

### Changed

- `search-qa` and `recom-qa` now test issues the card already tracks as known and report them as still broken or fixed, instead of carrying them over untested.
- `search-qa` and `recom-qa` now measure visual details the card orders (bold, alignment, size, colour) and quote the measured value in the verdict.
