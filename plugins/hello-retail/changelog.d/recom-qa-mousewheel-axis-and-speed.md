### Added

- `recom-qa` records the slide step and transition speed of a recom box next to the shop's own slider, and treats the one-view-per-step default as intended rather than a defect; it only warns when the shop's own sliders stay on the page or the customer asked for a match.

### Changed

- `recom-qa` names trackpad swipe alongside the mouse wheel in the wheel-scroll check, and tests the vertical direction separately when both sliders scroll with the wheel: a Hello Retail box that slides on vertical input while the shop's own slider lets the page scroll past is a FAIL, because the cursor gets trapped inside the box on trackpads.
