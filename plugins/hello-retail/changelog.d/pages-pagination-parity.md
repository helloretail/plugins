### Added

- `pages-developer` restyles the pagination to the shop when the design paginates: it measures the shop's own pagination (or the theme's pagination rules when the shop has none), writes the values scoped to the design's pagination, styles the prev/next arrows like the number buttons and gives all buttons one fixed height. Previously every build shipped the base's blue active page and unstyled, shorter arrow buttons.
- `pages-qa` checks that the pagination matches the shop's style and that the prev/next arrows have the same rendered height as the number buttons.
