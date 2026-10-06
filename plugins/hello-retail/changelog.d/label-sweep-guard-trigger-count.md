### Changed

- `tile-extractor` takes every native measurement only from a grid the shop renders itself: tile, variations, labels, CSS, alignment, hover and the fidelity check. A recom box or a Hello Retail Pages grid is no longer read as native, and the skill asks the operator when every category page is Hello Retail-rendered.
- `tile-extractor` needs three native category pages before concluding the shop never shows a label or another tile element.

### Fixed

- `search-developer` counts what the trigger selector matches at desktop and mobile widths and scopes it when a theme reuses the input's id, so a hidden duplicate input is no longer bound as a trigger.
