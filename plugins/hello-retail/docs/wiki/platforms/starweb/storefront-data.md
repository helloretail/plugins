---
source: field
verified: 2026-09-25
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
