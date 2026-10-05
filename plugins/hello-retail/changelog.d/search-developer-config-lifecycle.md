### Changed

- `search-developer` checks the customer's header for a search input before it creates any config; when there is none and embedded was requested, it asks whether to go for overlay (recommended) or embedded anyway, instead of creating an embedded config that has nothing to attach to.
- `search-developer` centers the initial-content heading and its subtitle, and checks on the rendered overlay that the text is centered in the panel.
- `search-developer` keeps the overlay's search bar at the default width when it matches the site header, instead of stretching it across the whole header.
- `tile-extractor` finds a colour-swatch strip that sits beside the product link as a row of thumbnail images, and `search-developer` documents how to build it from the feed's swatch fields with the current colour marked and scroll arrows wired.
