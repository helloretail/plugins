---
source: field
verified: 2026-09-15
---

# Shopify — Add to cart

Platform-specific ATC for Hello Retail tiles on Shopify. **The tile copies the theme's own form** —
`<product-form>` / `form.js-product-form`, exactly as the category page has it — and the surface binds
it as below. No Hello Retail form inside the tile: the older "Approach A" (an HR `.hr-form` with a
variant select) was retired on 2026-09-23 because it put Hello Retail markup in the tile that the
theme's CSS never styled (tile-extractor Output Rule 15).

**Detection:** storefront host / image URLs on `cdn.shopify.com` or `*.myshopify.com`; the tile's
ATC `<form action>` is `/cart/add`; a `Shopify` global / `cdn.shopify.com` script in `<head>`.
**Section IDs** (`section-id`) are page-specific and **not** in the feed — omit them entirely.

---

## Binding the copied theme form (formerly "Approach B")

The tile keeps the theme's own product-form markup — loading states, error line, quick-add dialog for
variant products — with the variant id and product id bound to the feed. `<product-form>` and the other
custom elements upgrade themselves when Hello Retail inserts the tile, so **test with a real click
before adding any of the JS below** (search-developer → tile-interactivity Step 0); on many Dawn-family
themes nothing more is needed.

### Form markup — simple product

```liquid
<product-form class="atc-wrap">
  <div class="js-form-error"></div>
  <form class="js-product-form"
        id="quick-add-{{ product.productNumber }}"
        action="/cart/add" method="post">
    <input type="hidden" name="form_type" value="product">
    <input type="hidden" name="utf8" value="✓">
    <input type="hidden" name="id" value="{{ product.variantProductNumbers | first }}">
    <button name="add" type="submit"
            data-add-to-cart-text="Add to cart"
            aria-haspopup="dialog"
            onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"
            {% if product.inStock == false %}disabled{% endif %}>
      Add to cart
    </button>
    <input type="hidden" name="product-id" value="{{ product.productNumber }}">
  </form>
</product-form>
```

### Form markup — variant product (opens quick-add dialog)

```liquid
{% if product.extraData.hasOptions == "true" %}
  <div class="no-js-hidden atc-wrap">
    <button class="js-quick-add"
            type="button"
            aria-haspopup="dialog"
            data-product-url="{{ product.url }}"
            data-product-default-variant="false">
      Vælg variant
    </button>
  </div>
{% else %}
{% endif %}
```

### Binding IIFE — AJAX add + section refresh + quick-add

Handles the `.js-product-form` submit (AJAX add + cart-icon/cart-notification section refresh) and
the `.js-quick-add` dialog trigger. Delegated, so it survives re-renders on its own.

```javascript
(function () {
  "use strict";

  document.addEventListener("submit", function (e) {
    var form = e.target;
    if (!form.classList.contains("js-product-form")) return;
    e.preventDefault();
    var btn = form.querySelector('[name="add"]');
    var label = btn?.querySelector("span");
    var origText = label?.textContent || "";
    var errDiv = form.closest("product-form")?.querySelector(".js-form-error");
    if (btn) btn.disabled = true;
    if (label) label.textContent = "...";
    if (errDiv) errDiv.style.display = "none";
    fetch("/cart/add.js", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "X-Requested-With": "XMLHttpRequest",
      },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
      .then(function (r) {
        if (!r.ok) return r.json().then(function (d) { throw d; });
        return r.json();
      })
      .then(function () {
        return fetch("/?sections=cart-icon-bubble,cart-notification")
          .then(function (r) { return r.json(); })
          .then(function (sections) {
            ["cart-icon-bubble", "cart-notification"].forEach(function (id) {
              if (!sections[id]) return;
              var target = document.getElementById(id);
              if (!target) return;
              var inner = new DOMParser()
                .parseFromString(sections[id], "text/html")
                .getElementById(id);
              if (inner) target.innerHTML = inner.innerHTML;
            });
            document.dispatchEvent(new CustomEvent("cart:updated"));
          });
      })
      .then(function () {
        if (label) label.textContent = "✓";
        setTimeout(function () {
          if (label) label.textContent = origText;
          if (btn) btn.disabled = false;
        }, 1800);
      })
      .catch(function (err) {
        var msg = err && err.description ? err.description : "Error. Please try again.";
        if (errDiv) { errDiv.textContent = msg; errDiv.style.display = "block"; }
        if (label) label.textContent = origText;
        if (btn) btn.disabled = false;
      });
  }, true);

  document.addEventListener("click", function (e) {
    var btn = e.target.closest(".js-quick-add");
    if (!btn) return;
    var url = btn.getAttribute("data-product-url");
    if (!url) return;
    if (window.QuickAddModal && typeof window.QuickAddModal.open === "function") {
      window.QuickAddModal.open(url);
    } else {
      window.location.href = url;
    }
  });
})();
```

> **Confirm the quick-add global on the live storefront before shipping this.** `window.QuickAddModal` stands in for whatever the theme actually exposes — often a `<quick-add-drawer>` element or a differently named global, sometimes nothing. An unconfirmed `else` branch turns every quick-add click into a page navigation. Check with `typeof window.<Global>` in the browser first; see `${CLAUDE_PLUGIN_ROOT}/skills/search-developer/references/tile-interactivity-js.md`.

---

## Quick View re-init (recom slider)

Some web-component themes render a `<quick-view-button>` inside `[data-button-quick-view]`. HR injects the tiles after page load, so the component's `connectedCallback` never runs for them — call it yourself once the slider is built. Scope to the box (the base template's id is `#hello-retail-{{ key }}`) and run it from Swiper's `afterInit` so clones are covered too:

```javascript
function initQuickViewButtons() {
    document.querySelectorAll("#hello-retail-{{ key }} [data-button-quick-view]").forEach(function (btn) {
        btn.removeAttribute("data-initialized");
        var el = btn.querySelector("quick-view-button");
        if (el && typeof el.connectedCallback === "function") el.connectedCallback();
    });
}
initQuickViewButtons();   // from afterInit
```

---

## Notes

- **Confirm the drawer event** against the customer's theme — `upcart:cart:change` (UpCart),
  `theme:cart:change` (Dawn-style), `cart:refresh` (Sense / custom). Wrong event = the item adds but
  the drawer never refreshes. The IIFE above uses `cart:updated` + a section refresh.
- The variant CTA ("Vælg variant") navigates or opens the quick-add dialog; it never carries
  `trackClick` — tracking is for add-to-cart actions only (tile-extractor Output Rule 11).
- No-variant products: the theme form's hidden `id` input carries the default variant id
  (`product.variantProductNumbers | first`).
- Shopify B2B / draft orders may need the Storefront API instead of `/cart/add.js`.

**Related:**
- Cross-platform binding rules — [../add-to-cart.md](../add-to-cart.md)
- Rating (Loox) — [./rating.md](./rating.md) · Platform install nuance — [Shopify overview](./README.md)

**Source:** consolidated from the Search, Recom, and tile-extractor skill references, 2026-07-01.

---

## Timeline
- 2026-05-21: Shopify add-to-cart and Quick View patterns documented from Shopify (Dawn) storefronts.
- 2026-07-01: Approach A / B page consolidated from the Search, Recom and tile-extractor skill references.
- 2026-09-14: Merged the cheat-sheet copy into this page. The Quick View re-init now targets `#hello-retail-{{ key }}`, the base template's box id, instead of the legacy `#aw-box-{{ key }}`.
- 2026-09-23: Approach A (Hello Retail's own `.hr-form` inside the tile) retired — the tile copies the theme's form. The variant-CTA example no longer carries `trackClick`; tracking is for add-to-cart only.
