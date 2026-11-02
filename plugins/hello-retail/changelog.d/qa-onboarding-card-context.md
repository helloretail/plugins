### Changed

- `search-qa`, `recom-qa`, `pages-qa`, `retailmedia-qa`, `newsletter-qa` and `qa-checklists` now look for the customer's Onboarding card by customer / brand name when the domain under QA has no card of its own, instead of searching on the domain alone.
- The same skills ask the operator before using context from another domain of the same customer: on a yes they read that onboarding in full, carry over its decisions and declined or waived items, re-verify its open items, and never inherit URLs, logins, feeds, UUIDs or locale. The report's ticket-context line records which sibling was used, or that it was declined.
