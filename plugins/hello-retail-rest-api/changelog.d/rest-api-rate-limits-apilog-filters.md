### Changed

- `search-api`, `recommendations-api`, `pages-api` and the four tracking skills now state that Hello Retail's REST endpoints have no rate limiting to consider, instead of listing rate limits as unknown. `search-api` still warns against excessive requests, such as a search box without debouncing that sends one request per keystroke.
- `view-tracking-api`, `cart-tracking-api`, `conversion-tracking-api`, `customer-id` and `troubleshooting-with-hello-retail-mcp` now name the API log filter for each endpoint (`collect_pageview`, `collect_cart`, `collect_conversion`, `collect_customerid`), so a log check can be narrowed to that endpoint's requests.
