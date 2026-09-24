---
source: index
---

# Search — Base Templates

Where a Search build starts, per variant. Two of the three variants come from the platform through the MCP; the wiki keeps files only for the one the MCP cannot create.

## Variants

| Variant | Source | Description |
| --- | --- | --- |
| desktop-embedded | the design `search_createConfig(target=DESKTOP)` attaches — read it with `search_getDesign` | Inline variant that renders inside a page container, not full-screen. |
| mobile-overlay | the design `search_createConfig(target=MOBILE)` attaches — read it with `search_getDesign` | Mobile-only overlay with tabbed categories/products. |
| [desktop-overlay/](./desktop-overlay/) | this folder: `search.liquid`, `search.css`, `search.js` | Desktop full-screen overlay. Triggered by clicking any `input[type='search']`. Auto-deactivates below 992 px viewport width. No create target exists: create a `DESKTOP` config and push all three fields from these files. |

`target=BOTH` creates the embedded and the mobile config in one call. The `type` label of every created config reads "Overlay search"; the config *name* ("Embedded overlay", "Overlay search mobile") is what tells the variants apart.

> For Instant/List and Grid/Full Search layouts, those ship upstream from the Hello Retail platform; D&TS rarely curates a starting version separately.

## Choosing a variant

- **Desktop full-screen** → [desktop-overlay/](./desktop-overlay/). This is the default.
- **Inline (no takeover)** → the embedded design, when the customer wants results to appear in the page flow rather than over it.
- **Mobile** → always pair the desktop variant with the mobile design. HR's desktop JS bails below 992 px (`return;` near the top of the file), so mobile *requires* its own design.

## The slot

The per-customer tile replaces the **whole content of the `{% else %}` branch** of the banner check inside `{% for product in product_list %}` — the default `<a class="hr-search-overlay-product-link">…</a>` and, in the overlay files, the `TILE_BODY` marker comment in front of it. Neither survives in a pushed design. The `search-developer` skill's `scripts/splice-tile.mjs` finds that branch by parsing the Liquid, so a design read from the MCP and the overlay files splice the same way.

> ⚠️ **Extend, never rewrite.** `resultStyles` is ~1,300 lines and most of it styles chrome you don't see while building — filters, filter dropdowns, selected-filter counts, the price range slider, sorting, the results header, the content column, animations. A reworked stylesheet passes a first screenshot with the filter styling already destroyed. Override with higher specificity, and ask the operator before altering the foundation: [foundation-rules.md](../foundation-rules.md).

> ⚠️ **Before you ship:** `CUSTOM_STYLING_BLOCK` stays empty. What the tile needs from the theme is restored by mirroring its parent hooks onto `hr-products-container` and the cell, plus the shell's sanctioned edits — never by rules that re-create the tile's look. Then put one HR tile next to a native tile and judge by eye: [cheat-sheets/search/general.md → _Tile fidelity_](../../cheat-sheets/search/general.md).

## Related

- Playbook: [../../onboarding/search-templates.md](../../onboarding/search-templates.md)
- **Tile fidelity** (must-read): [cheat-sheets/search/general.md](../../cheat-sheets/search/general.md) · platform specifics: [lightspeed.md](../../cheat-sheets/search/lightspeed.md)
