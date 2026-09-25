### Fixed

- `tile-extractor` no longer assumes every DanDomain shop posts add-to-cart to `/kurv/tilfoej/`
  with the product id; newer AngularJS-based themes post to `/actions/cart/add` with the item
  number, so the form's action and id field are now taken from the surveyed page.
