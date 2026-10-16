---
source: field
verified: 2026-10-14
---

# Starweb — Storefront data for tiles

Some tile data isn't in the Starweb product feed, so an HR tile can't render it from feed data. The shop's own storefront endpoints return it; this page fetches it at runtime and writes it into the HR tiles after they render. Add new cases here when more Starweb data turns out to be missing from the feed.

## Check the endpoints first

> **Check before building:** the two endpoints this page uses are not on every Starweb shop. Some shops have one and not the other, some have both, and a shop may have neither. Check both on the live shop before building, and only add the code for the ones that respond.

| Endpoint | Used for |
| --- | --- |
| `POST /product/get-quick-shop-products-data` | [Labels and boost variants](#labels-and-boost-variants) |
| `GET /storefrontapi/v1/campaigns/products-labels` | [Campaign labels](#optional-campaign-labels) |

Run this in the console on one of the shop's own category pages. It takes a product ID from a native tile and calls both endpoints:

```js
(() => {
    const id = document.querySelector(".gallery-item > a[data-id]")?.dataset.id;
    if (!id) return console.log("No native tile with a[data-id] on this page — open a category page.");

    const check = (name, request, key) => request
        .then((r) => (r.ok ? r.json() : Promise.reject(`HTTP ${r.status}`)))
        .then((d) => console.log(name, d?.[key] ? "present" : "responded, but without `" + key + "`", d))
        .catch((err) => console.log(name, "missing", err));

    check("quick-shop:", fetch("/product/get-quick-shop-products-data", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: new URLSearchParams([["idList[]", id]]).toString(),
        credentials: "same-origin",
    }), "productsData");

    check("campaigns:", fetch("/storefrontapi/v1/campaigns/products-labels?productIds=" + id, {
        credentials: "same-origin",
    }), "data");
})();
```

- **present:** the endpoint exists and returns the shape the code expects.
- **missing:** a non-2xx status, or a response that isn't JSON (often the shop's 404 page). Leave out the code that uses it.
- **responded, but without the key:** the endpoint exists but returns a different shape than documented here. Don't use the code as-is; look at the logged response first.

Neither endpoint present → HR tiles can't show labels, boost-variant styling or campaign labels. Say so in the hand-off instead of building a workaround.

## Labels and boost variants

Starweb doesn't send product labels or the boost-variants flag in the feed. Both come from the quick-shop endpoint, the one Starweb's own tiles use. It returns more product data than this page uses.

The script below does that for every tile matching a selector:

- **Boost variants:** adds `has-boost-variants` to the tile when the product has them, so the theme's CSS for that state applies.
- **Labels:** removes any `.product-label` elements inside the tile's link and adds one element per Starweb label. It uses the native class names (`product-label`, `product-label-<index>`, `product-label-id-<labelId>`), so the theme styles them like on its own tiles.

### Tile requirements

- The HR wrapper around each tile carries the Starweb theme's `gallery-item` class. That wrapper is `hr-product` in Recommendations and Pages and `hr-search-overlay-product` in Search; the tile inside is the same on all three.
- The tile's link is a **direct child** of that wrapper and carries `data-id` with the product's Starweb product ID: `<a href="{{ product.url }}" data-id="{{ product.extraData.id }}">`. The script reads `:scope > a[data-id]`; a link nested deeper, or one without `data-id`, is skipped.
- The product ID comes from Starweb's `productId`, indexed as `extraData.id`. If the feed doesn't have it yet, add it to the V2 transform's `extraData`:

  ```js
  extraData: {
      id: product.productId,
  },
  ```

- Leave label markup out of the tile Liquid. The script owns `.product-label` inside the link and replaces whatever is there.

### Script

```js
function fetchQuickShopProducts(productIds) {
    if (!Array.isArray(productIds) || productIds.length === 0) {
        return Promise.resolve(null);
    }

    const params = new URLSearchParams();
    productIds.forEach((id) => params.append("idList[]", id));

    return fetch("/product/get-quick-shop-products-data", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8" },
        body: params.toString(),
        credentials: "same-origin",
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    });
}

function updateProductCards(selector) {
    const galleryItems = Array.from(document.querySelectorAll(selector));
    if (galleryItems.length === 0) return;

    const productMap = {};
    const idList = [];

    galleryItems.forEach((item) => {
        const link = item.querySelector(":scope > a[data-id]");
        if (!link) return;

        const id = link.dataset.id;
        idList.push(id);
        productMap[id] = { link, galleryItem: item };
    });

    if (idList.length === 0) return;

    fetchQuickShopProducts(idList)
        .then((response) => {
            const productsData = response?.productsData;
            if (!productsData) return;

            Object.entries(productsData).forEach(([id, data]) => {
                const mapped = productMap[id];
                if (!mapped) return;

                const { link, galleryItem } = mapped;

                if (data.hasBoostVariants === true) {
                    galleryItem.classList.add("has-boost-variants");
                }

                const tmplParts = data.tmplDataParts;
                if (!tmplParts) return;

                const firstPart = Object.values(tmplParts)[0];
                if (!firstPart || !Array.isArray(firstPart.labels)) return;

                link.querySelectorAll(".product-label").forEach((el) => el.remove());

                firstPart.labels.forEach((label, index) => {
                    const labelEl = document.createElement("div");
                    labelEl.className = [
                        "product-label",
                        "product-label-" + index,
                        "product-label-id-" + label.labelId,
                    ].join(" ");

                    const span = document.createElement("span");
                    span.textContent = label.name;

                    labelEl.appendChild(span);
                    link.appendChild(labelEl);
                });
            });
        })
        .catch(console.error);
}
```

The selector is the only thing that changes per surface: the HR container plus that surface's wrapper with `gallery-item`. Always scope it to the HR container so it never touches the shop's own tiles; the script rewrites labels on everything it matches.

| Surface | Selector | Call it |
| --- | --- | --- |
| Pages | `.hr-pages-container .hr-product.gallery-item` | once the products have rendered (`content.products.count` non-zero) |
| Search | `.hr-overlay-search .hr-search-overlay-product.gallery-item` | after **every** `fix_links(...)` call-site, the same hook as Starweb [add to cart](./add-to-cart.md) |
| Recommendations | `#hello-retail-{{ key }} .hr-product.gallery-item` | from Swiper's `afterInit`, next to `quickShop.init()` |

Re-running is safe: labels are removed before they are re-added, and adding the class twice is a no-op. Each call fetches data for every matched tile, including ones already updated.

## Optional: campaign labels

Add this only when the shop shows campaign labels on its tiles (e.g. "Buy 4, pay for 3"), they are missing from HR tiles, and the campaigns endpoint passed the [check](#check-the-endpoints-first). It isn't part of the default script.

Starweb's own campaign script fetches these labels lazily from an `IntersectionObserver`, and that observer doesn't fire for tiles inside the search overlay. These two functions ask the same storefront endpoint directly for the IDs `updateProductCards` has already collected:

```js
function fetchCampaignLabels(productIds) {
    return fetch("/storefrontapi/v1/campaigns/products-labels?productIds=" + productIds.join(","), {
        credentials: "same-origin",
    }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    });
}

function renderCampaignLabel(galleryItem, campaign) {
    if (!campaign || galleryItem.classList.contains("has-campaign-label")) return;

    const figure = galleryItem.querySelector("figure");
    if (!figure) return;

    const labelEl = document.createElement("div");
    labelEl.className = "campaign-label";
    labelEl.title = campaign.text;
    labelEl.textContent = campaign.text;

    figure.prepend(labelEl);
    galleryItem.classList.add("has-campaign-label");
}
```

Call them from `updateProductCards`, right after `if (idList.length === 0) return;`:

```js
fetchCampaignLabels(idList)
    .then((response) => {
        const data = response?.data;
        if (!data) return;

        Object.entries(data).forEach(([id, entry]) => {
            const mapped = productMap[id];
            if (!mapped || !entry) return;
            renderCampaignLabel(mapped.galleryItem, entry.campaign);
        });
    })
    .catch(console.error);
```

- The label goes first inside the tile's `<figure>`, as a `div.campaign-label` with the campaign text: the same element Starweb's campaign script builds. So its size, position and colours come from the shop's own CSS, and nothing is styled here.
- `has-campaign-label` is the shop's own guard class. It stops a tile getting a second label on a later render, and makes Starweb's campaign script skip a tile that already has one.
- The tile needs a `<figure>` around the image, as on the native Starweb tile. Without one, no campaign label is added.

## Wishlist (favourite) button

Add this when the shop's own tiles have the heart / "Lägg till i favoriter" toggle. Starweb's favourites module does the work: it binds a delegated `click` on `.toggle-favorite-action` to `document`, POSTs or DELETEs `/storefrontapi/v1/favorite-products/<sku>`, and toggles `.favorite-active`. The theme also binds delegated `click` and `keydown` (Enter/Space) handlers that swap the visually hidden title text. So HR tiles only need the native markup; there's no HR click handler and no `trackClick` (it isn't a product click).

What HR has to add is the **initial state**. The theme marks saved favourites once, on `document.ready`, before HR tiles exist, so a product already in the customer's favourites shows as not saved in HR tiles.

**Check first:** on a shop page, `typeof window.toggleFavoriteProductAction === "function"` in the console means the favourites module is loaded (`/js/shop/modules/shopping-favorite-cart.min.js`). `undefined` means the shop doesn't use favourites, or runs the module in wishlist mode; then leave the toggle out of the HR tile.

### Markup

Put it inside the HR wrapper, as a **sibling after** the tile link, as on the native tile. Inside the link, a click on the heart also follows the link.

```liquid
{# text text_add_to_favorites = "Lägg till i favoriter" #}
{# text text_remove_from_favorites = "Ta bort från favoriter" #}

{% assign tile_sku = product.extraData.sku | default: product.productNumber %}

<div class="icon-container">
    <div class="toggle-favorite-action" data-sku="{{ tile_sku }}" data-bundle-config="" data-hr-remove-title="{{ text_remove_from_favorites }}" role="button" tabindex="0">
        <span class="favorite"><span class="favorite-title visually-hidden">{{ text_add_to_favorites }}</span></span>
    </div>
</div>
```

- Add `has-favorite-option` to the HR wrapper's classes, next to `gallery-item`: the theme's CSS for the toggle hangs off it.
- `data-sku` must be the Starweb SKU, the same value the add-to-cart button sends. The favourites API is keyed on it.
- Keep `data-bundle-config=""`: the module posts it as `bundleConfig`.
- `data-hr-remove-title` is HR's own attribute. The script below reads it to set the title on saved products; after a click, the theme sets the title from its own texts.

### Script

```js
// Saved favourites aren't in the feed, so mark them from the shop's favourites API (logged-in customers only).
function fetchFavoriteSkus(page, skus) {
    return fetch("/storefrontapi/v1/favorite-products?page=" + page, { credentials: "same-origin" }).then((response) => {
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        return response.json();
    }).then((json) => {
        const found = JSON.stringify(json.data || json).match(/"sku":"[^"]*"/g) || [];
        found.forEach((match) => {
            skus[match.slice(7, -1)] = true;
        });
        const pagination = (json.meta && json.meta.pagination) || json.meta || {};
        const lastPage = pagination.total_pages || pagination.last_page || 1;
        if (found.length > 0 && page < lastPage && page < 20) {
            return fetchFavoriteSkus(page + 1, skus);
        }
        return skus;
    });
}

function syncFavoriteStates(selector) {
    if (!document.documentElement.classList.contains("customer-account-logged-in")) return;
    const toggles = Array.from(document.querySelectorAll(selector));
    if (toggles.length === 0) return;
    fetchFavoriteSkus(1, {}).then((skus) => {
        toggles.forEach((toggle) => {
            const icon = toggle.querySelector(".favorite");
            const title = toggle.querySelector(".favorite-title");
            if (!icon || !skus[toggle.dataset.sku]) return;
            icon.classList.add("favorite-active");
            if (title && toggle.dataset.hrRemoveTitle) {
                title.textContent = toggle.dataset.hrRemoveTitle;
            }
        });
    }).catch(console.error);
}
```

- **Logged-in only:** favourites belong to a customer account, so the script returns early unless `<html>` has `customer-account-logged-in`.
- **One request per render.** It reads every saved SKU and marks the matching toggles, so re-running only adds `favorite-active`, never removes it. Removing is the module's job on click.

Call it at the same hook as `updateProductCards`, with the selector scoped to the HR container:

| Surface | Selector |
| --- | --- |
| Pages | `.hr-pages-container .hr-product .toggle-favorite-action` |
| Search | `.hr-overlay-search .hr-search-overlay-product .toggle-favorite-action` |
| Recommendations | `#hello-retail-{{ key }} .hr-product .toggle-favorite-action` |

In a list-style tile (link beside the image, as in a mobile search list), the theme positions `.icon-container` absolutely and it covers the title and price. Put it in the flow instead:

```css
.hr-overlay-search .hr-products-container .hr-search-overlay-product.gallery-item {
    display: flex;
    flex-direction: row;
    width: auto;
    margin: 0;
}

.hr-overlay-search .hr-search-overlay-product > .icon-container {
    position: static;
    flex: none;
    margin: 0;
}
```

The tile link then needs `flex: 1; min-width: 0;` so long titles wrap instead of pushing the heart out.

## Notes

- **Same-origin only.** The request goes to the shop's own `/product/get-quick-shop-products-data` with the shopper's cookies. It works on the live storefront, not in the dashboard preview, so check labels on the shop itself.
- **QA:** labels and boost-variant styling missing from the preview is expected. Missing on the live shop means checking the `data-id` binding, the selector, and the network response, and re-running the [endpoint check](#check-the-endpoints-first).
- **Parity table:** labels on Starweb aren't a feed gap to raise with the feed team. They come from this script.

---

**Related:**

- [Starweb overview](./README.md) · [add to cart](./add-to-cart.md) · [dynamicPriceHandler](./dynamic-price-handler.md)

---

## Timeline

- 2026-09-25: Page created from the team's Starweb notes. The hard-coded Pages selector became a `selector` argument, with a per-surface table.
- 2026-09-25: Confirmed the product ID mapping (`extraData.id` from `productId`) and that the tile markup is shared across surfaces, so only the container selector differs.
- 2026-09-25: Search selector corrected to HR's search wrapper (`hr-search-overlay-product`), from a live implementation. Added the optional campaign-labels functions.
- 2026-09-25: Added the endpoint check: shops vary in which of the two endpoints they have.
- 2026-10-14: Added the wishlist (favourite) button: native toggle markup, initial-state sync from `/storefrontapi/v1/favorite-products`, and the list-tile CSS, from a live desktop and mobile search implementation.
