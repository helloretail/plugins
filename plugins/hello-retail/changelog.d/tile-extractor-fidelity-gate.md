### Added

- `tile-extractor` now checks its own work before handing the tile over: for every surveyed state it renders a preview with the shop's own values, places it beside the shop's tile with the parent hooks applied, screenshots the pair on desktop and at phone width, and judges it by eye. Every difference is classified as a markup deviation to fix, a parent hook to report, or a shell-side rule to report; writing CSS is never an option. The verdicts come back in a new FIDELITY response section.
