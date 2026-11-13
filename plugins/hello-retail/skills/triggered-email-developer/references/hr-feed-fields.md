# HR feed fields + Liquid patterns

Inside a triggered-email content block, `product` is the current item in the loop
(`products` or `relatedProducts`). The **authoritative field map is the customer's
Search tile** — pull it via `search_getDesign` (the first
`[class^="hr-search-overlay-product"]` element's inner markup) and reuse exactly
which field carries the title, price, brand, etc. The fields below are the common
ones plus the Liquid patterns that go with them.

## Core fields

The standard fields — `title`, `url`, `imgUrl`, `brand`, `price`, `oldPrice`, `currency`,
`isOnSale`, `inStock`, `productNumber` — are listed in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/general.md` → *The standard fields on
`product`*. What a triggered-email tile does with them:

- `product.url` → the link target for the image and the title.
- `product.inStock` → drives the sold-out badge.
- `product.productNumber` → used on-site for modals; rarely needed in email.
- `product.extraData.*` → customer-specific extras (e.g. `brandUrl`, `altimg`); confirm the
  names against the Search tile.

## Price formatting — copy the Search tile exactly

Reproduce whatever the Search tile does, for the current and the old price. What an email tile
may write (a literal currency, a `replace` after the filter) and what still holds is in
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/price-formatting.md` → *Email tiles copy the shop's price markup*. The discount percentage and its guard are in
the same page → *Discount percentage*.

## Sale handling

Reproduce the tile's sale branch, including any prefix like "Från" / "From", the discount badge
when the tile has one, and the struck old price colour. The price form below is the base
template's; write the Search tile's form in its place, the same one on all three prices.

```liquid
{% if product.isOnSale and product.oldPrice > 0 %}
  {% assign discount_pct = product.oldPrice | minus: product.price | times: 100.0 | divided_by: product.oldPrice | round %}
  <span style="… badge styles …">Spara {{ discount_pct }}%</span>
{% endif %}
{% if product.isOnSale %}
  <span style="color:{{ text_color }};">Från {{ product.price | price }} {{ product.currency }}</span>
  <span style="color:{{ old_price_color }}; text-decoration:line-through;">{{ product.oldPrice | price }} {{ product.currency }}</span>
{% else %}
  <span style="color:{{ muted_color }};">{{ product.price | price }} {{ product.currency }}</span>
{% endif %}
```

## Sold-out

```liquid
{% if product.inStock == false %}
  <span style="… badge styles …">Utsåld</span>   {# or the shop's own out-of-stock copy #}
{% endif %}
```

## Brand line (optional link)

```liquid
{% if product.brand != blank %}
  {% if product.extraData.brandUrl != blank %}
    <a href="{{ product.extraData.brandUrl }}" style="…">{{ product.brand }}</a>
  {% else %}
    {{ product.brand }}
  {% endif %}
{% endif %}
```

## Notes

- Localised copy (badge words like "Spara"/"Save", "Från"/"From", "Utsåld") should
  match the **storefront language**, which can differ from the HR website
  `language` setting — copy what the live tile shows.
- Only render elements the storefront tile actually shows; guard customer-specific
  `extraData.*` with `{% if product.extraData.<field> != blank %}`.
- A JS-only rating widget (Lipscore etc.) has no feed field → omit it; never fake
  stars.
