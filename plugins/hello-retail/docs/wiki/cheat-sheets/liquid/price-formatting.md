---
source: field
verified: never
---

# Liquid — Prices (all template types)

**The rule: the number goes through `| price`, and the currency comes from the product.** It holds in every Hello Retail template: Search, Recommendations, Pages, Newsletter Content and Triggered Emails. The two exceptions are listed under [Exceptions](#exceptions); nothing else is one.

This page is the one place the price rules are written down. The developer and QA skills, and the other cheat sheets, point here instead of repeating them. The filters themselves are in [general.md](general.md) and on [Custom Liquid Filters](https://developer.helloretail.com/guides/templates/custom_liquid_filters/).

## Contents

1. [The price forms](#the-price-forms)
2. [Separators, decimals and static text](#separators-decimals-and-static-text)
3. [Sale pair](#sale-pair)
4. [Discount percentage](#discount-percentage)
5. [From prices and price ranges](#from-prices-and-price-ranges)
6. [Price elements with no standard field](#price-elements-with-no-standard-field)
7. [Exceptions](#exceptions)
8. [Prices that follow the shopper](#prices-that-follow-the-shopper)

---

## The price forms

Write the price in one of these four forms. All four are equivalent for QA and none is mandatory over another; pick the one that reproduces the shop's own format (separators, symbol, symbol position).

```liquid
{{ product.price | price }} {{ product.currency }}                    {# 999 SEK #}
{{ product.price | price }} {{ product.currency | currencySymbol }}   {# 999 kr #}
{{ product.price | priceWithCurrency: product.currency }}
{{ product.price | priceWithCurrencySymbol }}
```

- **`| price` must be there** in the first two forms. Without it the output is the raw number and the website's price format is ignored, with no error.
- **`priceWithCurrency` always takes `: product.currency`.** The bare `| priceWithCurrency` does not render the shop's currency.
- **Never `| money`.** It is a Shopify filter, not a Hello Retail one.
- **Never a hardcoded currency** (`kr`, `€`, `$`) in place of `product.currency`.
- **The symbol may stand before the number** when the shop writes it that way: `{{ product.currency | currencySymbol }}{{ product.price | price }}` gives `€49,95`.
- **`priceWithCurrencySymbol` is not for email templates.** The newsletter QA checklist records it as a runtime error in the newsletter renderer, and it is not on the public filter list. In Search, Recommendations and Pages it is one of the four forms.

The same form is used for `product.oldPrice`.

## Separators, decimals and static text

- **Separators and decimals come from the website's price format**, which `| price` applies. When the shop's own tile shows a different separator or number of decimals than `| price` produces, that is a website-settings question for the operator, not something to patch in Liquid.
- **No `replace` or `remove` on a formatted price.** `| replace: ",00", ""` is fragile across markets, and `| remove: '.'` destroys thousands separators.
- **Static text that is not a currency is allowed around the price.** The Danish and Norwegian zero-decimal form is `{{ product.price | price }},-`. A "from" prefix is a plain translated word (see [From prices](#from-prices-and-price-ranges)). Only the currency itself has to come from the filters.
- **A suffix on a sale pair goes on both prices or on neither.** A suffix such as `,-` or a currency code written once after the pair renders as `349,-122,-`.

## Sale pair

The old price and the current price use the same form, and the pair is gated on `product.isOnSale`.

```liquid
{% if product.isOnSale %}
  <s>{{ product.oldPrice | price }} {{ product.currency | currencySymbol }}</s>
  <span>{{ product.price | price }} {{ product.currency | currencySymbol }}</span>
{% else %}
  <span>{{ product.price | price }} {{ product.currency | currencySymbol }}</span>
{% endif %}
```

- **`product.isOnSale` is the only sale condition.** Not `oldPrice != price`: on many feeds the two differ on products that are not on sale.
- **The markup around the pair is the shop's own** (its `<del>` / `<ins>`, classes, colours). This block shows the condition and the filters, not the HTML to ship.

## Discount percentage

Always computed from the product, always guarded.

```liquid
{% if product.isOnSale and product.oldPrice > 0 %}
  {% assign discount_pct = product.oldPrice | minus: product.price | times: 100.0 | divided_by: product.oldPrice | round %}
  -{{ discount_pct }}%
{% endif %}
```

- **Keep the guard.** An empty or zero `oldPrice` divides by zero on a product that is not on sale.
- **Multiply by `100.0` before dividing.** It keeps the division in decimals.
- **A saved amount instead of a percentage:** `{{ product.oldPrice | minus: product.price | price }}`, inside the same guard.
- **Only when the shop's own sale tile shows a badge.** Many shops show the struck old price and no percentage.

## From prices and price ranges

Shop tiles show `From 199,-` or `199 – 349 kr` on products with variants. `product.price` is the master's price; a minimum or maximum exists only when the feed carries one, and its name differs per customer (`product.minPrice`, `extraData.highestPrice`, …).

1. Read one variant product's row in the feed (`productData_get`).
2. A minimum / maximum field is there → use it.
3. It is not → render `product.price` with the shop's prefix word, and report the missing field to the operator so the feed can add it.

The prefix word (`Fra`, `Från`, `Ab`, `Vanaf`, `From`) is static text in the shop's language, copied from its tile.

```liquid
{# from price #}
{% if product.extraData.hasVariants == "true" and product.minPrice %}
  <span>Fra {{ product.minPrice | price }} {{ product.currency | currencySymbol }}</span>
{% else %}
  <span>{{ product.price | price }} {{ product.currency | currencySymbol }}</span>
{% endif %}

{# range, when the feed carries the highest price #}
{% assign highest = product.extraData.highestPrice | plus: 0 %}
{% assign current = product.price | plus: 0 %}
{{ product.price | price }}
{% if current != highest and highest > 0 %}
  – {{ product.extraData.highestPrice | price }}
{% endif %}
{{ product.currency | currencySymbol }}
```

## Price elements with no standard field

None of these has a standard feed field. Look for a matching `extraData.*` key in the product's feed row first and bind it when it is there. Never invent the value.

| Element on the shop's tile | Where the value usually is | When the field is missing |
| --- | --- | --- |
| Incl. / excl. VAT pair (B2B shops, Magento) | `product.priceExVat`, added to the feed by the team; some feeds use `extraData.priceExTax` | Render the incl. price only and report the missing field. Never compute VAT in Liquid (`\| times: 0.8`): the rate differs per product. |
| Lowest price in the last 30 days (EU Omnibus, on sale tiles) | `extraData.<lowestPrice>`, name differs per customer | Leave the line out and report it. A wrong "lowest price" is a legal problem, so no static fallback. |
| Unit price (per kg, per litre, per piece) | `extraData.<unitPrice>` / `extraDataList.size` | Static fallback text and report it. |
| B2B or login-gated price | The feed carries the public price | Render the public price; there is nothing to gate. |
| Member or loyalty price | `extraData.*` when the customer exports it | Leave it out and report it. |

## Exceptions

### Email tiles copy the shop's price markup

A Newsletter Content tile and a Triggered Email tile reproduce the shop's price **exactly as its own tile shows it**, for the current and the old price alike. Currency presentation is part of the brand, and an email is a picture of the shop's tile. So in these two template types, and only there:

- a **literal currency** is allowed when that is what the shop's tile has: `kr&nbsp;{{ product.price | price }}`;
- a **`replace` after the filter** is allowed when it is what reproduces the shop's output: `{{ product.price | price | replace: ',00', ',-' }}`, or `{{ product.price | priceWithCurrency: product.currency | replace: 'kr.', 'kr' }}` to drop the trailing period.

What still holds: the number goes through `| price` or `priceWithCurrency`, never `| money`, and a suffix on a sale pair goes on both prices.

Where the markup is copied from: the shop's category tile for a newsletter tile; the customer's Search tile for a triggered email.

### One Recommendations design on several domains

`replace` on a formatted price is also accepted when the same recom design serves several domains that format prices differently, because the website's price format is one setting per website.

## Prices that follow the shopper

The feed holds one price per product, and the price format is one setting per website. A shop whose price depends on the logged-in customer or on a currency switcher needs the platform's own price handler instead of these forms. Starweb: [dynamicPriceHandler](../../platforms/starweb/dynamic-price-handler.md).

---

## Timeline

- 2026-11-12: Page created. Price rules gathered from the recoms cheat sheet, the search templates page and the developer skills into one place; the email exception written down.
