---
source: field
verified: 2026-09-25
---

# Foundation rules — extend the base, never rewrite it

> **The rule:** unless the operator explicitly tells you to, **do not rewrite the existing CSS, Liquid/HTML, or JS foundation** of a base template. Add on top of it. If the request genuinely can't be satisfied without altering the foundation, **stop and ask the operator for approval first** — name what has to change and why, and offer the additive alternative.

This applies to every skill that builds a customer design on top of a default design — whether that design comes from the MCP (every Search variant via `search_createConfig`, Recommendations standard designs via `recoms_listDesigns`) or from the files kept in `docs/wiki/base-templates/` — `search-developer`, `pages-developer`, `recom-developer`, `triggered-email-developer`, `newsletter-developer` — and to the per-customer designs those skills push back through the `hello-retail` MCP. For `pages-developer` the design it fetches is the foundation, and *Writing the CSS itself* governs its `templateCss` just the same.

## Why

1. **A roughly identical template foundation across all customers is a team requirement.** Every D&TS engineer can open any customer's design and recognise it; upstream changes to the base can be propagated; QA checklists assume the same structure. A per-customer rewrite makes the design a one-off nobody else can maintain.
2. **The base CSS styles chrome you can't see while you build.** `search.css` is ~1,300 lines, and most of it is *not* about the product tile: filters and filter dropdowns, the selected-filter counts, the price range slider, sorting, the results header and subtitle, the content/link-content column, the close button, animations, mobile tabs, breakpoints. Much of that markup only appears once a real query runs with filters configured — so a "cleaner" rewritten stylesheet looks fine in a first screenshot and is missing the filter styling entirely.
3. **Overriding with higher specificity is simply better than editing in place.** It is reversible, it diffs cleanly, and it survives a later base-template update.

**Field case (2026-08-03).** A Search build reworked `resultStyles` wholesale to hit a specific design. The tile looked right; the filter styling was broken, because the base rules that styled the filter chrome were gone. The same build kept the Liquid and JS untouched and those were fine. Drafting a search without a specific design ask did *not* trigger the rewrite — the trigger is a strong, specific styling request.

## What counts as "the foundation"

| Surface | Foundation (read-only by default) | Where your work goes |
|---|---|---|
| Search | `search.css` HR scaffold rules + the `{# text/color/boolean … #}` parameter block; everything in `search.liquid` outside the tile slot (the `{% else %}` branch of the banner check) (`captured_filters`, `hr-results`, banner branch, content branch, `hr-close`); the `search.js` scaffold (`open_overlay`/`close_overlay`/`fix_links`/render functions) | The tile slot (the whole `{% else %}` branch, replaced by the customer's tile), parameter **values**, new customer inputs in their own section ([below](#adding-customer-specific-inputs)), the sanctioned `resultStyles` edits, and selector/interactivity wiring appended in `search.js` |
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

- **Override, don't edit — and put the override where it belongs.** Your rule goes *after* the base rule it overrides, inside the section that already styles that element (`/* Products */`, `/* Header - Logo */`, …), not in a pile at the end of the file. The base rule stays visible in the file and in the diff, and the stylesheet stays readable as a stylesheet. → *Writing the CSS itself*
- **Win on specificity, not by deletion.** Prefix with the overlay root and add a class, e.g. `.hr-overlay-search .hr-products-container.is-native-grid { … }` beats `.hr-overlay-search .hr-products-container`. Reach for `!important` only when a base `!important` forces it, and say so in the diff.
- **Never reformat, reorder, dedupe, or "tidy" base rules.** A whitespace-only reflow of a 1,300-line stylesheet makes the real change unreviewable, and that is where deletions hide.
- **Never regenerate a whole field from scratch.** `resultStyles` / `resultTemplate` / `initializationCode` / `templateCode` / `templateStyles` are always *modified in place* from what the MCP read returned.
- **In Liquid, add markup inside the slot** — don't restructure the surrounding blocks to make the tile fit.
- **In JS, add functions and bind them at the documented call sites** (e.g. after every `fix_links`) — don't refactor or re-order the base scaffold.

## Writing the CSS itself

The rules above say what you may touch. These three say how the CSS you add should read. They hold
for every stylesheet we author — `resultStyles`, `templateStyles`, `templateCss` — and for the base
templates themselves when the team edits those.

### 1. Reach for an existing rule before writing a new one

Where a rule already exists that can be extended — a declaration added to it, or one taken out — to
reach the result you want, that beats adding a second rule for the same selector. Two rules for one
element is how a stylesheet ends up declaring the same property twice, and the next reader cannot
tell which one is live.

**Never re-declare something that already holds.** If the base already sets `font-size: 14px` on
that element and 14px is what you want, write nothing. A rule that restates a value already in
effect is invisible in the render and misleading in the diff — it reads as a decision when it is a
no-op.

The limit is the foundation rule above: a **base** rule is extended by an override, not edited in
place. Editing or deleting one is a foundation change and needs the operator's go-ahead (*When the
foundation really does have to change*). Rules **you** added earlier in the same build are yours —
extend those in place instead of stacking another beside them.

### 2. Put related rules together

A new rule goes next to the rules that already style the same element or the same part of the UI.
The base stylesheets are already sectioned this way — `search.css` carries `/* Products */`,
`/* Header - Logo */`, `/* Filter section */`, `/* Initial Content */` — so there is nearly always
an obvious home. Tile styling belongs with the tile styling; a filter override belongs with the
filter rules.

This is what keeps a 1,300-line stylesheet navigable: everything about one section is in one place,
and whoever changes the tile next finds all of it without grepping the file. No section fits → put
it at the end and say so in the diff, rather than inventing a section.

Moving an existing rule to make room is not grouping — it is a reorder, which the rules above
forbid. Insert; never rearrange.

### 3. Comment only what the CSS does not already say

CSS is close to self-explanatory: `color: #1a1a1a` needs no comment saying it sets a colour, or that the value came from the customer's site. [Comments in the code you add](#comments-in-the-code-you-add) applies: one short line, only where a reader would otherwise be confused. In CSS that is typically a value that looks wrong but is deliberate, a workaround for a theme or browser bug, a magic number nobody can re-derive, or a rule that exists to defeat a specific `!important`.

Section banners are a different thing and stay — the base files use them as structure, and rule 2
depends on them. Keep every comment the base already has, and match the existing style when a new
section is genuinely needed.

## Comments in the code you add

This applies to everything a skill writes: Liquid, CSS and JS in a design, and feed transforms. The base's own comments stay as they are.

- **No comment by default.** If the code is basically obvious, write none. Don't restate what a line does, narrate the steps, or say where a value came from.
- **Comment only what a reader would otherwise get wrong**: a value that looks like a bug but is deliberate, a workaround for a theme or browser quirk, a dependency the code doesn't show.
- **Keep it to one short line: "Doing X because Y."** That covers almost every case. Two lines at most; anything longer belongs in the hand-off or the PR, not the code.

```js
// Don't:
// This function loops through every product tile on the page, reads the data-id from
// the link, collects the IDs into an array and calls the quick-shop endpoint, because
// the product feed does not include labels, so we have to fetch them separately.

// Do:
// Labels aren't in the feed, so fetch them from the storefront.
```

The tile Liquid from `tile-extractor` stays comment-free, per that skill's own rule.

## When the foundation really does have to change

Some requests can't be done additively — the base rule is `!important`, the required layout contradicts the base grid, a base handler swallows the event you need. Then:

1. **Stop before editing.** Don't do it and mention it afterwards.
2. **Tell the operator exactly**: which file/field, which rule or block, what the request needs, and why an override can't reach it.
3. **Offer the additive alternative** you'd otherwise ship, and what it compromises.
4. **Wait for an explicit go-ahead.** No answer → ship the additive version and flag the limitation in MISSING DATA.

Edits already sanctioned by a skill (documented in its `references/`) don't need this — they *are* the approved deviations, e.g. Search's reset-block removal, TILE FILL rule, `product_tile_width` match, gutter-padding strip, `text-align` removal, fixed-column grid override, and the self-contained tile CSS block on CSS-in-JS storefronts. Everything outside those lists needs approval.

## Self-check before you show the diff

- [ ] **Diff against the base, not just against your intent.** Every base selector/rule/function present before your edit is still present, byte-identical unless it's on the sanctioned list.
- [ ] Your changes read as **additions plus token-value changes** — not as a rewritten file. Each addition sits in the section that owns those elements, and no base rule moved to make room for it.
- [ ] Every comment you added is one short line explaining something non-obvious ("Doing X because Y"); no narration, no restating the code.
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
