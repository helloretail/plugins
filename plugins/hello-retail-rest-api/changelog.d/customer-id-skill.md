### Added

- `customer-id` connects a shopper's `trackingUserId` to the shop's own customer id through the REST API, so a logged-in shopper's phone and laptop share one personalization profile without the Hello Retail SDK.
  It covers when to send the call, consent, and the `id` field name, which otherwise fails with an HTTP 500.
