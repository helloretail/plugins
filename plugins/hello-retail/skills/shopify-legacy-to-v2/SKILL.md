---
name: shopify-legacy-to-v2
description: Use when a Hello Retail product feed reads the legacy Shopify feed helper (feed-helper.addwish.com or feed-helper.helloretail.com, path /shopify/products.py or /shopify/RC/products.py, as a V2 transform or V1 crawl strings) and has to move to /shopify/V2/products.py while storing exactly the same product data, or when someone asks to convert, migrate or upgrade a legacy / "Shopify-V1" Shopify feed to Shopify-V2.
---

# Shopify legacy helper → V2 helper, 1:1

## Overview

The new feed must store **exactly** what the old feed stores today, field for field, so designs, filters, search
and recoms keep working. You do that by porting the **old** logic literally onto the items the V2 helper returns.
The D&TS Shopify-V2 template is not used: it changes prices, images, keywords and stock on purpose.

You cannot see any feed data: the feed-helper hosts only answer Hello Retail's servers and no MCP tool returns
feed items. So **never guess the shape of a V2 item**. Everything below was verified field by field against the
output of both helpers on full catalogues (three shops, about 19,500 products, V2 transforms and V1 crawl
strings, with and without `...product` spreads).

The only agreed exception to 1:1: **oldPrice = price when the product has no compare-at price.**

## Rules

- Use the Hello Retail MCP only.
- New feeds are only set up in the V2 feed system: even when the old feed is a V1 (crawl-string) feed, the result is
  a V2 feed. Never create or edit a V1 config.
- Create a **new** feed with `feeds_create`, `state: "INACTIVE"`. Never update, activate, deactivate or archive
  the old feed (V2 or V1), and never activate the new one. A person compares the two and switches.
- Copy the old feed's `runIntervalSeconds`, `cacheBusting`, `allowDeltaRuns` and `createProducts`. Set `format`
  JSON, `itemsPath` `items`, `requestType` SINGLE_REQUEST, `headers` []. A V1 `deleteProductsMissingFromFeed` has no
  V2 setting: V2 feeds always delete missing products on full runs.
- Every field the old feed stores comes out of the new transform under the **same name with the same value**.
  Never rename, drop, merge or "improve" one, even when it looks unused or odd.
- Read V2 fields only. A guard or lookup on a legacy-only name (`product.variants`, `product.id`, `main_image`,
  `images`, `body_html`, `variants_sellable`, `main_variant.product_id`, `presentment_prices`) is undefined on
  every V2 item: the transform then skips or throws on every product, and a full run with nothing in it removes the
  whole catalogue.
- Don't repeat the API key or password in chat or in your summary; they stay in the feed url.
- The finished transform has no explanatory comments and no unused code.

## Workflow

1. `website_getInfo` → domain, currency, language, companyId.
2. `feeds_list` and `internal_feeds_listV1Configs` → the feed on `/shopify/products.py` or `/shopify/RC/products.py`.
   Read every **other** active feed too (V1 and V2): a field another feed fills (e.g. an update-only feed with
   `createProducts` false that sets only `inStock`) is not the old feed's, so the new transform leaves it out even
   though `dataFields_getProductFields` lists it. When that field is `inStock`, say in the report that a V2 run in
   which no item carries `inStock` counts every product as in stock, so the first run must be watched for stock
   flipping to in-stock until the other feed runs again.
3. Read the old logic: `feeds_get` (transformationCode) or `internal_feeds_getV1Config` (crawlStrings; read
   `docs://crawl-strings/syntax` and `docs://feeds/v1-crawl-strings` first).
4. `dataFields_getProductFields` → every field the website stores. Each extraData / extraDataList key the old code
   does not write by name was **auto-mapped** (a `...product` spread or a non-native top-level key such as `id` or
   `altimg`). Write each of those explicitly in `extraData` / `extraDataList` (see "Auto-mapped keys"). The list also
   holds fields the old feed doesn't produce: `isOnSale` (derived by Hello Retail, never emit it), `pi.*`,
   `priceExVat`, `created` and `variantProductNumbers` when the old code doesn't set them (Hello Retail fills them),
   and keys left over from an older feed. Those are not yours to add.
5. `productData_get` on 2–3 live products (one with several variants, one on sale, one with tags) → the exact stored
   formats: keyword order, `created`, list contents, how empty values look, `published_scope`.
6. Build the new url (table below).
7. Write the transform with the field map and the port patterns. Fill the field checklist: every stored field →
   its new expression. A field without a line is a bug.
8. `feeds_create` as INACTIVE.
9. Report: new feed id, the dashboard editor link
   `https://my.helloretail.com/company/app/{companyId}/websites/{websiteUuid}/feed/product/productFeed-{feedId}`,
   the field checklist, the known differences that apply (below), and what to check in the editor.

## New url

Same scheme and host as the old url (`http://feed-helper.addwish.com` stays as it is); path becomes
`/shopify/V2/products.py`.

| Legacy parameter | V2 parameter |
|---|---|
| `domain` | `domain` (unchanged) |
| `apikey` | `apiKey` (same value) |
| `apipassword` | `apiPassword` (same value) |
| `currency=XXX` | `country=CC`, required: DKK→DK, SEK→SE, NOK→NO, USD→US, GBP→GB, CHF→CH, PLN→PL. EUR: the country of the Hello Retail website's domain. No currency: the website's country. A `country` already in the old url wins. |
| `locale=xx` | `locale=xx` |
| `metafields` (any value, even empty) | `metafields=true` |
| `extract_variants` empty or `false`, `page_size` | dropped |
| `extract_variants=true` | stop and ask: rows per variant need a separate port |

## Legacy item → V2 item

| Legacy helper | V2 helper |
|---|---|
| `id` (number) | `legacy_resource_id` (string; `id` is a gid) |
| `title`, `vendor`, `product_type`, `handle` | same names, same values |
| `body_html` | `description_html` (identical HTML) |
| `tags` "a, b" (one string) | `tags` ["a", "b"] → `(product.tags ?? []).join(", ")` gives the legacy string |
| `published_at` "2025-09-19T08:07:45+02:00" (shop time) | `published_at` "2025-09-19T06:07:45Z" (same instant, UTC); use it as it is (see Dates) |
| `published_scope` | none. Use the value the live `productData_get` samples show ("web" or "global") as a constant, and say in the report how many samples it rests on; if samples differ, report it |
| `variants[]` (position order) | `productvariants[]`, any order → sort (pattern) |
| `main_variant` | not equal on ties → pattern `mainVariant` |
| `variants_sellable` | none → pattern `variantsSellable` |
| variant `id` / `product_id` | variant `legacy_resource_id` / `product.legacy_resource_id` |
| variant `price`, `compare_at_price` (shop currency) | variant `price`, `compare_at_price` (identical strings) |
| variant `presentment_prices[0].price.amount` / `.compare_at_price.amount` (url currency) | variant `contextual_pricing.price.amount` / `.compare_at_price?.amount` (url country). `contextual_pricing.price.currency_code` exists, so a `.find((p) => p.price.currency_code === "XXX")` lookup ports as `variants.find((v) => v.contextual_pricing?.price?.currency_code === "XXX")` |
| variant `sku`, `barcode`, `title`, `position`, `inventory_quantity` | same |
| variant `inventory_policy` "deny" / "continue" | "DENY" / "CONTINUE" |
| variant `option1..3` | `variant.title.split(" / ")[0..2]` |
| `images[]` {src, position} (position order) | `productimages[]` {url} in **reverse** order → pattern `images`; `.url` equals legacy `.src` |
| `main_image.src` | `images[0]?.url` after the reverse (identical to `featured_image.url` on every product tested; use one) |
| `options[]` {name, values} (position order) | `options` object keyed by lowercased name, **reverse** order → pattern `options` |
| `hierarchies` ["Title", …] (all collections) | `collections.map((c) => c.title)` (published collections only) |
| `hierarchies_<locale>` (translated titles, published collections only, so it can be shorter than `collection_ids`) | `collections.map((c) => (c[`hierarchy_${locale}`] ?? c.hierarchy)[0])`: same content |
| `collection_ids` (numbers, all collections incl. unpublished) | `collections.map((c) => c.legacy_resource_id)` (published only) |
| `translations.<field>_<locale>.value` | identical |
| `metafields["<namespace>_<key>"]` | `metafields["<key lowercased>"]`; the entry's `.value`, `.namespace`, `.key` are identical. Two namespaces with the same key collide (one survives): check `.namespace` |
| `is_master` "true" | none → the constant `"true"` |

## Port patterns

The transform is a top-level `function transform(product) { … return { … }; }` (a TypeScript signature like
`(product:any): TransformationResult` is fine). Return the product object; `null` skips the item. `DOMParser` is
available. Put the patterns you need at the top of `transform` (without these comments):

```js
// legacy product.variants, in the same order
const variants = [...(product.productvariants ?? [])].sort((a, b) => a.position - b.position || a.legacy_resource_id - b.legacy_resource_id);
// legacy product.main_variant: lowest position, the last one on a tie
const mainVariant = variants.filter((variant) => variant.position === variants[0]?.position).pop();
// legacy product.variants_sellable
const variantsSellable = variants.filter((variant) => variant.inventory_quantity > 0 || variant.inventory_policy !== "DENY");
// legacy product.images (position order); images[0] is the legacy main_image
const images = [...(product.productimages ?? [])].reverse();
// legacy product.options (position order)
const titleParts = (variants[0]?.title ?? "").split(" / ");
const optionPosition = (option) => titleParts.findIndex((part) => (option.values ?? []).includes(part));
const options = Object.values(product.options ?? {}).sort((a, b) => optionPosition(a) - optionPosition(b));
// legacy collection order: smart collections first; closest the V2 data allows
const collections = [...(product.collections ?? [])].sort((a, b) => Boolean(b.rule_set) - Boolean(a.rule_set) || a.legacy_resource_id - b.legacy_resource_id);
// legacy product.tags string
const tags = (product.tags ?? []).join(", ");
// a legacy metafield "custom_size" (namespace custom, key size)
const size = product.metafields?.size?.namespace === "custom" ? product.metafields.size.value : undefined;
```

- **Guards and fallbacks:** port a guard to the V2 field it guards (`if (!product.variants) return null` →
  `if (!product.productvariants) return null`). Where the old code would throw on a missing value
  (`.find(...).presentment_prices`), write the port with `?.`: the old feed runs today, so it never throws on current
  data, and in the new feed one throw aborts the whole run. In a helper with fallback branches (e.g. one for
  `metafields.custom_x` and one for `metafields.custom.x`), port the branch that matches the legacy shape and drop
  the one that never could.
- **The oldPrice exception:** only where the old code leaves oldPrice empty. Write `<ported compare-at expression> ??
  <ported price expression>`. A compare-at the old code did send (also "0.00", or one below the price) stays as it is.
  When the old code already has its own fallback, port it unchanged.

- **Dates (team decision): no time-zone conversion.** Use V2's `published_at` as it is. A stored date string
  (`extraData.published_at`) becomes `product.published_at` (UTC, ending in `Z`). `created` is always
  `product.published_at ? Date.parse(product.published_at) : undefined`, also where the old feed stored a date only
  (V1 `(datefmt:"yyyy-MM-dd")`). Report the difference (known difference 5).

## Auto-mapped keys (`...product` spreads and non-native top-level keys)

Hello Retail maps every non-native top-level key: a primitive → `extraData.<key>` (as a string), an array →
`extraDataList.<key>` (only primitive elements kept), an object → dropped. Write each stored one explicitly:

| Stored field | New expression |
|---|---|
| `extraData.id` | `product.legacy_resource_id` |
| `extraData.handle`, `.vendor`, `.product_type` | the same V2 field |
| `extraData.body_html` | `product.description_html` |
| `extraData.tags` | `tags` (pattern) |
| `extraData.published_at` | `product.published_at` (UTC; known difference 5) |
| `extraData.published_scope` | the value the live samples show |
| `extraData.is_master` | `"true"` |
| `extraData.<name>` from a top-level key like `altimg: product.images?.[1]?.src` | the same expression, ported (`images[1]?.url`) |
| `extraDataList.collection_ids` | `collections.map((c) => c.legacy_resource_id)` |
| `extraDataList.hierarchies_<locale>` | `collections.map((c) => (c[`hierarchy_${locale}`] ?? c.hierarchy)[0])` |
| `extraDataList.images`, `.options`, `.variants`, `.variants_sellable` | `[]` (they were lists of objects, stored empty) |
| `main_image`, `main_variant`, `metafields`, `translations` | nothing (objects were dropped) |

A spread also re-adds native fields the old code didn't set itself (e.g. `title`); check them against the map.

## How Hello Retail stores values (what "the same" means)

- extraData: strings; `true` → "true", `false` → "false"; `""` and `null` remove the key. Designs often compare
  `== "true"`.
- Native string fields are trimmed; an empty value counts as missing (a `.text()` that gave "" stored nothing).
- extraDataList: primitive elements only; empty strings dropped (`[""]` is stored as `[]`).
- `hierarchies`: a flat `["A", "B"]` becomes `[["A"], ["B"]]`; paths are stored deduplicated and sorted, so their
  order never matters. Lists in extraDataList keep order and duplicates.
- `variantProductNumbers`: stored deduplicated.
- Numbers as strings ("60.00") are fine for price fields; `Math.round("699.00")` works as in the old code.
- Native field names match case-insensitively; everything else is auto-mapped.

## V1 crawl strings on the legacy item

The JSON is read as XML: object keys become elements, an array becomes a wrapper element with one repeated element
per entry (`variants > variants`), and `x[l='1']` selects every entry of list `x`.

| Crawl string | Behaviour (verified against stored data) |
|---|---|
| `$("root > handle").text()` | direct child of the product |
| `$("a, b, c")` | results in **selector order**, not document order |
| `$("variants > variants").find("a, b")` | selector order **per matched element**: every variant's `a` then its `b`, variant by variant (`[a1, b1, a2, b2, …]`), not all `a` then all `b` → `variants.flatMap((v) => [a(v), b(v)])` |
| `$("name")` for a key the legacy item doesn't have (e.g. `keywords`) | matches nothing: `.text()` gives "", so `.matches(…)` is always "false". Port the field as that constant |
| `.text()` on several matches | concatenated |
| `.fns("text")` | a list, one text per match; `.join(" ")` joins it |
| `$("x:first")` | first match in document order. Legacy key order: id, title, body_html, vendor, product_type, handle, published_at, published_scope, tags, variants, options, images, main_image, hierarchies, collection_ids, main_variant, variants_sellable, is_master. Variant: id, product_id, title, price, position, inventory_policy, compare_at_price, …, sku, …, inventory_quantity, old_inventory_quantity, presentment_prices |
| `$("inventory_quantity")` | every variant **plus** main_variant **plus** each variants_sellable entry (duplicates counted) |
| `$("main_variant > price")` | base price (shop currency), not presentment |
| `.unescapeHtml()` | decode entities only: `text.replace(/&(#\d+\|#x[0-9a-f]+\|[a-z][a-z0-9]*);/gi, (e) => new DOMParser().parseFromString(e, "text/html").textContent)` |
| `.replace(/<[^>]*>/g, "")` | the same regex in JS |
| `.split(",")` | no trim: `" Plastic"` keeps its space |
| `.asTags().fns("removeMatching", /re/)` | one path per string; drop the strings `re` matches. Port the regex without the `g` flag (a `g` regex in `.test()` keeps state between calls) |
| `.matches(/re/)` | `re` found anywhere in the text, like JS `re.test(text)` (verified: `join("\|\|").matches(/\|\|/)` stores "true" for 2+ entries) → "true"/"false" |
| `[sel, sel].removeMatching("")` | drops only the empty strings → `.filter((s) => s !== "")` |
| `previousPrice` | `oldPrice` |
| `(datefmt:"yyyy-MM-dd")created` | legacy: midnight UTC of the shop-local date. New: `product.published_at ? Date.parse(product.published_at) : undefined` (see Dates) |
| JSON `null` | an empty element: `.text()` gives "" |

Port each line to the V2 expression with the field map. Check two or three live products to confirm (keyword
strings show the selector order directly).

Side note on collection order: on one shop the legacy collection titles in stored keyword strings were in plain
alphabetical order on every sampled product, not smart-collections-first. If the samples show that,
`.map((c) => c.title).sort()` reproduces it; otherwise keep the `collections` pattern. Seen on one shop only.

## Known differences (always state the ones that apply)

1. **Unpublished collections.** The V2 helper only returns published collections. Anything built from collection
   titles or ids (hierarchies, keywords, `collection_ids`, `hierarchies_<locale>`) can miss "all products" /
   discount-code helper collections, and the order of collection-based lists can differ. Native `hierarchies` are
   stored sorted, so only their content matters. A flag built from one specific collection (e.g. "is in collection
   X") flips for the whole catalogue if X is unpublished: name the flag in the report and ask the person to check, in
   the feed editor, a product where it is "true" today.
2. **Product scope.** The V2 helper returns ACTIVE products only; the legacy helper returns every published
   product. A product whose page is live but whose status isn't ACTIVE (e.g. unlisted) drops out.
3. **Timing.** Stock and prices that change between the old feed's last run and the new one.
4. **Size.** V2 output is about 3–4× the legacy output (every product carries its collections); very large
   catalogues can pass 1 GB.
5. **Dates in UTC.** Stored date strings change from the shop's offset (e.g. `+02:00`) to UTC (`Z`), same instant.
   Where the old feed stored a date-only `created` (midnight), the new one stores the exact publish time.

## Field checklist (put it in the report)

| Stored field | Old expression | New expression | Same? |
|---|---|---|---|
| url | … | … | yes / known difference n |

## Common mistakes

| Mistake | Result |
|---|---|
| Guessing V2 field names, or guarding on `product.variants` / `main_image` | every product skipped: a full run removes the catalogue |
| Keeping `apikey`, `apipassword`, `currency` in the url | the V2 helper fails or prices the wrong market |
| Updating the old feed in place, or activating the new one | live data changes before anyone compared |
| Using the D&TS Shopify-V2 template | cheapest-variant price, `_600x` images, tags as keywords, a different stock rule: not 1:1 |
| Dropping keys that came from `...product` | designs lose data (e.g. `extraData.id` used for add-to-cart) |
| `productimages` / `options` in the order given | second image and option order wrong (both come reversed) |
| `product.main_variant` from V2 | wrong variant when two share a position |
| `product.hierarchies` where the old code read `hierarchies_<locale>` | untranslated titles |
| `contextual_pricing.min_variant_pricing` where the old code read one variant | cheapest instead of that variant's price |
| `Object.values(product.metafields)` by position or the legacy `<namespace>_<key>` name | wrong or missing metafield |
