---
source: public-docs
verified: 2026-10-29
---

# Platform installs and data sync — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [platforms](../../platforms/platforms.md), [ecommerce platforms](../../platforms/ecommerce-platforms.md), [plugin info endpoints](../../platforms/plugin-info-endpoints.md), [Shopify](../../platforms/shopify/README.md), [Magento 2](../../platforms/magento/README.md), [Magento 1](../../platforms/magento/magento-1.md), [WooCommerce](../../platforms/woocommerce/README.md), [PrestaShop](../../platforms/prestashop/README.md), [Shopware](../../platforms/shopware/README.md), [Starweb](../../platforms/starweb/README.md), [script not loading](../script-not-loading.md), [SPA tracking](../../onboarding/spa-tracking.md), [newsletter providers](./newsletter-providers.md)

| Symptom | Go to |
| --- | --- |
| Shopify connection fails, or "the app was made by our agency" | [Shopify API credentials](#shopify-the-custom-app-will-not-connect) |
| Shopify shows double tracking or old Addwish code | [Old Shopify scripts](#shopify-old-hello-retail-scripts-still-load) |
| Shopify carts or orders do not reach Hello Retail | [Shopify pixel](#shopify-carts-and-conversions-are-not-tracked) |
| Shopify market sends data to the wrong website, or tracks before consent | [Shopify markets and consent](#shopify-tracking-uses-the-wrong-website-or-ignores-consent) |
| "Where do we put the blank search page on platform X?" | [Blank search page](#any-platform-full-search-needs-a-blank-results-page) |
| Magento 2 full search page does not render | [Magento 2 search page](#magento-2-the-full-search-page-is-not-set-up) |
| Feed returns 401 / no products after a module update | [Feed token](#magento-woocommerce-prestashop-and-shopware-feed-fails-with-an-authorization-error) |
| Magento 2 category feed missing, extension outdated, consent not handled | [Magento 2 extension](#magento-2-category-feed-missing-or-extension-out-of-date) |
| Pages content not showing on a Magento 2 category | [Magento 2 Pages](#magento-2-pages-content-does-not-show-on-a-category) |
| Magento 1 extension update or product push not working | [Magento 1](#magento-1-extension-update-or-product-push-not-working) |
| WooCommerce shop with Cookiebot loses returning visitors | [WooCommerce consent](#woocommerce-returning-visitors-are-not-recognised-with-cookiebot) |
| WooCommerce prices in the feed are wrong | [WooCommerce prices](#woocommerce-prices-in-the-feed-are-wrong) |
| WooCommerce conversions missing for some payment methods | [WooCommerce conversions](#woocommerce-conversions-are-missing-for-some-payment-methods) |
| Shopware feed is empty or never generated | [Shopware feeds](#shopware-the-feeds-are-empty-or-not-generated) |
| Shopware Integrated Search shows duplicates, no filters or misses products | [Shopware search](#shopware-integrated-search-shows-duplicates-or-misses-products-and-filters) |
| Lightspeed feed cannot be connected | [Lightspeed](#lightspeed-the-product-feed-cannot-be-connected) |
| DanDomain, SmartWeb, ScanNet or Wannafind: where the script and feed go | [Hostedshop family](#dandomain-smartweb-scannet-and-wannafind-where-the-script-and-the-product-feed-go) |
| SmartWeb or hosted DanDomain: no category or order feed | [SOAP API user](#smartweb-and-hosted-dandomain-category-or-order-feed-is-missing) |
| "Can we load our old orders?" on DanDomain-family shops | [Historical orders](#dandomain-family-loading-historical-orders) |
| Starweb script missing or search page name rejected | [Starweb](#starweb-the-script-is-missing-or-the-search-page-cannot-be-created) |
| Norce or Centra: what Hello Retail needs for data | [Norce and Centra](#norce-and-centra-what-hello-retail-needs-for-the-data-sync) |
| Miva blocks the feed, or discounted prices are wrong | [Miva](#miva-the-feed-is-blocked-or-discounted-prices-are-wrong) |
| Shoporama, Golden Planet, E37, Abicart, Nordisk E-Handel: where the code goes | [Smaller platforms](#shoporama-golden-planet-e37-abicart-and-nordisk-e-handel-where-the-script-and-conversion-code-go) |
| Headless shop or platform without an integration | [Headless](#headless-or-unsupported-platform-how-to-integrate) |

## Shopify: the custom app will not connect

**Likely cause.** Hello Retail reads the Shopify Admin API through a custom app using the client
credentials grant, which Shopify only allows when the app is created inside the same Shopify
organisation it is installed in. An app built in an agency's partner dashboard and shared through a
custom distribution link does not work. A missing scope is the other cause.

**Fix.**

1. Have the store owner (or a user with the administrator or app-developer role) open **Dev
   Dashboard** from the shop icon and choose **Create New App** → **Start from Dev Dashboard**.
2. App URL `https://helloretail.com/`, untick **Embed Shop in Shopify Admin**, then **Select Scopes**:
   `read_orders`, `read_product_listings`, `read_products`, `read_content`, `read_customers`,
   `read_files`, `read_metaobject_definitions`, `read_metaobjects`, `read_translations`.
3. **Release** the version, copy Client ID and Secret from **Settings**, then **Install App** from Home.
4. In the Hello Retail setup, paste both values, pick the market or country, and click **Verify
   connection**. Feeds are created with default settings and sync in the background.
5. If an agency must do it, invite them into the store's organisation with the **App Developer** role
   first.

**Check with.** `feeds_list` and `feeds_getLatestRun` once the connection is verified.

**Source:** [Shopify Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopify-installation-guide/)

## Shopify: old Hello Retail scripts still load

**Likely cause.** A store installed before the move to pixel tracking still carries the legacy
`theme.liquid` snippet (with a Liquid-built `setCart`) and a conversion script in the checkout's
**Additional scripts** field. Older installs may reference "Addwish" or `awaddgift` instead.

**Fix.**

1. **Online Store → Themes → Actions → Edit code → Layout → theme.liquid**: remove the old
   `helloretail.js` block with the `HelloRetailCartContentsRecreate` Liquid loop, or any code
   referencing Hello Retail, Addwish or `awaddgift`.
2. **Settings → Checkout → Order status page → Additional scripts**: remove the
   `trackConversion` snippet. If the field is greyed out, the store is on Checkout Extensibility and
   the scripts no longer run, so it can be left.
3. Reinstall from the current guide: the `helloretail.js` script in `theme.liquid` and the custom
   pixel (next entry).
4. A store already on the pixel only needs its scopes, script and pixel compared with the current
   guide and replaced where they differ.

**Check with.** View source on the storefront and search for `helloretail`, `addwish` and
`awaddgift`; then follow [script not loading](../script-not-loading.md).

**Source:** [Remove old Shopify scripts](https://support.helloretail.com/platforms-and-newsletter-providers/remove-old-shopify-scripts/) · [Shopify Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopify-installation-guide/)

## Shopify: carts and conversions are not tracked

**Likely cause.** The Hello Retail custom pixel is missing, outdated or not connected. The pixel
reads the `hello_retail_id` cookie and the website from the `hello_retail_state` session storage,
which only exist once `helloretail.js` has run on the storefront, so a store that removed its old
install without re-adding the script tracks nothing.

**Fix.**

1. **Settings → Customer events → Add custom pixel**, name it (for example "Hello Retail Pixel"),
   paste the pixel code from the current guide, **Save**.
2. Set the customer privacy options and click **Connect**.
3. Make sure the `helloretail.js` script and the init block are in `theme.liquid` (before `</head>`
   and `</body>` respectively).

**Check with.** `orders_list` for conversions after a test order; in DevTools, requests to
`core.helloretail.com/serve/collect/cart` and `/serve/collect/conversion`.

**Source:** [Shopify Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopify-installation-guide/)

## Shopify: tracking uses the wrong website or ignores consent

**Likely cause.** Shopify can serve several markets or languages on one domain, but Hello Retail
needs a separate website per market or language. Without the `Shopify.country` switch in the init
block, every market falls back to the default website. Consent is read from
`Shopify.customerPrivacy`; a shop with a different consent model needs the logic changed.

**Fix.**

1. In the init block, fill the `switch (Shopify.country)` cases with each market's website ID
   (`Shopify.locale` works instead when the websites are split by language). Placeholders left as
   `YOUR_…` are ignored and fall back to the default website.
2. The template opts out when `analyticsProcessingAllowed()` and `marketingAllowed()` are not both
   true, and listens for `visitorConsentCollected` to update it. Change those checks if the shop's
   consent rules differ.

**Check with.** `website_getInfo` for each market's website; in DevTools, which website the
`hello_retail_state` session storage holds on each market.

**Source:** [Shopify Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopify-installation-guide/)

## Any platform: full search needs a blank results page

**Likely cause.** A full search setup renders into an empty page on the shop, and the shop has
not made one yet, or made one that shows up in navigation.

**Fix.** Create the page, keep it out of menus, and send its URL to Hello Retail support. Per platform:

| Platform | Where | Note |
| --- | --- | --- |
| Shopify | Online store → Pages → Add page, template **page**, Visible | |
| Magento 2 | Content → Elements → Pages | See the next entry |
| WooCommerce | WP Admin → Pages → Add new page | Keep it out of navigation |
| PrestaShop | 1.7: Design → Pages → Add new CMS page (1.6: Preferences → CMS) | Leave Page content empty |
| DanDomain, SmartWeb, ScanNet, Wannafind | Webshop → Sider → Opret kategori (hidden), then a page in it | Ends up at `/sogeresultater/` |
| DanDomain Classic | Design → Egne sider → Opret side, type Indholdsside | URL under Parameter |
| Starweb | Utseende → Sidor → Lägg till ny sida, hide the header | Do not call it "Sökresultat" |
| Shoporama | Statiske sider → Opret ny side | The default theme adds it to navigation |
| Golden Planet / OpenBizBox | Content & layout → Info Pages, then untick it in Layout Builder | |
| E37 | WEBBPLATS → Sidor → Ny sida, Status **Dold** | |
| Norce | Sidor → Lista sidor → Skapa ny sida, with placeholder content | Responsive Base only; Jetshop Flight → support |
| Nordisk E-Handel | Sidor → Sidor → Skapa ny sida | |

**Check with.** `search_listConfigs` for the config's full-search URL; open the page and confirm it is
reachable and empty.

**Source:** [Shopify Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopify-installation-guide/) · [WooCommerce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/woocommerce-installation-guide/) · [PrestaShop Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/prestashop-installation-guide/) · [SmartWeb Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/smartweb-installation-guide/) · [Starweb Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/starweb-installation-guide/) · [Norce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/norce-installation-guide/)

## Magento 2: the full search page is not set up

**Likely cause.** The Magento 2 extension does not create the results page: it is a manual CMS page
whose URL key must also be entered on the Hello Retail search config.

**Fix.**

1. Magento Admin → **Content → Elements → Pages → Add New Page**: Page Title "Search Results",
   URL Key `search-results`, the right **Store View**, **Status** Enabled. **Save and Continue Edit**.
2. **Design** tab: Page Layout **1 Column**; under Custom Design pick the site's Theme and Layout.
3. **Content** tab: set the Content Heading (for example "Search Results") and save.
4. In Hello Retail, on the search config, enter the URL key in **URL for your full search page**,
   then save and activate the config.

**Check with.** `search_listConfigs` and `search_getDesign` for the config and its page URL.

**Source:** [Set up your Search Page in Magento 2](https://support.helloretail.com/platforms-and-newsletter-providers/setup-your-search-page-in-magento-2/)

> **May be outdated:** the Hello Retail steps use the older dashboard path **On-Site → Search →
> Overview → Create New**. The blank page itself is a manual step: the extension does not create
> it (see [Magento](../../platforms/magento/README.md)).

## Magento, WooCommerce, PrestaShop and Shopware: feed fails with an authorization error

**Likely cause.** The platform modules protect the product, category and order feeds with a Bearer
token. After an install or update, or after someone regenerated the token, the feed in Hello Retail
no longer sends a valid `Authorization` header. WooCommerce switched from IP checks to the token in
plugin 1.2.34.

**Fix.**

1. Copy the token from the module settings:
   - Magento 2: **Stores → Configuration → Hello Retail**, Feeds authorization.
   - Magento 1: the **Hello Retail** top menu → **Feed Access Restriction**.
   - WooCommerce: the plugin settings.
   - PrestaShop: **Modules** → Hello Retail → **Configure**.
   - Shopware: the **Hello Retail** Sales Channel.
2. Add a request header to each feed: `Authorization` = `Bearer <token>`.
3. For a feed Hello Retail manages, send the token to Hello Retail support instead.
4. Regenerating the token invalidates the old one, so update every feed header at the same time.

**Check with.** `feeds_get` for the header, `feeds_getLatestRun` for the error; the
[plugin info endpoints](../../platforms/plugin-info-endpoints.md) for the module version.

**Source:** [Magento 2 Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/magento-2-installation-guide/) · [Magento 1 Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/magento-1-installation-guide/) · [WooCommerce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/woocommerce-installation-guide/) · [PrestaShop Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/prestashop-installation-guide/) · [Shopware Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopware-installation-guide/)

## Magento 2: category feed missing or extension out of date

**Likely cause.** The category feed relies on API features from Magento 2.2, so it does not work
on 2.0 or 2.1. Fixes ship as extension updates, which must use the same method as the install.
The extension sends the init call but has no cookie-consent handling of its own.

**Fix.**

1. Install with Composer: `composer require addwish/awext`, then `module:enable Addwish_Awext`,
   `setup:upgrade`, `setup:di:compile`. Update with `composer update addwish/awext` plus the same
   commands and `cache:clean`. A manual install goes in `app/code/Addwish/Awext`; Extension Manager
   is deprecated.
2. For consent, push `setTrackingOptOut` from the shop's consent tool. Do not add a second `init`
   with `trackingOptOut`, because the extension already sends `init`.

**Check with.** The Magento 2 [plugin info endpoint](../../platforms/plugin-info-endpoints.md) for the
version; `feeds_listRuns` for the category feed.

**Source:** [Magento 2 Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/magento-2-installation-guide/)

## Magento 2: Pages content does not show on a category

**Likely cause.** Category Pages content is switched off for that category, or points at the wrong
Pages key. With backend rendering, a cached category page cannot show personalised content.

**Fix.**

1. **Stores → Configuration → Hello Retail**: check **Default category setting** (Enabled applies
   to all categories; Disabled applies only to categories switched on individually).
2. On the category, tab **Hello Retail Category Pages Content**: **Enable on this category** and,
   if needed, a **Specific Hello Retail Pages Key** (empty uses the default key).
3. Backend rendering with personalised content needs **Enabled cache buster for category pages**;
   frontend rendering keeps the page cache and injects content after load.

**Check with.** `pages_listConfigs` and `pages_getConfig` for the key in use.

**Source:** [Magento 2 Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/magento-2-installation-guide/)

## Magento 1: extension update or product push not working

**Likely cause.** Magento 1 updates mean uninstalling and reinstalling through the original channel
(Magento Connect or FTP). PHP 8 and OpenMage need extension 1.0.38 or newer, OpenMage 20 needs
1.0.45. Product create, update and delete are pushed only when the Website ID is set.

**Fix.**

1. Back up first. In Magento Connect Manager, clear the maintenance-mode checkbox before
   **Proceed**. On FTP, overwrite the files, then **System → Cache Management → Flush Magento Cache**
   and **Flush Cache Storage**.
2. **Hello Retail** menu → **Data Push Setup**: enter the website ID.
3. **Tracking Setup**: **Use Ajax** suits full page caching.

**Source:** [Magento 1 Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/magento-1-installation-guide/)

## WooCommerce: returning visitors are not recognised with Cookiebot

**Likely cause.** Tracking was opted out at `init` through the `hr_sdk_init_config` filter. The SDK
then makes a new tracking ID on every page load when the consent listener turns tracking back on,
so returning visitors and personalisation are lost. A JavaScript-delay plugin can also stop
`helloretail.js` from loading.

**Fix.**

1. Plugin 1.2.42 or newer. Add `data-cookieconsent="ignore"` to the script with the
   `hr_sdk_script_attributes` filter, so Cookiebot does not block it.
2. Gate tracking only after consent:

   ```html
   <script>
     window.addEventListener('CookiebotOnConsentReady', function () {
       window.hrq = window.hrq || [];
       hrq.push(["setTrackingOptOut", !Cookiebot.consent.marketing]);
     });
   </script>
   ```

3. Remove any `trackingOptOut: true` set through `hr_sdk_init_config`.
4. Exclude `helloretail.js` from delay settings such as WP Rocket "Delay JavaScript Execution".

**Source:** [WooCommerce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/woocommerce-installation-guide/)

> **May be outdated:** the article says a built-in Cookiebot setting arrives in plugin 1.2.43, but
> its own changelog for 1.2.43 lists only a price fix. Check the plugin settings before relying on it.

## WooCommerce: prices in the feed are wrong

**Likely cause.** The plugin's price helper works the price out from WooCommerce's price HTML and
filters, and a shop with unusual price formatting or price logic can end up with a wrong value.

**Fix.**

1. From plugin 1.2.30, a developer can return the prices directly with the
   `hello_retail_product_price_hook` filter: an array with `price`, `oldPrice` and, for ranges only,
   `priceRangesTo`.
2. Return floats or numeric strings, never HTML.

**Check with.** `productData_get` for an affected product; the WooCommerce
[plugin info endpoint](../../platforms/plugin-info-endpoints.md) for the version.

**Source:** [WooCommerce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/woocommerce-installation-guide/)

## WooCommerce: conversions are missing for some payment methods

**Likely cause.** The plugin's frontend conversion tracking does not fire for some payment
methods; the plugin has a backend alternative for exactly this case.

**Fix.** From plugin 1.2.28, enable the plugin's backend conversion tracking option. Updating the
plugin means deactivating and deleting the old one, then installing the new ZIP.

**Check with.** `orders_list` for orders placed with the affected payment method.

**Source:** [WooCommerce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/woocommerce-installation-guide/)

## Shopware: the feeds are empty or not generated

**Likely cause.** The Hello Retail Sales Channel has not generated its XML files yet, the feed
lacks the Authorization header, the data path is wrong, or the server blocks Hello Retail's IP.

**Fix.**

1. Plugin 5.2.1 for Shopware 6.6, 4.4.1 for 6.5 (`composer require helret/hello-retail`).
2. **Sales Channel** → add the Hello Retail channel with storefront and domain, activate, save, then
   **Force generation**. On the server, `find . -type f -name "products.xml"` confirms the file.
   Set up a cron job so it regenerates.
3. **Extensions → My Extensions → Hello Retail → Configure**: partnerID `0` (mandatory, unused);
   do not limit orders on the first sync; leave "Include product data in category feed" off.
4. In Hello Retail: XML feed, header `Authorization: Bearer <token>`, data path
   `root > products > product`, enable **create** and **delete** on the Settings tab.
5. Still failing: fetch the feed with the same header from Postman, and check the server
   allowlists Hello Retail's IP.

**Check with.** `feeds_get`, `feeds_getLatestRun`.

**Source:** [Shopware Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopware-installation-guide/)

## Shopware: Integrated Search shows duplicates or misses products and filters

**Likely cause.** Grouping, indexing or variant settings do not match what the Shopware plugin
expects, or products lack an image. Integrated Search does not support redirects or Retail Media.

**Fix.**

1. Group by `extraData.displayGroup` (or `wexoDisplayGroupGroupingKey` if a transform adds it) and
   nothing else. A transform must extend `extraData`, not overwrite it, and drop products without
   a `displayGroup`.
2. Index `extraData.manufacturerId`, `extraData.isCloseoutAvailable` (needed to hide sold-out
   products) and every `extraDataList.propertyGroup_*` field.
3. On the product search engine, set **Show Variants** to **Show only the first variant of a product**.
4. Products without `imgUrl` never appear in search: add a placeholder image in a transform or
   in the feed.
5. Filter order is set in Shopware (**Catalog → Properties**), not in Hello Retail. Category
   support needs `extraData.id` mapped on the managed feed by Hello Retail support.

**Check with.** `dataFields_getProductFields`, `search_getProductEngine`, `search_getFilters`,
`productData_get` for an affected product.

**Source:** [Shopware Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shopware-installation-guide/)

## Lightspeed: the product feed cannot be connected

**Likely cause.** The feeds use the Lightspeed API, which entry-level Lightspeed plans do not
include. A wrong language code or cluster also fails.

**Fix.**

1. **Settings → Store Settings → Developers → New API Key**, enable read for **Content**,
   **Products** and **Orders**, then copy key and secret into Hello Retail.
2. **Language**: the storefront's two-letter code (for example NL, DE, EN for UK, US for US English).
   **Cluster**: `eu1` for EU, `us1` for US.
3. No API access: the shop must ask Lightspeed to enable it or upgrade its plan.
4. The script and cart tracking go in **Settings → Web extras → CUSTOM JS**; conversion tracking
   in the **TRACKING** section.

**Check with.** `feeds_list`, `feeds_getLatestRun`.

**Source:** [Lightspeed Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/lightspeed-installation-guide/)

## DanDomain, SmartWeb, ScanNet and Wannafind: where the script and the product feed go

**Likely cause.** These shops install the Hello Retail app, but the script still has to be pasted
into the design by hand, and the product feed URL has to be sent to Hello Retail.

**Fix.**

1. **Apps** → Hello Retail → **Installer app** → **Indstillinger** → **Gem**.
2. **Webshop → Design → Ret design → Indsæt Javascript**: paste the app's snippet under **Sidens
   header**. On DanDomain the app shows two snippets: number 1 in **Sidens header**, number 2 in
   **Sidens indhold (bunden)**.
3. Send the product feed URL to Hello Retail support:

   ```text
   https://<shop>.mywebshop.io/framework/priceindex/?index=addwish
   ```

4. Categories and orders need a SOAP API user (next entry).
5. **DanDomain Classic** differs: the script goes at the bottom of **Indstillinger → Site →
   Kodefelt (head section)**, product data comes from a user under **Indstillinger → Integration**
   (send the API key, site ID and domain), and conversions use an `addwish-conversion` span in
   **Design → Tekster/Knapper → Bestil step 4**.

**Check with.** View source for `helloretail`; `feeds_list`.

**Source:** [DanDomain Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/dandomain-installation-guide/) · [SmartWeb Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/smartweb-installation-guide/) · [ScanNet Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/scannet-installation-guide/) · [Wannafind / Hostedshop Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/wannafind-hostedshop-installation-guide/) · [DanDomain Classic Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/dandomain-classic-installation-guide/)

> **May be outdated:** the Wannafind article still asks for a Hello Retail partner ID in the app;
> the DanDomain and SmartWeb articles say it is not required.

## SmartWeb and hosted DanDomain: category or order feed is missing

**Likely cause.** Categories and orders come through the shop's SOAP API, which needs its own API
user. Without it only the product feed exists.

**Fix.**

1. **Indstillinger → API:SOAP**: tick **API adgang**, **Gem**.
2. **Indstillinger → Medarbejdere → Opret medarbejder**: a unique e-mail (it is the username and
   need not receive mail) and a new password without `!`, `,` or `€`. Set **Applikationsadgang**
   to **API**, **Gem**.
3. Send the username, password and the shop's languageISO (DK for Danish) to Hello Retail
   support. Hello Retail staff see the password, so it must not be a personal one.

**Check with.** `feeds_list` for the category and order feeds.

**Source:** [Create SmartWeb/hosted Dandomain/Hostedshop API User for Category & Order Feed](https://support.helloretail.com/platforms-and-newsletter-providers/create-smartwebhosted-dandomainhostedshop-api-user-for-category-order-feed/)

## DanDomain family: loading historical orders

**Likely cause.** A new shop has no order history in Hello Retail, so recommendations start cold.
The shop can export old orders for a one-time import.

**Fix.**

1. **Ordrer → Alle ordrer → Eksportér**, **Ordrer**, format **XML**.
2. Fields: Ordre – Generelt **Total**; Ordrelinjer **Produkt id, Varenummer, Produkt titel, Variant
   titel, Diverse titel, Antal, Pris**; Kundeoplysninger **Kunde e-mail**.
3. **Efter periode**, start date two years back, **Download**, send the file to Hello Retail support.

**Check with.** `orders_list` after the import.

**Source:** [DanDomain Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/dandomain-installation-guide/) · [Exporting historical orders from DanDomain](https://support.helloretail.com/platforms-and-newsletter-providers/exporting-historical-orders-from-dandomain/)

> **May be outdated:** the separate export article describes a different screen (**Import/Export →
> Export**, fields Ordrenummer, Oprettet dato, Totalpris, Email, Produktnummer, Produktnavn). It
> does not say which DanDomain generation it is for; use whichever screen the shop has.

## Starweb: the script is missing or the search page cannot be created

**Likely cause.** On Starweb the script and the cart and conversion tracking are switched on by
Starweb, not pasted by the shop. The name "Sökresultat" is reserved by Starweb.

**Fix.**

1. Ask Starweb support to enable the Hello Retail integration.
2. Data: **Inställningar → Kopplingar → Starweb API → Hantera API-klienter → Lägg till ny klient**,
   API group **Hello Retail**, rights **Produkter**, **Kategorier**, **Ordrar**. Send the client ID
   and client secret to Hello Retail.
3. Name the search page something else (for example "Search results"). Starweb cannot hide a page
   from **Standardmeny**; only if Hello Retail asks, build a copy of the menu without it and set it
   on the theme.

**Check with.** View source for `helloretail`; `feeds_list`. Starweb code is on the
[Starweb](../../platforms/starweb/README.md) page.

**Source:** [Starweb Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/starweb-installation-guide/)

## Norce and Centra: what Hello Retail needs for the data sync

**Likely cause.** Both platforms sync data through their APIs, and onboarding stalls when the shop
sends only part of the details.

**Fix.**

1. **Norce Commerce**: a product feed channel in **JSON** with **Include Inactivated Variant Day
   Count** = `1` (send the **Channel Key**), delta tracking enabled, API credentials (Client ID,
   Client Secret, Client Scope if not `prod`), Application ID, primary culture code, client slug
   and client region (usually `se`).
2. **Norce storefront**: script and cart tracking in **Inställningar → Scripthantering → All pages**
   (**Inkludera skript för bodytaggen**); conversion script on the order confirmation page.
3. **Centra**: a Checkout API token (products, pricelists, categories) and an Order API token
   (orders, products), each with its endpoint URL, plus the language ISO code and market ID.
4. **Centra storefront**: `helloretail.js` on every page except the order submit page, and on the
   confirmation page. On a single-page app, call the SDK's `reload()` after route changes or track
   views and clicks manually (see [SPA tracking](../../onboarding/spa-tracking.md)).
5. Hello Retail Search does not translate or convert currency: on a multi-language Centra shop,
   build search against the API and handle language and currency in the frontend.

**Check with.** `feeds_list`, `feeds_getLatestRun`, `orders_list`.

**Source:** [Norce Commerce data synchronisation](https://support.helloretail.com/platforms-and-newsletter-providers/norce-commerce-data-synchronisation/) · [Norce Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/norce-installation-guide/) · [Centra installation guide](https://support.helloretail.com/platforms-and-newsletter-providers/centra-installation-guide/)

## Miva: the feed is blocked or discounted prices are wrong

**Likely cause.** Miva can block Hello Retail's feed requests by IP. The Miva API does not apply
price groups, so the API feed has list prices only.

**Fix.**

1. Blocked feeds: ask Miva support to allow IP `34.245.105.75`.
2. API token (**Settings → User Management → API Tokens**): allowed IPs `0.0.0.0/0`, groups **Order
   Processing & Fullfilment** and **Product Management**; send the endpoint URL, access token and
   signature.
3. Discounted prices: **Marketing → Feeds → Add Feed** with the Product template, template-based,
   Mode Product, Load Active, Encoding CSV, **Predict Product Discounts** on, fields Code and Price.
   Add a scheduled task (**Settings → Store Settings → Scheduled Tasks**) to regenerate it, for
   example every 30 minutes.
4. Recommendations in Miva's Visual Page Editor: upload the Hello Retail Flex Component and enter
   the recommendation box key as **Recommendations ID**.

**Check with.** `feeds_getLatestRun`; `productData_get` for a discounted product; `recoms_list`
for the box key.

**Source:** [Miva merchant installation guide](https://support.helloretail.com/platforms-and-newsletter-providers/miva-merchant-installation-guide/) · [Adding recommendations with Miva's Visual Page Editor](https://support.helloretail.com/platforms-and-newsletter-providers/adding-recommendations-with-mivas-visual-page-editor/)

## Shoporama, Golden Planet, E37, Abicart and Nordisk E-Handel: where the script and conversion code go

**Likely cause.** Each platform has its own field for the script and for conversion tracking, and
a snippet in the wrong field, or a missing platform setting, tracks nothing.

**Fix.**

| Platform | Script | Conversions | Data |
| --- | --- | --- | --- |
| Shoporama | End of `<body>` in `global.html` (SFTP, or a theme override with only `global.html`) | Same snippet (`trackConversion` on `$order`) | `/product-feed.xml`; API key from the gear icon → **Tilføj adgang** |
| Golden Planet / OpenBizBox | **Integration → Custom Integration**, Pages **All pages** | Custom integration on **Checkout success**, **Body end**, `addwish-conversion` span | **Tools → API**: client ID and secret |
| E37 | **Script för spårning**, with **Aktivera JavaScript-objekt på klienten** ticked (the cart code reads `TC.Cart`) | **Script för omvandlingsspårning i kassan** | **E-HANDEL → Exportfiler → Keybroker Product Feed** |
| Abicart / Textalk | Store-specific script from Hello Retail support, in the theme's **Site header → Top bar custom content → Custom HTML** | Google Tag Manager tags on `tws-purchase` and `tws-article-added` | **Settings → Apps → API keys**, plus the shop ID |
| Nordisk E-Handel | The platform installs the Hello Retail plugin | The platform enables it on checkout success | Via the platform |

On Shoporama nothing is tracked while **Design → Tracking → Enable tracking** is off. On Abicart,
use **Check JavaScript installation** in Hello Retail after reloading the front page.

**Check with.** View source for `helloretail` ([script not loading](../script-not-loading.md));
`orders_list` after a test order.

**Source:** [Shoporama Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/shoporama-installation-guide/) · [Golden Planet / OpenBizBox Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/golden-planet-openbizbox-installation-guide/) · [E37 Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/e37-installation-guide/) · [Abicart / Textalk Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/abicart-textalk-installation-guide/) · [Tracking Carts & Conversions on Abicart / Textalk via Google Tag Manager](https://support.helloretail.com/platforms-and-newsletter-providers/tracking-carts-conversions-on-abicart-textalk-via-google-tag-manager/) · [Nordisk E-Handel Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/nordisk-e-handel-installation-guide/)

> **May be outdated:** the published Shoporama snippets have template slips (`<{/else}>`, a missing
> `$` before `product`, and `}]);` closing a function push in the consent version); have a developer
> check them before use. The Abicart cart tag uses the legacy `ADDWISH_PARTNER_NS.api.cart.addProduct`
> call, not `setCart`.

## Headless or unsupported platform: how to integrate

**Likely cause.** The platform has no Hello Retail integration, or the storefront is headless or a
single-page app.

**Fix.**

1. Follow the developer documentation's integration guide for tracking, data sync and markup.
2. Choose a rendering approach: **API JSON** (Hello Retail returns product IDs, the shop renders
   them with its own templates and prices; recommended), **API template** (Hello Retail returns
   ready HTML), or **selector-based auto insert** (a `<div>` the script fills).
3. Add the script and tracking, and on a single-page app call the SDK's reload after route changes.
4. Newsletter Content and Triggered Emails cannot use API JSON: e-mail content is pre-rendered, so
   plan a separate route for it.

**Source:** [General Guide for Hello Retail Integration with Third-Party Platforms](https://support.helloretail.com/platforms-and-newsletter-providers/general-guide-for-hello-retail-integration-with-third-party-platforms/) · [Hello Retail Integration Guide](https://developer.helloretail.com/guides/setup/)
