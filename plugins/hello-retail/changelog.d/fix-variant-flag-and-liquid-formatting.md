### Added

- `search-qa` and `recom-qa` now fail a variant branch gated on `variantProductNumbers.size` or on
  a `hasVariants` field the feed does not map. They also list Liquid block tags that share a line
  with markup, and any `</img>`, as a NOTE.

### Changed

- `tile-extractor`, `search-developer`, `recom-developer` and `pages-developer` now gate every
  variant decision on `extraData.hasVariants`. When the feed does not map it, they stop and ask
  the operator to map it or name another field, instead of falling back to a list length.
- `tile-extractor`, `search-developer`, `recom-developer` and `pages-developer` now put every Liquid
  block tag on its own line with its body indented, and remove any `</img>`, including in the
  banner branch.
- `feed-setup` now maps `extraData.hasVariants` in every Shopify feed.
