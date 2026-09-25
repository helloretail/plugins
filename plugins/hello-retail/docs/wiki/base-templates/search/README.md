---
source: index
---

# Search — Base Templates

D&TS-canonical starting templates for the three Search overlay variants D&TS commonly works with.

## Variants

| Variant | Description | Status |
| --- | --- | --- |
| [desktop-overlay/](./desktop-overlay/) | Desktop full-screen overlay. Triggered by clicking any `input[type='search']`. Auto-deactivates below 992 px viewport width. | ✅ Captured |
| [desktop-embedded/](./desktop-embedded/) | Embedded inline variant that renders inside a page container, not full-screen. | ✅ Captured |
| [mobile-overlay/](./mobile-overlay/) | Mobile-only overlay with tabbed categories/products. | ✅ Captured |

Each variant lives in its own folder with `search.js`, `search.liquid`, `search.css`, and (when documented) a `README.md` covering config inputs and customization notes.

> For Instant/List and Grid/Full Search layouts, those ship upstream from the Hello Retail platform; D&TS rarely curates a starting version separately.

## Choosing a variant

- **Desktop full-screen** → start with [desktop-overlay/](./desktop-overlay/). This is the default.
- **Inline (no takeover)** → use [desktop-embedded/](./desktop-embedded/) when the customer wants results to appear in the page flow rather than over it.
- **Mobile** → always pair the desktop variant with [mobile-overlay/](./mobile-overlay/). HR's desktop overlay JS bails below 992 px (`return;` near the top of the file), so mobile *requires* its own template.

> ⚠️ **Extend, never rewrite.** The base `search.css` is ~1,300 lines and most of it styles chrome you don't see while building — filters, filter dropdowns, selected-filter counts, the price range slider, sorting, the results header, the content column, animations. A reworked stylesheet passes a first screenshot with the filter styling already destroyed. Override with higher specificity, and ask the operator before altering the foundation: [foundation-rules.md](../foundation-rules.md).

> ⚠️ **Before you ship:** `CUSTOM_STYLING_BLOCK` stays empty. Keeping the customer's tile classes does **not** by itself guarantee their theme CSS reaches the tile inside the overlay — the theme often styles via a grid ancestor the overlay doesn't reproduce, and the base `search.css` centres and sizes things its own way. The answer is never tile CSS: mirror the tile skill's PARENT HOOKS onto the container, apply the sanctioned shell edits (TILE FILL with the surveyed alignment, `product_tile_width`, the reset deletion), and put the rendered tile next to the native one before calling it done. Method + checklist: [cheat-sheets/search/general.md → _Tile fidelity_](../../cheat-sheets/search/general.md).

The per-customer tile replaces the **whole default tile element** in the `{% else %}` branch of the product loop — the `<a class="hr-search-overlay-product-link">…</a>` and everything inside it. There is no placeholder or marker comment to look for, and nothing of the default tile survives in a pushed design.

## Related

- Playbook: [../../onboarding/search-templates.md](../../onboarding/search-templates.md)
- **Tile fidelity** (must-read): [cheat-sheets/search/general.md](../../cheat-sheets/search/general.md) · platform specifics: [lightspeed.md](../../cheat-sheets/search/lightspeed.md)
