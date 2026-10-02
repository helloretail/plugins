### Added

- `search-developer` has a recipe for filters on one side and the close button on the other side of the mobile search input, and says how it combines with a matched header and a removed logo. It is marked derived until a build renders it.

### Changed

- `search-developer` matches the mobile overlay header with selectors, because the mobile design has none of the desktop header tokens, and resets the side margin that left strips of the panel colour beside a coloured header.

### Fixed

- `search-developer` no longer lets a non-wrapping tile title stretch the grid columns past the screen on mobile or make them uneven on desktop, and its rendered checks now test for overflow at 375px.
