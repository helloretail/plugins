### Added

- `feed-migration` now checks XML feeds for identifiers the parser turns into numbers: product
  numbers, EANs and model names that lose a trailing zero. A hit confirmed in the feed editor is
  reported as a blocker, since the transform cannot restore the value.
