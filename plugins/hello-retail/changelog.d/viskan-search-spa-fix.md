### Added

- `search-developer` now adds the Viskan SPA prelude to every Viskan desktop Search config: it
  clone-replaces the native search triggers and adds the SPA fix that clears a stale scroll lock. On
  mobile it clones a trigger only when Viskan's own search still reacts to it.
- `search-qa` fails a Viskan desktop config that lacks the prelude. It also re-tests the trigger after a
  page change without a reload on SPA storefronts.
- `hello-retail-knowledge` documents the Viskan managed-Search prelude, with the trigger selectors seen
  on Streamline and NG.
