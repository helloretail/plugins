### Changed

- `retailmedia-qa` reads each banner's relevance from the campaign (global, product-based or field-based) and judges placement against it: a banner shows at most once per page, in its relevant box, or in the lowest-load-order recom box when it is global. A banner shown twice on one page is now a FAIL.
- `retailmedia-qa` expects a banner to take the product tile's exact corner radius but never its border, outline or shadow; a mismatch is now a Low finding with the tile's radius as the fix, instead of a note.
