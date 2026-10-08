---
source: field
verified: 2026-10-08
---

# Starweb — Add to cart

Platform-specific ATC binding for Hello Retail tiles on Starweb. Starweb ships a global `quickShop` module that handles the form binding internally — after HR renders products, call its init. `quickShop.init()` re-scans the DOM, so it is naturally idempotent (no per-form guard needed).

**Detection:** `window.quickShop` global present.

---

## Search overlay — `fix_links`-bound

Call after **every** `fix_links` call-site.
See `${CLAUDE_PLUGIN_ROOT}/skills/search-developer/references/tile-interactivity-js.md`.

```js
function add_to_cart() {
    if (window.quickShop && typeof window.quickShop.init === "function") {
        window.quickShop.init();
    }
}
```

## Recom slider — `afterInit`-bound

Same call, invoked from Swiper's `afterInit`.
See `${CLAUDE_PLUGIN_ROOT}/skills/recom-developer/references/add-to-cart-js.md`.

```js
function add_to_cart(root) {
    if (window.quickShop && typeof window.quickShop.init === "function") {
        window.quickShop.init();
    }
}
```

## Pages

Call `quickShop.init()` after Pages has rendered (`content.products.count` non-zero).

## Click tracking

Starweb's native buy button (`button.add-to-cart-action.add-to-cart`) has no `onclick`, so a verbatim copy has no tracking. Add the call to it in every surface:

```html
<button type="button" class="button add-to-cart-action add-to-cart" data-name="{{ product.title }}" data-sku="…" data-currency="{{ product.currency }}" onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"><span>Köp</span></button>
```

See [../add-to-cart.md](../add-to-cart.md) → *Click tracking on the buy button*.

## Added-to-cart feedback icon

Starweb themes show a check-mark circle on the tile after a successful add (`.added-to-cart-feedback > .feedback-icon`, toggled by the `show` class). The theme appends that element and binds its handler directly to `.gallery-item` **at page load**, so Hello Retail tiles rendered later never get it. Copying the element into the tile is not enough on its own.

Show it from a delegated click instead, in `initializationCode` (search) or the init script of the surface. The theme's `.show` switches `display` on, so start at opacity 0 and force a reflow before fading in:

```js
// The theme binds its "added to cart" feedback to .gallery-item on page load, so HR tiles miss it; show it on click instead.
document.addEventListener("click", function(event) {
	var button = event.target.closest(".hr-overlay-search button.add-to-cart");
	var tile = button && button.closest(".gallery-item");
	var feedback = tile && tile.querySelector(".added-to-cart-feedback");
	if (!feedback) {
		return;
	}
	clearTimeout(feedback.hrFeedbackTimer);
	feedback.style.transition = "opacity 0.4s ease";
	if (!feedback.classList.contains("show")) {
		feedback.style.opacity = "0";
		feedback.classList.add("show");
		void feedback.offsetWidth;
	}
	feedback.style.opacity = "1";
	feedback.hrFeedbackTimer = setTimeout(function() {
		feedback.style.opacity = "0";
		feedback.hrFeedbackTimer = setTimeout(function() {
			feedback.classList.remove("show");
		}, 400);
	}, 2000);
});
```

with `<div class="added-to-cart-feedback"><div class="feedback-icon"></div></div>` as the last child of the tile's `li.gallery-item`. Swap `.hr-overlay-search` for the surface's root (the recom box or the Pages container).

Don't bind to the theme's jQuery `addedToCart` event instead: it fires about a second after the click, and on a real storefront it showed the icon only once, on the first tile.

## If `quickShop` is undefined

The customer either isn't on Starweb or the platform's JS hasn't loaded yet. Wrap the call in a polling helper — see [../../cheat-sheets/pages/general.md](../../cheat-sheets/pages/general.md) → "Look for an element repeatedly until found".

---

**Related:**
- Platform install nuance — [Starweb overview](./README.md)
- Cross-platform binding rules — [../add-to-cart.md](../add-to-cart.md)

---

## Timeline
- 2026-05-21: Starweb `quickShop` init documented from the team's Starweb cheat sheet.
- 2026-07-01: Surface-scoped Search and Recom snippets extracted from the skill references.
- 2026-09-14: Merged the cheat-sheet copy into this page.
- 2026-10-08: Added *Click tracking* (the native button has no `onclick`) and *Added-to-cart feedback icon* — the theme binds it at page load, so HR tiles need a delegated click handler.
