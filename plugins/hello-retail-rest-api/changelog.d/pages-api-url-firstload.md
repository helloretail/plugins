### Fixed

- `pages-api` now sets `firstLoad` by whether a request can change the scope of products, not by
  whether it is the page's first request. Applying or removing a filter sends `true`; a sort
  change or going to the next page sends `false`.

### Changed

- `pages-api` now states that the request's `url` can be absolute or relative, and recommends the
  relative path (`/category/snowboards`): it is exactly what Hello Retail requires, while the part
  before it in an absolute URL can be misinterpreted. Its examples now send the relative path.
