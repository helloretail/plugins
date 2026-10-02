# WooCommerce — Feed Reference

Feed URL pattern: `?feed=hello_retail_feed`
Feed plugin: Hello Retail WooCommerce plugin

---

## Field mapping

| Feed field | HR field | Notes |
|---|---|---|
| `productnumber` | `productNumber` | |
| `title` | `title` | |
| `url` | `url` | |
| `imgurl` | `imgUrl` | |
| `price` | `price` | |
| `oldPrice` | `oldPrice` | Same name on both sides — V2 emits `oldPrice`, not `previousPrice` |
| `priceBase` | `priceExVat` | WooCommerce stores prices ex-VAT internally |
| `oldPriceBase` | `oldPriceExVat` | |
| `instock` | `inStock` | String "true"/"false" — HR handles the conversion |
| `hierarchies` | `hierarchies` | Use `getHierarchies()` — see SKILL.md |
| `variantProductnumbers.productnumber` | `variantProductNumbers` | Array of child elements |
| `description` | `description` | May contain HTML |
| `keywords` | `keywords` | Often empty; combine with `sku` for better coverage |
| `created` | `created` | `new Date(product.created)` |
| `sku` | — | Put in `keywords` and/or `extraData.sku` |
| `imgurl` | `imgUrl` | |
| `catalog` | `extraData.catalogImgUrl` | Medium-size image |
| `thumbnail` | `extraData.thumbnailImgUrl` | Small thumbnail |

## Attributes

WooCommerce attributes live in `product.attributes.attribute[]`. Each `<attribute>` element
has a `name` XML attribute identifying the group, and `<attributeValue>` children with the values.

After XML-to-JSON parsing, XML attributes are stored under `_xmlAttributes`:

```js
// <attribute name="Color" variant="true">
//   <attributeValue>Red</attributeValue>
// </attribute>
// parses to:
{ _xmlAttributes: { name: "Color", variant: "true" }, attributeValue: "Red" }
```

Use this helper to extract values by attribute name:

```js
function getAttributeValues(name) {
  var allAttributes = ensureArray(product.attributes?.attribute);
  var match = allAttributes.find(function(attr) {
    return attr._xmlAttributes?.name === name;
  });
  return ensureArray(match?.attributeValue);
}
```

Attribute names use the `pa_` WooCommerce prefix in the feed (e.g. `pa_maerke`, `pa_farve`).
Check `<attribute name="...">` in the actual feed XML to find the exact names.

---

## Pagination

The plugin pages with `page`, starting at **0**, and `pageSize`, which are the standard
defaults:

```json
{
  "pageVariable": "page",
  "pageInitialValue": 0,
  "sizeVariable": "pageSize",
  "sizeValue": 200
}
```

The plugin has never had a `paged` parameter, so it ignores one: `paged=1` and `paged=2`
both return the first page. A feed whose page parameter is `paged` stops at the second request, because a paginated
feed stops when a page matches the previous one. It imports only the first page (200
products) and the run still shows green. This was checked against plugin 1.2.43. The root element's
`last-page-number` gives the page count.

---

## Info endpoint and `extraAttributes`

Fetch `/?feed=hello_retail_info` (no auth) before mapping. It returns the plugin version, the
WooCommerce and WordPress versions, every product meta key (`<product_meta><meta>`) and every
taxonomy (`<taxonomies><taxonomy>`).

Data points beyond the standard fields are requested on the feed URL:

```
?feed=hello_retail_feed&extraAttributes=total_sales,product_brand
```

They arrive per product as:

```js
// <meta><key name="total_sales"><value>12</value></key></meta>
// <taxonomies><taxonomy name="product_brand"><term>Acme</term></taxonomy></taxonomies>
// ensureArray(...)[0] accepts <meta> / <taxonomies> parsed either as an object or as a one-item array.
function getMetaValue(name) {
  var keys = ensureArray(ensureArray(product.meta)[0]?.key);
  var key = keys.find(function(k) { return k._xmlAttributes?.name === name; });
  return key ? ensureArray(key.value)[0] || '' : '';
}

function getTaxonomyTerms(name) {
  var taxonomies = ensureArray(ensureArray(product.taxonomies)[0]?.taxonomy);
  var tax = taxonomies.find(function(t) { return t._xmlAttributes?.name === name; });
  return tax ? ensureArray(tax.term).filter(Boolean) : [];
}
```

Check the parsed shape on a real product in the feed editor before you rely on these helpers.

- Keys and taxonomies that are unknown or empty are left out without any error. Count how
  many products carry each one over a few hundred products before you map it.
- On a WPML (multilingual) shop, the info endpoint at the root URL describes the default
  language. Test `extraAttributes` against the URL of the language you are building. If a
  value is missing in one language, the shop's translation lacks the data.

Wiki: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/woocommerce/README.md`.

---

## Example transform

```js
function transform(product) {

  if (!product) return null;


  // ─── Helpers ─────────────────────────────────────────────────────────────────
  // You should not need to edit these.

  function ensureArray(val) {
    if (Array.isArray(val)) return val;
    if (val !== undefined && val !== null) return [val];
    return [];
  }

  // Returns the list of values for a named WooCommerce attribute.
  // Attribute names come from <attribute name="..."> in the feed XML.
  // Example: getAttributeValues("pa_farve") → ["Red", "Blue"]
  function getAttributeValues(name) {
    var allAttributes = ensureArray(product.attributes?.attribute);
    var match = allAttributes.find(function(attr) {
      return attr._xmlAttributes?.name === name;
    });
    return ensureArray(match?.attributeValue);
  }

  // Each <hierarchy> becomes one path array, e.g. [["Clothes", "Women", "Tops"]]
  function getHierarchies() {
    if (!product.hierarchies) return undefined;
    var paths = [];
    ensureArray(product.hierarchies).forEach(function(item) {
      ensureArray(item.hierarchy).forEach(function(h) {
        var cats = ensureArray(h.category).filter(Boolean);
        if (cats.length > 0) paths.push(cats);
      });
    });
    return paths.length ? paths : undefined;
  }


  // ─── Field mapping ────────────────────────────────────────────────────────────
  // Edit the values on the right-hand side to match your feed.
  //   Left side  = Hello Retail field name
  //   Right side = field from the feed  (product.FIELD_NAME)

  return {

    // ── Core fields ───────────────────────────────────────────────────────────
    productNumber:         product.productnumber,
    title:                 product.title,
    url:                   product.url,
    imgUrl:                product.imgurl,
    price:                 product.price,
    oldPrice:              product.oldPrice,
    priceExVat:            product.priceBase,
    oldPriceExVat:         product.oldPriceBase,
    inStock:               product.instock,
    hierarchies:           getHierarchies(),
    variantProductNumbers: ensureArray(product.variantProductnumbers?.productnumber),
    description:           product.description,
    created:               new Date(product.created),

    // Combines multiple fields into one searchable string
    keywords: [product.keywords, product.sku].filter(Boolean).join(' '),

    // brand: getAttributeValues("pa_maerke")[0],


    // ── Extra text fields ─────────────────────────────────────────────────────
    // Available in recommendation templates as {{ extraData.fieldName }}
    extraData: {
      sku:               product.sku,
      type:              product.type,             // "simple", "variable", "external", etc.
      visibility:        product.visibility,       // "visible" or "hidden"
      shortDescription:  product.shortDescription,
      isPurchasable:     product.isPurchasable,
      backordersAllowed: product.backordersAllowed,
      catalogImgUrl:     product.catalog,          // medium-size product image
      thumbnailImgUrl:   product.thumbnail,        // small thumbnail image
      externalUrl:       product.externalUrl,      // only set for "external" product type
      taxCountryIso:     product.taxCountryIso,
      modified:          product.modified,
    },


    // ── Extra numeric fields ──────────────────────────────────────────────────
    // Available in recommendation templates as {{ extraDataNumber.fieldName }}
    extraDataNumber: {
      priceRangesTo:      product.priceRangesTo,
      oldPriceRangesTo:   product.oldPriceRangesTo,
      priceRangesToBase:  product.priceRangesToBase,
      mainProductTaxRate: product.mainProductTaxRate,
    },


    // ── Extra list fields ─────────────────────────────────────────────────────
    // Available in recommendation templates as {{ extraDataList.fieldName }}
    // Add lines below to expose product attributes for filtering/personalisation.
    // Find attribute names by checking <attribute name="..."> in the feed XML.
    //
    // Example:
    //   color: getAttributeValues("pa_farve"),
    //   size:  getAttributeValues("pa_stoerrelse"),
    extraDataList: {
      variantSkus:            ensureArray(product.variantSkus?.sku),
      categoryIds:            ensureArray(product.categoryIds?.categoryId),
      categoryIdsWithParents: ensureArray(product.categoryIdsWithParents?.categoryId),
    },

  };
}
```
