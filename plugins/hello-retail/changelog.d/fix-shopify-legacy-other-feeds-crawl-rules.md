### Fixed

- `shopify-legacy-to-v2`: checks the website's other feeds, so a field another feed fills (such as `inStock`) is
  not added to the new transform, and warns that the first V2 run can count every product as in stock.
- `shopify-legacy-to-v2`: three more verified V1 crawl-string rules (`.find("a, b")` order per element, selectors
  on keys the legacy item lacks, `removeMatching("")`) and a note on alphabetical legacy collection order.
