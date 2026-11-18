### Added

- `search-developer` now takes the page behind an embedded search panel out of the keyboard and screen-reader order while the panel is open, and counts the Tab presses to the close button after every push. A build can no longer be handed off with keyboard focus running through content the panel covers.

### Fixed

- `search-developer` hides the shop's own autocomplete for good on embedded search, so its old suggestions no longer pop up under the search box after the panel closes. It now looks for that autocomplete with every Hello Retail search switched off, and checks again after closing the panel.
