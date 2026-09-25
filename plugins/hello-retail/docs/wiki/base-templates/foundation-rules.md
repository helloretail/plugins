---
source: field
verified: 2026-09-25
---

# Foundation rules — extend the base, never rewrite it

> **The rule:** unless the operator explicitly tells you to, **do not rewrite the existing CSS, Liquid/HTML, or JS foundation** of a base template. Add on top of it. If the request genuinely can't be satisfied without altering the foundation, **stop and ask the operator for approval first** — name what has to change and why, and offer the additive alternative.

This applies to every skill that builds a customer design on top of `docs/wiki/base-templates/` — `search-developer`, `pages-developer`, `recom-developer`, `triggered-email-developer`, `newsletter-developer` — and to the per-customer designs those skills push back through the `hello-retail` MCP.

## Why

1. **A roughly identical template foundation across all customers is a team requirement.** Every D&TS engineer can open any customer's design and recognise it; upstream changes to the base can be propagated; QA checklists assume the same structure. A per-customer rewrite makes the design a one-off nobody else can maintain.
2. **The base CSS styles chrome you can't see while you build.** `search.css` is ~1,300 lines, and most of it is *not* about the product tile: filters and filter dropdowns, the selected-filter counts, the price range slider, sorting, the results header and subtitle, the content/link-content column, the close button, animations, mobile tabs, breakpoints. Much of that markup only appears once a real query runs with filters configured — so a "cleaner" rewritten stylesheet looks fine in a first screenshot and is missing the filter styling entirely.
3. **Overriding with higher specificity is simply better than editing in place.** It is reversible, it diffs cleanly, and it survives a later base-template update.

**Field case (2026-08-03).** A Search build reworked `resultStyles` wholesale to hit a specific design. The tile looked right; the filter styling was broken, because the base rules that styled the filter chrome were gone. The same build kept the Liquid and JS untouched and those were fine. Drafting a search without a specific design ask did *not* trigger the rewrite — the trigger is a strong, specific styling request.

## What counts as "the foundation"

| Surface | Foundation (read-only by default) | Where your work goes |
|---|---|---|
| Search | `search.css` HR scaffold rules + the `{# text/color/boolean … #}` parameter block; everything in `search.liquid` outside the `{{ TILE_BODY }}` slot (`captured_filters`, `hr-results`, banner branch, content branch, `hr-close`); the `search.js` scaffold (`open_overlay`/`close_overlay`/`fix_links`/render functions) | The `{{ TILE_BODY }}` slot, parameter **values**, new customer inputs in their own section ([below](#adding-customer-specific-inputs)), the sanctioned `resultStyles` edits, and selector/interactivity wiring appended in `search.js` |
| Recommendations | `recom.css` scaffold; the swiper scaffold + init structure in `recom.liquid`; the banner branch | The `{{ TILE_BODY }}` slot, `breakpoints`/version/`loop` tuning, the `afterInit` hook, delegated handlers |
| Triggered emails / newsletter | The parameter block, the section skeleton (which sections exist, related-products, `{% break %}`, voucher, `cart_url`), and the variable names | Styling of the existing sections and the product-tile content — restyle, don't restructure |

Parameter **tokens** are foundation; parameter **values** are yours. Change `{# text product_tile_width = "214" #}` to `"290"` — never rename or delete the token.

## Adding customer-specific inputs

A customer design sometimes needs inputs the base doesn't have. For example, when replicating a shop's tile you may make an element's text editable in the design editor. Search and Pages declare their inputs as `{# text/boolean/color/number/choice … #}` lines. Keep new ones apart from the base's:

1. **Put them in a new section** directly below the **last** base declaration, in the field that uses them (`resultTemplate` for markup, `resultStyles` for CSS). Leave **one empty line** between the last base declaration and the new `{# section … #}` line, so anyone can see where the base ends and the customer additions begin.
2. **Name the section after its context**, in English, written like the base's own sections (`General`, `Colors`, `Texts`): `{# section Product tile #}`, `{# section Campaign banner #}`. One section per context; add to it rather than opening a second one for the same thing.
3. **Name each input after its role, in English and snake_case**: what the element is, not what it currently says, e.g. `tile_badge_new_text`, `tile_usp_text`, `tile_sold_out_label`. The **value** is the customer's own text in the shop's language; only the name is English. Check the name isn't already declared anywhere in the design.
4. **Never mix them into the base block.** Don't insert customer inputs between base declarations, and don't move base declarations into your section.

```liquid
{# boolean product_grid_layout = false #}

{# section Product tile #}
{# text tile_badge_new_text = "Nyhet" #}
{# text tile_usp_text = "Fri frakt" #}
```

JavaScript can't read these inputs. When a script needs one, render it into a `data-*` attribute on a wrapper element and read it from there (`search-developer` → `references/layout-options.md` has a worked example).

Recommendation designs are different: fixed texts become inline `{% input … %}` blocks in the tile, not a declarations block, so this section doesn't apply to them.

## How to extend instead

- **Append, don't edit.** Put your override *after* the base rule, at the end of the stylesheet (or in the sanctioned slot), so the base rule stays visible in the file and in the diff.
- **Win on specificity, not by deletion.** Prefix with the overlay root and add a class, e.g. `.hr-overlay-search .hr-products-container.is-native-grid { … }` beats `.hr-overlay-search .hr-products-container`. Reach for `!important` only when a base `!important` forces it, and say so in the diff.
- **Never reformat, reorder, dedupe, or "tidy" base rules.** A whitespace-only reflow of a 1,300-line stylesheet makes the real change unreviewable, and that is where deletions hide.
- **Never regenerate a whole field from scratch.** `resultStyles` / `resultTemplate` / `initializationCode` / `templateCode` / `templateStyles` are always *modified in place* from what the MCP read returned.
- **In Liquid, add markup inside the slot** — don't restructure the surrounding blocks to make the tile fit.
- **In JS, add functions and bind them at the documented call sites** (e.g. after every `fix_links`) — don't refactor or re-order the base scaffold.

## When the foundation really does have to change

Some requests can't be done additively — the base rule is `!important`, the required layout contradicts the base grid, a base handler swallows the event you need. Then:

1. **Stop before editing.** Don't do it and mention it afterwards.
2. **Tell the operator exactly**: which file/field, which rule or block, what the request needs, and why an override can't reach it.
3. **Offer the additive alternative** you'd otherwise ship, and what it compromises.
4. **Wait for an explicit go-ahead.** No answer → ship the additive version and flag the limitation in MISSING DATA.

Edits already sanctioned by a skill (documented in its `references/`) don't need this — they *are* the approved deviations, e.g. Search's reset-block removal, TILE FILL rule, `product_tile_width` match, gutter-padding strip, `text-align` removal, fixed-column grid override, and the self-contained tile CSS block on CSS-in-JS storefronts. Everything outside those lists needs approval.

## Self-check before you show the diff

- [ ] **Diff against the base, not just against your intent.** Every base selector/rule/function present before your edit is still present, byte-identical unless it's on the sanctioned list.
- [ ] Your changes read as **additions at the end** plus token-value changes — not as a rewritten file.
- [ ] Any customer-specific inputs sit in their own English-named `{# section … #}`, one empty line below the last base declaration, with English role-based names.
- [ ] **No chrome CSS deleted:** filters, filter dropdowns, selected-filter counts, range slider, sorting, results header/subtitle, content column, close button, animations, mobile tabs, breakpoints.
- [ ] **Rendered chrome QA** with filters and sorting actually configured: open a filter dropdown, select a value, check the count badge and clear-filters button, drag the price slider, switch sorting. Filter markup renders from `captured_filters` + JS, so an unconfigured design never shows it — configure first, then look.
- [ ] Any foundation change that survived is one the operator explicitly approved, and the diff says so.

## Related

- [base-templates.md → Editing rules](./base-templates.md) — rules for changing the *base itself* (a different job from a per-customer build)
- [search/README.md](./search/README.md) · [recoms/README.md](./recoms/README.md) · [triggered-emails/README.md](./triggered-emails/README.md)
- `search-developer` → `references/shell-structure.md` — the full list of sanctioned `resultStyles` edits
- `search-developer` → `references/filter-sorting.md` — where the filter markup lives, and the full list of base-owned filter/sorting selectors (the option lists are platform-rendered, so their CSS looks orphaned in `search.css` — it isn't)
- `recom-developer` → `references/slider-structure.md` — "Swiper init — tune, don't rewrite"
