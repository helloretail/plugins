### Added

- `pages-developer` sets up Pages for API use, where the customer's own frontend renders the products. It indexes the fields the caller filters on, configures design filters and sorting to match the storefront, and leaves the page config without product conditions, with no template work.

### Changed

- `pages-developer` establishes the integration mode (client-side, API with HTML, API with JSON) before touching a design, and warns that an INPUT product filter makes its value mandatory, so requests that don't send that field fail.
- `pages-developer` names new designs after the domain alone (`<domain>`, or `<domain> (API)` for API setups), without "Pages", since a Pages design only exists in Pages.
