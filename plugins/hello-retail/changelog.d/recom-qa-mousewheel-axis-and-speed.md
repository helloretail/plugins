### Added

- `recom-qa` checks the slide speed and step of a recom box against the shop's own slider — one arrow click or wheel notch should move about as far and as fast on both — and reports a clear difference as a warning for the operator, with both speeds recorded in the report.

### Changed

- `recom-qa` now tests the vertical wheel direction separately when both sliders scroll with the mouse wheel: a Hello Retail box that slides on vertical input while the shop's own slider lets the page scroll past is a FAIL, because the cursor gets trapped inside the box on trackpads.
