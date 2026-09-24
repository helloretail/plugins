---
source: field
verified: 2026-09-24
---

# Starweb — dynamicPriceHandler

Starweb's dynamicPriceHandler is a global object that writes the price each shopper should see into Hello Retail product tiles — in their currency, and at their own price where the shop has customer-unique prices — with the amount, the thousand and decimal separators, and the currency symbol and its position. HR renders the tile with a fixed price markup; the handler looks each tile up by SKU and replaces the price text.

## When to use it

When Search, Recommendations or Pages is being set up on a Starweb shop, ask whether the shop has **customer-unique prices** (prices that depend on the logged-in customer), **several currencies**, or **other price quirks**. Don't assume the answer from the storefront; a guest session doesn't show customer-unique prices.

- **Yes to any of them** — use the handler. The feed holds one price per product and HR's `| price` formatting is one setting per website, so neither can follow the shopper.
- **No** — don't use it. Format prices as usual with `| price` (see [price formatting](../../cheat-sheets/recoms/general.md)). This includes a one-currency shop with a B2C/B2B (incl./excl. VAT) toggle, which is simpler to handle the usual way.

The developer skills ask this question themselves when they detect Starweb.

## Versions and activation

The handler comes in two versions, and they are not enabled the same way:

| Global | Status | Available on a shop |
| --- | --- | --- |
| `dynamicPriceHandler` | Older version, has known bugs | Automatically, on every Starweb shop |
| `dynamicPriceHandler25` | Updated version, fixes several of those bugs | Only after Starweb activates it for that shop |

Build against `dynamicPriceHandler25`:

1. Check which versions the shop exposes, in the storefront console:

   ```js
   Object.keys(window).filter((k) => k.startsWith("dynamicPriceHandler"));
   ```

2. If only `dynamicPriceHandler` is listed, ask Starweb support to activate `dynamicPriceHandler25` on the shop. Don't build on the older version to save time; its bugs are what the new version fixes.
3. The snippets below use `dynamicPriceHandler25`. If Starweb ships a newer version with a different suffix, replace the name everywhere.

## Tile markup

Every HR design that should get dynamic prices (Search, Recommendations, Pages) uses this structure in the tile:

```html
<div class="product-price hr-starweb-prices" data-sku="{{ product.productNumber }}">
  <div class="selling-price">
    <span class="price">
      <span class="hr-price hr-starweb-currentPrice">{{ product.price | price }}</span>
    </span>
  </div>
  <div class="original-price">
    <span class="price">
      <span class="hr-oldPrice hr-starweb-oldPrice">{{ product.oldPrice | price }}</span>
    </span>
  </div>
</div>
```

- The **first common parent** of the current and old price carries the class `hr-starweb-prices` and a `data-sku` attribute with the product's Starweb SKU.
- The elements holding the prices carry `hr-starweb-currentPrice` and `hr-starweb-oldPrice`.
- The Liquid prices inside are the fallback: they stay visible if the handler is missing, or if it can't match the product and `leaveDefaultPrice` is `true` (see [render](#setseparators-and-render)).

### Getting the SKU into `data-sku`

The SKU is often indexed as `productNumber` — then `{{ product.productNumber }}` works as above. If it isn't, index it as `extraData.sku` in the feed and use `data-sku="{{ product.extraData.sku }}"`.

V2 feed (inside the transform's `extraData`):

```js
sku: product.mainVariant.sku
  ? product.mainVariant.sku
  : Array.isArray(product.mainVariant.data) && product.mainVariant.data.length && product.mainVariant.data[0]?.sku
    ? product.mainVariant.data[0]?.sku
    : null
```

V1 feed:

```text
$("mainVariant sku").text()
```

Keep the feed's own `price` field correct even though the handler overwrites what the shopper sees: `isOnSale`, sort by price and the price filter all run on the indexed value.

## setSeparators and render

```js
dynamicPriceHandler25.setSeparators(" ", ",");        // (thousandSeparator, decimalSeparator)
dynamicPriceHandler25.render(priceList, false);       // (tiles, leaveDefaultPrice) → Promise
```

- `setSeparators(thousand, decimal)` — the separators to format with.
- `render(priceList, leaveDefaultPrice)` — `priceList` is every `.hr-starweb-prices` element to update. It returns a Promise.
- `leaveDefaultPrice` decides what happens to a tile Starweb can't match to a product:
  - `true` — the tile is left untouched, so the HR-rendered fallback price stays.
  - `false` — both `hr-starweb-currentPrice` and `hr-starweb-oldPrice` are emptied, so the tile shows no price.

## Recommendations

Declare the function in the recom design's JS, suffixed with the box key so several boxes on one page don't collide:

```js
function starwebHelloRetailPriceHandler_{{ key }}(selector) {
    const priceList = document.querySelectorAll(selector);
    if (!priceList.length) return;
    if (typeof dynamicPriceHandler25 !== "object") {
        console.warn("dynamicPriceHandler25 is not defined.");
        return;
    }
    dynamicPriceHandler25.setSeparators(" ", ",");
    dynamicPriceHandler25.render(priceList, false).catch((err) => {
        console.warn("Starweb price render failed:", err);
    });
}
```

Call it from Swiper's `on` hooks — `afterInit` for the first render, `slideChange` (with a short delay) for looped clones:

```js
on: {
    afterInit: function () {
        starwebHelloRetailPriceHandler_{{ key }}("#hello-retail-{{ key }} .hr-starweb-prices");
    },
    slideChange: function () {
        setTimeout(function () {
            starwebHelloRetailPriceHandler_{{ key }}("#hello-retail-{{ key }} .hr-starweb-prices");
        }, 200);
    }
},
```

If the slider already has an `afterInit` for [add to cart](./add-to-cart.md) (`quickShop.init()`), call both from the same hook — Swiper takes one handler per event.

## Search and Pages

One function serves desktop overlay, embedded and mobile search, and Pages. After a successful render it removes `hr-starweb-prices` from the tiles it handled, so later calls — more results loaded on scroll — only send the new tiles to Starweb.

```js
function starwebHelloRetailPriceHandler_search(selector) {
    const priceList = document.querySelectorAll(selector);
    if (!priceList.length) return;
    if (typeof dynamicPriceHandler25 !== "object") {
        console.warn("dynamicPriceHandler25 is not defined.");
        return;
    }
    dynamicPriceHandler25.setSeparators(" ", ",");
    dynamicPriceHandler25.render(priceList, false).then(() => {
        // Already priced — don't send these tiles to Starweb again on the next call.
        priceList.forEach((el) => el.classList.remove("hr-starweb-prices"));
    }).catch((err) => {
        console.warn("Starweb price render failed:", err);
    });
}
```

- **Search** — call it after **every** `fix_links(...)` call-site (initial content, search results, and the end of `load_more_results`), the same hook as Starweb's [add to cart](./add-to-cart.md). Because priced tiles lose the class, one selector covers every case:

  ```js
  starwebHelloRetailPriceHandler_search(".hr-overlay-search .hr-starweb-prices");
  ```

- **Pages** — call it once the products have rendered (`content.products.count` non-zero), with the Pages container's `.hr-starweb-prices` as the selector.

## Styling the injected prices

Starweb replaces the content of each price element with two spans — the amount and the currency symbol:

```html
<span class="hr-price hr-starweb-currentPrice">
  <span class="hr-starweb-currentPrice-price-span amount">2 187,50</span>
  <span class="hr-starweb-currentPrice-unit-span currency">kr</span>
</span>
<span class="hr-oldPrice hr-starweb-oldPrice">
  <span class="hr-starweb-oldPrice-price-span amount">2 905,63</span>
  <span class="hr-starweb-oldPrice-unit-span currency">kr</span>
</span>
```

Style them like any other element. To put the symbol before the amount, make the price element `display: flex` and give `.currency` a lower `order` than `.amount`.

That covers ordinary styling. If the handler's output itself is off, see the next section before writing workarounds.

## When the injected prices look wrong: escalate to Starweb

Sometimes the handler injects prices oddly: awkward markup or styling that is hard to target, or a price that doesn't display exactly like the native Starweb tile (format, rounding, which price is shown). Once the [tile markup](#tile-markup), `data-sku` and [calls](#setseparators-and-render) are confirmed correct, treat this as a bug in the dynamicPriceHandler, not something to fix on our side:

- Don't patch it with CSS overrides or JS that rewrites the injected spans. Such fixes break silently when Starweb changes the handler.
- Report it to Starweb support and ask them to fix the handler. Say which shop it happens on and which version it runs (`dynamicPriceHandler25`), and give an example product with its SKU, the currency, and how the HR tile differs from the native one.

### The Starweb test shop

Hello Retail has a test website, `hr.sw-test.se`, that Starweb usually troubleshoots the handler on. It has no fixed shop behind it; Starweb clones the affected shop onto it for each case. The usual flow:

1. When you report the issue, tell Starweb which shop it occurs on.
2. Starweb clones that shop to `hr.sw-test.se` and lets you know when it's done.
3. In Hello Retail, configure the test website's feed(s) and the affected solutions (Search, Recommendations, Pages) to match the customer's implementation: same tile markup, same handler calls.
4. Starweb troubleshoots on the test shop with the HR solutions in place.

Every escalation gets a fresh clone, so redo step 3 each time. Whatever is configured on the test website from the last case belongs to a different shop.

## Troubleshooting

- **Console shows `dynamicPriceHandler25 is not defined`** — Starweb hasn't activated the updated version on this shop yet; the shop only has the older `dynamicPriceHandler`, which is there by default. Check as in [Versions and activation](#versions-and-activation) and ask Starweb support to activate it.
- **A tile shows no price** — Starweb couldn't match its `data-sku` while `leaveDefaultPrice` is `false`. Compare the rendered `data-sku` with the product's SKU in Starweb; if the feed indexes a different identifier, map `extraData.sku` as above.
- **Prices correct on screen but sale badge, sorting or price filter wrong** — those use the feed's `price`, not the rendered one. Fix the feed.
- **Injected prices styled awkwardly or not matching the native tile** — most likely a handler bug. Ask the team first, then report it to Starweb as described in [When the injected prices look wrong](#when-the-injected-prices-look-wrong-escalate-to-starweb).

---

**Related:**

- Starweb's own documentation — [DynamicPriceHandler](https://starwebab.notion.site/DynamicPriceHandler-98c6dbd5b444448c926f771ff9bf8a93)
- Original D&TS write-up — [helloretail/dts_tips_and_tricks](https://github.com/helloretail/dts_tips_and_tricks/blob/main/helloretail-starweb-dynamic-price-handler.md)
- [Starweb overview](./README.md) · [Starweb add to cart](./add-to-cart.md)

---

## Timeline

- 2026-09-24: Page created from the team's Starweb notes and the D&TS dynamicPriceHandler write-up. Recom selector aligned with the base template root (`#hello-retail-{{ key }}`); Search call-sites consolidated onto the `fix_links` hook.
- 2026-09-24: Corrected activation: the older `dynamicPriceHandler` is on every Starweb shop by default; the bug-fixed `dynamicPriceHandler25` has to be activated per shop by Starweb.
- 2026-09-24: Added escalation guidance for handler rendering bugs and the `hr.sw-test.se` test shop Starweb uses for troubleshooting.
- 2026-09-24: Added customer-unique prices as a reason to use the handler, and the question to ask before building.
