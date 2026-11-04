---
source: field
verified: 2026-11-03
---

# Wikinggruppen (WGO)

Wikinggruppen is a Nordic ecommerce platform used by Swedish/Nordic merchants. It is not in Hello Retail's officially supported platform list — treat it as a custom integration using the [General Guide](https://support.helloretail.com/platforms-and-newsletter-providers/general-guide-for-hello-retail-integration-with-third-party-platforms/).

WGO storefronts run on one of several theme generations. **This page and its sub-pages describe the newest theme as the standard**: that is what new customers are set up on. Older themes behave differently in a few places; those differences are collected under [Caveats for older themes](#caveats-for-older-themes) at the bottom, so they don't get copied into a new setup by accident.

**Pages:**

- [feeds.md](./feeds.md): the native product export, the V2 feed config and the column → field mapping
- [add-to-cart.md](./add-to-cart.md): the theme's own cart handler, the tile markup it needs, and why a new setup adds no cart JavaScript; favorites (the heart button)
- [multi-currency.md](./multi-currency.md): showing the right price on shops that sell in several currencies

---

## Which theme is it?

Run this in the console on the storefront (any page):

```javascript
({
  jquery: window.jQuery && jQuery.fn.jquery,
  wgrCartAddItem: typeof (window.WGR && WGR.cart && WGR.cart.addItem),
  nativeListHandlerDelegated: [document, document.body].some(function (el) {
    var ev = jQuery._data(el, 'events');
    return !!(ev && ev.click && ev.click.some(function (h) { return h.selector === '.js-product-item-add'; }));
  })
})
```

| Result | Theme | What to use |
|---|---|---|
| jQuery 3.x, `wgrCartAddItem: "function"`, `nativeListHandlerDelegated: true` | **Newest (the standard)** | Everything on these pages as written |
| jQuery 1.11, `wgrCartAddItem: "function"`, `nativeListHandlerDelegated: false` | Older | [Caveats → Older theme with `WGR.cart`](#older-theme-with-wgrcart) |
| jQuery 1.11, `wgrCartAddItem: "undefined"`, a global `popCartRefreshBufferData` function | Oldest | [Caveats → Oldest theme without `WGR.cart`](#oldest-theme-without-wgrcart) |

On the newest theme the theme's list handler is bound on `document` or on `body` — both bubble from Hello Retail tiles, so either counts.

---

## Standard setup (newest theme)

### Feed

The shop's own Hello Retail export at `https://<shop-domain>/csv/?action=addwish-products` — semicolon CSV, hourly, no credentials. Field mapping and naming rules: [feeds.md](./feeds.md).

**extraData keys are English camelCase** — `combinationId`, `productId`, `hasVariants` — even though the export's columns are Swedish (`KombinationsID`, `ProduktID`, `Valalternativ`).

### Product tile

Copy the theme's own list tile. Its class names are stable across WGO shops:

| Element | Markup |
|---|---|
| Tile root | `.product-item.js-product-item` with `data-title`, `data-artno`, `data-price` (the cart handler reads them — see [add-to-cart.md](./add-to-cart.md)) |
| Image | `.product-item__img` → `a` → `img.js-product-item-img` |
| Title | `h3.product-item__heading` |
| Price | `span.price`; on sale `span.price.price-discount` + `span.muted.price-original` |
| Buy button | `a.btn.btn--primary.js-product-item-add[data-cid]` |
| Favorites | `.product-item__favorite-icon.js-favorites-flip[data-combination]` |

### Add to cart

No custom JavaScript. The theme's own delegated handler catches clicks on Hello Retail tiles and does the cart call, the fly-to-cart animation and its GA / Facebook events. Markup and the full rule set: [add-to-cart.md](./add-to-cart.md).

### Search

- Two configs: a desktop design (overlay or embedded) and a mobile overlay, split at **992 px** (desktop `> 992`, mobile `<= 992`).
- The search trigger selector depends on the shop's header — read it from the live storefront; it is not the same across shops.
- **Hide the shop's native autocomplete** while the Hello Retail search is open; otherwise WGO's own suggestion dropdown opens on top of (or under) the Hello Retail results. Find its container on the live storefront by typing in the search field — the markup differs between themes. Seen so far: `.l-constrained.autocomplete.js-autocomplete` (newest theme) and `.l-autocomplete` (oldest theme), hidden with `display: none !important` in the search design's CSS.

### Category pages (probably universal)

Recommendation boxes on category pages read the page context with the same three selectors on shops of different theme generations, so treat them as the WGO default and only deviate when the live page differs:

| Context | Crawl | Notes |
|---|---|---|
| `hierarchies` | `$("ol.breadcrumbs").text().split("/").removeMatching(/{HOME_BREADCRUMB}/).asHierarchy()` | The breadcrumb is `ol.breadcrumbs` (newest theme: `ol.nav.breadcrumbs`). Its items carry the `/` separator in their text (`Startsida/`), so split the whole text on `/`. See [Removing the start-page crumb](#removing-the-start-page-crumb) below. |
| `extraData.pageTitle` | `$(".category-heading").text()` | The category's `h1`. |
| `extraData.showRecom` | `$(".grid-gallery--products .product-item:nth-child(12)").exists()` | `true` when the category lists at least 12 products. Use it as a step condition to show a "top in category" box only on categories with enough products of their own. |

#### Removing the start-page crumb

Remove the start-page crumb **by its text**, not by its position: `removeMatching(/{HOME_BREADCRUMB}/)`, where `{HOME_BREADCRUMB}` is the shop's own start-page label (for example `Startsida`).

- **Why not `.slice(1)`:** some shops add the start-page crumb with JavaScript *after* the page has loaded. If the crawl runs before that, `.slice(1)` drops the first **real** category level instead. Matching the label removes the right crumb whenever it is there.
- **More than one crumb to drop:** pass every label — `removeMatching("String 1", "String 2")`.
- **`.slice(1)` is the fallback** for a shop whose start-page crumb has no stable label to match, and only when that crumb is in the server-rendered HTML.

One oldest-theme shop reads the breadcrumb item by item instead: `$("ol.breadcrumbs li").fns("text").removeMatching(/{HOME_BREADCRUMB}/).asHierarchy()`. Check the item text on the live page before choosing — if it carries the `/`, use the first form.

### Staging hosts

WGO test and staging copies of a shop run on `<shop-domain>.wikinggruppen.info`. They are set up as separate TEST websites in Hello Retail.

---

## ⚠️ `initializationCode` warning

`initializationCode` in the HR Search dashboard is the **full ~500-line search initialization script** (not a small config block). It contains all overlay setup, event binding, filter handling, and scroll-to-load logic.

**Always read the existing code via `search_getDesign` before pushing.** Append custom code at the end — never replace the field from scratch unless you are intentionally rebuilding the whole design. The base is the design `search_createConfig` attaches — the wiki keeps no copy of it.

Code appended to `initializationCode` that runs after each render (initial render **and** every load-more / infinite-scroll batch) runs again on tiles that are already in the DOM. Never bind click handlers there — see [add-to-cart.md → Don't bind your own handler](./add-to-cart.md#dont-bind-your-own-handler).

---

## Caveats for older themes

Use these only when [Which theme is it?](#which-theme-is-it) says the shop is **not** on the newest theme, or when editing an existing setup that already follows them. Don't carry them into a new setup.

### Older theme with `WGR.cart`

jQuery 1.11; `WGR.cart.addItem` exists, but the theme binds its list handler **directly on each of its own buttons**, so it never sees buttons inside Hello Retail tiles. A Hello Retail tile here needs its own handler: one delegated click listener, bound once, that calls `WGR.cart.addItem({ combinationID: <id>, quantity: '1' })`. On this theme `addItem` posts to `/ajax/?action=cart-additem&lang=` + `WGR.cartParams.languageCode`. Not click-tested from a Hello Retail tile yet.

### Oldest theme without `WGR.cart`

jQuery 1.11; no `WGR.cart`. The theme exposes a global `popCartRefreshBufferData()` and an `animationSettings` object. Its buy button is `a.btn.btn--primary.buybuttonRuta` with `href="/checkout/?action=additem&id=<productId>"`.

The setup that works here (click-tested from search and recommendation tiles, one add per click also after infinite scroll):

```text
POST /ajax/?action=cart-additem&lang=<languageCode>
Content-Type: application/x-www-form-urlencoded

combinationID=<combinationId>&quantity=1
```

On a 200 response, pass the raw response text to the theme: `popCartRefreshBufferData(xhr.responseText, false, false)`. Bind the handler once (guard it), not on every render.

### Older feed key names

Setups made before the naming rule use Swedish or mixed key names: `extraData.kombinationsID`, `extraData.productID`, `extraData.hasVariant`. When editing an existing design, use the keys that shop's feed actually has (`dataFields_getProductFields`). New setups use `combinationId`, `productId`, `hasVariants`.

### Google Shopping XML feed

Some early setups read the shop's Google Shopping export (`/butikadmin/googleshopping.php?action=feed&id=1`) instead of the CSV export. None of the fields mapped from it (`g:id`, title, price, link, image, availability, GTIN) is the `KombinationsID` the cart needs. Move such a shop to the CSV export.

### Withdrawn from an earlier version of this page

- **The `#js-topcart-body` / `.js-m-cart-modal` handler.** An XHR to `/ajax/?action=cart-additem` with `isPopup=false` and `X-Requested-With`, injecting `htmlHeader` / `htmlBody` into those elements. Not found in any live setup or theme surveyed; don't use it.
- **"The base CSS resets `padding-inline-start: 0` on every descendant."** Not present in any desktop or mobile search design surveyed (base versions 1.0.x and 1.2). If an element loses its padding, check that design's CSS instead of assuming the reset.

---

## Timeline

- 2026-06-22: Page created from a Wikinggruppen Search onboarding. ATC AJAX endpoint confirmed by XHR interception.
- 2026-11-03: Rewritten from the Hello Retail configs of three live WGO setups and storefront checks of nine (three theme generations), with add-to-cart click-tested on the storefronts (cart calls stubbed). The newest theme is now the standard: the theme's own delegated handler, no custom cart JS, English camelCase feed keys (`combinationId`). The earlier delegated-XHR recipe and the padding-reset claim moved to *Caveats for older themes*. Split into `feeds.md` and `add-to-cart.md`. Added the native-autocomplete rule, the category-page context crawl (probably universal), list-size images, favorites and the multi-currency setup (`multi-currency.md`).
