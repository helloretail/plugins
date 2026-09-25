---
source: field
verified: 2026-09-15
---

# Search Templates — Onboarding Playbook

> **Audience:** D&TS / Implementation, customizing a customer's Search design.
> **Source of truth:** the platform-default Search templates shipped by Hello Retail (product-engineering owned). This page is the **how-to** for editing the per-customer design in the dashboard; the [base templates](../base-templates/base-templates.md) are the canonical starting files D&TS works from.

## What you're editing, and where

The default Search templates ship with the Hello Retail platform. When a website is provisioned in `my.helloretail.com`, a **design** is created with these defaults as the body. You then edit that design in the Supervisor / Dashboard template editor — **not the upstream platform defaults**.

The platform defaults are the source of truth for **what fresh customers start with**. Touching them is product engineering's job, not D&TS's.

| Search layout | Template files (defaults) |
| --- | --- |
| List / Instant Search | Liquid/HTML + CSS + JS |
| Grid / Full Search | Liquid/HTML + CSS + JS |
| Overlay Search — desktop | Liquid + CSS + JS (with an inline-embedded variant) |
| Overlay Search — mobile | Liquid + CSS + JS |

## The customization loop

For every customer, you'll do some subset of these:

1. **Pick the right starting template.** Default is fine for most customers. If the customer already has a similar implementation on another site, copy that as a starting point instead.
2. **Tune the inputs block** (the `{# text ... #}`, `{# boolean ... #}`, `{# color ... #}`, `{# choice (...) ... #}` declarations at the top). These become the editable form in the design editor — surface anything you want the customer to change later.
3. **Replace placeholders.** Look for `{% comment %}` blocks. The current notable ones:
   - `BANNER_SIZE_NAME_PLACEHOLDER` in all three Search Liquid templates → swap with the Retail Media banner size the customer's design actually uses.
   - `header_logo_url` default → customer's logo CDN URL.
4. **Copy the product tile.** This used to be the bit that took the most time, and it is now the `tile-extractor` skill's job: it copies the customer's category-page card as real HTML, binds the product values by table, and checks the result next to the native tile before handing it over. The copy **replaces the whole default tile element** in the `{% else %}` branch of `{% for product in product_list %}` (there is no placeholder to look for: the branch itself is the slot). Do not re-skin the default tile to look like the customer's — that leaves Hello Retail markup restyled with CSS, which breaks the moment the theme changes and is the pattern the team retired.
5. **Mirror the same tile in `initialContent`** (the suggestions panel before the user types). The base templates render both from one loop; if the design you edit has two, keep them identical.
6. **CSS pass — shell only.** Branding, header, filters, and the sanctioned tile-fill and width tokens (`search-developer` → `shell-structure.md`). No CSS on the tile: what the tile needs from the theme is restored by mirroring its parent hooks onto `hr-products-container`, never by rules keyed on `.hr-*` or on the customer's classes. Don't rename `.hr-*` / `.aw-*` shell classes — JS binds to them.
7. **Test on real data** with Product Lookup + a real search query before launch.

## The fields you have on `product`

| Field | Notes |
| --- | --- |
| `product.title` | Always present |
| `product.url` | Product detail link |
| `product.imgUrl` | Primary image |
| `product.price`, `product.oldPrice`, `product.currency` | Format with `\| price` + `\| currencySymbol` or the one-shot `\| priceWithCurrency: product.currency` — the two are equivalent; pick whichever reproduces the customer's format. Don't hand-roll `\| replace: ",00", ""`. |
| `product.isOnSale` | Boolean — drives the sale-price branch |
| `product.isBanner`, `product.bannerImages.<SIZE>.url` | Retail Media slot |
| `product.brand`, `product.productNumber`, `product.description`, `product.inStock` | Standard catalog fields |
| `product.extraData.<key>`, `product.extraDataList.<key>` | Custom attributes from the feed — e.g. size, color, material, swatches |

Full field list at [Website's Indexed product fields](https://support.helloretail.com/general-setup/websites-indexed-product-fields/). For price formatting, use an HR price filter — `{{ product.price | price }} {{ product.currency | currencySymbol }}` and `{{ product.price | priceWithCurrency: product.currency }}` are equivalent (both apply the dashboard's price format, decimals included; neither is preferred) — and don't hand-roll regex on the price string.

## Pre-launch checklist

- [ ] Inputs block reflects what the customer is allowed to change later in Supervisor.
- [ ] All `PLACEHOLDER` strings replaced (grep the template).
- [ ] Tile is the customer's copied markup: no Hello Retail tile class inside it, no tile rules in the CSS; rendered next to the native tile on desktop and mobile.
- [ ] Tile renders correctly with sale + non-sale products.
- [ ] Initial content tile matches the search-result tile.
- [ ] `product.isBanner` branch tested if Retail Media is in scope.
- [ ] Mobile overlay tested at common breakpoints (don't trust desktop-only QA).
- [ ] Currency + price formatting verified against website settings (no hard-coded `kr` / `$`).
- [ ] No `.hr-*` / `.aw-*` class names renamed.
- [ ] Schema.org `itemprop` attributes intact on the full search page (`full_search.html`).

## Related

- [Base templates](../base-templates/base-templates.md) — canonical starting Liquid + CSS the team maintains
- [Search feature reference](../features/search/search.md)
- [Implementation methods (Script vs API)](./implementation-methods.md)
- [Data requirements](./data-requirements.md) — feed fields you need before you can fill in `{{ product.* }}`
- [Review & testing checklist](./review-and-testing.md)
