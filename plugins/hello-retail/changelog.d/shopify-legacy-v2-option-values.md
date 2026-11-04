### Fixed

- `shopify-legacy-to-v2` reads variant option values by matching the title against the product's option values, so
  sizes like "31 / 34" are no longer cut at the first " / ". The option order uses the same parse.

### Changed

- `shopify-legacy-to-v2` warns never to run the new INACTIVE feed manually (it overwrites live products and deletes
  missing ones) and points to the editor's test instead.
- `shopify-legacy-to-v2` keeps the collections the V2 helper returns, including ones the deprecated legacy helper
  missed, as an agreed exception to the 1:1 port.
