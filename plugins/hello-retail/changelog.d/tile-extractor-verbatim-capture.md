### Changed

- `tile-extractor` now copies the customer's tile as real HTML on Playwright instead of rebuilding it from a list of nodes, so the markup it hands over is byte-faithful. The node walk remains only for the Claude in Chrome fallback.
- `tile-extractor` removes attributes injected by browser extensions and security tools by provenance, using a known list plus anything stamped on nearly every element of the page, and reports what it removed. Attributes the site authored are never touched.
- `tile-extractor` picks the product card as the tile root and drops the customer's grid cell, strips width and position classes from the root because the shell owns the width, and keeps an `<li>` root as an `<li>` with the bullet hidden inline.
