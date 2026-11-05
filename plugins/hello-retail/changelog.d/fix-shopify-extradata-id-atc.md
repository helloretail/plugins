### Added

- `search-qa` and `recom-qa` now fail a Shopify design that sends `variantProductNumbers | first` or
  `| last` as the cart id, since depending on the feed that is the product id or a SKU.

### Changed

- `feed-setup` now maps `extraData.id` to the default variant id in every Shopify feed, so
  add-to-cart and wishlist buttons have a reliable cart id.
- `hello-retail-knowledge` and `tile-extractor` now bind Shopify add-to-cart and wishlist buttons to
  `extraData.id` instead of `variantProductNumbers`, and the Loox rating widget to `productNumber`.
