### Added

- `pages-developer` checks the shop for an existing Hello Retail Pages div before the first
  preview, so a test div no longer clashes with the theme's own and shows 0 products.
- `pages-developer` finds CSS from other Hello Retail designs (search, recoms) that reaches the
  Pages grid and filter drawer at 820 and 375 px, and overrides it on the Pages side.

### Changed

- `pages-developer` sorts "newest" / "oldest" on the shop's own product date (e.g.
  `extraData.createdAt`) instead of Hello Retail's import date, so the order matches the shop.
