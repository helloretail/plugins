### Changed

- `search-api` now specifies that changing the search query clears every applied filter and the
  selected sort, both in the next request and in the UI, so filters chosen for one query never
  silently narrow the next one.
