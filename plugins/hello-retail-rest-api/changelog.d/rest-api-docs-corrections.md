### Fixed

- `recommendations-api` now documents `count` as required on Unmanaged recommendation requests;
  it was listed as optional, which led to requests built without it.
- `pages-api` no longer claims only `url` and `key` can fail a request. It now lists every input
  that returns an HTTP 500: a misspelled `format` or `deviceType`, a malformed `trackingUserId`,
  and a relative `url` without its leading slash.

### Changed

- `cart-tracking-api` no longer treats an HTTP 500 as a server error to report to support. Like
  the other skills, it now says the generic `UNEXPECTED ERROR` body can also mean bad input, so
  check the request first.
