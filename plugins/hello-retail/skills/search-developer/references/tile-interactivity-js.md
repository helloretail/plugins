# Tile-interactivity JS — bind after every `fix_links`

The tile skill emits the **markup** for everything interactive (add-to-cart form, swatches, review widget, wishlist button) inside `{{ TILE_BODY }}`. Markup alone is inert — nothing works until `search.js` binds it. This doc covers **add-to-cart** in full (the documented case) and gives the **base pattern every other interactive behavior follows** (swatches, reviews, wishlist, custom).

**The pattern is identical for all of them:** tile emits markup → the shell defines a bind/re-init function → call it after **every** `fix_links` call-site → scoped to the overlay, idempotent. It has to live in the shell, not the tile, because only the shell knows HR's render lifecycle: `fix_links` fires on every search, filter change, and infinite-scroll append, and anything bound once at load dies the moment HR re-renders the grid.

ATC is documented because it is stable per platform; what is common to every surface is in the wiki page **`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md`**. **Swatches / reviews / wishlist / custom are customer-specific** (3rd-party lib or bespoke) — don't guess them; see *Other interactivity* at the end.

## Platform inference (shell-side — for cart binding)

The tile skill detects the platform during its own survey, but you also need it here to pick the right cart function. Storefront-side signals only, never feed shape: the table is `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` → *Platform inference*.

## Step 0 — Check whether ATC already works natively before writing any binding code

**Read `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` → *Before binding — check whether it already works*, and do it before writing a cart function or any re-init call.** In short:

- After the tile is dropped into the shell (Step 7), click a rendered tile's ATC button with a **real click** and see whether the cart updates.
- **It already works** → stop. Write no ATC JS, add nothing at the `fix_links` call-sites, and note in the build report that it worked natively (and by which mechanism, if you could tell).
- **It doesn't work** → only now proceed to *The pattern* below and define a platform-specific `add_to_cart()`.
- **Never an `if (window.SomeGlobal) { … } else { … }` fallback for a global you have not confirmed on this storefront** — the `else` then runs on every click and overrides the theme's own handler. If you can't identify what drives the native behaviour, that's "undocumented and unclear" (see *Other interactivity* below): leave it unbound and flag MISSING DATA.

## The pattern

HR re-renders the product grid on every search, filter change, and infinite-scroll append. Each render ends with a call to **`fix_links`** — that is the "tiles are now in the DOM" signal you hook into:

| Variant | `fix_links` call-sites (`initializationCode` of the attached design; line numbers approximate — grep `fix_links(`) |
|---|---|
| desktop-overlay | initial render (~L113) + end of `load_more_results` (~L330) |
| desktop-embedded | initial render (~L121) + end of `load_more_results` (~L349) |
| mobile-overlay | initial render (~L182) + end of `load_more_results` (~L497) — note it's `ui_utility_vanilla.fix_links` |

So, two steps:

1. **Define a platform-specific cart function at the top of `search.js`** — after the `import` lines and config block, before `activate()`.
2. **Call it immediately after *each* `fix_links` call** — at *both* call-sites, so freshly-appended tiles (load-more, filter change) get bound too, not just the first render.

```js
// inside searcher.initial_render(...)
ui_utility.fix_links(overlay, "ps");
add_to_cart();            // <-- bind freshly rendered tiles
handle_live_update();
```

```js
// inside load_more_results -> searcher.yield_template(...), near the end
ui_utility.fix_links(overlay, "ps");
add_to_cart();            // <-- bind appended / re-rendered tiles
handle_live_update();
```

> In `mobile-overlay` the call is `ui_utility_vanilla.fix_links(overlay, "ps")` — put `add_to_cart()` directly after it the same way.

**Binding must be idempotent.** It runs after every render over a grid that may already contain bound tiles. Either guard already-bound forms with a `data-*` flag, or rely on the platform's own re-init (which no-ops on already-initialized forms). Double-binding = double add-to-cart.

**Scope every selector to `.hr-overlay-search`** so you only bind HR's tiles, never the storefront's own product grid. (For `desktop-embedded`, scope to the embedded container class the variant uses instead.)

Source of truth per platform: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/<platform>/add-to-cart.md`.

## Per platform — which block, and what Search adds

The cart function is the **Search overlay** block of the platform's page, `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/<platform>/add-to-cart.md` (the documented platforms: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` → *Per-platform pages*). The binding mechanics — scope to `.hr-overlay-search`, idempotent guard, call after each `fix_links` — are *The pattern* above. What Search adds per platform:

| Platform | Block to use | Search-specific |
|---|---|---|
| Shopify | `shopify/add-to-cart.md` → *Binding the copied theme form*; its *Notes* for the drawer event | The tile carries the theme's own `<product-form>` / `form.js-product-form`, never a Hello Retail `.hr-form`. Step 0 first: on many Dawn-family themes a real click already adds to cart and you write nothing. A wrong drawer event = the item adds but the drawer never refreshes. |
| Magento | `magento/add-to-cart.md` → *Step 2*, the *Search overlay* block (Luma or Hyvä per its *Step 0*) | **Add `import "jquery";` at the very top of `search.js`** (it's not in the base imports). Leave the `awuenc` placeholder in the template — the function swaps it at runtime. `x-magento-init` (its *Step 3*) is the alternative to `.mage('catalogAddToCart')`: whichever the theme expects, not both. **Swatches / size filter for configurable products** are not plain ATC — handle them under *Other interactivity* below. |
| Shopware | `shopware/add-to-cart.md` → *Search overlay* | — |
| Starweb | `starweb/add-to-cart.md` → *Search overlay* | `quickShop.init()` re-scans the DOM, so no per-form guard is needed. |
| BigCommerce (Stencil) | `bigcommerce/add-to-cart.md` → *The fix* → *Search overlay* | Cornerstone binds only the forms present at page load, so injected tiles are never picked up — still confirmed by a real click first (Step 0). CSRF headers are injected by the storefront itself; don't hand-roll token handling. |
| Viskan | `viskan/add-to-cart.md` → *Binding in HR tiles* | The delegated click handler and the stepper-state sweep after every render. |

DanDomain / Lightspeed and Wikinggruppen need nothing from this surface: a plain form POST, or (newest Wikinggruppen theme) the theme's own handler — `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` → *Per-platform pages*. Never bind a second handler there; an older Wikinggruppen theme is the exception, in `wikinggruppen/README.md` → *Caveats for older themes*.

**A platform with no page** (`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` → *A platform with no page*): keep the ATC form the tile skill emitted, leave the cart unbound, and add the **MISSING DATA** line `ATC JS not wired — <platform> cart binding not documented; needs operator-supplied snippet.` Don't invent a binding.

## Other interactivity — swatches, reviews, wishlist, custom

These behaviors vary customer-to-customer (a 3rd-party app or a bespoke solution), so there are **no canned patterns** — don't invent one. Follow the loop, using the **same `fix_links` binding mechanics as ATC** (scoped to the overlay, re-run after every render, idempotent / clone-safe):

1. **Analyze** — during the survey, identify what the tile uses (swatch mechanism, review app such as Yotpo / Loox / Judge.me / Stamped / Reviews.io / Trustpilot, wishlist app such as Swym / Wishlist Plus / Growave) and how it's wired natively.
2. **Plan** — check the KB for that exact library/functionality first (see *Reference files* — there's already coverage for **Lipscore ratings**, **Magento configurable-product swatches**, and **Lightspeed wishlist**). Hit → apply it. Miss → draft a binding approach (usually: re-trigger the widget's own DOM-scan / re-init function after each `fix_links`).
3. **Discuss** — present the plan to the operator and get the precise re-init call / snippet for anything unclear. **Don't guess** — this is the riskiest wiring and a wrong handler can silently break tracking or double-fire.
4. **Execute** — wire it after every `fix_links`, scoped + idempotent, exactly like ATC.
   **Prove it by its state, not its request.** A control that relies on the theme's own delegated handler (no binding from you) still has to pass a real-click test in the overlay: click it, read its state, click it again, read it again, and compare with the same clicks on a native tile. The request firing is not the pass — a wishlist heart can send its request and still show "add", with the second click doing nothing (field case 2026-10, a WooCommerce wishlist plugin: native toggled each click, the overlay copy did not). A control that fails here is an Analyze → Plan → Discuss item, never a silent hand-off.
5. **Capture** — once it works on a real onboarding and it isn't already in the KB, **ask the operator to approve a cheat-sheet entry** (`AskUserQuestion`, header `Cheat sheet`: *Write the cheat-sheet entry* / *Not this time*, neither recommended) and write it to `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/<swatches|reviews|wishlist>/<lib>.md`. Never file the learning only in private memory — the cheat-sheet is the shared, team-visible source of truth.

If a behavior is **undocumented and the binding can't be clarified**, leave the markup unbound and add a MISSING DATA line (same rule as an undocumented ATC platform).

## Verified JS gotchas (field-captured)

- **Swatch / slider strips: Chrome's smooth-scroll no-op, and the dashboard preview that runs no init JS.** Both are written down once, with the fix for each (`scrollBehavior = "auto"` plus a small rAF ease; a CSS-only default for anything JS reveals), in `../../tile-extractor/references/liquid-rules.md` → *Swatch-slider strips — two verified gotchas*. In Search the CSS-only default goes in `resultStyles`; the runtime JS then refines via inline styles, which win.
- **Current-colour swatch — mark it in JS, after `fix_links`.** Liquid `==` between a swatch URL and `product.url` can fail on identical strings, so toggle the "selected" class from the DOM once the links are final: for each cell, `link.getAttribute("href") === cell.querySelector("<product link>").getAttribute("href")` → selected class on, the other class off. Call it after **every** `fix_links` call-site (initial render and each result render) so appended "load more" tiles are marked too. Prove it on the rendered overlay: exactly one selected swatch per tile that has swatches.
- **Swatch arrows: bind once on the overlay, capture phase.** One delegated `click` listener and one capture-phase `scroll` listener on the overlay (scroll does not bubble) survive every re-render. Set `strip.style.scrollBehavior = "auto"` in the click handler, then change `scrollLeft` and update the arrows' `hidden` state. The strip gets narrower when the previous-arrow appears, so evaluate "at the end" **after** toggling it, and test with a product that has more swatches than fit (a search for a multi-colour model), not only the initial-content tiles.
- **Reverting hover state:** when swatch hover swaps the main image (image-swap pattern), bind the revert (`mouseleave` → restore original `src` + re-mark the first swatch selected) on the swatch *area*, and read/restore `src` via `getAttribute`/`setAttribute` so lazy-loader attribute rewrites don't fight you.

## Reference files

**Add to cart** — `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/add-to-cart.md` (what is common: platform inference, the native check, binding per surface, click tracking, the list of platform pages) and `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/<platform>/add-to-cart.md` (the per-platform `add_to_cart()` bodies, Search and Recom variants; Shopify and Magento also carry loading states, Quick View and the `swatch-renderer` / `getMatchingLabels` code for configurable-product swatches).

**Ratings / reviews** — per-platform widget markup + re-init:

- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopify/rating.md` (Loox) · `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/dandomain/rating.md` + `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/lightspeed/rating.md` (rateit) · `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/magento/rating.md` (native CSS-width)
- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/search/lipscore-ratings.md` — Lipscore (cross-platform library): widget markup + **re-trigger init after render** (the canonical review/rating re-init pattern this loop follows)

**Wishlist**

- **Viskan / Streamline — wishlist is NOT supported.** Don't emit the favourite star and don't wire one; Hello Retail ships Viskan tiles without it, and QA grades the absence ACCEPTED. Why it can't be wired: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/viskan/README.md` → *Favourite / wishlist: NOT supported*
- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/lightspeed/wishlist.md` — Lightspeed wishlist + the **SKU-vs-numeric-id blocker**: confirm the feed exposes the platform's numeric id before promising wishlist, or the control ships dead
- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopify/wishlist.md` — Wishlist King app: custom-element auto-upgrade (no JS needed), and the **deterministic `wk-id`** technique — native ships a random per-render id in the `floating` position reference, which can't be copied verbatim into a Liquid loop; derive a stable one from `product.productNumber` instead
- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/search/lightspeed.md` — the same blocker in full search-parity context
- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/search/general.md` — general caveat: any feature control needing an id (ATC, wishlist, Quick View) must use an id the **feed actually exposes** — don't assume `productNumber` is the platform's numeric id

**Capture target**

- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/<swatches|reviews|wishlist>/` — where to capture *new* per-library patterns from future onboardings (operator-approved)
