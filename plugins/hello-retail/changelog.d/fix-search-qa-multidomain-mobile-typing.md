### Fixed

- `search-qa` multi-domain runs now build each domain's config list, coverage checklist and report from that domain's own data. Before, a config key or a checklist verdict could be copied over from a sibling storefront.
- `search-qa` now catches mobile search losing the first letters when a shopper types straight after tapping the field, and typing that goes to a hidden field after search is closed and reopened. Both checks run at phone and tablet width; the first is now a standing template issue checked on every run.
