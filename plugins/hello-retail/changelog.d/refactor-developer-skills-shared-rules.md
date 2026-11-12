### Changed

- `tile-extractor`, `search-developer`, `recom-developer`, `pages-developer`, `newsletter-developer` and `triggered-email-developer` take their price rules from one wiki page. The discount percentage is now always guarded on an old price above zero, and what an email tile may copy from the shop's price markup is written down as the one exception.
- `newsletter-developer` and `triggered-email-developer` read the shop's tile with the same inspection steps and one script. The script also reports the old price, a sold-out badge, text casing and whether the buy button shows without hover.
- `search-developer`, `recom-developer` and `pages-developer` read the rules they share — draft writes and the Push question, using `tile-extractor`, the hand-off, surveying a storefront — from one file each, so a rule changed once changes in every skill.
- `search-developer` and `recom-developer` take the add-to-cart rules that are the same on every surface — how the platform is recognised, the real-click check before any cart code, click tracking — from the wiki's add-to-cart page, and keep only what the overlay or the slider adds per platform.
- `newsletter-developer` states each build rule once, in its rendering rules, and its build step lists which rule covers what.
- `search-developer` states each instruction once: its hard rules and self-check name the step or reference that holds the detail instead of repeating it, and its config, filter, content-feed and initial-content steps point to their reference for the detail.
- `recom-developer` asks the foundation question with the same two options as `search-developer`.
- `recom-developer`'s self-check and its box-setup step name the step or reference that holds the detail instead of repeating it.

### Fixed

- `recom-developer` and `triggered-email-developer` no longer say in one place that Claude in Chrome comes before Playwright; Playwright is first everywhere.
- `newsletter-developer` and `triggered-email-developer`: on a tile that is on sale, the inspection no longer reports the old price as the current price or the sale price as the discount badge.
- `newsletter-developer` no longer points to worked-example files that are not part of the plugin.
- `search-developer` and `recom-developer` no longer treat DanDomain, Lightspeed, Viskan, Wikinggruppen or (in Recommendations) BigCommerce as platforms without a documented add-to-cart; they use the platform's wiki page, and report a missing binding only for a platform that has none.
- `search-developer` no longer says Magento's `form_key` is read from `#maincontent`; the Magento page's lookup, which also works on Hyvä, is the one to use.
- `search-developer` no longer says in one rule never to resize the browser for mobile while its survey step uses a real mobile viewport; both now say the same.
- `search-developer` asks for six sets of page-type measurements in the report, matching the six page types it checks, and its pointers to the variant section now name a section that exists.
