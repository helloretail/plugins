### Changed

- `search-qa`, `recom-qa`, `pages-qa`, `retailmedia-qa`, `newsletter-qa` and `qa-checklists` now handle a build that is a copy of another domain: they ask the operator, then read the source domain's onboarding card and earlier QA files to learn why the design is as it is. A source from another customer contributes build facts only, never that customer's decisions, and a behaviour shared with the source is never passed as by-spec unless this domain's own card says so.
