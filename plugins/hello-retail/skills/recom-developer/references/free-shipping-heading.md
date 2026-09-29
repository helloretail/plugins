# Free-shipping heading — cart and upsell recoms

A dynamic heading for a **cart** (`CART_PAGE`) or **upsell** (`UPSELL_STEP`) recom that tells the
shopper how far they are from free shipping — "Add 120 kr. more for free shipping" — and switches
once they're there. Offered in `box-setup.md` → step 4; built only on the operator's yes.

This supersedes the per-shop Free Shipping snippets in
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/recoms/` (`shopify.md`, `dandomain.md`, `general.md`)
for new builds. Those are written for one shop each — the threshold, currency and copy are
hardcoded and the heading is computed once. Read them to understand a design that already uses one.

## What to ask the operator (on yes)

1. **Threshold** — the cart value where free shipping starts, in the website's currency
   (`website_getInfo`). One design can serve several domains, so it's a dashboard field per
   domain, not a constant.
2. **Text below the threshold**, with `{amount}` where the remaining amount goes —
   "Køb for {amount} mere og få gratis fragt", "Add {amount} more for free shipping".
3. **Text once reached** — "Du har gratis fragt", or empty to fall back to the normal headline.
4. **Where the shop shows the cart subtotal** — only on non-Shopify shops (Shopify reads the cart
   API). The subtotal **before shipping**: when the page only shows a total that includes shipping,
   point at the product-lines subtotal instead, or use the wiki's subtract-shipping variant.

The normal `{% input headline %}` stays: it's what the box shows until the cart is read, when the
total can't be read, and on a domain where the free-shipping fields are left empty.

## Template — `templateCode`

**1. Three hidden dashboard fields,** right after the base `<h2>` (additive; the `<h2>` itself is
unchanged). Rendering them into hidden elements, instead of into a JavaScript string, keeps any
text the operator types — quotes included — from breaking the script.

```liquid
<h2>{% input headline %}</h2>
<span hidden data-hr-fs="threshold">{% input free_shipping_threshold %}</span>
<span hidden data-hr-fs="left">{% input free_shipping_left %}</span>
<span hidden data-hr-fs="reached">{% input free_shipping_reached %}</span>
```

**2. The script,** appended to the design's `<script>` after the swiper init. Set `LOCALE` and
`CURRENCY` from `website_getInfo`, and on a non-Shopify shop the two selectors from step 4.

```js
(function () {
  var root = document.getElementById("hello-retail-{{ key }}");
  if (!root || root.getAttribute("data-hr-fs-ready")) return;       // once per rendered box
  root.setAttribute("data-hr-fs-ready", "1");
  var heading = root.querySelector("h2");
  var read = function (name) { var el = root.querySelector('[data-hr-fs="' + name + '"]'); return el ? el.textContent.trim() : ""; };
  var threshold = parseFloat(read("threshold").replace(",", "."));
  var textLeft = read("left"), textReached = read("reached");
  if (!heading || !threshold || textLeft.indexOf("{amount}") < 0) return;   // not set up on this domain → plain headline
  var fallback = heading.textContent;

  var LOCALE = "da-DK", CURRENCY = "DKK";                            // ← from website_getInfo
  var SUBTOTAL_SELECTOR = "";                                         // ← non-Shopify: the shop's cart subtotal (before shipping)
  var WATCH_SELECTOR = "";                                            // ← AJAX carts: the cart / drawer element that re-renders

  var money = new Intl.NumberFormat(LOCALE, { style: "currency", currency: CURRENCY, maximumFractionDigits: 0 });
  var decimal = new Intl.NumberFormat(LOCALE).formatToParts(1.1).filter(function (p) { return p.type === "decimal"; })[0].value;
  // "1.234,56 kr." → 1234.56: keep the number, drop currency and thousands separators.
  function parseAmount(text) {
    var m = String(text).match(/\d[\d.,\s  '’]*/);
    if (!m) return NaN;
    var keep = new RegExp("[^0-9" + (decimal === "." ? "\\." : decimal) + "]", "g");
    return parseFloat(m[0].replace(keep, "").replace(decimal, "."));
  }
  function cartTotal() {
    if (window.Shopify) {                                             // Shopify: a number from the cart API, no text parsing
      return fetch("/cart.js", { credentials: "same-origin" })
        .then(function (r) { return r.json(); })
        .then(function (cart) { return cart.total_price / 100; });
    }
    var el = SUBTOTAL_SELECTOR && document.querySelector(SUBTOTAL_SELECTOR);
    return Promise.resolve(el ? parseAmount(el.textContent) : NaN);
  }
  function set(text) { if (heading.textContent !== text) heading.textContent = text; }   // no-op writes keep the observer quiet
  function update() {
    if (!root.isConnected) { if (observer) observer.disconnect(); return; }   // the box was re-rendered away
    cartTotal().then(function (total) {
      if (isNaN(total)) return set(fallback);
      var left = threshold - total;
      set(left > 0 ? textLeft.replace("{amount}", money.format(Math.ceil(left))) : (textReached || fallback));
    }).catch(function () { set(fallback); });
  }

  var observer = null, timer;
  var watch = WATCH_SELECTOR && document.querySelector(WATCH_SELECTOR);
  if (watch) {                                                        // AJAX cart: recalculate when it re-renders without a reload
    observer = new MutationObserver(function () { clearTimeout(timer); timer = setTimeout(update, 500); });
    observer.observe(watch, { childList: true, characterData: true, subtree: true });
  }
  update();
})();
```

Why it is written this way:

- **Shopify reads `/cart.js`.** `total_price` is the cart value in the shopper's currency,
  after discounts and before shipping, in cents — no formatted text to parse.
- **Other platforms parse the subtotal text** with the locale's decimal separator, so
  `1.234,56 kr.`, `$1,234.56`, `1 234,50 kr` and `CHF 1’234.50` all read correctly.
- **`WATCH_SELECTOR`** is only for carts that change without a page reload (drawer carts,
  quantity steppers). Point it at the cart or drawer element that re-renders. A full-reload cart
  leaves it empty.
- **The watch and the box can overlap** (an upsell box inside the drawer). The heading is only
  written when its text changes, so the update can't keep re-triggering itself. A box that the
  drawer re-renders away disconnects its old observer.
- **`Math.ceil`** rounds the remaining amount up, so the shopper is never told a figure that
  leaves them just short.

## Check it on the rendered draft

With the box shown through the staff widget (SKILL.md Step 7.5):

- **Below the threshold** → the "left" text with the right amount. **At or above** → the "reached"
  text, or the plain headline when that field is empty.
- **Add, remove and change a quantity without reloading** → the amount updates each time (AJAX
  carts).
- **A cart over 1,000** in the shop's currency → still the right amount (the thousands separator).
- **A domain with the fields left empty** → the plain headline, no errors in the console.

## Hand-off

The three fields are dashboard inputs: the MCP writes the design, not their values. List per box
and domain the values the operator enters — `free_shipping_threshold` = `499`,
`free_shipping_left` = "Køb for {amount} mere og få gratis fragt", `free_shipping_reached` = "Du har
gratis fragt" — next to the `headline` value.
