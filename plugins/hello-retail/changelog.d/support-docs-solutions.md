### Added

- `hello-retail-knowledge` answers "how do I fix X" questions from a solutions section in the knowledge base: the support and developer docs re-cut by symptom, with the likely cause, the fix, how to confirm it and the source article. Some of those articles are out of date, so each answer flags that the fix should be checked against the live configuration first.

### Fixed

- `hello-retail-knowledge` and the Pages snippets now send the clicked product's `trackingCode` as the click-tracking `source`, not the box or page ID, so clicks are attributed to the right module. The snippet that creates a tracking user is a plain GET, as documented.
- `hello-retail-knowledge` now says the product URL is the product's ID in the feed and that `brand` is a native feed field, not an extra field.
- `hello-retail-knowledge` no longer says the Magento 2 extension creates the empty search page — it is a manual CMS page — and lists HeyLoyalty and MailerLite among the ESPs with permission auto-sync.
- `hello-retail-knowledge` no longer calls Klaviyo the only Product Agents channel; agents can also deliver to a webhook.
