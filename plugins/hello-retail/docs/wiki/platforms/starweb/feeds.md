---
source: field
verified: 2026-09-24
---

# Starweb — Feeds

Feed notes for Starweb customers. Read alongside the `feed-setup` skill, which owns the general V2 feed-creation flow, and `feed-migration` when moving a V1 Starweb feed to V2.

---

## Price: use `activePriceExVat`, not `specialPriceIncVat`

Starweb shops can schedule prices: a shop can say "this product costs 399 SEK for a week, starting a week from now". `specialPriceIncVat` comes from before scheduling existed, when a price could only be changed by hand at the moment it should apply, and it doesn't follow scheduled prices. The price in force right now is `activePriceExVat`, per price list, on the product's main variant.

Map `price` from `activePriceExVat` on every Starweb feed, including ones that don't use scheduled prices today. It isn't a single top-level field, so it takes a few steps:

1. Find the main variant's entry for the shop's default price list: `mainVariant.data[0].prices.data[]`, matched on `pricelistId`. That is usually price list `1`, but check it on the shop.
2. Take its `activePriceExVat` and add VAT with the product's `usedVatRate` (a percentage, e.g. `25`).
3. Round to two decimals.
4. If there is no entry for that price list, fall back to `specialPriceIncVat`.

This keeps `isOnSale`, sort by price and the price filter right. They run on the indexed `price`, so it has to be correct even on shops where Starweb's [dynamicPriceHandler](./dynamic-price-handler.md) overwrites the price the shopper sees.

This page covers `price` only; it doesn't change how `oldPrice` is mapped.

### V2 transform

```js
function getActivePrice(product) {
    const defaultPriceList = 1; // usually 1 — check the shop's price lists
    const priceObj = product.mainVariant?.data?.[0]?.prices?.data?.find((p) => p.pricelistId === defaultPriceList);
    const price = priceObj && product.usedVatRate != null
        ? priceObj.activePriceExVat * (1 + product.usedVatRate / 100)
        : product.specialPriceIncVat;
    return Math.round((price + Number.EPSILON) * 100) / 100;
}

function transform(product) {
    return {
        // ...other fields
        price: getActivePrice(product),
    };
}
```

`price` is a number in the V2 feed, so the helper returns a number, not a `toFixed(2)` string.

### V1 feed

```text
price: [[$("mainVariant prices data pricelistId:contains(1):first").parent().find("activePriceExVat").text().replace(/^$/, 0),
         $("root > usedVatRate").text().replace(/^$/, 0).replace(/^(\d{1})$/,"0$1").replace(/(\d)/, "1.$1")].multiply(),
        $("root > specialPriceIncVat").text()].removeMatching(/^0$/).shift().round()
```

It does the same as the V2 helper:
- It reads `activePriceExVat` from price list `1`.
- It turns `usedVatRate` into a factor: `25` → `1.25`, `6` → `06` → `1.06`.
- It multiplies the two.
- If that comes out as `0` (the price list entry is missing), it uses `specialPriceIncVat` instead, then rounds.

When migrating a V1 Starweb feed whose price line reads only `specialPriceIncVat`, move it to the V2 helper above rather than translating it one to one.

---

**Related:**

- Platform install nuance — [Starweb overview](./README.md)
- Multi-currency and customer-unique prices — [dynamic-price-handler.md](./dynamic-price-handler.md)
- Feed setup flow — `${CLAUDE_PLUGIN_ROOT}/skills/feed-setup/SKILL.md`

---

## Timeline

- 2026-09-24: Page created from the team's Starweb notes. The V2 helper returns a number instead of a string, and falls back to `specialPriceIncVat` when `usedVatRate` is missing as well as when the price list entry is.
