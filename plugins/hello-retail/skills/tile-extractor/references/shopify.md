# Shopify — tile reference

Read before writing a Shopify tile's ATC form, rating widget, or ATC JavaScript.

**Detection:** `cdn.shopify.com`, `myshopify.com`.

**Section IDs** (`section-id`) are page-specific and **not** in the feed — omit them entirely.

---

## Add to cart — copy the shop's own form

**Never a Hello Retail form.** The tile keeps the theme's `<product-form>` / `form.js-product-form`
markup exactly as the category page has it — custom elements upgrade themselves when inserted, so
much of it works without any binding — with the variant id bound to the feed and the tracking call
of Output Rule 11 on the submit button. The binding, when one is needed, is the shell's job:
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopify/add-to-cart.md` → **Approach B** (AJAX add +
cart-section refresh + quick-add dialog).

That page's **Approach A** (Hello Retail's own `.hr-form` inside the tile) is retired: Output Rule 15
forbids any Hello Retail element or class inside the tile. Do not use it even while the page still
lists it.

---

## Rating — Loox

**Widget markup + re-init:** `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopify/rating.md`. `window.LOOX.inject2()` /
`inject()` re-renders the widgets — the rating part of the generic JS engine (`references/js-engine.md`)
already calls it, so no extra wiring is needed.
