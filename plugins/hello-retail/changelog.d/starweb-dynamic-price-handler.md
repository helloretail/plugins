### Added

- `hello-retail-knowledge` now answers how to show multi-currency and customer-unique prices on Starweb shops with Starweb's `dynamicPriceHandler25`: why to use it over the older default `dynamicPriceHandler`, getting Starweb to activate it, the tile price markup, the SKU feed mapping, where to call it in Search, Recommendations and Pages, and how to report handler rendering bugs to Starweb using the Starweb test shop.

### Changed

- `search-developer`, `recom-developer` and `pages-developer` now ask, on Starweb shops, whether the shop has customer-unique prices, several currencies or other price quirks. A yes builds the tile prices on Starweb's dynamicPriceHandler; a no keeps prices as usual.
- `tile-extractor` flags the same question on Starweb shops when the calling skill hasn't answered it, and builds prices as usual until it is.
