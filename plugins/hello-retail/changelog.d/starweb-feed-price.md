### Added

- `hello-retail-knowledge` now covers Starweb product feeds: `price` comes from `activePriceExVat` (the price in force, including scheduled prices) instead of `specialPriceIncVat`, with a ready V2 helper and the V1 selector.

### Changed

- `feed-setup` maps `price` on Starweb feeds from `activePriceExVat`, so scheduled prices show up correctly.
- `feed-migration` moves Starweb V1 price lines that read only `specialPriceIncVat` to `activePriceExVat`, and says so in its summary.
