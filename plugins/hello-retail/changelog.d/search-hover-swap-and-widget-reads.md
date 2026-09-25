### Changed

- `search-developer` checks a tile's hover image by comparing where both images render and
  whether the link around them is `display: block`, not only whether the hover image fades in.
  It previously passed a hover image that faded in correctly but sat far below the main image.
- `search-developer` reads price, badge and button text from a tile inside the search overlay,
  never from the HR debug widget's panel — the panel shows preview tiles of other designs, which
  previously produced a false price-format PASS.
- `search-developer` no longer takes `.hr-overlay-search` or `overlay_z_index` in a design as a
  sign that it is an overlay; every variant, including desktop-embedded, uses them.

### Fixed

- `tile-extractor` no longer assumes every DanDomain shop posts add-to-cart to `/kurv/tilfoej/`
  with the product id; newer AngularJS-based themes post to `/actions/cart/add` with the item
  number, so the form's action and id field are now taken from the surveyed page.
