### Fixed

- `pages-api` no longer tells you to send `firstLoad: false` on a request that changes filters; it
  stays `true` so the filter panel's counts refresh, and only pagination or re-sorting sends `false`.
- `pages-api` examples now always request `trackingCode`, so tiles built from them can be
  click-tracked.
- `recommendations-api` now points to the MCP tools for reading and changing a Managed box's
  algorithm and filters, instead of saying this can only be done in the dashboard.
- `cart-tracking-api` and `conversion-tracking-api` now agree that both endpoints store nothing for
  an opted-out shopper, and the link between them works.
