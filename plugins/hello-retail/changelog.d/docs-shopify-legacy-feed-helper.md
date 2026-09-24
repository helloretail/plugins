### Added

- `feed-setup`'s Shopify reference now covers the legacy feed helper (`shopify/products.py`, no
  `V2/`): how to recognise it, its payload shape, and its `<namespace>_<key>` metafield keys.
  It also says plainly that new feeds are set up only on V2.
- The search relevance wiki page explains how to make a value searchable. Only the fields in
  `availableStepFields` can be weighted, and `extraData` is not one of them, so values like
  MPNs, EANs and variant SKUs go into `keywords` through the feed.

### Changed

- `support-debugging`'s capability matrix says how to test a search query: send it to
  `serve/search` from the storefront page. Replaying `partnerSearch` returns only the design
  shell, and a shop's `/search` page may not be Hello Retail's.
