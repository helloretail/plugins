### Fixed

- `search-qa`, `recom-qa`, `pages-qa`, `retailmedia-qa`, `newsletter-qa`, `qa-checklists`,
  `support-debugging`, `tile-extractor`, `customer-handoff` and the `*-developer` skills now close
  every Playwright browser they opened when the browser work is done, also when the task stops
  midway and for subagent workers. Chrome windows no longer pile up and block a macOS restart.
- `browser-login` closes the login window once the login is confirmed, and the check browser when
  it was run on its own; it never closes the window while you are still logging in.
