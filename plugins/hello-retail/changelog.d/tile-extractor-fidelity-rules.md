### Changed

- `tile-extractor` no longer allows anything of Hello Retail inside the tile: no `hr-*` class, no Hello Retail form or wrapper. The customer's card replaces the base design's default tile element, and the only addition is the cart-tracking call on the buy button. Shopify tiles copy the shop's own add-to-cart form; the older Hello Retail form option is retired.
- `tile-extractor` copies badges verbatim again and no longer adds inline padding to them, because the Search shell deletes the overlay reset that made it necessary.
- `tile-extractor` treats shops whose CSS is not global (CSS-in-JS) differently: it proves it with two checks, asks the operator whether the customer can make the CSS global, and only then copies the customer's own rules into the CSS block instead of reconstructing styles.
- `tile-extractor` binds every image candidate, including `<picture>` sources, to the feed image and asks whether the customer can supply sized images when the native tile serves several sizes. It keeps custom elements as they are, normalises the few classes that mean "not loaded yet", and checks the mobile markup, reporting a JavaScript-swapped mobile DOM instead of building a second tile.
- `tile-extractor` copies fixed texts as they appear on the surveyed page. For Recom designs each fixed text becomes a dashboard input, listed under a new TEXT INPUTS response section.

### Removed

- `tile-extractor` no longer accepts `newsletter` as a target surface; newsletter and triggered-email tiles are a separate feature with their own skills.
