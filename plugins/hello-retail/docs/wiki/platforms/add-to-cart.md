---
source: field
verified: 2026-09-15
---

# Add to cart — cross-platform rules

How to wire the add-to-cart form inside a Hello Retail tile into each ecommerce platform's cart. The form is the **shop's own**, copied into the tile by `tile-extractor` (no Hello Retail form or class inside the tile — its Output Rule 15); the surface then binds it. **Cross-cutting**: the same recipe serves Search overlay results, Recommendation sliders and Pages, because all three render products from the same tile. Older designs still carry Hello Retail form classes (`.aw-buy-form`, `.hr-form`); the selectors below name the shop's own form first and the legacy class after it.

This is the single most platform-dependent part of an HR install — each platform has its own cart API, its own form-binding mechanism and its own quirks. The platform pages hold the code; this page holds what is common: how to tell which platform you are on, which hook to bind from per surface, and the selector / API each platform uses.

## Per-platform pages

| Platform | Page | Mechanism |
| --- | --- | --- |
| Shopify | [shopify/add-to-cart.md](./shopify/add-to-cart.md) | `POST /cart/add.js`; the theme's `<product-form>` / `form.js-product-form` copied into the tile, delegated submit; Quick View re-init |
| Magento 2 (Luma / Hyvä) | [magento/add-to-cart.md](./magento/add-to-cart.md) | `uenc` + `form_key` injection, `mage/mage` or `x-magento-init` binding, swatch renderer for configurables |
| Shopware 6 | [shopware/add-to-cart.md](./shopware/add-to-cart.md) | `PluginManager.initializePlugins` over `form.buy-widget` |
| Starweb | [starweb/add-to-cart.md](./starweb/add-to-cart.md) | `quickShop.init()` |
| Viskan (Streamline / NG) | [viskan/add-to-cart.md](./viskan/add-to-cart.md) | `window.viskan.cart.add(plu, qty)` from a delegated click handler with a quantity stepper |
| DanDomain / Lightspeed | [dandomain/add-to-cart.md](./dandomain/add-to-cart.md) | plain form POST, no JS |
| BigCommerce Stencil | [bigcommerce/add-to-cart.md](./bigcommerce/add-to-cart.md) | `POST /remote/v1/cart/add` with `FormData`; CSRF headers injected by the storefront |
| Wikinggruppen | [wikinggruppen/add-to-cart.md](./wikinggruppen/add-to-cart.md) | newest theme: the theme's own delegated handler (`WGR.cart.addItem`) catches Hello Retail tiles — copy the native tile markup, add no cart JS; older themes in the page's caveats |

## Quick reference: selector and API per platform

| Platform | Cart API | Form / trigger selector | Init pattern |
| --- | --- | --- | --- |
| Shopify | `POST /cart/add.js` (form-encoded) | `form.js-product-form` (the copied theme form; legacy designs: `.hr-form`) | delegated `submit`, `fetch`, cart-section refresh + the theme's cart-change event |
| Magento | form POST to `/checkout/cart/add/...` with `uenc` | `[data-role=tocart-form]` (the copied theme form; legacy designs: `.aw-buy-form`) | `mage('catalogAddToCart')` or `x-magento-init` + `catalogAddToCart` (Luma); plain POST (Hyvä) |
| Shopware | Shopware `PluginManager` | `form.buy-widget[data-add-to-cart="true"]` | `PluginManager.initializePlugins(selector, formEl)`, once per form |
| Starweb | `quickShop` module | (handled internally by `quickShop`) | `quickShop.init()` |
| Viskan (Streamline / NG) | `window.viskan.cart` JS API (`add(plu, qty)`, `get()`) | `.hr-cta-button` buy button + `.hr-qty-container` stepper | delegated `click` on `document`, `await window.viskan.cart.add(...)`, then a state sweep; fires GA4 events itself |
| DanDomain / Lightspeed | native form POST | the tile's own form | none |
| BigCommerce | `POST /remote/v1/cart/add` (`FormData`) | `form[data-cart-item-add-from-card]` | per-form submit listener, guarded |
| Wikinggruppen | `WGR.cart.addItem` → `/ajax/?action=cart-additem` (called by the theme) | `.js-product-item-add[data-cid]` inside `.js-product-item[data-title][data-artno][data-price]` | none — the theme delegates on `document` / `body`; never bind a second handler |

## Platform inference (storefront-side — never feed shape)

Both Search and Recom need the platform to pick the cart binding. Infer it from the surveyed storefront, in order of reliability — **never from HR feed shape** (feed shape reflects feed config, not the e-commerce platform):

| Signal | Platform |
|---|---|
| Storefront host or image URLs match `cdn.shopify.com` / `*.myshopify.com` | Shopify |
| Image URLs match `/media/catalog/product/cache/` | Magento |
| Tile has `<li class="grid__item">` + `.card-wrapper` + `.card__media` | Shopify (Dawn / Dawn fork) |
| Tile has `<li class="item product product-item">` + `.product-item-photo` + `.price-box` | Magento |
| Tile's ATC `<form action>` is `/cart/add` (or `/<locale>/cart/add`) | Shopify |
| Tile's ATC `<form action>` contains `/checkout/cart/add/uenc/` | Magento |
| `Shopify` global / `cdn.shopify.com` script in `<head>` | Shopify |
| `mage/cookies.js`, `requirejs-config.js`, `Magento_*` in `<head>` | Magento |
| `typeof window.require === 'undefined'` and `[x-data]` present on a Magento DOM | Magento 2 Hyvä |
| `form.buy-widget[data-add-to-cart]`, `PluginManager` global | Shopware |
| `window.quickShop` global | Starweb |
| `window.viskan.cart` global (Streamline also has `window._streamline` / `window.v12`, `#Streamline` root element) | Viskan (Streamline / NG) |
| Assets on `cdn11.bigcommerce.com/s-.../stencil/`, `csrf-protection-header-*.js` in `<head>` | BigCommerce Stencil |

## Before binding — check whether it already works

**Click the tile's buy button for real before writing any cart code.** A copied form often works with no JavaScript from Hello Retail, for one of two reasons — you do not need to know which before testing:

- **Custom elements upgrade themselves.** Shopify's `<product-form>`, `is="product-form"` on a form or `is="custom-button"` on its button are upgraded by the browser wherever and whenever the markup is inserted.
- **The theme rebinds on its own.** Commonly a `MutationObserver` (sometimes a periodic re-scan) that binds each new matching element and marks it with a `data-*` attribute, such as `data-quick-add-listener-added`, so it is not bound twice.

How to check: once the tile renders in the design, click its buy button with a real click (Playwright `browser_click`, or the Chrome `computer` tool — never `.click()` or a dispatched event, which are unreliable here) and see whether the cart updates.

- **The cart updates** → write no cart code, and add nothing at the surface's hook. Note in the build report that it worked natively, and by which of the two mechanisms when you can tell. A binding added anyway is dead code at best and a double add-to-cart at worst.
- **It does not** → bind it, from the platform's page above and at the surface's hook below.

**Never write a fallback for a mechanism you have not confirmed on this shop.** In

```js
if (window.QuickAddModal && typeof window.QuickAddModal.open === "function") {
    window.QuickAddModal.open(url);
} else {
    window.location.href = url;
}
```

the `else` runs on **every** click when `window.QuickAddModal` does not exist on this storefront, and it overrides whatever the theme's own handler would have done — worse than writing nothing. Before any condition on a global, a function or a class hook, confirm it in the live page (`typeof window.TheGlobal` in the browser, or the real mechanism in the DOM: a marker attribute, a custom-element tag, a delegated listener). A name remembered from another shop's build is not confirmation.

**The mechanism cannot be identified** → leave the control unbound and report it as missing data. Never ship a guess as an `else` branch.

## A platform with no page

The platforms in [Per-platform pages](#per-platform-pages) are the documented ones. For any other platform (WooCommerce and PrestaShop, for example) keep the shop's form markup as the tile skill copied it, **do not bind it**, and report:

```
ATC JS not wired — <platform> cart binding not documented; needs operator-supplied snippet.
```

Never invent a binding.

## Binding per surface

The per-platform cart **call** is the same regardless of surface. What differs is **when** you bind and **what you scope to**, because Search re-renders a grid and Recom runs a looped slider with DOM clones:

| Surface | Hook | Scope | Idempotency |
| --- | --- | --- | --- |
| **Search overlay** | Call the binding after **every** `fix_links(...)` (initial render *and* end of `load_more_results`) so appended tiles bind too. `mobile-overlay` uses `ui_utility_vanilla.fix_links`. | `.hr-overlay-search` (embedded variant: its container class) | Guard each form with a `data-*` flag or rely on the platform's no-op re-init. Double-bind = double add-to-cart. |
| **Recom slider** | Bind via Swiper `on: { afterInit }` (fires once every slide, **clones included**, exists) and/or **delegated** handlers. No `fix_links` in recom. | `#hello-retail-{{ key }}` | `loop: true` clones forms — prefer delegation, or a `data-*` guard inside `afterInit`. Never per-element listeners bound at load. |
| **Pages** | Call after `content.products.count` is non-zero. | the box container | re-init safe |

The cart call itself is identical across surfaces (e.g. Shopify = `POST /cart/add.js`; see each platform page). Only the wrapper differs:

```js
// Search wrapper — guarded forEach, re-run after each fix_links(); the selector is the shop's own form
document.querySelectorAll(".hr-overlay-search form.js-product-form").forEach(function (form) {
    if (form.dataset.hrBound) return;          // idempotent
    form.dataset.hrBound = "true";
    form.addEventListener("submit", onSubmit); // onSubmit = the platform cart call
});
```

```js
// Recom wrapper — delegated, clone-safe (loop: true)
$(document).on("submit", "#hello-retail-{{ key }} form.js-product-form", onSubmit);
```

Bind only after the check in [Before binding](#before-binding--check-whether-it-already-works) says the button does not work on its own.

## Click tracking on the buy button

Every buy / add-to-cart element in a Hello Retail tile carries the click-tracking call, on every surface and every platform:

```html
<button type="button" class="…the shop's own classes…" onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])">…</button>
```

- **Always, also when the button is copied verbatim.** A shop's native buy button never has this call, so copying it as-is (`tile-extractor` Output Rule 10) always leaves it out. Adding it is part of copying a buy button, not a separate step to remember.
- **Prepend, never replace.** When the native button already has an `onclick`, the tracking call goes first: `onclick="hrq.push([…]); originalHandler()"`.
- **Buy actions only.** Variant, info, view and sold-out CTAs and the tile links navigate to the product page; `fix_links` (`#aw_source=`) attributes those clicks, so they get no `trackClick`.
- **Added when the tile is copied.** `tile-extractor` places the call on the copied button and checks its finished tile before hand-over (its Output Rule 11), so a tile built from the shop's markup never leaves without it.
- **Verify with a real click:** the network shows `POST https://core.helloretail.com/serve/collect/click` next to the shop's own cart request. `POST /serve/collect/cart` alone is the generic cart collection, not click attribution.

Without the call, add-to-cart clicks from Hello Retail tiles are never attributed to Hello Retail. Real case (2026-10): a desktop search shipped for two weeks with the shop's native buy button copied verbatim and no `trackClick`, until search QA flagged it.

## Related

- Platform pages: [platforms.md](./platforms.md)
- Features: [search](../features/search/search.md) · [product-recommendations](../features/product-recommendations/product-recommendations.md)

---

## Timeline
- 2026-05-21: Category created to consolidate cross-cutting cart-integration patterns.
- 2026-09-14: Moved here from `cheat-sheets/add-to-cart/README.md` to sit with the platform pages; the per-platform cheat-sheet copies were merged into `platforms/<platform>/add-to-cart.md`. Corrected the Viskan row — the recipe is a delegated click handler with a stepper, not an `.hr-form` submit binding — and added the DanDomain, BigCommerce and Wikinggruppen rows.
- 2026-10-08: Added *Click tracking on the buy button* — the rule, the copy-verbatim trap, and where `tile-extractor` adds it.
- 2026-09-23: The tile carries the shop's own form, never a Hello Retail one; selectors now name the copied theme form first and the legacy `.hr-form` / `.aw-buy-form` classes only for reading older designs.
- 2026-11-12: Added *Before binding — check whether it already works* and *A platform with no page*, moved here from the Search and Recommendations developer skills so every surface and platform page reads one copy.
- 2026-11-03: Wikinggruppen rows now point to `wikinggruppen/add-to-cart.md`: on the newest WGO theme the theme's own delegated handler covers Hello Retail tiles, so no cart JS is added.
