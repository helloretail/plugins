### Changed

- `search-developer` builds every Search variant — desktop overlay, desktop embedded and mobile — on the design Hello Retail attaches when the config is created, read back with `search_getDesign`, instead of on a copy kept in the knowledge base. The copy had fallen behind the platform; the attached design is always current.
- `search-developer` asks "overlay or embedded?" together with the scope question in the first round, because the create call now takes it (`desktopDesign`) and attaches the matching design. The website's existing search configs are listed in that same question, so one answer settles scope, type and whether to reuse a config.
- `search-developer` works on the design on disk: the three fields are extracted to files, the tile is spliced in by structure, and the diff against the untouched extract is what the operator approves.
- `search-developer` renames every search config it creates to `Desktop`, `Embedded Desktop` or `Mobile`, so the on-site widget lists "Overlay search - Desktop" instead of a default name that does not say which design the config holds. On later builds it takes that name as a first guess and confirms it against the design itself, asking when the two disagree; configs that already existed are never renamed.
- `search-qa` and `qa-checklists` compare a Search design with the pristine design the MCP attaches when deciding whether a defect is template-level or was introduced by the onboarding.

### Added

- `search-developer` ships `splice-tile.mjs`: it finds the tile slot in any Search design by parsing the Liquid, replaces the default tile with the customer's, mirrors the parent hooks onto the grid containers and the cell, and refuses to write while a token is unbound or the Liquid would end up unbalanced.

### Removed

- The knowledge base no longer keeps copies of any Search template — desktop overlay, embedded or mobile. Create the config with `search_createConfig` (with `desktopDesign` `OVERLAY` or `EMBEDDED` on desktop) and read the attached design instead.
- The Search base template carries no `TILE_BODY` marker comment; it kept ending up in pushed designs. `search-developer` describes the slot in words, and `splice-tile.mjs` finds it.
