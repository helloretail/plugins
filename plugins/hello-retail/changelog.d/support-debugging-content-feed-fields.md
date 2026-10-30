### Fixed

- `support-debugging` no longer reaches for indexing toggles when the category, brand or blog
  fields a customer expects are missing entirely from the content fields. It now hands that back
  as a content feed crawl-config fix, and names the expected fields by comparing a working sister
  website of the same company.

### Changed

- `support-debugging` now reads the content feed's change history from the audit log — when it was
  created, activated or its crawl config changed, and by whom — instead of treating content feeds
  as entirely out of reach.
