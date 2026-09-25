---
source: field
verified: 2026-09-25
---

# DanDomain & Lightspeed — Add to cart

DanDomain and Lightspeed (WebshopApp) commonly share the **dmws_perfect** plugin, so they share this
reference. ATC here is a **plain `<form action>` POST — no binding JS is needed**, the form submits
natively. Decide which form by what's in the DOM: `.dmws_perfect-*` classes → dmws_perfect form;
otherwise the DanDomain standard form.

**Detection:**

| Signal | Platform |
| --- | --- |
| `meta[name="generator"] = DanDomain` | **DanDomain** |
| `cdn.webshopapp.com`, `lightspeed.multisafepay.com` | **Lightspeed** (WebshopApp) |
| `.dmws_perfect-*` classes | **Lightspeed** dmws_perfect plugin (on either platform) |

---

## ATC form — dmws_perfect (Lightspeed plugin)

```liquid
<form action="/cart/add/{{ product.variantProductNumbers | first }}/"
      id="product_configure_form_{{ product.variantProductNumbers | first }}"
      method="post">
  <input type="number" name="quantity" value="1" min="1" max="10000" pattern="[0-9]*">
  <button class="dmws_perfect-filter-add-to-cart-btn"
          type="submit"
          data-link="/cart/add/{{ product.variantProductNumbers | first }}/"
          onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])">
  </button>
</form>
```

## ATC form — DanDomain standard (not dmws_perfect)

**The `action` URL, the hidden-input `name` pattern and the product-id field are not fixed
across DanDomain shops — always take all three from the surveyed tile's own `<form>`, never
from this snippet.** Two shapes seen in the field: the classic template posts to
`/kurv/tilfoej/` with `product[<id>][amount]`; the newer AngularJS-driven product-list
template posts to `/actions/cart/add` with a visible quantity `<input name="product[<id>][amount]">`
inside the form and a `<button type="submit" name="cartadd">`. The `<id>` the theme uses is
the DanDomain item number — on the Angular template that is `product.extraData.itemNumber`
(matches the native `product[1234][amount]` value), not `productId`. Copy the form verbatim per
the tile-extractor rules and bind only the dynamic values. The snippet below is the classic
shape, kept as the reference for its Liquid branches:

```liquid
<form action="/kurv/tilfoej/" method="post">
  <input type="hidden" name="product[{{ product.extraData.productId }}][amount]" value="1">
  {% if product.extraData.hasVariants == "true" %}
    <input type="hidden" name="product[{{ product.extraData.productId }}][variant]" value="">
  {% endif %}
  {% if product.inStock == false %}
    <button type="button" disabled><span>Udsolgt</span></button>
  {% elsif product.extraData.hasVariants == "true" %}
    <button type="submit" onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"><span>Vælg Variant</span></button>
  {% else %}
    <button type="submit" onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"><span>Køb</span></button>
  {% endif %}
</form>
```

---

**Related:**
- Search-trigger conflict (`#search-modal`) when reusing the storefront search input as the HR trigger
  — [./search-trigger.md](./search-trigger.md)
- Rating (rateit) — [./rating.md](./rating.md)

**Source:** extracted from the tile-extractor skill reference, 2026-07-01.
