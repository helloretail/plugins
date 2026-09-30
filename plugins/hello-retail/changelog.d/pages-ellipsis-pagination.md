### Added

- `pages-developer` can build numbered pagination with an ellipsis (`1 … 8 9 10 11 12 … 20`) when a shop asks for it: first and last page always shown, a window around the current page, arrows hidden at the ends. An ellipsis never stands in for a single page, and a stale page number in the URL no longer shows every page button in one row.
- `pages-qa` clicks through the ellipsis pagination and checks one active page, correct ellipses, the same window after a reload and a single row at phone width.
