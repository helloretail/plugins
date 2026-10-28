### Fixed

- `recommendations-api` now documents `count` as required on Unmanaged recommendation requests;
  it was listed as optional, which led to requests built without it.
- `pages-api` no longer claims only `url` and `key` can fail a request. It now lists every input
  that returns an HTTP 500: a misspelled `format` or `deviceType`, a malformed `trackingUserId`,
  and a relative `url` without its leading slash.

### Changed

- `pages-api` now explains how to paginate: `products.count` caps how many products a response
  returns, and `products.start` steps through them (`start: 0` then `start: 20` for pages of 20).
  `products.start` is optional and defaults to `0`; it was listed as required.

- `cart-tracking-api` no longer treats an HTTP 500 as a server error to report to support. Like
  the other skills, it now says the generic `UNEXPECTED ERROR` body can also mean bad input, so
  check the request first.
