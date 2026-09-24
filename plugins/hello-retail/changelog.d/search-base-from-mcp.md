### Changed

- `search-developer` builds embedded and mobile Search on the design Hello Retail attaches when the config is created, read back with `search_getDesign`, instead of on a copy kept in the knowledge base. The copy had fallen behind the platform; the attached design is always current. The desktop overlay still starts from the knowledge base's own files, because the MCP cannot create one.
- `search-developer` works on the design on disk: the three fields are extracted to files, the tile is spliced in by structure, and the diff against the untouched extract is what the operator approves.
- `search-qa` and `qa-checklists` compare a Search design with the pristine design the MCP attaches, or with the overlay files, when deciding whether a defect is template-level or was introduced by the onboarding.

### Added

- `search-developer` ships `splice-tile.mjs`: it finds the tile slot in any Search design by parsing the Liquid, replaces the default tile with the customer's, mirrors the parent hooks onto the grid containers and the cell, and refuses to write while a token is unbound or the Liquid would end up unbalanced. It works the same on a design read from the MCP and on the overlay's files.

### Removed

- The knowledge base no longer keeps copies of the embedded and mobile Search templates. Create the config with `search_createConfig` and read the attached design instead.
