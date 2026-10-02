### Changed

- `search-developer` now looks up every visible string in `translations.json` before translating it itself — filter titles, sort labels, content-feed texts and the initial-content title, not only the header texts — and uses the file's wording exactly. The diff before the push now includes a translation table showing where each string came from.
- `search-developer` asks how the initial products grid should look, recommending the shop's own grid (an extra tile per row where the category page has a filter sidebar), and widens the initial panel when the tiles don't fit.
- `search-developer` points out when filter A→Z sorting copied from the other search config also sorts the category and number filters, and asks whether to narrow it.

### Fixed

- `search-developer` keeps the header and its menus above the embedded search on shops whose page is wrapped by a menu plugin, and keeps page badges from showing through the panel.
- `search-developer` moves the embedded search's close button clear of a theme search bar that overlaps it, and hides the skip link that could show as a black bar over the header.
