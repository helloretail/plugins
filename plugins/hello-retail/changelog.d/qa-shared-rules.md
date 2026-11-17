### Changed

- `search-qa`, `recom-qa` and `pages-qa` now keep the multi-domain rules in one shared file that
  is read only when a run covers more than one domain, so single-domain runs read less. The rule
  to build each domain's report from its own MCP output now applies to `recom-qa` too.
- `qa-checklists` reads the "copy of another domain" procedure only when the build is a copy,
  instead of on every run.
