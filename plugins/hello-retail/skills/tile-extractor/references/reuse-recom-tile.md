# Reuse a finished recom tile instead of extracting it again

When the customer already has a **finished Hello Retail recommendation design** whose tile matches
their category-page tile, that tile body is the customer's card already copied, bound to the feed and
QA'd. Search and Pages take it from there instead of surveying, diffing and binding the category tile
a second time. This file is the procedure; the calling shell (search-developer Step 6,
pages-developer step 3) decides whether to offer it and passes `reuse: recom design <design-key>`. The default is always a new survey of the category page; reuse happens only when the operator explicitly picks a recom design.

Reuse replaces the *extraction* (steps 3, 3b, 4, 6, 6b, 7b, 8), never the *checks*. If any condition
below fails, say which one under ASSUMPTIONS and run the normal workflow from step 3.

## 1. Conditions — all three must hold

1. **The recom design is finished.** Its box is LIVE on the storefront, or it is a REVIEW draft whose
   latest `recom-qa` report under `QA/<customer>/` says it is ready to publish. The caller checked
   this with `recoms_list` / `recoms_listDesigns`. You re-read the design with `recoms_getDesign` and
   record its `lastModified`.
2. **Its tile is the customer's card.** The non-banner branch inside `<div class="hr-product">` of the
   `{% for product in products %}` loop holds the shop's own card markup (the shop's classes and
   element tree), not the base design's default tile. Extract `templateCode` from the spilled result
   to a file and read only that branch (payload-spill rules: `../../recom-developer/references/mcp-flow.md`).
3. **It still matches the category tile.** Shops change their cards; a recom tile built months ago
   can be out of date. On the reference category page:
   - **Markup.** Take the rendered recom card's `outerHTML` from a page where the box shows (or from
     the widget preview), and compare its tag and class sequence with the native category card of a
     product in the same state. Differences limited to state classes (sale, stock, lazy-load) pass;
     a missing or extra element, or a different class on a structural element, fails.
   - **By eye.** Place the rendered recom card beside the native category card with the FIDELITY
     CHECK harness (`survey-snippets.md`), same product and state, at desktop and 375 px. Same → the
     condition holds. A difference you cannot explain as page-type CSS (step 4g) fails it.

## 2. Taking the tile body

Copy the non-banner branch's contents (the card, not the `<div class="hr-product">` around it, not
the swiper slide) and change only what the target surface requires:

- **`{% input %}` blocks → the words they render.** Recom designs turn every fixed text into an
  `{% input %}` (Output Rule 16); Search and Pages keep the words. Replace each block with the text the
  live box renders for it (read it from the rendered recom DOM, never guess), and list them under
  TEXT INPUTS as `none — texts copied verbatim (from recom inputs: <name> = "…")`.
- **Loop variable.** The body must read `product.*`. A recom loop with another variable name is
  renamed in the body, nothing else.
- **Nothing recom-only stays.** No swiper classes, no `aw-`/`hr-` wrapper, no recom heading or
  free-shipping input. The `trackClick` call on the add-to-cart control stays (Output Rule 11).
- **JS.** The recom design's tile handlers live in the swiper `afterInit` hook. Report under JS what
  the tile needs bound (ATC, swatches, wishlist) and where it came from; the shell re-binds after
  `fix_links`, so the recom init code itself is never copied.

Save the result as `tile.liquid` in the session scratch folder. Run the unbound-token gate on it as
you would on `bind-tile.mjs` output: no `[TEXT:`, `[ATTR:`, `[URL:` or `<!--HR-IF:` tokens, and no
`{% input` left.

## 3. Steps that still run

| Step | Why it still runs |
| --- | --- |
| 1 · 2 · 2b | Platform, a real category page, popups swept — the checks below need them. |
| 4b | PARENT HOOKS: the Search and Pages containers are not the recom box, so the ancestor scan runs again for the new container. |
| 4c | ALIGNMENT for the new shell. |
| 4d · 4e · 4f | Image sizing, mobile markup and hidden-state classes, read on the native tile as usual. |
| 4g | Page-type CSS — the new surface opens on other page types than the recom box. |
| 5 | Third-party widget bindings, for the JS section. |
| 7 | The PARITY TABLE, from the recom build's record if the caller passed one, otherwise from 3–5 `productData_get` rows against the reused body. |
| 8b | FIDELITY of the reused body in the new shell's terms, every state, desktop and 375 px. |

## 4. Reporting

Fill every RESPONSE FORMAT section as usual. Under ASSUMPTIONS add one line:
`tile body reused from recom design <design-key> (<LIVE | REVIEW, recom-qa ready <date>>, last modified <date>); matched the category tile on <date> (markup + by eye)`.
BINDINGS reads `reused — bound in recom design <design-key>`; VARIATIONS and LABEL VOCABULARY list the
branches the reused body carries, with the carrier products you checked in condition 3.
