---
source: field
verified: 2026-10-02
---

# Plugin info endpoints

Each Hello Retail platform plugin has an **info endpoint** next to its feed. It reports the
plugin version, the platform version, and the shop data the feed depends on. Fetch it:

- **at the start of every feed setup or migration** on these platforms, because it lists the
  data points you can add to the feed, and on PrestaShop the language and country the feed
  prices for;
- **first on every support case about feed or product data**, because the plugin version is
  the first fact the case needs. Quote it in the findings.

| Platform | Info endpoint | Auth | Key contents | Details |
|---|---|---|---|---|
| Magento 2 | `/rest/V1/awext/info` | Feeds Bearer token; `version` readable without one | `version`, every product attribute and extension attribute | [magento/README.md](./magento/README.md#endpoints-the-extension-exposes) |
| WooCommerce | `/?feed=hello_retail_info` | None | `version`, WooCommerce and WordPress versions, product meta keys, taxonomies | [woocommerce/README.md](./woocommerce/README.md#endpoints-the-plugin-exposes) |
| PrestaShop | `/modules/addwish/info.php` (older plugins: `/modules/addwish/addwishinfo.php`) | Not verified | `extension-version`, PrestaShop version, languages, countries, currencies | [prestashop/README.md](./prestashop/README.md#endpoints-the-module-exposes) |

Magento 1 is legacy (see [magento/magento-1.md](./magento/magento-1.md)) and not covered here.

## Support checklist

On a ticket about missing, wrong or stale product data on one of these platforms:

1. **Fetch the info endpoint and note the plugin version.** It answers whether the shop runs a
   version that has the behaviour in question. Use it in the reply ("the shop runs plugin
   1.2.43") instead of a guess.
2. **Compare the feed URL against the info output.**
   - Magento 2 and WooCommerce: every code in the feed URL's `extraAttributes` should be in
     the info list. A code that isn't there never arrives, and nothing reports an error.
   - PrestaShop: check that the default country is the country the shop sells to (see below).
     If it isn't, prices carry the wrong VAT.
3. **On a multilingual WooCommerce shop (WPML), fetch the feed for the language in question.**
   The info endpoint at the root URL describes the default language. A translation can lack
   meta values the original has, so a data point that is empty in one language's feed and
   filled in another is a translation gap in the shop, not a feed fault.

## Feed setup checklist

- **Magento 2:** pick the `extraAttributes` codes from `awext/info`, not from a sample of the
  feed. The feed only shows what is already requested.
- **WooCommerce:** pick `extraAttributes` from `<product_meta>` and `<taxonomies>`. The info
  endpoint lists these data points from roughly plugin 1.2.23 onwards.
- **PrestaShop:** read the languages and countries before writing the feed URL. Add
  `country_id` when the default country is wrong, and `lang_id` to choose the language.

**Related:** [platforms](./platforms.md) · [ecommerce platforms](./ecommerce-platforms.md)

## Timeline

- 2026-10-02: Page created. The WooCommerce endpoint and its `extraAttributes` behaviour were
  checked against a live shop on plugin 1.2.43. The PrestaShop details come from D&TS field
  experience.
