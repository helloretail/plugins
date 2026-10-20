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

## Sale tile markup

WooCommerce's product loop renders a sale tile with the same three pieces on every theme that
keeps the standard loop (Storefront, Astra, Elementor's products grid, GeneratePress). A tile
template built for a WooCommerce shop carries this branch **even when no product is on sale on
the day of the survey** — scheduled sales start and end on their own, and a tile without the
branch renders the first sale product wrong (seen 2026-10: two surveys found no sale tile, one
appeared the same afternoon).

```html
<li class="product type-product … sale …">
  <a href="…" class="woocommerce-LoopProduct-link woocommerce-loop-product__link">
    <span class="onsale">-15%</span>              <!-- percentage or the theme's word, e.g. "Tilbud!" -->
    <img …>
    <h2 class="woocommerce-loop-product__title">…</h2>
    <span class="price">
      <del aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi>565,00&nbsp;<span class="woocommerce-Price-currencySymbol">kr.</span></bdi></span></del>
      <span class="screen-reader-text">Den oprindelige pris var: 565,00&nbsp;kr..</span>
      <ins aria-hidden="true"><span class="woocommerce-Price-amount amount"><bdi>480,25&nbsp;<span class="woocommerce-Price-currencySymbol">kr.</span></bdi></span></ins>
      <span class="screen-reader-text">Den aktuelle pris er: 480,25&nbsp;kr..</span>
    </span>
  </a>
  …
</li>
```

- The card gets the `sale` class; the badge is `span.onsale` as the first child of the product
  link; the old price sits in `<del>`, the new one in `<ins>`. Themes restyle these three
  selectors (circle vs ribbon, text vs percentage), so copy the shop's computed values for
  `.onsale`, `.price del` and `.price ins` into the design's `resultStyles`, scoped under the
  overlay container — the base theme rules are keyed on `ul.products li.product` and never reach
  the Hello Retail container.
- **Sale signal in the feed.** The WooCommerce feed sets `isOnSale` inconsistently — on one shop
  it was `false` for every product and the single sale product had `price` and `oldPrice`
  inverted. When the feed carries the rendered price (`extraData.priceHtml`), gate the branch on
  `priceHtml contains "<del"`; otherwise on `isOnSale`. Never on `oldPrice != price` alone — tier
  and range prices make those two differ on products that are not on sale.
- **Range sales.** A variable product whose sale is on one variant shows `.onsale` without a
  `<del>` in the loop (the range "4,05–5,40 kr" is already the sale range). The feed carries no
  signal for this case; record it as a feed gap, do not invent one.

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
- 2026-10-20: Added the sale tile markup (`sale` class, `span.onsale`, `del`/`ins`), the feed sale-signal rule and the range-sale gap, from an Elementor + WooCommerce onboarding where the survey found no sale tile and one appeared the same day.
