### Added

- `search-developer`, `recom-developer` and `pages-developer` follow house rules for the CSS they write: extend a rule that already exists instead of adding a second one for the same selector, and never re-declare a value that already holds.

### Changed

- `search-developer`, `recom-developer` and `pages-developer` no longer park overrides at the end of the stylesheet. A new rule goes in the section that already styles that element, so everything about the tile, the header or the filters stays in one place. Base rules still may not be edited, reordered or moved to make room.
- `search-developer`, `recom-developer`, `pages-developer`, `newsletter-developer`, `triggered-email-developer` and `feed-setup` keep the comments they add to one short line ("doing X because Y"), and only where the code isn't obvious. No more paragraphs explaining what the code already says.
