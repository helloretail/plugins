### Added

- `recom-developer` checks whether the shop's own sliders scroll with the mouse wheel and, if they do, asks whether to enable the same on the Hello Retail recoms. On a yes it applies the team method: Swiper 11.2.8, the `swiper` root class and `mousewheel: true`, mirroring the shop's `forceToAxis` setting.
- `recom-qa` checks that the recom box scrolls with the mouse wheel when the shop's own slider does, and reports a mismatch as a warning for the operator to decide.

### Fixed

- `recom-developer` and the base recom template pin Swiper `"11.2.8"`, the Swiper 11 build Hello Retail serves, instead of `"11.2.10"`, which it does not.
