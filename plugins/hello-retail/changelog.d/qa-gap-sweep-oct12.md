### Added

- `qa-checklists` asks the operator at the start of a QA about behaviour that differs per customer and that the ClickUp card leaves open: alphabetical filter options, which variants a tile shows and where a variant click leads, tablet tiles per row, and wheel/trackpad scrolling in recoms. It also accepts items the operator says were waived or shelved.
- `search-qa`, `recom-qa` and `pages-qa` reports now carry a per-viewport verdict table, Known limitations, Customer-side notes, an "Appendix — ruled out" and closing Session notes for the run's own tooling problems. A viewport that wasn't fully tested makes the overall verdict "partial", never PASS.
- `search-qa` opens search from every page type and checks both the shop's search icon and Enter. It also checks that the overlay opens from the shop's search field rather than the centre of the page, and states whether out-of-stock products appear in the results.
- `search-qa`, `recom-qa` and `pages-qa` run a full tablet pass at 1024 and 820 px, add HR-vs-native add-to-cart comparisons at every viewport, and scan every tile for zero or empty prices. They also compare 10 products against the native category page and repeat the check in a private window.
- `search-qa` and `pages-qa` run a filter-panel visual pass with screenshots at every viewport, and `search-qa` clicks at least 10 content-feed links per viewport.
- `recom-qa` surveys every native label type before judging badges, checks that slider arrows reach the end of every box, and triggers every cart and upsell box at every viewport.

### Changed

- `search-qa`, `recom-qa` and `pages-qa` compare tiles only against the native category page, never the product page: sold-out tiles need the same product with paired screenshots (at least 3), and variants are compared on at least 5 products.
- `search-qa`, `recom-qa` and `qa-checklists` accept click tracking only from the network request (`trackClick` / the click-collect call), never from an `#aw_source=` fragment in a link.
- `search-qa`, `recom-qa` and `pages-qa` record cart behaviour after an HR add-to-cart as customer-side notes instead of WARNs. Only an item that isn't added at all is still a FAIL.
- `search-qa` and `pages-qa` make single-filter removal mandatory, also removing chips in a different order and flagging chips that need two clicks. The typed price filter is now tested with Tab and with Enter at every viewport.
- `search-qa` and `pages-qa` no longer grade filter-group order. Filter-option order is graded against the operator's answer instead of assumed alphabetical.
- `search-qa` treats search ignoring typing right after page load, because the shop loads the Hello Retail script late, as a customer-side known limitation rather than the dropped-characters template bug.
- `qa-checklists` lets the page settle and re-reads any count or total before reporting it; a short flash of a wrong count is Low at most.
- `recom-qa` takes the expected wheel/trackpad scrolling from the card or the operator, and always lists a real finger swipe as a manual check.
- `search-qa` and `recom-qa` take a rapid screenshot burst after Back and after removing a filter; any hint of an oversized image is reported as a possible flash for a manual look.

### Removed

- `search-qa`, `recom-qa` and `qa-checklists` no longer report translation strings that exist only in code and never reach the live storefront.
- `qa-checklists` no longer reports cookie or consent banners overlapping Hello Retail elements, or an open dropdown covering the content beneath it.
- `search-qa` and `pages-qa` no longer report the price-filter dropdown closing after a slider drag, and `pages-qa` no longer reports the current category shown in its own filter (Pages default behaviour). A Pages dropdown that doesn't close on an outside click is reported only when the shop's own filters do close that way.
