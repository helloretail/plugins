---
source: field
verified: 2026-11-04
---

# Viskan — Moving an existing customer to NG

What changes for Hello Retail when a live Viskan customer (Streamline, v1/v2 feeds) moves to the
NG storefront, and how to prepare so the switch is one coordinated step. Read with
[README.md](./README.md) (NG setup: indexed fields, Pages and Search via API) and
[feeds.md](./feeds.md) (feed versions).

> Field-proven on one multi-market migration (15 production websites, 2026-11). Re-check each
> point against the customer's own feeds before relying on it.

---

## What changes at go-live

| | Before (Streamline) | After (NG) |
|---|---|---|
| Product feed API | v1 + v2 (`/api/product-feed/v1`, `/v2`) | **v3 only.** Viskan confirmed v1 and v2 stop working at the switch. |
| v3 before the switch | — | Only on the preview host (`<shop>.preview.v2.viskan.com`), not on the live domain. |
| Product URL | `/<locale>/artikel/<slug>?attr1_id=<id>` | `/<locale>/artikel/<slug>?color=<id>`. Same slug, same id. |
| Category id the storefront filters on | `cat_id` / hierarchies | `extraDataList.categoryUUID` |
| Pages URL override paths | `/sv-se/herr/jackor/` (trailing slash) | `/sv-se/herr/jackor` (no trailing slash) |

**Consequences:**

- **The feeds must be swapped at the moment of the switch.** v3 can't run on the live domain before
  it, and v1/v2 don't run after it. Get the exact date and time from Viskan.
- **Every product gets a new URL**, so Hello Retail creates every product again and deletes the
  old ones. The new products start with view and buy score 0: Pages score sorting, recommendations
  and search ranking start over. Tell the customer before go-live.
- **The slug and the colour id do not change.** On the migration above, all 1277 slug + colour
  pairs in the v2 feed existed unchanged in v3. The only URL difference is the parameter name, so
  old URLs map to new ones by rewriting `attr1_id=` to `color=`.

---

## Before the switch (no effect on live)

1. **Add `categoryUUID` to the existing v2 feeds.** The v2 feed already carries
   `categories[].categoryUUID`, with the same values as v3. Add
   `categoryUUID: dedup(product.categories?.map((c) => c?.categoryUUID) ?? [])` to `extraDataList`
   and index `extraDataList.categoryUUID` on every website. The field is then in place on the
   current products before NG goes live.
2. **Optional test website for NG.** A separate TEST website on the preview host, with a full v3
   feed (`createProducts: true`) and the same indexed fields as production, lets Viskan test
   against real data without touching the live sites.
   - **Set its URL mask to `sb:&`.** A new website gets `sb:?`, which cuts every query parameter, so
     all colours of an article become one product (1213 products collapsed to 406).
3. **Prepare one v3 feed per website, INACTIVE.** Use the live domain and the website's locale in
   the product URL and `?color=` (template below). Do not run it: a manual run of an INACTIVE feed
   still writes to the live website, and the v3 URL on the live domain does not answer yet.
4. **Read each website's v1 transform first.** Locale-specific lists (hierarchy whitelists such as
   Herr/Dam vs Men/Women, Division values) live there and have to be carried into each v3 feed.
5. **List the Pages URL overrides and their pins.** Read every override on every website's page
   configs, so the change after the switch is ready to apply. Pins that point at products no longer
   in the feed are already dead; list them for the customer rather than mapping them. Do not change
   the overrides yet: the current storefront still sends the trailing slash, and the `?color=`
   products don't exist until the v3 feed has run.

## At the switch

1. Set the v3 feed ACTIVE on each website and the v1 and v2 feeds INACTIVE (dashboard; the MCP
   state change does not persist). Run each v3 feed.
2. **After the v3 feed has run, update the Pages URL overrides, both changes together:**
   - override URL: drop the trailing slash (`/sv-se/herr/jackor/` → `/sv-se/herr/jackor`);
   - pinned products: rewrite `?attr1_id=` to `?color=` (same slug, same id). Pins match on the
     exact product URL, so every pin is dead from the feed swap until it is rewritten.

   The override tools write a draft of the page config; publish it in the dashboard. The customer
   may have edited the same configs, so check each draft before publishing.
3. Check one product and one category page per website: product URL with `?color=`,
   `categoryUUID` filled, the category list not empty, and the pinned products first.

---

## v3 feed: what differs from v2

Observed on the v3 feed on the preview host. Check the parameters on the live domain at the
switch.

| Topic | v3 |
|---|---|
| Items path | `root > products` (v2: `root > products > products`) |
| Language | `languageCode=sv\|en\|de\|nl` with the same `countryId` as the v2 feed |
| Page size | **`size`** works; `pageSize` was ignored (always 500). Use `size`. |
| Page start | **1**. `page=0` returns HTTP 400. |
| Colour split | Each colour is already its own item (`attribute1Id`); no `splitByAttribute1` needed. |
| `linkFriendlyName` | `/artikel/<slug>` including the localized segment (`/article/` on German), without the locale. URL = `https://<domain>/<locale>` + `linkFriendlyName` + `?color=<attribute1Id>`. |
| `stockKeepingUnits` | Holds **every colour** of the article. Filter on `sku.attribute1.attribute1Id === product.attribute1Id`, or sizes, prices and variant numbers mix across colours. |
| Images | `media[]` for every colour. Take the first by `sort` with the item's `attribute1Id`. |
| Lookbooks | `productType: "LOOKBOOK"` ("Shop the look") rows. Skip them. |
| `productId` | Repeats across the colours of an article. Fine as `productNumber`: products are keyed by URL. |
| Missing vs v2 | No `attribute1.groupId` (so `attr1_id_group` stays empty) and no `keywords`. |
| Description | `longDescription` is HTML (the old v1 `art_desc2`); `shortDescription` is the teaser. |

### v3 transform template (full feed, one website)

Port the locale lists from the website's v1 transform into the constants. `BASE_URL` is the live
domain plus the locale, without a trailing slash.

```ts
const BASE_URL = "https://www.<domain>/<locale>";
const IMG_BASE = "<image base URL from the website's v1 transform>";
const domParser = new DOMParser();

function uniq(arr) {
	return Array.from(new Set((arr ?? []).filter(v => v !== null && v !== undefined && v !== "")));
}

function transform(product) {
	if (product.productType === "LOOKBOOK") return null;

	const attr1Id = product.attribute1Id;
	const skus = (product.stockKeepingUnits ?? []).filter(sku => sku?.attribute1?.attribute1Id === attr1Id);
	const prices = skus.map(sku => sku.price).filter(Boolean);
	const unitPrice = prices.find(p => p.unitPrice != null)?.unitPrice;
	const salePrice = prices.find(p => p.salePrice != null)?.salePrice;
	const onSale = salePrice != null && unitPrice != null && salePrice < unitPrice;
	const img = (product.media ?? [])
		.filter(m => m?.attribute1Id === attr1Id && m?.fileName)
		.sort((a, b) => (a.sort ?? 0) - (b.sort ?? 0))[0]?.fileName;

	return {
		url: `${BASE_URL}${product.linkFriendlyName}?color=${attr1Id}`,
		productNumber: String(product.productId),
		variantProductNumbers: uniq(skus.map(sku => sku.priceLookUpNumber)),
		title: product.productName,
		description: product.longDescription
			? domParser.parseFromString(product.longDescription, "text/html").body.textContent?.trim()
			: undefined,
		inStock: skus.some(sku => sku?.stock?.web && sku.stock.web !== "OUT_OF_STOCK"),
		imgUrl: img ? IMG_BASE + img : undefined,
		price: onSale ? salePrice : unitPrice,
		oldPrice: onSale ? unitPrice : 0,
		hierarchies: (product.categoryPaths ?? []).map(path => path.split(" > ")),
		extraData: {
			artId: String(product.productId),
			attr1_id: String(attr1Id),
		},
		extraDataList: {
			cat_id: uniq((product.categories ?? []).map(c => String(c.categoryId))),
			categoryUUID: uniq((product.categories ?? []).map(c => c.categoryUUID)),
			attr1_id: [String(attr1Id)],
			attr2_id: uniq(skus.map(sku => sku?.attribute2?.attribute2Id).filter(id => id != null).map(String)),
			attr3_id: uniq(skus.map(sku => sku?.attribute3?.attribute3Id).filter(id => id != null).map(String)),
			brand_id: uniq([product.brand?.brandId].filter(id => id != null).map(String)),
		},
	};
}
```

Feed settings: `PAGE_BASED` `{"pageVariable":"page","sizeVariable":"size","sizeValue":500,"pageInitialValue":1}`,
`createProducts: true`, `stopIfFewerThanExpected: false`, `stopIfMoreThanExpected: true`,
`allowDeltaRuns: false`.

---

**Related:**
- NG setup: indexed fields, Pages and Search via API — [README.md](./README.md)
- Feed versions — [feeds.md](./feeds.md)

---

## Timeline
- 2026-11-04: Page created from the first migration of a live multi-market Viskan customer to NG.
