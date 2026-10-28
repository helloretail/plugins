---
source: field
verified: 2026-10-26
---

# Shopify — Feeds

Feed notes for Shopify customers. Read alongside the `feed-setup` skill, which owns the general V2 feed-creation flow, and `shopify-legacy-to-v2` when moving a feed off the legacy Shopify feed helper.

---

## Unlisted products show up in Hello Retail

Shopify has four product statuses: Active, Draft, Archived and **Unlisted**. An Unlisted product is still published to the Online Store: its product page works by direct URL and it can be bought. But Shopify hides it from storefront search, collections and the sitemap. Merchants use it for products that should be reachable by link only, such as private offers, bundle components or gift-with-purchase items.

Search, Recommendations and Pages are all discovery surfaces, so an Unlisted product must never show up in them.

**Cause:** the feed reads the legacy Shopify feed helper, `feed-helper…/shopify/products.py` (or `/shopify/RC/products.py`). That helper is built on an older Shopify API that does not know the Unlisted status. It returns every published product, and Unlisted products count as published.

**Diagnose:** open the feed (`feeds_get`) and look at its source URL. A path without `/V2/` is the legacy helper.

**Fix:** migrate the feed to `/shopify/V2/products.py` with the `shopify-legacy-to-v2` skill. The V2 helper returns Active products only, so Unlisted, Draft and Archived products drop out. A filter in the feed transform can't do this on the legacy helper, because its payload never says a product is Unlisted.

Tell the customer before the switch:

- The catalogue gets smaller: every product that isn't Active leaves Hello Retail.
- The V2 helper only returns published collections. Hierarchies, keywords or flags built from collection titles can change. The `shopify-legacy-to-v2` skill lists this and the other known differences.

---

## Timeline
- 2026-10-26: Page seeded — Unlisted products leaking through the legacy feed helper.
