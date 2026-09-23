### Changed

- `recom-developer` asks the tile skill for `target surface = recom`, so fixed texts such as "Add to cart" arrive as `{% input %}` blocks that become dashboard fields, and the hand-off lists them for the operator to fill per domain. It consumes the tile skill's FIDELITY section and cell-level hooks, binds Shopify's copied theme form instead of a Hello Retail form, and checks the pushed tile by eye next to the shop's own tile on desktop and at phone width.
- `pages-developer` consumes the tile skill's FIDELITY section and cell-level hooks, keeps the design's own wrapper as the cell, and checks the pushed tile by eye next to the shop's own tile before QA.
