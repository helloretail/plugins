---
source: field
verified: 2026-10-02
---

# WooCommerce
WooCommerce is the WordPress ecommerce plugin — very common in EU SMB. Hello Retail supports it via the [WooCommerce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/woocommerce-installation-guide/).

**Common gotchas:**

- **Demo store notice** — when WooCommerce demo mode is on, the `.woocommerce-store-notice.demo_store` bar can collapse/expand and shift the main content. HR's overlay needs to follow — see [../cheat-sheets/search/woocommerce.md](../../cheat-sheets/search/woocommerce.md).
- **Theme variance** — WooCommerce ships with a default product loop, but most customers use third-party themes (Storefront, Astra, GeneratePress, etc.). Confirm template files before placing divs.
- **Cache plugins** — WP Rocket, W3 Total Cache, and similar can defer HR's JS in ways that break it. Exclude `addwish` / `helloretail` from JS deferral.

**Cheat sheets:**

- [cheat-sheets/search/woocommerce.md](../../cheat-sheets/search/woocommerce.md) — demo store notice offset

---

## Endpoints the plugin exposes

| Endpoint | Auth | What it's for |
| --- | --- | --- |
| `/?feed=hello_retail_info` | None | Plugin version, WooCommerce and WordPress versions, and the data points the feed can add: product meta keys and taxonomies |
| `/?feed=hello_retail_feed` | Bearer token | The product feed. Paged with `page` (starts at **0**) and `pageSize`; `last-page-number` on the root element gives the page count |

Both are WordPress front-end URLs, so the shop may redirect them, for example to add a
trailing slash. Follow redirects. On a multilingual shop each language has its own URL, for
example `/en/?feed=hello_retail_feed`.

### What the info endpoint returns

```xml
<info>
  <version>1.2.43</version>
  <woocommerce_version>…</woocommerce_version>
  <wordpress_version>…</wordpress_version>
  <product_meta>
    <meta>total_sales</meta>
    <meta>attribute_pa_color</meta>
    …
  </product_meta>
  <taxonomies>
    <taxonomy>product_cat</taxonomy>
    <taxonomy>product_tag</taxonomy>
    <taxonomy>product_brand</taxonomy>
    …
  </taxonomies>
</info>
```

The meta list also shows which other plugins the shop runs. For example, `wcml_sync_hash`
means WPML / WooCommerce Multilingual, and keys such as `b2bking_…_group_<id>` mean B2BKing
customer-group prices.

### Adding data points with `extraAttributes`

Add meta keys and taxonomies to the feed URL as a comma-separated list:

```
/?feed=hello_retail_feed&extraAttributes=total_sales,product_tag
```

They land on each product under `<meta>` and `<taxonomies>`:

```xml
<meta>
  <key name="total_sales"><value><![CDATA[12]]></value></key>
</meta>
<taxonomies>
  <taxonomy name="product_tag">
    <term><![CDATA[summer]]></term>
    <term><![CDATA[bestseller]]></term>
  </taxonomy>
</taxonomies>
```

- The info endpoint lists these data points from roughly plugin 1.2.23 onwards.
- Meta keys outside the list work as well. `_sku` and `_price` came back although the info
  endpoint does not list them.
- **Unknown or empty keys are left out without an error.** A key missing from every
  product in a sample does not prove the request failed. Count how many products carry it
  over a few hundred before relying on it.
- **On WPML shops, test each language's feed.** The info endpoint at the root URL describes
  the default language. A translation can lack meta values the original has. That is a gap
  in the shop's translated data, which the shop has to fix.

See [plugin info endpoints](../plugin-info-endpoints.md) for when to check these.

---

## Timeline
- 2026-05-21: Page seeded.
- 2026-10-02: Added the endpoint table, the info endpoint's shape and `extraAttributes` behaviour, checked against a live shop on plugin 1.2.43.
