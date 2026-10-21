### Fixed

- `pages-api` no longer ties `params.filters` to the Pages config's product conditions. Any
  field indexed in Data Fields can be used for per-request rules such as the forwarded category
  id; static rules such as "sale products only" ideally go in the product conditions instead.
