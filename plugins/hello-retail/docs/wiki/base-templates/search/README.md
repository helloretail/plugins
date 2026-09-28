---
source: index
---

# Search — Base Templates

Where a Search build starts, per variant. The design comes directly from Hello Retail's system: when a new search is created (`search_createConfig`), the platform attaches its current default design to the new config, and that design is the base. The wiki keeps no copy of any of them, because a copy drifts from the platform.

## Variants

| Variant | Source | Description |
| --- | --- | --- |
| desktop-overlay | the design `search_createConfig(target=DESKTOP, desktopDesign=OVERLAY)` attaches — read it with `search_getDesign` | Desktop full-screen overlay. Triggered by clicking any `input[type='search']`. Auto-deactivates below 992 px viewport width. |
| desktop-embedded | the design `search_createConfig(target=DESKTOP, desktopDesign=EMBEDDED)` attaches — read it with `search_getDesign` | Inline variant that renders inside a page container, not full-screen. `EMBEDDED` is also what the tool attaches when `desktopDesign` is omitted. |
| mobile-overlay | the design `search_createConfig(target=MOBILE)` attaches — read it with `search_getDesign` | Mobile-only overlay with tabbed categories/products. |

`target=BOTH` creates the desktop config (`desktopDesign` picks overlay or embedded) and the mobile config in one call. The `type` label of every created config reads "Overlay search", so the config *name* is what tells the variants apart; the team names them `Desktop`, `Embedded Desktop` and `Mobile` (the on-site widget prints the type in front: "Overlay search - Desktop").

> For Instant/List and Grid/Full Search layouts, those ship upstream from the Hello Retail platform; D&TS rarely curates a starting version separately.

## Choosing a variant

- **Desktop full-screen** → the overlay design. This is the default.
- **Inline (no takeover)** → the embedded design, when the customer wants results to appear in the page flow rather than over it.
- **Mobile** → always pair the desktop variant with the mobile design. HR's desktop JS bails below 992 px (`return;` near the top of the file), so mobile *requires* its own design.

## The slot

The per-customer tile replaces the **whole content of the `{% else %}` branch** of the banner check inside `{% for product in product_list %}` — the default `<a class="hr-search-overlay-product-link">…</a>` and everything inside it. There is no placeholder or marker comment to look for, and nothing of the default tile survives in a pushed design. The `search-developer` skill's `scripts/splice-tile.mjs` finds that branch by parsing the Liquid, so every variant splices the same way.

> ⚠️ **Extend, never rewrite.** `resultStyles` is ~1,300 lines and most of it styles chrome you don't see while building — filters, filter dropdowns, selected-filter counts, the price range slider, sorting, the results header, the content column, animations. A reworked stylesheet passes a first screenshot with the filter styling already destroyed. Override with higher specificity, and ask the operator before altering the foundation: [foundation-rules.md](../foundation-rules.md).

> ⚠️ **Before you ship:** write no CSS for the tile (a Search design has no CSS slot; an older copy's `CUSTOM_STYLING_BLOCK` token stays empty). What the tile needs from the theme is restored by mirroring its parent hooks onto `hr-products-container` and the cell, plus the shell's sanctioned edits — never by rules that re-create the tile's look. Then put one HR tile next to a native tile and judge by eye: [cheat-sheets/search/general.md → _Tile fidelity_](../../cheat-sheets/search/general.md).

## Related

- Playbook: [../../onboarding/search-templates.md](../../onboarding/search-templates.md)
- **Tile fidelity** (must-read): [cheat-sheets/search/general.md](../../cheat-sheets/search/general.md) · platform specifics: [lightspeed.md](../../cheat-sheets/search/lightspeed.md)
