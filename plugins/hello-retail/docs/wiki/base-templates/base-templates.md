---
source: index
---

# Base Templates

> The **canonical starting files** D&TS works from when onboarding a new Hello Retail customer. One set of files for every platform. Edit in place when team conventions change — new customers inherit your edits.

Two sources, one rule. For **Search embedded and mobile**, the starting design is the one Hello Retail attaches when the config is created through the MCP (`search_createConfig`, target `DESKTOP` / `MOBILE` / `BOTH`); the wiki keeps no copy of those files, because a copy drifts from the platform. For the **Search desktop overlay**, Recommendations, Newsletter and Triggered Emails, the files below are still the starting point. Whichever the source, the foundation is extended, never rewritten.

> ⚠️ **Building a per-customer design? Read [foundation-rules.md](./foundation-rules.md) first.** The base CSS/Liquid/JS foundation is **not** rewritten per customer — you extend it with higher-specificity overrides, and you ask the operator for approval before altering it. The *Editing rules* below are about changing the **base itself**, which is a different job.

## Layout

```
base-templates/
├── search/                             ← Search layouts
│   ├── desktop-overlay/                Desktop full-screen overlay (default)
│   │   ├── search.liquid              Base Liquid — same for every platform
│   │   ├── search.css                 Base CSS — same for every platform
│   │   └── search.js                  Base JS — same for every platform
│   ├── desktop-embedded/               no wiki copy — `search_createConfig(target=DESKTOP)` attaches this design
│   └── mobile-overlay/                 no wiki copy — `search_createConfig(target=MOBILE)` attaches this design
├── recoms/                             ← Recommendations layouts (see recoms/README.md)
│   └── slider/                         Swiper slider recom box (default)
│       ├── recom.liquid              Base Liquid — same for every platform
│       └── recom.css                 Base CSS — same for every platform
├── triggered-emails/                   ← Triggered Email template: base shell + per-trigger product-tile content (see triggered-emails/README.md)
│   └── base-design.liquid            Outer email shell — head, header, content slot, footer
└── newsletters/                        ← Newsletter product-tile design only, rendered server-side to an IMAGE (see references/)
    ├── newsletter-tile-default.liquid  Default email-safe product tile → HR renders it to an image
    ├── references/                     email-safe-rules.md · hr-feed-fields.md · inspection-and-verification.md
    └── examples/                       per-customer worked tiles
```

## Where each Search variant comes from

| Variant | Source | How a build gets it |
|---|---|---|
| desktop-embedded | the design `search_createConfig(target=DESKTOP)` attaches | create the config, `search_getDesign` it, edit in place |
| mobile-overlay | the design `search_createConfig(target=MOBILE)` attaches | same |
| desktop-overlay | `search/desktop-overlay/` in this folder | create a `DESKTOP` config, then push all three fields from these files (`search_updateDesign`); there is no overlay target |

The MCP's `type` label reads "Overlay search" for all three; only the config *name* tells them apart ("Embedded overlay", "Overlay search mobile"). Ask product engineering for an overlay create target before retiring the last folder.

## Two email surfaces — different deliverables

Hello Retail has two email-related surfaces, and D&TS builds a **different thing** for each:

- **Triggered Emails** — D&TS builds a full **email-friendly template**: a **base design** (`triggered-emails/base-design.liquid`, the outer email shell) plus a **per-trigger content design** (`triggered-emails/abandoned-cart.liquid`, `price-drop.liquid`, `back-in-stock.liquid`, `post-conversion.liquid` — the product grid that fills `blocks.content`). The output is the HTML/Liquid Hello Retail sends as the email body.
- **Newsletter (Newsletter Content)** — D&TS builds **only the product-tile design** (`newsletters/newsletter-tile-default.liquid`). Hello Retail renders that tile **server-side into an image**, and the customer drops that product-tile image into their own newsletter/ESP email. There is no email shell to build — just the tile.

Each product area documents its own slot model and conventions in its folder README:
- Search: [search/README.md](./search/README.md)
- Recoms: [recoms/README.md](./recoms/README.md)
- Triggered Emails: [triggered-emails/README.md](./triggered-emails/README.md)

## One file, all platforms

The team uses **the same base files for every customer regardless of platform**. Per-customer customization mirrors the customer's existing category-page tile (DOM structure, classes, ATC form action) and substitutes static content with `{{ product.* }}` Liquid references from the HR feed. The base scaffolding around the tile is identical for everyone.

## The slot model

`search.liquid` (the design's `resultTemplate`) has one place per-customer markup goes: the **`{% else %}` branch of the banner check** within `{% for product in product_list %}`. Every source carries Hello Retail's default tile there (`<a class="hr-search-overlay-product-link">…</a>`) and nothing else — no placeholder, no marker comment. The `search-developer` skill's `scripts/splice-tile.mjs` finds the branch by parsing the Liquid. A marker comment was tried and retired: it kept leaking into pushed designs.

```liquid
{% for product in product_list %}
  …
  {% if product.isBanner and banner_size_search_desktop != blank %}
    {# === banner branch — never modified === #}
    <div class="hr-search-overlay-product-link" style="…">
      <a href="{{ product.url }}" class="hr-b-container">
        <div class="hr-b-image" style="…"></div>
      </a>
    </div>
  {% else %}
    {# === non-banner branch === #}
    {{ TILE_BODY }}            ← per-customer tile goes here
  {% endif %}
  …
{% endfor %}
```

A Search design has **no CSS slot** (older copies carried a `{{ CUSTOM_STYLING_BLOCK }}` token; neither the designs the MCP attaches nor the current overlay files do). The theme styles the copied tile; what the theme cannot reach is restored by mirroring the tile's parent hooks onto `hr-products-container` (rule 6) and by the shell's sanctioned edits — never by CSS written for the tile.

**That branch is the only place per-customer markup goes.** Everything around it — banner branch, filters, captured_filters, hr-results, content blog branch, hr-close, animations, breakpoints — stays untouched across all customers.

## Editing rules

1. **Keep the anchors** in the files the wiki still keeps: the default tile in the `{% else %}` branch (Search), the `{{ TILE_BODY }}` and `{{ CUSTOM_STYLING_BLOCK }}` slots (Recoms). Never add a marker comment to a Search file — it ends up in pushed designs.
2. **Don't touch the banner branch.** Banners are HR Retail Media markup and have their own conventions. The base handles them correctly out of the box.
3. **Don't substitute customer-specific values in the defaults.** Token defaults should be neutral (`#232324` not a brand color, `240px` not 300). Operators override per customer in the dashboard.
4. **Don't add per-customer extension markup.** Amasty Labels, Timesact Pre-order ribbons, Dawn `<details>` collision workarounds — those are per-customer and live in the customer's design, not in the base.
5. **Mirror the platform defaults** in the files the wiki still keeps. If Hello Retail's default desktop overlay changes structurally upstream, propagate the change to `search/desktop-overlay/`. The embedded and mobile designs have no wiki copy to keep in sync — that is the point of reading them from the MCP.
6. **Scope the tile to the customer's CSS via the container — never a wrapper inside the loop.** Customer themes usually scope their card CSS under a section-level ancestor (e.g. `.collection-product`, `.products-grid`, `.collection`). In the overlay that ancestor is absent, so those rules don't match and the tile loses styling. **Fix: add the ancestor class to `.hr-products-container`** (the loop's parent — there are usually two occurrences, the `initialContent` branch and the `else` branch), e.g. `<div class='hr-products-container collection-product' …>`. Do **not** wrap the tile in that class inside `{% for %}` — a per-tile wrapper drags in the theme's section width/grid and shrinks every tile (observed: 290px → 192px). This is the one sanctioned edit outside the two slots.

## Tile styling gotchas

Hard-won from real onboardings. The reusable pieces live in the [cheat sheets](../cheat-sheets/README.md) and the [platform pages](../platforms/platforms.md).

- **HR centers tile text.** The base rule `.hr-overlay-search { text-align: center }` cascades into every tile; native category tiles are usually left-aligned. Adding the customer's scoping ancestor to `.hr-products-container` (rule 6) normally pulls in the theme's own `text-align` and fixes it. If the theme has no such rule, the shell sets the surveyed alignment on its TILE FILL rule (the tile skill's ALIGNMENT line) — never a CSS rule written for the tile.
- **Restore the theme's reach, never author CSS for the tile.** Restoring the theme's own scoped rules (rule 6) is the fix; a rule that re-creates the tile's look on Hello Retail or customer classes is the retired pattern. A difference that neither the copy nor a hook explains is reported to the shell, which owns the sanctioned edits.
- **`<li>` tiles need `list-style-type: none`.** If the customer's tile root is an `<li>` (Dawn-style grids), it renders inside HR's `<div>` container, not a `<ul>`, so the browser shows a bullet. The tile skill's bind script adds inline `style="list-style-type:none;"` on the `<li>`.
- **Collapsing a per-card image carousel breaks the image box.** When a tile's image area is a theme-JS slider (Swiper, `global-variant-slider`, etc.) that won't init in the overlay, and you reduce it to a static `<img>` (+ hover), the theme's square-ratio and `img{position:absolute;width/height:100%}` fill rules are often scoped to the `.swiper-slide`/container structure you removed. Restore the square box with inline `style="padding-bottom:100%;"` on the `.media` wrapper; the image-fill rule usually returns once the scoping ancestor is on `.hr-products-container` (rule 6).

## How operators use these

1. Get the starting design. Embedded or mobile: create the config through the MCP (`search_createConfig`) and read the attached design with `search_getDesign`. Desktop overlay: create a `DESKTOP` config and use `search/desktop-overlay/` as the build base — all three fields get replaced on push.
2. Extract the three fields to files (`resultTemplate.liquid`, `resultStyles.css`, `initializationCode.js`) in the session scratch folder and work on disk — the payload is too large to hold in context.
3. Survey the customer's category-page tile (sample 6-12 tiles from the pagination grid, avoiding 3rd-party recom widgets) to identify variations: sale, sold-out, badges, swatches, brand label, ATC form, etc.
4. Replace the whole `{% else %}` branch content — the default tile element and everything inside it — with the tile body from `tile-extractor` (the customer's card copied as real HTML with the product values bound by table): `node "<search-developer>/scripts/splice-tile.mjs" --liquid resultTemplate.liquid --tile tile.liquid --out resultTemplate.liquid`.
5. Write no CSS for the tile; apply only the shell's sanctioned edits (parent hooks on the container and the cell, TILE FILL, `product_tile_width`, the reset deletion where the design still has the block).
6. Push the three files' contents with `search_updateDesign` once the operator approved the diff; publishing stays a dashboard step.

The JS field keeps the design's own scaffold; only the customer's selectors and feature flags change.

## Related

- [Onboarding playbook these slot into](../onboarding/search-templates.md)
- [Search feature reference](../features/search/search.md)
- [Implementation methods (Script vs API)](../onboarding/implementation-methods.md)
