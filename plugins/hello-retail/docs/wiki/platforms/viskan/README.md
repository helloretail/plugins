---
source: field
verified: 2026-09-24
---

# Viskan

Viskan is a Nordic enterprise ecommerce platform. It ships two storefront generations, and most of
what Hello Retail needs is the same on both:

- **Streamline**: a React/Redux SPA bundled with webpack and served from `/build/chunks/`.
- **NG (Next Generation)**: a Next.js app.

This page covers both. The shared rules come first; only the differences are split by storefront.

**Pages:**

- [add-to-cart.md](./add-to-cart.md): the `window.viskan.cart` JavaScript cart API
- [feeds.md](./feeds.md): product feed versions (v1/v2/v3) + content feeds

---

## Which storefront is it?

| Signal | Streamline | NG |
|---|---|---|
| App framework | React/Redux SPA, chunks under `/build/chunks/` | Next.js, assets under `/_next/`, `self.__next_f` payloads in the HTML |
| Root element | `<div id="Streamline">` | no `#Streamline` |
| Globals | `window.viskan` + `window._streamline` (also `window.v12`, `window.webpackJsonpStreamline`) | `window.viskan`, **no** `window._streamline` |
| Cart API | `window.viskan.cart` | `window.viskan.cart` (see [add-to-cart.md](./add-to-cart.md)) |
| Native tile markup | `ListArticle` BEM classes, `.CMS-Component` | no `ListArticle` / `CMS-Component` classes |

**Deciding rule** (run it after the page has loaded; `window.viskan` only exists once Viskan's
eCom engine is up):

1. `window.viskan` present → a Viskan storefront.
2. `window._streamline` also present → **Streamline**. Absent → **NG**.

Check the live page rather than trusting the platform name you were given: the two generations need
different handling for anything Hello Retail renders into the page.

---

## Integration model per feature

| Feature | Streamline | NG |
|---|---|---|
| Recommendations | API (a few older shops still run script-injected recoms) | API |
| Pages | API | API |
| Search | almost always managed (script) | API or managed (script); check per customer |

With API integration Viskan calls Hello Retail and renders the products itself, so there is no HR
tile to build or QA. Hello Retail's side is the configuration: indexed fields, design filters and
sorting, and the page or search config.

---

## Product fields: index every `_id` field

Viskan identifies attributes, brands, categories and properties by numeric id. The feed exposes
them as `extraData.*_id` / `extraDataList.*_id` fields (e.g. `attr1_id`, `attr2_id`, `brand_id`,
`cat_id`, `property_<name>_id`), and Viskan's storefront maps the ids back to labels itself.

- **Index every field whose name ends in `_id`** for search filtering and sorting
  (`dataFields_updateProductFieldsIndexing`, one batched call). A field that isn't indexed can't be
  used as a filter, neither as a design filter nor in a Pages request's `params.filters`.
- **NG only: also `extraDataList.categoryUUID`.** NG identifies categories by UUID as well; the
  v3 feed carries it per category (`product.categories[].categoryUUID`), and the feed transform
  maps it as a list: `categoryUUID: product.categories.map(c => c.categoryUUID)`. Index it with
  the `_id` fields. Not part of the Streamline setup.
- Other fields ending in something else (e.g. `attr1_id_group`) are not part of the rule.

---

## Pages (API)

**Design.** The templates stay at the default: Viskan renders the tiles, so no tile or grid work.

- **Filters:** every `_id` field as a `LIST` filter, **titled with the bare field name**
  (`extraDataList.cat_id` → `cat_id`, not `extraDataList.cat_id`), plus `price` as a `RANGE`
  filter. On NG, add `extraDataList.categoryUUID` as a `LIST` filter titled `categoryUUID`.
  No other filters.
- **Sorting:** match the storefront's own sort options. On NG these are configured in Viskan's
  product-list component (e.g. `PRICE_ASC` / `PRICE_DESC`, `PUBLISHED_ASC` / `PUBLISHED_DESC`),
  which map to `price` and `created` ascending/descending.

**Page config.** **No product conditions.** Viskan's request decides which products the page shows,
by sending any field it needs in `params.filters`; it does not use `extraDataList.categoryIds`.
Don't add an `INPUT` product filter "for the category": an `INPUT` filter makes its value mandatory,
so every request that doesn't send that field fails.


---

## Search (API)

Applies when a Viskan storefront calls the Search API itself (NG may do this; Streamline almost
always runs managed Search).

- **Config without a design:** create it with `search_createConfig` and target `NONE`. The input
  template, initialisation code, result template and styles all stay empty. The config's `key` is
  what Viskan sends on every request.
- **Filters and sorting:** the same as the Pages design, in the same order and with the same
  titles. Search filters take no type; it follows from the field.
- **Category engine:** attach one when the customer provides a category feed; without a category
  feed, leave it out.
- **Publishing:** the Search API only serves a LIVE config, so nothing is returned until the config
  is published in My Hello Retail. Leave any existing managed (script) search configs as they are.

---

## Favourite / wishlist: NOT supported

**Hello Retail does not support wishlist / favourite buttons on Viskan, on either storefront.**
Every native Streamline `ListArticle` tile carries a `.CMS-ArticleFavorite-icon` star, but tiles
Hello Retail builds ship **without** it by design:

- **Build:** leave the star out of the tile and say so in the response (tile-extractor rule 6 exception). Don't wire a substitute.
- **QA:** the missing star is not a parity gap — grade it ACCEPTED with the platform named, never FAIL/WARN (qa-checklists → Product Tile → Wishlist icon).

### Why it can't be wired on Streamline

Clicking `.CMS-ArticleFavorite-icon` on the storefront works via Viskan's delegated click handler on `#Streamline`. The HR overlay sits outside `#Streamline`, so the handler never fires and overlay stars are visually inert. For unauthenticated users the storefront toggle is **purely visual** — no XHR or fetch call is made, state lives in Redux memory only — so there is no API for the overlay to call either. Any star rendered in an HR tile would be disconnected from the customer's real favourites, which is why the platform position is to leave it out.

### Historical — localStorage shim (do not ship)

A `localStorage`-backed toggle (`reinit_wishlist`, keyed by product URL pathname, re-run after every render) was previously documented here as a workaround. It is kept only for reference — **do not ship it**: it fakes a favourite state the storefront never sees, and Hello Retail does not support the control on Viskan.

```javascript
function reinit_wishlist(container) {
    // HR overlay lives outside #Streamline so Viskan's delegated handler never fires.
    // We own persistence: product URL pathname is the stable key.
    var LS_KEY = 'hr-favorites';
    function getFavs() {
        try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch(e) { return []; }
    }
    function setFavs(favs) {
        try { localStorage.setItem(LS_KEY, JSON.stringify(favs)); } catch(e) {}
    }
    function productKey(btn) {
        var article = btn.closest('article');
        var link = article && article.querySelector('a.Link');
        return link ? link.pathname : null;
    }

    // Restore active state on every call (new tiles may have loaded).
    var saved = getFavs();
    container.querySelectorAll('.CMS-ArticleFavorite-icon').forEach(function(btn) {
        var key = productKey(btn);
        var icon = btn.querySelector('i');
        if (!key || !icon) return;
        var active = saved.indexOf(key) !== -1;
        icon.classList.toggle('fas', active);
        icon.classList.toggle('fal', !active);
    });

    // Bind click handler once per container.
    if (container._wishlistBound) return;
    container._wishlistBound = true;
    container.addEventListener('click', function(e) {
        var btn = e.target.closest('.CMS-ArticleFavorite-icon');
        if (!btn) return;
        e.preventDefault();
        var icon = btn.querySelector('i');
        if (!icon) return;
        var key = productKey(btn);
        var isFav = icon.classList.contains('fas');
        icon.classList.toggle('fas', !isFav);
        icon.classList.toggle('fal', isFav);
        if (key) {
            var favs = getFavs();
            if (isFav) {
                favs = favs.filter(function(k) { return k !== key; });
            } else if (favs.indexOf(key) === -1) {
                favs.push(key);
            }
            setFavs(favs);
        }
    });
}
```

---

## Streamline specifics

### DOM architecture

Streamline mounts the entire store UI inside a single root element:

```html
<div id="Streamline">
  <div class="App">
    <div class="App-content">
      <main id="maincontent">…</main>
    </div>
  </div>
</div>
```

**The HR overlay is injected as a direct child of `<body>`, outside `#Streamline`.**  
This is fundamental: any Viskan event handler scoped to `#Streamline` (which is all of them) will never fire for clicks inside the HR overlay. This affects every CMS-integrated component — favourites, add-to-cart, dropdowns — not just one feature.

### Useful globals

| Global | What it is |
|---|---|
| `window._streamline` | Streamline framework (`siteContext`, `webpack.publicPath`, …) |
| `window.v12` | Viskan API — `v12.article`, `v12.customer`, `v12.shopcart`, `v12.search`, … |
| `window.webpackJsonpStreamline` | Webpack chunk registry for the Streamline bundle |
| `localStorage['[brand]-state']` | Redux state persisted to localStorage (cart, article history, saved count) |

### CMS components (`.CMS-Component`)

Viskan initialises elements with class `CMS-Component` on page load by adding a derived class (usually the article number) to each element. If the article number lookup fails, the literal string `"undefined"` is added instead. Elements that were never initialised (no extra class beyond the base two) are ignored by Viskan's click handlers — which is exactly the state HR overlay tiles are in after inject.

### Tile structure

Viskan article tiles use BEM-style class names prefixed with `ListArticle`:

```html
<article class="ListArticle [StyleId]-Article" data-style-attr="Article">
  <div class="ListArticle-img-wrapper">
    <figure class="ListArticleBig-img" data-style-attr="BigArticleImage">
      <div class="BadgeList">…</div>
      <a class="Link" href="/[lang]/artikel/[slug]?attr1_id=[colorId]">
        <img class="Image" …>
      </a>
    </figure>
  </div>
  <div class="ListArticle-body">
    <a class="Link" href="…">
      <h2 class="ListArticle-title Preset-Heading4 …">Title</h2>
      <div class="Prices ListArticle-prices …">
        <span class="Price …">…</span>
        <span class="Price Price--old …">…</span>  <!-- sale only -->
      </div>
    </a>
    <a class="CMS-Component CMS-ArticleFavorite-icon" data-style-attr="Favorite Icon">
      <div><i class="fal fa-star"></i></div>
    </a>
  </div>
</article>
```

Font Awesome is loaded site-wide (`fal` = light/empty star, `fas` = solid/filled star).

Product URL pattern: `/[lang]/artikel/[slug]?attr1_id=[colorId]`

---

## NG specifics

- **HR script:** loaded through Next's script loader (`helloretail.js` from `helloretailcdn.com`),
  initialised with `hrq.push(['init', { websiteUuid: … }])`. The storefront then reads the
  tracking user id via `hrq.push(['getTrackingUserId', …])` and stores it in a
  `helloRetailTrackingUserId` cookie, so its server-side API calls can send it.
- **Product list:** Viskan's product-list component carries a `helloRetailTrackingCodes` field,
  which holds the tracking codes of the products when Hello Retail serves the list.
- **Product URLs** observed on an NG storefront: `/<slug>`, with `?color=<attribute1Id>` when each
  colour is its own product.

---

**Related:**
- SPA tracking — [../../onboarding/spa-tracking.md](../../onboarding/spa-tracking.md)
- Cross-platform add-to-cart rules — [../add-to-cart.md](../add-to-cart.md)

---

## Timeline
- 2026-09-23: Merged Streamline and NG into one page; added the NG signals, the integration model
  per feature, the `_id` field rule and the Pages (API) setup.
- 2026-09-24: NG adds `extraDataList.categoryUUID` to the indexed fields and the Pages filters;
  added the Search (API) setup.
