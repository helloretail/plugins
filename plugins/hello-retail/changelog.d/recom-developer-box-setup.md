### Added

- `recom-developer` now sets up the recommendation boxes as well as the design: it creates missing boxes from a best-practice algorithm and sets their name, load order, product count, devices, strategy, hierarchies / urls selector, placement and design, all as drafts after you approve a current → new plan. The hand-off lists the placement div each box needs on the customer's page.

### Changed

- `recom-developer` finds the design to edit from the website's boxes instead of asking for a design key, and asks only when several editable designs are candidates.
- `recom-developer` reads every box on the design before building, and after a push names each box the push turned into a draft.
