# Platform detection and per-platform routing

Read this before workflow step 1 of `../SKILL.md`. Run the detection snippet once on the homepage,
record every hit under `PLATFORM`, then read the platform's file from the routing list at the end
before writing the ATC form, the rating widget or the ATC JavaScript.

## Signals

| Signal                                               | Platform                             |
| ---------------------------------------------------- | ------------------------------------ |
| `cdn.webshopapp.com`, `lightspeed.multisafepay.com`  | **Lightspeed** (WebshopApp)          |
| `cdn.shopify.com`, `myshopify.com`                   | **Shopify**                          |
| `meta[name="generator"] = DanDomain`                 | **DanDomain**                        |
| `.dmws_perfect-*` classes                            | **Lightspeed** (dmws_perfect plugin) |
| `mage/` scripts, `.catalog-category-view` body class | **Magento**                          |
| `Swissup_Breeze` in script src, `breeze` body class  | **Magento 2** (Breeze frontend)      |
| `wp-content/plugins/woocommerce`                     | **WooCommerce**                      |
| Centra API calls (`/api/centra/`), headless React    | **Centra** (headless)                |
| `window.viskan` global; plus `window._streamline` / `#Streamline` root → Streamline, without → NG | **Viskan** (Streamline SPA / NG Next.js) |
| `form.buy-widget[data-add-to-cart]`, `window.PluginManager`, `[data-shopware-*]` | **Shopware**                         |
| `window.quickShop` global                            | **Starweb**                          |
| `cdn11.bigcommerce.com/s-…/stencil/`, `csrf-protection-header-*.js`, `[data-cart-item-add-from-card]` | **BigCommerce** (Stencil)            |
| `/ajax/?action=cart-additem`, `.js-product-item-add[data-cid]`, `.js-favorites-flip` | **Wikinggruppen**                    |
| `window.prestashop` global, `/modules/ps_…/`, `body#category` | **PrestaShop**                       |
| `typeof window.require === 'undefined'` **and** `[x-data]` present on a Magento DOM | **Magento 2 Hyvä** (Alpine, no jQuery — see `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/magento/add-to-cart.md` Step 0) |

## Detection snippet

Run this once on the homepage; it evaluates every row above and returns the matches:

```javascript
(() => {
  const html = document.documentElement.outerHTML;
  const has = (s) => html.includes(s);
  const q = (s) => !!document.querySelector(s);
  const g = (k) => typeof window[k] !== "undefined";
  const hits = [];
  if (has("cdn.shopify.com") || has("myshopify.com")) hits.push("shopify");
  if (q('meta[name="generator"][content*="DanDomain" i]')) hits.push("dandomain");
  if (has("cdn.webshopapp.com") || q('[class*="dmws_perfect-"]')) hits.push("lightspeed");
  if (has("/media/catalog/product/") || has("requirejs-config.js") || q("body.catalog-category-view")) hits.push("magento");
  if (has("Swissup_Breeze") || q("body.breeze")) hits.push("magento-breeze");
  if (hits.includes("magento") && !g("require") && q("[x-data]")) hits.push("magento-hyva");
  if (has("wp-content/plugins/woocommerce")) hits.push("woocommerce");
  if (has("/api/centra/") || has("centracdn.net")) hits.push("centra");
  if (g("viskan") || g("_streamline") || q("#Streamline")) hits.push(g("_streamline") || q("#Streamline") ? "viskan-streamline" : "viskan-ng");
  if (q("form.buy-widget[data-add-to-cart]") || g("PluginManager")) hits.push("shopware");
  if (g("quickShop")) hits.push("starweb");
  if (has("cdn11.bigcommerce.com") || has("csrf-protection-header")) hits.push("bigcommerce");
  if (has("action=cart-additem") || q(".js-product-item-add[data-cid]")) hits.push("wikinggruppen");
  if (g("prestashop") || has("/modules/ps_")) hits.push("prestashop");
  return { hits, spa: !!(g("next") || g("__NUXT__") || q("#__next, #app, #root")), jquery: g("jQuery") };
})();
```

Several hits are possible (Lightspeed + dmws_perfect, Magento + Breeze/Hyvä); note them all under
`PLATFORM`. `spa: true` means the shell skill must handle client-side routing; `jquery: false` means
no `$` in any JS you write.

## Per-platform routing — read after detection

The Liquid and JS rules in `SKILL.md` and `liquid-rules.md` are cross-platform and apply everywhere.
The files below add detection notes and platform quirks; the ATC forms/JS, rating and swatch code
live under `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/<platform>/` (each reference file points to
the exact pages).

- **Shopify** (`cdn.shopify.com`, `myshopify.com`) → `shopify.md` — detection + section-id note; code: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopify/{add-to-cart,rating}.md`
- **DanDomain** (`generator = DanDomain`) → `dandomain.md` — detection; code: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/dandomain/{add-to-cart,search-trigger,rating}.md`
- **Lightspeed / WebshopApp** (`cdn.webshopapp.com`, `.dmws_perfect-*`) → `dandomain.md` — shares the dmws_perfect ATC with DanDomain; code: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/lightspeed/{rating,wishlist}.md` + the shared DanDomain add-to-cart
- **Centra** (headless, `/api/centra/`) → `centra.md` — MUI/Emotion class-name handling, read the live form (no canned ATC — inspect the real markup)
- **Magento 2** (Luma / Breeze / Hyvä) → `magento.md` — frontend detection, `itemNumber` ids, price box, configurable-vs-simple CTA, swatches; platform knowledge: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/magento/{README,add-to-cart,rating,swatches}.md` and the Luma-vs-Hyvä plumbing in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/magento/add-to-cart.md`.
- **Viskan** (`window.viskan`; `window._streamline` / `#Streamline` root = Streamline, without = NG) → no reference file; code + platform quirks: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/viskan/{README,add-to-cart,feeds}.md`. Both storefronts: ATC goes through the `window.viskan.cart` API (documented from Streamline; NG parity unverified), and **wishlist / favourite buttons are not supported** — omit the favourite star from the tile and say so in the response (rule 6 exception), never wire a substitute. Streamline only: the HR overlay is injected **outside** `#Streamline`, so every Viskan delegated click handler (CMS components) is dead inside the overlay, which is why ATC must use the cart API (no bubbling) and the native `.CMS-ArticleFavorite-icon` star is inert.
- **Shopware** (`form.buy-widget[data-add-to-cart]`, `PluginManager`) → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopware/{README,add-to-cart}.md`. The tile keeps the theme's `buy-widget` form; the shell re-inits it.
- **Starweb** (`window.quickShop`) → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/starweb/{README,add-to-cart}.md`. Keep the quick-shop markup verbatim; `quickShop.init()` scans for it.
  **Prices:** build the price block the usual way (the price forms in `liquid-rules.md`) unless the caller says the shop needs Starweb's dynamicPriceHandler — then use the price markup in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/starweb/dynamic-price-handler.md` → *Tile markup*. Not told either way → build it the usual way and add to OPEN QUESTIONS: *"Starweb: does the shop have customer-unique prices, several currencies, or other price quirks? If yes, the price block moves to the dynamicPriceHandler markup."*
  **Labels and boost variants:** not in the Starweb feed. They come from the script in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/starweb/storefront-data.md`. Put `gallery-item` on the HR tile wrapper (`hr-product` in recom / pages, `hr-search-overlay-product` in search) and keep the tile's link as its direct child, `<a data-id="{{ product.extraData.id }}">` (Starweb's `productId`, indexed as `extraData.id`; not indexed → say so under MISSING DATA with the transform line `id: product.productId`). The tile markup is the same for every surface; only the wrapper and container in the selector differ. Native tiles showing `.campaign-label` badges → keep the `<figure>` around the image and add the page's optional campaign-labels functions; otherwise leave them out. Before handing over any of it, run the page's endpoint check (*Check the endpoints first*) with `browser_evaluate` on a native category page. Shops differ in which endpoints they have. Report the result under PLATFORM, ship only the code for endpoints that answered, and if neither did, say under MISSING DATA that labels can't be shown. Don't bind labels in Liquid. Put the script in JS with the selector for the target surface. In the PARITY TABLE, mark labels *runtime — Starweb storefront-data script*, not ✗.
- **BigCommerce** (Stencil / Cornerstone) → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/bigcommerce/add-to-cart.md`. Keep `[data-cart-item-add-from-card]` forms verbatim; the shell replaces the load-time-only native binding.
- **Wikinggruppen** (`/ajax/?action=cart-additem`) → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/wikinggruppen/README.md` — ATC tile Liquid (`extraData.kombinationsID` → `.js-product-item-add[data-cid]`) and the delegated XHR handler.
- **WooCommerce** → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/woocommerce/README.md` (gotchas only — no ATC/rating page yet). The native tile's ATC is normally `<a href="?add-to-cart=ID" class="add_to_cart_button ajax_add_to_cart" data-product_id="…">`; keep it verbatim, note the `data-product_id` feed mapping, and record under `PLATFORM` that WooCommerce binding is uncaptured so the shell flags it as MISSING DATA.
- **PrestaShop, Centra, other headless / unknown platforms** → no ATC recipe. Inspect the live tile, keep the real form `action` and field names verbatim, and record what you saw under `PLATFORM`; the shell decides whether it can bind it. Centra specifics: `centra.md`.
