### Added

- `pages-developer` restyles the pagination to the shop when the design paginates: it measures the shop's own pagination (or the theme's pagination rules when the shop has none), writes the values scoped to the design's pagination, styles the prev/next arrows like the number buttons and gives all buttons one fixed height. Previously every build shipped the base's blue active page and unstyled, shorter arrow buttons.
- `pages-qa` checks that the pagination matches the shop's style and that the prev/next arrows have the same rendered height as the number buttons.

### Fixed

- `pages-developer` fixes three base pagination bugs on every paginated build: two pages shown as active after the previous-page arrow, the active page ending up one off from the products after two quick clicks, and "next" jumping to the wrong page after a reload.
