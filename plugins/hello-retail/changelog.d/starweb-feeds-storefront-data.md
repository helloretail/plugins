### Added

- `hello-retail-knowledge` now covers Starweb product feeds: `price` comes from `activePriceExVat` (the price in force, including scheduled prices) instead of `specialPriceIncVat`, with a ready V2 helper and the V1 selector.
- `hello-retail-knowledge` now explains how to show Starweb product labels and boost variants on Hello Retail tiles, which the feed doesn't carry, with a script that fetches them from the shop for Search, Recommendations and Pages.

### Changed

- `feed-setup` maps `price` on Starweb feeds from `activePriceExVat`, so scheduled prices show up correctly.
- `feed-migration` moves Starweb V1 price lines that read only `specialPriceIncVat` to `activePriceExVat`, and says so in its summary.
- `tile-extractor` no longer reports Starweb labels as missing feed data. It checks which of Starweb's storefront endpoints the shop has, and hands over only the matching labels and boost-variant code for the surface being built.
