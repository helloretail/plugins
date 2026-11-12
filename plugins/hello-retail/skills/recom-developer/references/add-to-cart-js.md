# Add-to-cart JS wiring — make the slider's ATC form work, per platform

The tile skill emits the ATC **form markup** inside `{{ TILE_BODY }}` (only when the customer's tile already has one). That markup is inert until JS binds it to the platform's cart. This is the recom shell's job, and it's clone-aware: the recom slider runs `loop: true`, so binding happens via the swiper **`on: { afterInit }`** hook and/or **delegated** handlers — never per-element listeners bound at load. The mechanics of the hook and why clones force delegation are in `references/slider-structure.md`.

Recom has **no `fix_links`** — that's Search's render hook. The recom render hook is Swiper's `afterInit`, which fires once every slide (clones included) exists.

## What is shared, and where it lives

Everything about add-to-cart that is the same on every surface is in one wiki page, **`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md`**. Read these sections there; they are not repeated here:

| Section in that page | What you take from it |
|---|---|
| *Platform inference* | The platform, from the surveyed storefront. You never ask the operator for it, and never read it from the feed's shape. |
| *Before binding — check whether it already works* | The real click on a rendered slide's buy button before any cart code; never a fallback for an unconfirmed global. |
| *Per-platform pages* | Which platforms are documented, and each one's page. |
| *Binding per surface* → Recom slider | Hook `afterInit` and/or delegation, scope `#hello-retail-{{ key }}`, idempotent. |
| *Click tracking on the buy button* | `trackClick` on every buy button and only there — confirm the tile skill's button carries it. |
| *A platform with no page* | Leave the form unbound and add the `ATC JS not wired — …` MISSING DATA line. Never invent a binding. |

## Per platform — which block, and how it binds in a slider

The cart code is the **Recom slider** block of the platform's page, `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/<platform>/add-to-cart.md`. What stays your call in the recom shell is *how* it binds:

| Platform | Block to use | Binds how |
|---|---|---|
| Shopify | `shopify/add-to-cart.md` → *Binding the copied theme form*; its *Notes* for the drawer event | The copied theme form often needs nothing (`<product-form>` upgrades itself in clones too). If the real click fails: the **delegated** `submit` IIFE, selector scoped to `#hello-retail-{{ key }} form.js-product-form`. |
| Magento | `magento/add-to-cart.md` → *Step 2*, the *Recom slider* block (Luma or Hyvä per its *Step 0*) | `uenc` + `form_key` injection mutates each form, so it runs in **`afterInit`**, idempotently. Leave `awuenc` / `uenc` as placeholders in the Liquid. Swatches and size filters stay **delegated** — a separate concern from ATC. |
| Shopware | `shopware/add-to-cart.md` → *Recom slider* | PluginManager re-init in **`afterInit`**. |
| Starweb | `starweb/add-to-cart.md` → *Recom slider* | `quickShop.init()` in **`afterInit`**; it re-scans the DOM, so no guard is needed. Shares `afterInit` with the price handler when the shop uses one. |
| BigCommerce | `bigcommerce/add-to-cart.md` → *Recom slider* | The page's binding over the slides in **`afterInit`**, with its `data-*` guard. |
| Viskan | `viskan/add-to-cart.md` → *Recom slider* | The page's **delegated** click handler unchanged; its state sweep from **`afterInit`**. |

DanDomain / Lightspeed and Wikinggruppen need nothing from this surface: a plain form POST, or (newest Wikinggruppen theme) the theme's own handler — `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` → *Per-platform pages*. Never bind a second handler there; an older Wikinggruppen theme is the exception, in `wikinggruppen/README.md` → *Caveats for older themes*.

## Where this JS lives

All of it goes inside `recom.liquid`'s inline `<script>` (the `(function(_) { … })(ADDWISH_PARTNER_NS)` swiper IIFE): the `add_to_cart(root)` function before the `_.util.swiper_slider(...)` call, wired to `on: { afterInit }`; delegated handlers after the init. There is no separate JS field to push — it's all part of `templateCode`.
