### Added

- `retailmedia-qa` runs the pre-handoff QA of Retail Media banners (`/retailmedia-qa [URL] [card]`): a code pass on every banner-hosting design plus a measured rendered pass on desktop, tablet and mobile, including the 404 page, the sidecart and the rule that a page shows the banner in one recom box only. It answers every line of the ClickUp card's banner checklists and never edits campaigns or designs.

### Changed

- `qa-checklists` now hands single-feature Retail Media QA to `retailmedia-qa` instead of running the walk itself.
