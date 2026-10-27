### Added

- `search-api`, `recommendations-api` and `pages-api` explain how to find every native product
  property and its exact name: send one request without a `fields` array and read them off the
  response.

### Changed

- `troubleshooting-with-hello-retail-mcp` now explains `apiLogTag`, the query-string parameter
  every endpoint accepts for tagging requests so they can be found in the API log with
  `onlyTagged`. `recommendations-api` no longer covers it, because the parameter is not specific
  to Recommendations.

### Fixed

- `click-tracking-api`, `search-api` and `recommendations-api` now say that leaving out the
  `fields` array returns every available property, `trackingCode` included, on every endpoint.
  Previously they said `trackingCode` only came back when listed in `fields`.
- `search-api`, `recommendations-api` and `pages-api` now say that an empty `fields` array returns
  an empty object for every result, so it is not a way to ask for every property.
- `search-api` now states that the zero-result products in `zeroResultContent` always carry every
  available property, whatever `products.fields` lists, and no longer describes their field names
  as different from the requested ones.
- `pages-api` no longer tells you to request `isOnSale` rather than `onSale` in `products.fields`.
- `recommendations-api` and `pages-api` now say, as `search-api` already did, that a property only
  has to be mapped in the ETL for `fields` to return it; Data fields indexing is needed only for
  filtering and sorting.
- `search-api`'s example request now asks for the product image as `imgUrl`; it previously used
  `image`, which is not a product property.
