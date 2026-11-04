---
source: field
verified: 2026-11-03
---

# Wikinggruppen — Multi-currency shops

Some WGO shops sell one product range in several currencies from the same domain. The shopper picks a currency in the theme's currency selector and the theme reloads its own prices; Hello Retail tiles have to follow. This page is the reference setup for that, taken from the most recently reworked multi-currency WGO setup.

**How it works:** the feed carries one price per currency, every tile prints all of them, and CSS shows only the one the shopper picked. Nothing is fetched or recalculated in the browser.

---

## 1. Feed: one price field per currency

The export has `Pris_<CUR>` and `OrgPris_<CUR>` columns for every currency the shop sells in. Map each to a flat `extraDataNumber` key; `price` / `oldPrice` stay on `Pris` / `OrgPris` (the shop's default currency) as on any WGO feed ([feeds.md](./feeds.md)):

```javascript
extraDataNumber: {
  priceSEK: row["Pris_SEK"], oldPriceSEK: row["OrgPris_SEK"],
  priceEUR: row["Pris_EUR"], oldPriceEUR: row["OrgPris_EUR"],
  priceNOK: row["Pris_NOK"], oldPriceNOK: row["OrgPris_NOK"],
  // …one pair per Pris_<CUR> column in the export's header row
},
```

Key names: `price<CUR>` / `oldPrice<CUR>` with the ISO code in capitals.

## 2. Tile: one span per currency

Inside the price block, print every currency as its own `span.aw-currency-<CUR>`, formatted the way the shop prints that currency:

```liquid
<div class="aw-price-box">
  <p class="price{% if product.isOnSale %} price-discount{% endif %}">
    <span class="aw-currency-SEK">{{ product.price | price }} kr</span>
    <span class="aw-currency-EUR">€{{ product.extraDataNumber.priceEUR | price }}</span>
    <span class="aw-currency-NOK">{{ product.extraDataNumber.priceNOK | price }} kr</span>
  </p>
  {% if product.isOnSale %}
    <p class="aw-old-price muted price-original">
      <span class="aw-currency-SEK">{{ product.oldPrice | price }} kr</span>
      <span class="aw-currency-EUR">€{{ product.extraDataNumber.oldPriceEUR | price }}</span>
      <span class="aw-currency-NOK">{{ product.extraDataNumber.oldPriceNOK | price }} kr</span>
    </p>
  {% endif %}
</div>
```

The default currency's span reads `product.price` / `product.oldPrice`; every other span reads its `extraDataNumber` key. Use the same markup in search, recommendation and Pages designs.

## 3. JavaScript: copy the shopper's currency onto `<html>`

The theme's currency selector is a `<select class="js-set-currency">`; the active currency is the `option` carrying the `selected` attribute. Copy its value to `html[data-aw-currency]`:

```javascript
function hrSearchFixCurrency() {
  var opt = document.querySelector(".js-set-currency option[selected]");
  if (opt) document.documentElement.dataset.awCurrency = opt.value;
}
```

- **Search** (`initializationCode`): call it on initial render, when the overlay opens and after every load-more batch. It only sets an attribute, so running it repeatedly is safe.
- **Recommendations:** run the same two lines once in the design's script.

## 4. CSS: show the matching span

```css
.hr-overlay-search .aw-price-box [class*="aw-currency-"] { display: none; }

html[data-aw-currency="SEK"] .hr-overlay-search .aw-currency-SEK,
html[data-aw-currency="EUR"] .hr-overlay-search .aw-currency-EUR,
html[data-aw-currency="NOK"] .hr-overlay-search .aw-currency-NOK,
html:not([data-aw-currency]) .hr-overlay-search .aw-currency-SEK {
  display: inline;
}
```

One line per currency, plus the `:not([data-aw-currency])` fallback to the default currency for the moment before the script has run. Recommendation designs scope the same rules to the box (`#aw-box-{{ key }}` instead of `.hr-overlay-search`).

---

## Timeline

- 2026-11-03: Page created from the live search and recommendation designs and the feed of a multi-currency WGO shop (nine currencies), the setup reworked most recently; currency selector checked on the storefront.
