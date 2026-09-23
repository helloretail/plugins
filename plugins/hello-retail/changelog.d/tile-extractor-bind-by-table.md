### Added

- `tile-extractor` builds the Liquid by substitution instead of hand-editing the copied HTML. It diffs two normal tiles and the sale, sold-out and badge tiles to find which values are dynamic and which markup is a state branch, emits a tokenised skeleton, and a bundled script fills in the mapping table and refuses to produce a template while a token is unbound or an element was added or removed. The table is returned as a new BINDINGS section.

### Changed

- `tile-extractor` running in the background may now write its working files to the session scratch folder; it still writes nothing into the repository or the plugin.
