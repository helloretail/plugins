### Added

- `feed-migration` covers `createProducts`, which no skill mentioned: `false` while a migrated
  transform is still being verified, `true` once the feed is the only source. On a five-site
  migration the switch created 426–621 products per site that the V1 feed had never delivered.
- `feed-migration` says never to leave the V1 and V2 feed ACTIVE on the same website. They
  overwrite each other every run and the product data flips between generations, which makes
  any verification meaningless.
- `feed-setup` warns that commenting fields out of a transform to make a run "safe" is the most
  destructive edit available: `url`, `imgUrl`, `title` and `price` are required, so a reduced
  transform deactivates the whole catalogue. The feed editor is the tool for this.
- `feed-setup` notes that `itemsTotal` is unreliable — it reported 3 for a 7,337-item run — and
  that `nextRunAt` keeps advancing on an INACTIVE feed that will never run on its own.

### Fixed

- `feed-migration` Step 9 told you to check `total` after a run. That is the field that
  misreports; it now points at `itemsAdded` / `itemsUpdated` / `itemsDeleted`.
