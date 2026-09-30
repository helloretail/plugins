### Added

- `pages-developer` can build a "load more" button as a third loading mode: the first page renders, a centred button under the grid appends one page per click with a "shown of total" counter, nothing loads on scroll, and the button disappears on the last page. It reuses the base design's request and reload-restore logic and documents the reload quirk that otherwise makes later clicks load more than one page.
- `pages-qa` checks the load-more mode: no scroll loading, one page per click also after a reload, counter and URL state, no duplicates, block gone at the end.
