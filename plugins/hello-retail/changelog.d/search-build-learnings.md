### Fixed

- `tile-extractor` now finds badges the shop draws with its stylesheet on an empty element, such
  as an outlet ribbon, and gives each badge class its own branch and feed flag. These were
  treated as part of the product image before, so outlet products got the sale badge.
- `search-developer` now compares which badge each product shows in the overlay with the shop's
  own tile after the first push, so a wrong badge type is caught in the build instead of in QA.
