### Changed

- `tile-extractor` reports a PRICE BASIS section: which feed field the visible price binds to (`price` or `priceExVat`), proven against a feed row.
- `search-developer` puts the price filter and the price sort on the field the tile displays, read from that section, instead of always on `price`; a field other than `price` is flagged in the diff and the report.
