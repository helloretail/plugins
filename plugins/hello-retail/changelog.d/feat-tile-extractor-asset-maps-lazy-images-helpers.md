### Changed

- `tile-extractor` now maps every value of a feed field that picks a picture, icon or badge (for example country flags), instead of a sample, and only reports values the feed truly cannot express as missing data.
- `tile-extractor` loads product images eagerly only in the first row and lazily after that, instead of copying the shop's "load everything now" settings onto every tile of a long search or Pages list.
- `tile-extractor` and `search-developer` now check that theme helper functions called by the tile (such as Hyvä's price-box and wishlist helpers) exist on every page type, and guard or drop them where they do not, so the console stays clean on the homepage, cart and account pages.
