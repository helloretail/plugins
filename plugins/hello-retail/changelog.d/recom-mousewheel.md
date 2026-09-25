### Added

- `recom-developer` checks whether the shop's own sliders scroll with the mouse wheel and, if they do, asks whether to enable the same on the Hello Retail recoms. On a yes it applies the team method: Swiper 11, the `swiper` root class and `mousewheel: true`, mirroring the shop's `forceToAxis` setting.
- `recom-qa` checks that the recom box scrolls with the mouse wheel when the shop's own slider does, and reports a mismatch as a warning for the operator to decide.
