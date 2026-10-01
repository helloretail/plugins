### Fixed

- `newsletter-developer` keeps the tile's image and title heights computed from the canvas and the dashboard fields, so changing margin, lines of text or height in the dashboard re-flows the tile instead of overlapping text. It now also renders once with a changed field to prove it.
- `newsletter-developer` avoids a double border: a border inside the tile no longer sits next to the frame the dashboard and campaign already draw around it.
