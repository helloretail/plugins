---
source: field
verified: 2026-10-02
---

# Liquid — General (all template types)
Liquid rules and Hello Retail's custom filters, valid in **every** HR template: Search, Recommendations, Pages, Newsletter Content and Triggered Emails. Liquid that only makes sense for one product stays in [../search/](../search/general.md), [../recoms/](../recoms/general.md) or [../pages/](../pages/general.md).

Full reference for HR's own filters: [Custom Liquid Filters](https://developer.helloretail.com/guides/templates/custom_liquid_filters/) on developer.helloretail.com. **Check that page before hand-building any string logic in Liquid** — HR ships a dedicated filter for several common jobs.

---

### _HR custom Liquid filters — overview_
One line per filter; arguments, defaults and edge cases are on the developer docs page.

| Filter | Does | Example |
| --- | --- | --- |
| `currencySymbol` | ISO 4217 code → symbol (a fixed subset of currencies) | `{{ product.currency \| currencySymbol }}` |
| `jsonParse` | JSON string → object | `{% assign obj = json_string \| jsonParse %}` |
| `num` | Round and format a number: decimals, decimal separator, thousands separator | `{{ product.price \| num: 2, ',', '.' }}` |
| `price` | Format as a price — the website's price format unless one is passed | `{{ product.price \| price }}` |
| `priceWithCurrency` | Price format plus currency symbol | `{{ product.price \| priceWithCurrency: 'DKK' }}` |
| `setUrlParam` | Add or overwrite one query-string parameter on a URL | `{{ product.url \| setUrlParam: 'ref', 'hr' }}` |
| `rawHtml` | Raw, unescaped value of a safe string | `{{ product.title \| rawHtml }}` |

### _Add a parameter to product links — `setUrlParam`_
Use when a customer wants a query parameter on HR-rendered links only — e.g. a flag that makes their mobile app's deep-link handler leave the link to the browser, or a campaign parameter. The product URL in the feed and in API responses stays unchanged; only the rendered `href` changes.

```liquid
<a class="hr-search-overlay-product-link" href="{{ product.url | setUrlParam: 'ref', 'hr' }}">
```

- Appends with `?` or `&` as needed and **overwrites** the parameter if the URL already carries it. Never build the query string by hand with `contains` / `append`.
- Put it on the product links only. Leave banner links (`product.isBanner`) and content links (`ctnt.url`) alone unless the customer asks for them too.
- Every template that renders the link needs it: the desktop **and** mobile search configs, every recommendation design, Pages designs. Recommendation designs are company-scoped, so one design edit reaches every website whose boxes use it.
- An app or headless frontend that reads its own design-less search config (often named "API") is not touched by any template edit — that is what keeps "website links only" changes away from the app.

### _Quotes: Liquid inside an HTML attribute_
Inside a double-quoted attribute, **string arguments to a filter take single quotes**. Double quotes inside the `{{ }}` collide with the attribute's own quotes.

```liquid
{% comment %} Don't {% endcomment %}
<a href="{{ product.url | setUrlParam: "ref", "hr" }}">

{% comment %} Do {% endcomment %}
<a href="{{ product.url | setUrlParam: 'ref', 'hr' }}">
```

This holds for every filter argument written inside an attribute — `remove_first: '…'`, `replace: '…', '…'`, `default: '…'` and so on — not just `setUrlParam`.

---

## Timeline
- 2026-10-02: Created — HR custom-filter overview, `setUrlParam` on product links, attribute quote rule (source: support ticket + developer docs).
