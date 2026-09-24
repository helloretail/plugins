### Changed

- `hello-retail-knowledge` and the skills that read the Viskan platform notes now include `categoryUUID` for Viskan NG shops: the feed maps it, it gets indexed with the `_id` fields, and it is added as a filter. Streamline shops are unchanged.
- `hello-retail-knowledge` describes the Search setup for Viskan shops that call the Search API themselves: a config without a design, the same filters and sorting as Pages, and a category engine when a category feed exists.
