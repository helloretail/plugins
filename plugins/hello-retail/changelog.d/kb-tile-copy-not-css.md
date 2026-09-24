### Changed

- `search-qa`, `recom-qa` and `pages-qa` now fail a tile that is a Hello Retail skeleton restyled to look like the shop's card, a Hello Retail wrapper or class inside the tile, or a Hello Retail form in place of the shop's own form, even when it looks right.
- `hello-retail-knowledge` answers tile-styling questions from the rewritten "Tile fidelity" page: the copy is the fix, parent hooks restore the theme's reach, shells make only their sanctioned edits, and the computed-style diff is a diagnostic rather than a source of CSS. The Lightspeed parity block and the Shopify option that placed a Hello Retail form inside the tile are retired.
- The Search base templates and the knowledge base say exactly where the customer's tile goes: it replaces the whole default tile element in the else branch of the banner check, with no placeholder or marker to look for. The recom base stylesheet's slot comment now says the slot stays empty.
