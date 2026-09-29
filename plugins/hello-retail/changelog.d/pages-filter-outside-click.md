### Added

- `pages-developer` now appends an outside-click listener to the design JS whenever filters or sorting are configured, so an open filter or sorting dropdown closes when the visitor clicks elsewhere on the page. The base Pages design only closed a dropdown when another heading was clicked.
- `pages-qa` checks that an open filter or sorting dropdown closes on an outside click, and that clicking inside it keeps it open.
