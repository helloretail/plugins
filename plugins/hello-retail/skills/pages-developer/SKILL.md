---
name: pages-developer
description: >
  Build and edit Hello Retail PAGES designs — the dynamic category/brand pages that
  replace a shop's static listing pages — via the Pages MCP tools (pages_listDesigns,
  pages_getDesign, pages_updateDesign, pages_updateDesignFilters,
  pages_updateDesignSorting, pages_createDesign, pages_copyDesign). Use when someone
  wants to create, customize, splice a product tile into, or configure filters/sorting
  on a Pages design. Also owns the PAGE CONFIGS: which products a page selects, their
  boosts, out-of-stock handling and design — "which products show on this category
  page", "pin/boost products on a Pages category", "create a brand page", "copy this
  page to another website". Also sets up Pages for API use, where the customer's frontend
  renders the products ("Pages via API", "headless Pages", "Pages config for API use").
  Draft-only: publishing is a My Hello Retail dashboard step. Sibling of search-developer
  / recom-developer; the tile body comes from tile-extractor.
---

# Hello Retail — Pages Design Development

Pages replaces a shop's static category/brand listing with a personalized one
(product background: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/pages/pages.md`; field snippets:
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/pages/` — general + magento + shopify). This skill owns the
DESIGN work: templates, filters, sorting — through the Pages MCP tools.

<!-- gap-watch:start -->
## Gap watch — when the MCP cannot do a step

While you run this skill, watch for a step the hello-retail MCP cannot do: no tool for it, a tool that errors, or a tool that does not return or change what the step needs.

- Say so in your next reply, with the manual route (what the operator does in the My Hello Retail dashboard). Never work around it by driving my.helloretail.com in a browser.
- A gap that blocks the task → offer the `plugin-feedback` report (`../plugin-feedback/SKILL.md`) right away. A gap with a workaround → offer it once, in your last message of the task.
- One offer per gap per session. Not for typos, MCP authorization, browser login or problems on the customer's own site.
<!-- gap-watch:end -->

## What a Pages design is

| Field | Meaning |
|---|---|
| `templateHtml` | The page's HTML/Liquid template — product grid, tile markup, chrome |
| `templateJs` | The design's JavaScript |
| `templateCss` | The design's stylesheet |
| `filtersEnabled` / `sortingEnabled` | Feature flags (a fresh design starts with both disabled) — separate facets, read/written via the dedicated filter/sorting tools |
| `filterSettings` / `sortingSettings` | Filter/sorting configuration; filter types: LIST, OBJECT, BOOLEAN, RANGE — same dedicated tools |

**The MCP tool schemas are the authoritative shape** for `filterSettings` /
`sortingSettings` — read the live tool schema before composing either; never compose
settings from memory or from this file.

## Tools and lifecycle (draft-only — NON-NEGOTIABLE)

- `pages_listDesigns` — every design incl. archived (archived = read-only).
- `pages_getDesign` — the templates (HTML/Liquid, JS, CSS) for one design. ALWAYS read
  before writing. Filter and sorting settings are **separate facets**: read them with
  `pages_getDesignFilters` / `pages_getDesignSorting` when the task touches them.
- `pages_updateDesign` — partial update of name/templates only (omitted fields
  unchanged). Edits DRAFT page configs using the design in place; updating a design
  used by a LIVE page config auto-creates a draft — the live page keeps serving the
  previous version until a human publishes the draft in My Hello Retail. The affected
  page configs are reported in the result. **Never publish, never archive, never
  delete.**
- `pages_updateDesignFilters` / `pages_updateDesignSorting` — the enabled flag plus the
  settings list for each facet. The settings list **replaces the current list in
  full** — read the facet first and send back the complete set, or you silently drop
  everything you omitted. Same draft rules as `pages_updateDesign`.
- `pages_createDesign` — new design from the built-in default template (filters/sorting
  disabled). Name it with the site domain so future runs can find it.
- `pages_copyDesign` — independent copy; the ONLY route to customize an archived design.
  The copy gets its own key and no page references it until explicitly configured.

### Page configs — the individual pages

A design is the template; a **page config** is one page built on it. Same draft rules:
every write lands in DRAFT and a human publishes in My Hello Retail.

- `pages_listConfigs` / `pages_getConfig` — the website's pages and one page's core
  settings (name, design key, `showOutOfStockProducts`, `productScoreBoost`). ALWAYS
  read before writing.
- `pages_getConfigProductFilters` / `pages_updateConfigProductFilters` — which products
  the page selects. Each filter is `field` + `operator` (EQ, NE, LT, LTE, GT, GTE, ANY,
  ALL, NONE) + `valueType`: `LITERAL` compares against a `value` stored in the config;
  `INPUT` compares against a value the page's embed script supplies at render time,
  keyed by the field name — that is how one config serves a whole set of categories, so
  do NOT convert an INPUT filter to LITERAL to "fix" a page. An INPUT filter makes its
  value **mandatory**: every request that doesn't send that field fails. Never add one
  on your own initiative, and on an API integration whose caller scopes the page itself
  the config has no product conditions at all (see *API (JSON) workflow*).
- `pages_getConfigProductBoosts` / `pages_updateConfigProductBoosts` — ordering.
  `productBoosts` are field+value+boost; `personalizedBoosts` are field+boost against
  the visitor's affinity. Pass only the list you are changing; each list given is
  replaced in full.
- `pages_updateConfig` — name, design key, out-of-stock, product score boost. Partial.
- `pages_createConfig` — a page from scratch; needs a `designKey`. Starts in DRAFT.
- `pages_copyConfig` — copy a page, optionally onto another website of the same company
  and onto a different design. Starts in DRAFT.

**Both filter and boost writes replace the whole list** — read the facet first and send
back the complete set, or you silently drop what you omitted. Field names must be real
product fields (`dataFields_getProductFields`) and filter/boost values must be the exact
indexed value — read them with `productData_getFieldValues` rather than guessing;
hierarchies use the `$`-separated encoding (`kids$shoes` = Kids > Shoes).

## Workflow

**Ask with the `AskUserQuestion` tool.** Every question whose answer has a finite set of sensible options — pick a page, a design, yes / no, 8 / 10 / 12 — is asked with Claude Code's `AskUserQuestion` tool: a header (12 characters at most), two to four options with a one-line description each, the recommended one first and marked "(Recommended)", `multiSelect: true` when several may apply; *Other* is added automatically for free text. Up to four independent questions per call; a question whose options depend on an earlier answer waits for the next call. Options come from what you already read, never from guesswork, and nothing the prompt, the card or an earlier answer already settled is asked again. Free text with nothing to suggest (a URL, a UUID) stays a prose question. No `AskUserQuestion` tool in the session → the same questions in prose, the options as a numbered list; no operator to answer at all → take the recommended option and record the question under OPEN QUESTIONS.

0. **Establish the integration mode before anything else.** Pages ships in three modes
   (`${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/pages/pages.md`): client-side JS render,
   API with an HTML response, API with a JSON response. Take it from the operator, the
   platform's wiki page (`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/`; some platforms
   run Pages through the API only), or the on-site widget label **"Pages (API)"**. Not
   settled → ask with `AskUserQuestion`, header *Pages mode*, the three modes from the wiki
   page as the options — *Client-side JS render* / *API, HTML response* / *API, JSON response*,
   each described in one line; never assume. On an SEO-sensitive store list the two API
   modes first and say in the client-side option's description that it is not recommended
   for SEO (the wiki page's *D&TS notes*); mark none "(Recommended)" — either API mode works.
   - **Client-side** or **API-HTML** → Steps 1–8 below. Hello Retail renders the markup
     in both, so the template, tile and grid work applies.
   - **API-JSON** → the customer's frontend renders the products; follow *API (JSON)
     workflow* instead. Steps 2–4f and 7 do not apply there.

1. **Select the design.** `pages_listDesigns`; prefer the editable company design whose
   name carries the site URL/domain. Archived → `pages_copyDesign` first, then work on
   the copy. Nothing suitable → `pages_createDesign` (name: `<domain>`; no "Pages" in
   the name, a Pages design only exists in Pages).
2. **Read it ONCE.** `pages_getDesign` — the fetched design IS the foundation.
   **Extend, never rewrite the foundation:** chrome, CSS, and JS outside the slots you
   are sanctioned to touch must survive byte-identical. Learn the template's variable
   model (product loop, page/filter objects) from the fetched template itself — Pages
   templates are not guaranteed to share the search/recom shells' variables, so never
   assume a binding you haven't seen in THIS design.

   **Confirmed template model** (field-verified on the fixture's "Prestashop test"
   design, 2026-08-18 — verify it still holds on the design YOU fetched): four
   `{% capture %}` blocks — `sorting_container`, `filter_container`,
   `product_container`, `pagination_container` — assembled at the bottom under a
   `filter_position` choice token ("top"/"left"). The products loop is
   `{% for product in products %}` inside `<div class="hr-products-container hr-grid">`,
   with an `{% if product.isBanner %}` banner branch (`banner_size_pages` +
   BANNER_SIZE_NAME_PLACEHOLDER — untouchable, same rule as search/recom banners) and
   the tile in the `{% else %}` branch. Filters chrome uses `filters.size` /
   `{% assign filters = filters|items %}` / `filter[1]` like the search shell;
   pagination derives `totalPages` from `totalResults` at 24 per page. Config tokens
   (`{# text … #}` / `{# choice … #}`): `product_title_single/multiple`,
   `filters_title`, `sorting_title`, `clear_button_text`, `filter_search_text`,
   `filter_position` — value-swaps only, never rename or delete. New customer-specific
   inputs go in their own section below the last token, never between them:
   `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md` → *Adding
   customer-specific inputs*.
3. **Tile body.** Comes from `tile-extractor`, started as a background subagent with
   `target surface = pages` — **read `${CLAUDE_PLUGIN_ROOT}/docs/tile-delegation.md` and follow it**: how to invoke the tile skill, the
   recom-tile reuse check and its `Tile source` question, what to do with each section it
   returns (FIDELITY, PARENT HOOKS, BINDINGS, PARITY TABLE, MISSING DATA, OPEN QUESTIONS), and
   what the shell never does. For Pages: container hooks go to step 4, cell-level hooks onto the
   design's own product wrapper (scope classes only), and TEXT INPUTS is `none` — fixed texts
   are copied as they are. Splice the
   converted tile into the per-product slot of `templateHtml` only; keep the design's
   own product-loop wrapper element the way recom keeps `.hr-product` — that wrapper is the cell,
   so the customer's grid cell is never copied.

   **Starweb shops:** once the platform is known to be Starweb (tile-extractor's
   PLATFORM section), ask the *Prices* question —
   `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/starweb/dynamic-price-handler.md` → *When to use it* has the question, its options and what each answer means. Don't
   assume the answer. Yes → the design JS calls the handler once products have rendered
   (*Search and Pages* on that page).

   **SEO microdata is part of the foundation — never remove it.** The default tile
   wrapper (`aw-infinite-search-results__item hr-product`, `itemscope`
   `itemtype="http://schema.org/Product"`) opens with a schema.org block: the
   `<meta itemprop=…>` tags, the visually-hidden `<span itemprop="offers">…</span>`,
   and the overlay `<a class="aw-infinite-search-results__product-link">`. Crawlers
   read this — it is why SEO-sensitive stores can run Pages at all. The tile splice
   replaces ONLY the visual block after that prefix; the microdata block and the
   wrapper's attributes survive byte-identical, with their `{{ product.* }}` bindings
   intact.
4. **Parent hooks.** If the tile's styling needs ancestor scope classes
   (survey-verified PARENT HOOKS), mirror them onto the design's products-container
   element — scope classes only, **layout classes are excluded** (`row`, `col-*`,
   `container`, `grid`; the mirrored-`row` −15px clip incident applies here verbatim).
   Rules: `../search-developer/references/shell-structure.md` → "Parent / ancestor scope".
4b. **Device grid parity — the products-per-row TOKENS are the source of truth**
   (operator decision 2026-08-19: they are the CSM-tunable knobs; never freeze
   literal widths into the css; modify the liquid variable declarations only).

   **The parity reference is the shop's own CATEGORY page — the surface Pages
   replaces — never the homepage/featured grid.** Field-confirmed 2026-08-19: the
   fixture's homepage grid measures 4-across (1110px section) while its category
   grid measures 3-across (285px tiles in an 855px column) — using the homepage
   reference shipped a 4-across Pages draft on a 3-across shop.

   **Derive columns by GEOMETRY, never by counting a row:** columns =
   round(column inner width ÷ tile outer width). A sparse category (the fixture's
   has 2 products) makes row-counting report 2 where the layout is 3-wide; the
   geometry division is immune (855/285 = 3 exactly). Survey field:
   `pages_reference.grid_columns` (category context) — the homepage-context
   `grid_columns` is the RECOM reference (front-page boxes), not the Pages one:
   every surface takes its columns from the page context it actually renders on.

   **1:1 is PER BAND — measure a width ladder, align the shop's change points**
   (operator doctrine 2026-08-19: gutters and columns can change per device; check
   mobile/tablet/desktop each). Sample the category across widths (1440→375) and
   derive the shop's own bands: where their column count changes IS their
   breakpoint (fixture: 3 at ≥1200, 2 at 576–1199, 1 below — the design's default
   @media edges of 940/768 rendered 3-across in the 941–1199 band where the shop
   shows 2). The design css's media THRESHOLD NUMBERS are measurements too:
   value-swap them to the shop's change points, and apply each band's own measured
   gutter to that band's rules — never assume the desktop gutter holds everywhere,
   even when it happens to (fixture: 30px in every band — verified, not assumed).

   Swap the declarations to those measured values (plausibility-gated). KNOWN
   PLATFORM FACT (harness-proven 2026-08-18): the LIVE render substitutes the
   design's DASHBOARD-SAVED token values when they exist — INVISIBLE and UNWRITABLE
   through the MCP. You cannot fix a wrong saved value; REPORT it: the operator
   verifies the dashboard-saved values equal the measured category columns.

4f. **Box-model parity — the shop's gutters, not HR's defaults (STRICT).** Operator
   doctrine 2026-08-19: "the goal is always to get as close to the customer's own as
   possible no matter what setup — be strict." Measure the native category grid's box
   model (survey `pages_reference.box_model`: grid margin/bleed, item margin/padding,
   visible tile width, visual gap, edge-flush offset, vertical gap) and VALUE-SWAP the
   design's existing box rules to the measured translation. Fixture example: native =
   item `padding: 0 15px` gutters + row `margin: 0 -15px` bleed → 255px visible tiles,
   30px gaps, edges flush with the column. Our tile fills its wrapper (no inner
   padding), so the translation is: container margin ← native grid margin (`0 -15px`),
   item margin ← `0 15px`, item padding ← `0`, calc gutter constant ← `- 30px`
   (2×gutter). Change VALUES of existing rules only — the `{{ …_products_per_row }}`
   token inside the calc survives untouched; never add new rules, never keep HR's
   default 5px/10px gutter scheme when the shop's own numbers are measured. Symptoms
   of getting this wrong: wrong tile spacing, item padding shrinking tiles, the Pages
   grid visibly inset from the shop's own column edges.

4e. **Container geometry parity — match the shop's own CATEGORY layout.** Measure the
   native content column (the grid's constrained ancestor: width/max-width, margins,
   padding — survey `native_container`) and the native grid box's own margin/padding
   (`grid_box`). Swap the existing `{# text container_max_width #}` token to the
   measured column width when plausible. Box-model rule values are swapped per 4f
   (strict parity); anything the design's rules genuinely cannot express is reported
   authoring new CSS rules.

4k. **Chrome parity — the sidebar, the top bar and the sort control are the shop's too.** 4b/4e/4f
    match the grid; everything around it still renders as the base design's own chrome, so the page
    reads as Hello Retail's even with a perfect tile. Read `references/chrome-parity.md` → *Chrome parity* first, then give
    the left sidebar (in every band where it shows), the top-bar pills, and the sort control and its
    panel the same measure → value-swap → verify treatment, at the shop's own change points.
    **Done when** the numbers match by computed style, not by screenshot — at the shop's desktop
    width, at every width where its sidebar width changes, and on both sides of its sidebar
    breakpoint.

4c. **Tile hover — capture the MECHANISM, never guard blindly.** Two harness-proven
   facts (fixture, 2026-08-18):

- Theme hover mechanisms with tile-internal selectors (e.g.
     `.product-miniature .thumbnail-container:hover .highlighted-informations
     { top: calc(100% - 4.4rem) }`) work inside HR containers WITHOUT any hooks.
     A blind static overlay guard on top of such a mechanism is at best redundant —
     measure first (survey `hover_mechanism`: the actual `:hover`/`:focus` rules
     targeting the tile's reveal blocks, with their declarations).
- The default Pages tile carries a full-tile overlay link
     (`a.aw-infinite-search-results__product-link { inset:0; z-index:1 }`) that EATS
     the pointer: the theme trigger (`.thumbnail-container:hover`) is a SIBLING and
     never fires — only higher-z elements (the wishlist button, z-index 10) react.
     Fix = a HOVER BRIDGE: copy the measured reveal declarations onto a trigger
     rescoped to the tile WRAPPER (an ancestor of both the overlay and the reveal),
     e.g. `.hr-pages-container .aw-infinite-search-results__item.hr-product:hover
     .highlighted-informations { …theme's own values… }`. Never `pointer-events:none`
     the overlay — it IS the tile's link. No measured mechanism → add nothing.

4d. **Range-filter currency token.** templateCss carries
   `{# text range_filter_currency = "€" #}` + `range_filter_currency_position` —
   the default € ships on every shop unless swapped. Set the symbol (and position)
   from the measured price skeleton (`kr##.##` → "kr", before; `##,## €` → "€",
   after). A € price slider on a kr shop was an operator-reported dropdown defect.

4g. **Pagination chrome parity — the base pagination is not the shop's.** Whenever the design
    paginates (`paginated = true`, or the operator asked for numbered pages), restyle it after the
    shop's own pagination and apply the three one-line fixes to the base pagination handlers:
    `references/pagination.md` → *Pagination chrome parity*. **Done when** (step 7) every visible button, arrows
    included, has the same rendered height and top edge at 1440 and 375px; the active page uses the
    shop's active colour; the row is centred and fits a phone width; and prev, next and a reload each
    leave exactly one active page, on the page the products show.

4h. **Numbered pagination with ellipsis — opt-in, when the operator asks for it** (`1 2 3 … 20`
    instead of the base's sliding window of five neighbours). Build it from `references/pagination.md` →
    *Numbered pagination with ellipsis*. **Done when**, by clicking on-site and not by reading the
    code — page 1, next several times, a middle page, the last page, prev twice, back to 1 — there is
    exactly one active page at each step, a `…` only where two or more pages are skipped, arrows
    hidden at the ends, one row of equal-height cells at 1440 and 375 px, and a reload on a middle
    page shows the same window.

4i. **"Load more" button — opt-in, the third loading mode** (the first page, then a button under
    the grid that appends the next page on each click, with a counter and no auto-loading on scroll).
    Build it from `references/pagination.md` → *"Load more" button*. **Done when** scrolling to the bottom loads
    **nothing**, each click appends exactly one page and updates the counter and the `hr-page` URL
    state, a reload restores what was loaded, no product repeats across clicks, the whole block
    disappears on the last page, pagination does not render, and the base's loading image stays
    hidden at every step.

4j. **Equal-height tiles in a row — standard on every grid build.** Field-proven 2026-09-30.
   The base product container is a wrapping flex row, so every cell (the design's
   `.aw-infinite-search-results__item.hr-product` wrapper) already stretches to the tallest
   cell of its row — but the customer's card inside it keeps its own content height. One
   tile with more content (a sale price pair with a "save" line, a two-line badge, a longer
   title) then makes its card visibly taller than its neighbours while their borders stop
   short. Make the card fill its cell; no display change on the cell, no fixed heights:

   ```css
   .hr-pages-container .hr-grid .aw-infinite-search-results__item.hr-product > :last-child {
   	height: 100%;
   	box-sizing: border-box;
   }
   ```

   `:last-child` is the spliced tile root — it follows the SEO microdata prefix, the
   `offers` span and the overlay link, which are all out of flow. If the tile root is not
   the wrapper's last child, target its own class instead. `box-sizing` keeps a bordered
   card from growing past the cell. If the shop pins something to the card bottom (an
   add-to-cart button, a stock line) and the native grid aligns those across a row, that is
   the tile's own layout — mirror the shop's rule (typically the card as a flex column with
   the pinned element on `margin-top: auto`), never invent one.

   Verify on-site with enough products loaded to include the tallest variant (load more or
   page until a sale/badge tile shares a row): in every row, all cards have the same
   rendered height and none is taller than its cell, at 1440, 1024 and 375 px.

4l. **Phone filter drawer — a bottom sheet, when the shop's is one.** Measure the shop's drawer
    open, then build the sheet, its title and close, the footer and the scroll lock from
    `references/chrome-parity.md` → *Phone filter drawer*, and state the known gap it names in the hand-off.
    **Done when**, at the shop's phone size, the sheet's position, height and radius equal the
    shop's; ×, apply and a tap outside each close the sheet and release the lock; clear returns the
    full result count; and at desktop and just below the breakpoint the title, footer and × are
    hidden and the sidebar matches step 4k unchanged.

4m. **Cross-design CSS leaks — other HR designs' rules reach the Pages markup.** Search and recom
    designs share class names with Pages, and their CSS is on every page. Run the leak check and fix
    it **on the Pages side, never in the other design**: `references/cross-design-css.md`. **Done when** the rows the
    override covers resolve to the Pages values (`getComputedStyle`) and the 4b grid measurement
    still holds; report the leaking design and its selectors in the hand-off.

5. **Filters & sorting.** Read the current facets with `pages_getDesignFilters` /
   `pages_getDesignSorting`, then write with `pages_updateDesignFilters` /
   `pages_updateDesignSorting` — enable the flag only when configuring real settings,
   and remember the settings list is a **full replacement** (send back the complete
   set). Every filter/sorting entry maps a REAL field — verify with
   `dataFields_getProductFields` / `dataFields_getContentFields` first; pick the
   filter type (LIST/OBJECT/BOOLEAN/RANGE) from the field's shape, per the live tool
   schema. Hide irrelevant filters
   (`${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/pages/general.md` has the field-proven snippet), and
   structure `extraDataList` values per the same cheat sheet's `data-filters` note.

   **Date sorts take the shop's product date, not `created`.** HR's `created` is the
   date the product was imported into Hello Retail, so a whole catalogue imported in one
   run shares a few dates and "newest" comes out in an order the shop never shows
   (field case 2026-10: the shop's "Dato" sort and HR's `created` disagreed from the
   first row). Look in `dataFields_getProductFields` for the feed's own product date —
   `extraData.createdAt` on that Shopify feed, otherwise the feed's equivalent (check that
   its values are real dates that differ per product) — index it if it is not `searchIndexed` (it goes in the same single
   `dataFields_updateProductFieldsIndexing` call as any other field this build needs), and
   sort on it. Fall back to `created` only when the feed has no product date, and say so
   in the hand-off.
5b. **Dropdowns close on an outside click — the base JS does not do this.** Field-proven
   2026-09-28: the default design's `templateJs` hides an open filter or sorting dropdown
   only when another heading is clicked; the one `container` click listener it has is the
   ≤ 767 px slide-panel path. On desktop an opened dropdown therefore stays open until the
   visitor opens another one, and the operator reports it. Whenever the design offers
   filters or sorting, append this listener inside the existing `if (filters.length > 0)`
   block of `post_insert` (after the "Display handlers for filters" loop, so
   `hide_filter_options` is in scope) — an addition, never a rewrite of the block:

   ```javascript
   // Close open dropdowns when clicking outside a filter or the sorting control
   if (document.documentElement.dataset.hrPagesOutsideClick != "true") {
   	document.documentElement.dataset.hrPagesOutsideClick = "true";
   	document.addEventListener("click", function(e) {
   		if (e.target.closest(".aw-filter__single-wrapper, .hr-category-page-results__sorting-content")) {
   			return;
   		}
   		var open_dropdown = document.querySelector(".aw-filter-dropdown-content:not(.hr-hidden), .aw-sorting-dropdown-content:not(.hr-hidden)");
   		if (open_dropdown) {
   			hide_filter_options();
   			filtersScrollTop = 0;
   			querystring_storage.put("active_filter", "");
   		}
   	});
   }
   ```

   The `dataset` guard keeps one listener per page across re-renders; clearing
   `active_filter` stops the design re-opening the dropdown on the next refresh. Verify it
   in the browser during step 7: open a filter, click the product grid → closed; open the
   sorting dropdown, click elsewhere → closed; clicking inside an open dropdown keeps it open.
6. **Write EXACTLY.** `pages_updateDesign` with ONLY the template fields you changed
   (filter/sorting facets go through their own update tools per step 5). Then
   **read-back verify**: `pages_getDesign` (and the facet reads, if written) again and
   compare each written field byte-for-byte (whitespace-tolerant at most). A claimed
   tool call is never proof. Unverified after 3 attempts → report the target as NOT
   applied. Two things that make this read-back fail in practice (field-proven
   2026-09-29):
   - **The result lands in a file, not in the reply.** A full design is ~90 k characters,
     over the tool's output limit, so `pages_getDesign` returns only the path of a JSON
     file under `tool-results/`. Compare from that file: `jq -r .templateCss <file> >
     rb.css` (same for `templateHtml` / `templateJs`) into the scratchpad, then `diff`
     each against the local copy you sent. The Read tool cannot chunk it — the JSON is
     one line.
   - **Whitespace-tolerant means blank lines too.** The platform drops some empty lines
     on save, so `diff -w` still reports every write as different; `diff -wB` (ignore
     whitespace and blank lines) is the check. Anything it still prints is a real
     difference.
   Keep a numbered local copy of every stylesheet and script you send (`final7.css`,
   `final8.css` …): the next write is built from the last verified copy, never from
   memory, and a regression is a plain diff between two numbers.
6b. **Look for the shop's own Pages div before the first preview.** The theme may already
   carry a `#helloretail-category-page-<key>` container — added by the customer or an earlier
   setup — with its own `data-filters`. A test div injected with the same id (the pages cheat
   sheet's probe) is then the second element with that id, Hello Retail renders into the
   theme's one, and its filters decide what shows. Field case 2026-10: the page showed 0
   products and the time went into debugging the design. On the category page, before
   injecting anything:

   ```js
   [...document.querySelectorAll('[id^="helloretail-category-page-"]')].map(function (d) {
     return { id: d.id, filters: d.getAttribute('data-filters'), parent: d.parentElement && d.parentElement.className };
   })
   ```

   - **Empty** → inject the test div as the cheat sheet shows.
   - **A div exists** → record its id and `data-filters` in the build summary and the
     hand-off. Preview through that div (it is what the live page will use), or remove it
     (`.remove()`) before injecting a test div with the same id — never leave two. A preview
     that shows 0 products with this div in place is a `data-filters` question (the keys
     and values it filters on), not a design fault.
7. **Tile fidelity, by eye.** Where a native reference exists, put a rendered HR tile next to
   the native tile of the same state at 1440 and 375 px and classify any difference, as
   `${CLAUDE_PLUGIN_ROOT}/docs/tile-delegation.md` → *After the push — the same check again* says (for Pages a hook is mirrored in
   step 4). Then **QA.** Run the `pages-qa` skill with the checklist catalogue
   (`../qa-checklists/references/pages.md`): native-reference survey first, the
   test-div browser probe from the pages cheat sheet, four widths (1440/1024/820/375),
   worst-case tiles, measured verdicts. A FAIL verdict is a successful QA run.
8. **Hand-off record.** Run `customer-handoff` (`../customer-handoff/SKILL.md`; record mode, stage `pages`; mandatory — do not ask whether to, do not skip) so the design keys, filters/sorting decisions and any
   workaround land in the customer's living hand-off document under `output/handoffs/` (local for now;
   `${CLAUDE_PLUGIN_ROOT}/docs/hand-off.md` → *The record — `customer-handoff`*).

## API (JSON) workflow

The caller (the customer's backend or frontend) requests `/serve/pages/{key}` with
`format: json` and draws the products itself. Hello Retail's side is configuration only.

1. **Design.** As Step 1; a new one is named `<domain> (API)`. Leave the
   templates exactly as created: nothing of them is rendered, so no tile, grid, hover or
   currency work, and no `pages_updateDesign` template writes.
2. **Index every field the caller filters or sorts on.** Design filters, sorting and the
   caller's `params.filters` only work on fields with `searchIndexed: true`
   (`dataFields_getProductFields`). Turn on every `ALLOWED` field that is needed in ONE
   `dataFields_updateProductFieldsIndexing` call — any change schedules a full re-index.
   The platform's wiki page may fix the set (e.g. a platform whose storefront maps
   numeric ids to labels: index every `*_id` field).
3. **Filters & sorting.** Write them as in Step 5 (full replacement, read back).
   - **Filters:** the platform convention or the operator's list — never filters of your
     own choosing. Titles follow the platform page when it sets them (the caller may key
     on the title).
   - **Sorting:** mirror the sort options the storefront already offers (read them from
     the live category page), e.g. lowest/highest price → `price`, newest/oldest → the
     feed's product date (`extraData.createdAt` or equivalent; `created` only when there
     is none — Step 5).
4. **Page config — no product conditions by default.** A caller that scopes the page
   itself sends the field it needs in `params.filters`; that works on any indexed field
   without a matching INPUT filter. So:
   - leave `productFilters` empty;
   - add an INPUT filter only when the operator confirms the caller sends that exact
     field on **every** request (an INPUT filter's value is mandatory; see *Page
     configs*) — confirmed with `AskUserQuestion`, header *Input filter*: *"Does the
     caller send `<field>` on every request?"* — *Yes, on every request* / *No, leave the
     page without it* (no option recommended);
   - add a LITERAL filter only for a fixed rule the operator asks for.

   Out-of-stock handling, product score boost and boosts are the operator's call — not
   settled by the prompt or the card → out-of-stock with `AskUserQuestion`, header *Out of
   stock*: *Hide out-of-stock products* / *Show them* (none recommended); the boost fields
   and values in prose. Report
   personalized boosts on a field the catalog leaves empty (e.g. `hierarchies`) as having
   no effect.
5. **Read-back verify** the facets, the indexing state and the config with its product
   filters; same 3-strike rule as Step 6.
6. **QA.** No rendered pass: `pages-qa` skips API-based Pages. Instead, list for the
   operator what the first live calls must confirm: with API logging on
   (`apiLog_setLogging`, then `apiLog_getEntries` for the `pages` endpoint) the
   `params.filters` keys the caller actually sends, each of them indexed.
7. **Hand-off record.** As Step 8.

## Integration awareness (affects what "perfect" means)

Pages ships in three modes — client-side JS render, API-HTML, API-JSON
(`${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/pages/pages.md`). In client-side and API-HTML
mode design work targets the rendered output; in API-JSON mode nothing of the design is
rendered (*API (JSON) workflow*). On SEO-sensitive stores D&TS recommends an API mode, HTML
or JSON, over client-side Pages injected by the Hello Retail script — note the store's mode in
your report. REST request shapes and tracking events (page-view, click, `hello_retail_id`
bootstrap) are in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/pages/general.md`.

## Reference files — read at the step named

- `references/chrome-parity.md` — step 4k (every build): the sidebar, top-bar pills and sort control; step 4l: the phone filter drawer as a bottom sheet.
- `references/pagination.md` — step 4g (whenever the design paginates): the shop's pagination chrome and the base-handler fixes; steps 4h and 4i (only when the operator asks): numbered pages with an ellipsis, and the "load more" button.
- `references/cross-design-css.md` — step 4m: rules from other Hello Retail designs that reach the Pages markup, and the Pages-side override.

## Hard rules recap

- Draft-only; publishing is a human dashboard step. Never publish/archive/delete.
- Extend, never rewrite: foundation survives byte-identical outside sanctioned edits.
- Comments you add: one short line, only where the code isn't obvious ("doing X because Y").
  `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md` → *Comments in the code you add*.
- Read-back verify every write; 3 strikes → NOT applied. The shared write rules (read first,
  the spilled payload, changed fields only, raw fields, whole lists sent back in full):
  `${CLAUDE_PLUGIN_ROOT}/docs/design-writes.md` — its diff and `Push` gate are not part of the Pages flow.
- Tile body verbatim from the tile skill; no invented classes; no Hello Retail class inside
  the tile; no `hr-product` boilerplate where the design's own wrapper differs. A difference
  after the push is a tile fix, a hook or a restated theme rule — never CSS that re-creates the look.
- Tile rules — body from the tile skill, the Liquid rules for what you write yourself (block
  tags on their own line, the `extraData.hasVariants` gate, never `variantProductNumbers.size`),
  prices: `${CLAUDE_PLUGIN_ROOT}/docs/tile-delegation.md` → *What the shell never does*.
- Banner branch untouched (the one exception, a stray `</img>`: `${CLAUDE_PLUGIN_ROOT}/docs/tile-delegation.md` → *What the shell never
  does*).
- CSS authoring (one rule per selector, no re-declared values, the rule in the section that
  already styles the element): `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md` → *Writing the CSS itself*
- Settings from real fields + live tool schema — never from memory.
- Close the browser last, also when the build stops midway: `${CLAUDE_PLUGIN_ROOT}/docs/browser-login.md` → *Close the browser when
  the work is done*
- Integration mode first (Step 0). API-JSON: no template edits, no product conditions
  unless the operator confirms the caller always sends that field. Both asked with the
  `AskUserQuestion` picker when the prompt, the card or the widget hasn't settled them.
- Platform guides exist for Shopify and DanDomain Classic Pages setups — read them
  before touching those platforms (`${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/pages/pages.md` → guides).
