---
source: field
verified: 2026-11-03
---

# Wikinggruppen — Add to cart

Add to cart on the **newest WGO theme** (see [README.md → Which theme is it?](./README.md#which-theme-is-it)). Older themes: [README.md → Caveats for older themes](./README.md#caveats-for-older-themes).

**The rule: copy the theme's tile markup and add no cart JavaScript.** The theme binds its list handler, `productListItemAddToCart`, as a delegated jQuery click listener on `document` (some shops: `body`) for `.js-product-item-add`. Hello Retail's search overlay and recommendation boxes are rendered inside `body`, so a click on a Hello Retail buy button bubbles up to that listener exactly like a click on a native tile.

Verified on the storefront (cart call stubbed): one click on a Hello Retail search tile with no Hello Retail cart JS → one `WGR.cart.addItem({ combinationID, quantity: "1" })`, plus the theme's fly-to-cart animation and its GA and Facebook add-to-cart events. The page does not navigate.

---

## What the theme's handler reads

`productListItemAddToCart` starts from the clicked button and reads everything else from the tile around it. Each item below is required unless marked optional:

| Element | Read as | If missing |
|---|---|---|
| Button `.js-product-item-add` with `data-cid` | `combinationID` for the cart call | Nothing is added |
| Tile root `.js-product-item` (closest ancestor of the button) | container for the next three | Handler throws |
| `data-title` on the tile root | GA product name | Handler throws — it calls `.data('title').toString()` |
| `data-artno` on the tile root | GA / Facebook article number | Handler throws — `.toString()` again |
| `data-price` on the tile root | Facebook event value | Facebook event skipped |
| `data-price-excl-vat` on the tile root (optional) | GA value excl. VAT | GA event sent without it |
| `img.js-product-item-img` inside the tile | fly-to-cart animation source | No animation |
| `.is-add-to-cart-body` + `.is-add-to-cart-preloader` inside the button (optional) | spinner while the call runs | No spinner |
| `.js-product-items[data-slotid]` around the tile (optional) | `clickedslot` cookie | No cookie |

`WGR.cartParams.buyButtonAction` decides what a click does. It is `flyToCart` on the shops surveyed. When a shop is set to `directlyToCheckout`, the same handler sends the shopper to `/checkout/?action=additem&combinationID=<id>` instead — nothing to change in the tile.

---

## Tile markup

```liquid
<div class="product-item js-product-item"
     data-title="{{ product.title | escape }}"
     data-artno="{{ product.productNumber }}"
     data-price="{{ product.price }}">
  <div class="product-item__img">
    <a href="{{ product.url }}">
      <img class="js-product-item-img" src="{{ product.imgUrl }}" alt="{{ product.title | escape }}">
    </a>
  </div>
  <div class="product-item__body">
    <h3 class="product-item__heading"><a href="{{ product.url }}">{{ product.title }}</a></h3>
  </div>
  <div class="product-item__buttons">
    {% if product.inStock and product.extraData.hasVariants != "true" and product.extraData.combinationId %}
      <a class="btn btn--primary js-product-item-add"
         href="/checkout/?action=additem&amp;combinationID={{ product.extraData.combinationId }}"
         data-cid="{{ product.extraData.combinationId }}"
         rel="nofollow"
         onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])">
        <span class="is-add-to-cart-body">Köp</span>
        <span class="is-add-to-cart-preloader"></span>
      </a>
    {% else %}
      <a class="btn btn--primary" href="{{ product.url }}">Köp</a>
    {% endif %}
  </div>
</div>
```

- **`combinationId`** is the feed's `extraData.combinationId`, mapped from the export's `KombinationsID` column ([feeds.md](./feeds.md)).
- **Products with variants** (`extraData.hasVariants == "true"`) and products **out of stock** link to the product page, where the shopper picks the variant.
- **`href`** is the no-JavaScript fallback. The theme's handler returns `false`, so the link is not followed when the handler runs.
- **`trackClick`** goes on the buy button as on every platform ([../add-to-cart.md → Click tracking on the buy button](../add-to-cart.md#click-tracking-on-the-buy-button)).
- Copy the remaining markup (price block, badges, favorites, preloader icon) from the shop's own list tile; the class names are listed in [README.md → Product tile](./README.md#product-tile).

---

## Don't bind your own handler

Don't add a click handler for `.js-product-item-add` in `initializationCode` or in a recommendation design's JavaScript. The theme's handler already covers the button, and a second handler only adds risk:

- Search code that runs after each render runs again after every load-more / infinite-scroll batch. A direct `$('.js-product-item-add').on('click', …)` there stacks one more handler on every tile already on the page. Observed on a live setup: after four infinite-scroll batches, one click on an early tile added the product **five times**.
- A copy of the theme's handler pasted into the design goes stale when the theme updates; the theme's own handler doesn't.

If a shop needs behaviour the theme's handler doesn't give, put a class of your own on the Hello Retail button instead of `js-product-item-add` (one setup uses `hr-product-item-add`) so the theme's handler skips it. Bind that class **once**, delegated, and call the theme's API rather than the endpoint:

```javascript
// Bound once — never inside render / load-more callbacks.
jQuery(document).on('click', '.hr-product-item-add', function (e) {
  e.preventDefault();
  WGR.cart.addItem({ combinationID: jQuery(this).data('cid'), quantity: '1' });
});
```

---

## Favorites (heart button)

Markup, the same on the newest-theme shops surveyed: the theme's heart, `.product-item__favorite-icon.js-favorites-flip`, with the combination ID on it:

```liquid
<div class="product-item__favorite-icon js-favorites-flip" data-combination="{{ product.extraData.combinationId }}">
  <!-- the shop's own heart icons (icon-off / icon-on) -->
</div>
```

The theme's handler (`flip`) posts to `/my-favorites/?action=ajax&stage=add` or `stage=remove` with the combination ID and toggles `is-active` on the heart. **Unlike the cart handler, how the theme binds it differs between newest-theme shops**, so check before deciding whether the design needs JavaScript:

```javascript
[document, document.body].some(function (el) {
  var ev = jQuery._data(el, 'events');
  return !!(ev && ev.click && ev.click.some(function (h) { return h.selector === '.js-favorites-flip'; }));
})
```

| Result | Theme binding | What to do |
|---|---|---|
| `true` | delegated — reaches Hello Retail tiles | Copy the markup, **add no JavaScript**. Click-tested: one `stage=add` call from a Hello Retail recommendation tile with no Hello Retail favorites code. |
| `false` | directly on each native heart at page load — never reaches Hello Retail tiles | The design needs its own handler, bound once and **scoped to Hello Retail's container** (`.hr-overlay-search`, `#aw-box-{{ key }}`). |

When the design has to bind it, don't paste the theme's favorites module with its unscoped `$('.js-favorites-flip').on('click', …)`. Observed on a live setup: the pasted module ran once per recommendation box, leaving four handlers on every Hello Retail heart and a second handler on every native heart on the page. A delegated listener on the Hello Retail container, bound once, avoids both.

---

## The theme's cart API

For reference — a Hello Retail design calls none of this directly on the newest theme.

```javascript
// WGR.cart.addItem, as shipped by the newest theme (minified source, reformatted)
function addItem(options) {
  if (WGR.cartParams.buyButtonAction == 'directlyToCheckout') { return true; }
  WGR.mobileCart.prepareModal();
  return $.ajax({
    url: '/ajax/?action=cart-additem' + WGR.getURLLanguageParameter(false),
    type: 'POST', data: options, dataType: 'json'
  }).done(function (data) {
    WGR.popCart.refreshBufferData(data, false, false);
    WGR.popCart.viewBuffer(true, true);
    WGR.mobileCart.openModal(data);
    // …adds and removes the is-new-m-cart-item body class
  });
}
```

The handler also dispatches a `CartItemAdded` CustomEvent on `document` when the call completes; listen to it if a design needs to react to a successful add.

---

## Timeline

- 2026-11-03: Page created from storefront checks of nine live WGO setups. Newest-theme behaviour click-tested on two storefronts (cart calls stubbed, nothing added to real carts); the stacked-handler failure reproduced on one of them. Favorites binding checked on two newest-theme shops: delegated on one (click-tested from a Hello Retail tile), direct per heart on the other.
