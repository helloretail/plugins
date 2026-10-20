### Changed

- `tile-extractor` records a product state (sale, sold-out, variant) as absent only when the page survey and a feed probe both come back empty, and on WooCommerce it builds the sale branch from the platform's documented markup even when no sale product is live on the survey day. The sale branch is gated on `isOnSale` or the shop's own struck-through price, never on `oldPrice` differing from `price` alone.
- `search-developer` checks the rendered tile against the native tile once per product state after a push, not only the normal tile.
- `search-developer` proves the embedded placement selector on six templates (home, category, product, cart, account, 404) instead of three, defaults to the tag-agnostic `body > header + *` for a body-level header, and re-reads the panel offset on all six after the push.

### Added

- The WooCommerce platform page documents the sale tile markup (`sale` class, `span.onsale`, `del`/`ins`), the feed sale-signal rule and the range-sale gap.
