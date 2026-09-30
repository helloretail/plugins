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
   each described in one line; on an SEO-sensitive store *API, HTML response* goes first as
   "(Recommended)", otherwise none is; never assume.
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
   `target surface = pages`; read its RESPONSE FORMAT sections by name (`../tile-extractor/SKILL.md`):
   **FIDELITY** (every state PASS or fully classified before the splice — a shell-side item becomes
   a NOTES line or a sanctioned edit, a markup item goes back to the tile skill, never into CSS),
   **PARENT HOOKS** (container hooks for step 4; cell-level hooks onto the design's own product
   wrapper, scope classes only), **BINDINGS** and **PARITY TABLE** (build record), **MISSING DATA**
   and **OPEN QUESTIONS**; TEXT INPUTS is `none` for Pages — fixed texts are copied as they are.
   Its Output Rules and `../tile-extractor/references/liquid-rules.md` are binding here too — do not
   restate or improvise them. Splice the
   converted tile into the per-product slot of `templateHtml` only; keep the design's
   own product-loop wrapper element the way recom keeps `.hr-product` — that wrapper is the cell,
   so the customer's grid cell is never copied.

   **Starweb shops:** once the platform is known to be Starweb (tile-extractor's
   PLATFORM section), ask the operator with `AskUserQuestion` (header *Prices*,
   `multiSelect: true`): *None of these* / *Customer-unique prices* / *Several currencies* /
   *Another price quirk* (*Other* says which) — don't assume the answer. Yes → the
   tile's price block uses the markup in
   `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/starweb/dynamic-price-handler.md` and the
   design JS calls the handler once products have rendered (*Search and Pages* on that
   page). No → prices as usual, no handler.

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

4k. **Chrome parity — the sidebar, the top bar and the sort control are the shop's too.**
   4b/4e/4f match the grid; everything around it still renders as the base design's own
   chrome, so the page reads as Hello Retail's even with a perfect tile. Field-proven
   2026-09-29 on a Shopify Impact theme. Give the chrome the same measure → value-swap →
   verify treatment, at the shop's own change points (this fixture: sidebar only ≥ 1000 px):

- **Left sidebar.** Measure the shop's sidebar width and its gap to the grid (fixture
  305 px + 32 px) and swap `.hr-filters-container` flex-basis/max-width and
  `.hr-results-container` margin-left/flex-basis to them. Then the rows: the title row
  (`.hr-category-page-filter-title` — the shop's "Filter by:" with the result count
  appended, `{{ totalResults }} {{ product_title_multiple }}`, and its divider), the group
  heading (font/weight/padding — fixture 16 px/500, 16 px top and bottom — with the
  shop's chevron as a data-URI on `span.arrow-fix:after`, rotated in the open state via
  `.aw-filter__single-wrapper:has(> .aw-filter-dropdown-content:not(.hr-hidden))`, since
  the base never toggles `.rotated`), the option rows (min-height and gap — fixture 27 px
  and 8 px — with the count right after the label, `float: none`), the checkbox
  (`span.checkbox-span`: size, border, radius, filled state, the shop's tick as a
  data-URI on `:after`) and the range inputs. All of it inside the existing rules'
  values; new rules only for the icons, scoped under `.hr-filters-container`.
- **Top-bar pills.** When the shop shows one facet as pills above the grid (sizes here),
  pull that facet out of the sidebar loop (`{% if filter[1].name != "<field>" %}` around
  the loop body) and render it in `sorting_container` as a pill row: a heading
  (`h4.hr-category-page-filter__heading.hr-top-filter-title`, `pointer-events: none`), an
  empty `div.aw-filter-dropdown-content.hr-hidden` stub, then the options as
  `label.hr-top-filter-item` with the checkbox inside. The wrapper carries
  `class="hr-top-filter"` and `data-filter-name` — the base's `register_filter` binds
  `input[name^=aw-filter-]` under the heading's parent and calls `hide()` on the dropdown
  sibling, so the stub and a class starting with `aw-filter-` on the list
  (`aw-filter-top-list`) are what keep it from throwing. Style the pills from the shop's
  (fixture 141×48, 16 px gap, radius 32, base/hover/selected colours, `order: -1` on
  selected), scroll them horizontally with the shop's scrollbar, and sort them in
  `post_insert` with `localeCompare(…, "<lang>", {numeric: true})` so "140x200" precedes
  "160x200". Above the shop's sidebar breakpoint the sorting line becomes a two-column
  grid (heading left, sort control right, pills spanning the second row); below it, a
  column (sort first, heading, pills) — with `min-width: 0` on the results, sorting and
  line containers, or the pill row widens the whole column to its scroll width.
- **Sort control and panel.** The base heading becomes the shop's: its sort icon as a
  data-URI `::before`, the chosen option as the label (`span.hr-sort-current`, filled in
  `post_insert` from `.aw-sorting-tag-list > label.selected`), the chevron hidden. The
  panel (`div.aw-sorting-dropdown-content`) takes the shop's width, right alignment,
  border, radius, shadow and offset; option rows the shop's font, the unselected ones
  dimmed (fixture opacity .7), the selected one full with the shop's check icon on
  `span.checkbox-span:after`.
- **Verify by computed style, not by screenshot**, at the shop's desktop and both sides
  of its sidebar breakpoint (fixture 1440 / 999 / 390): sidebar width and gap, title and
  heading font, option row pitch, checkbox size, pill size and gap, sort weight and panel
  width, and the vertical rhythm heading → pills → grid (fixture 16 px and 48 px). A 10 px
  spacing difference is invisible by eye and obvious in numbers.

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

4g. **Pagination chrome parity — the base pagination is not the shop's.** Field-proven
   2026-09-29: the default `templateCss` ships a fixed 45px button height, a blue `#337ab7`
   active page, a 2px gap, and no rule at all for the prev/next `.direction-links` buttons,
   which therefore render as bare browser buttons; because those two hold only a 17px SVG
   they also come out shorter than the number buttons. Whenever the design paginates
   (`paginated = true`, or the operator asked for numbered pages), restyle it to the shop:

- **Reference, in this order.** (1) The shop's own pagination on the category page —
  measure it like any other chrome (link/active/hover/disabled colours, border, radius,
  padding, font, gap). (2) The shop has none (single page, "load more", infinite scroll):
  use the theme's own pagination rules instead — scan the linked stylesheets for
  `.pagination` / `.page-link` / `.page-item` selectors, and read the framework's
  pagination variables from a temporary `<ul class="pagination">` element the survey
  appends and removes (Bootstrap 5 exposes `--bs-pagination-*` on it). Never keep HR's
  defaults, never invent a palette; the design's own injected CSS is not a reference.
- **Write.** Value-swap the base pagination block (`gap`, `height`, the `.active` colours)
  and add the measured declarations as rules scoped to `.hr-pagination-container`, always
  for `.page-link` **and** `.direction-links` together: padding, font, colour, background,
  border, the joined `-1px` overlap, end radii on the first/last item, hover, focus and
  active. Give both button kinds the same fixed `height` — the number buttons' rendered
  height (text line + padding + border) — so the SVG-only arrows cannot end up shorter.
- **JS — three one-line fixes to the base pagination handlers**, on every paginated build:
  (1) the declaration becomes `var current_page = parseInt(options.get_pagination(), 10) || 1;`
  — the page is read back from the `hr-page` URL state, and `current_page += 1` on a text
  value concatenates (`"3"` → `"31"`); (2) the `#prev-page` handler clears `active` from the
  page it leaves, as the `#next-page` handler already does — without it two pages show as
  active after a prev click; (3) the `.page-link`, `#prev-page` and `#next-page` click
  handlers each start with `if (options.loading) { return; }` — `load_more()` ignores a
  click while a request runs, but the handler has already moved `current_page`, so two
  quick clicks leave the active page one off from the products shown. The prev handler
  after the edits:

  ```javascript
  prevPageLink.addEventListener("click", function() {
  	if (options.loading) {
  		return;
  	}
  	if (current_page > 1) {
  		pagination_container.querySelector("#page-link-" + current_page)?.classList.remove("active");
  		current_page -= 1
  		options.start = (current_page - 1) * 24
  		load_more();
  	}
  })
  ```

- **Verify on-site** (step 7): every visible button, arrows included, has the same
  rendered height and top edge at 1440 and 375px; the active page uses the shop's active
  colour; the row is centred and does not overflow a phone width. Then click: prev from
  page 3 leaves exactly one active page; two quick clicks on next land on the page the
  products show; a reload on page 3 keeps page 3 active and next goes to 4.

4h. **Numbered pagination with ellipsis — opt-in, when the operator asks for it.** Some shops
   want `1 2 3 … 20` instead of the base's sliding window of five neighbours. Field-proven
   2026-09-30. The behaviour: page 1 and the last page always shown, the current page ±
   `paginations_per_side` (the existing JS number, default 2) around it, a `…` cell only where
   two or more pages are skipped — a single skipped page shows as its number, since the `…`
   would take the same space (`‹ 1 2 3 4 [5]`, not `‹ 1 … 3 4 [5]`) — prev hidden on page 1
   and next hidden on the last page — e.g. `‹ 1 … 8 9 [10] 11 12 … 20 ›`. Liquid still
   renders every page item; the JS only toggles which are visible, so no extra requests.
   Apply step 4g's three handler fixes first, then three edits, value- and slot-level only:

- **Liquid** — the base `{% for item in (1..totalPages) %}` loop becomes exactly this
  (1-based; keep it — a 0-based rewrite needs an off-by-one correction for exact multiples of
  the page size). The ellipses sit **inside** the first and last `<li>`, which are always
  visible:

  ```liquid
  {% for item in (1..totalPages) %}
  	<li class="page-item pagination-item" name="{{item}}">
  		{% if item == totalPages and totalPages > 1 %}<span id="end-ellipsis" class="hr-pagination-ellipsis hr-hidden" aria-hidden="true">&hellip;</span>{% endif %}
  		<button class="page-link" id="page-link-{{item}}" value="{{item}}">
  			{{ item }}
  		</button>
  		{% if item == 1 %}<span id="start-ellipsis" class="hr-pagination-ellipsis hr-hidden" aria-hidden="true">&hellip;</span>{% endif %}
  	</li>
  {% endfor %}
  ```

- **JS** — replace `handle_pagination_limit()` with this function and add the
  `toggle_visible()` helper below it. It already runs after the first render and after every
  page load:

  ```javascript
  function handle_pagination_limit() {
  	if (!paginated || !pagination_container) {
  		return;
  	}
  	var paginations = pagination_container.querySelectorAll(".pagination-item");
  	var total_pages = paginations.length;
  	if (total_pages === 0) {
  		return;
  	}
  	// Clamp: a stale URL can name a page that no longer exists
  	var current = Math.min(Math.max(parseInt(current_page, 10) || 1, 1), total_pages);
  	var first = current - paginations_per_side;
  	var last = current + paginations_per_side;
  	// An ellipsis that would hide a single page shows that page instead
  	if (first === 3) {
  		first = 2;
  	}
  	if (last === total_pages - 2) {
  		last = total_pages - 1;
  	}
  	paginations.forEach(function(element) {
  		var page = parseInt(element.getAttribute("name"), 10);
  		var visible = page === 1 || page === total_pages || (page >= first && page <= last);
  		visible ? show(element) : hide(element);
  		var link = element.querySelector(".page-link");
  		if (link) {
  			link.classList.toggle("active", page === current);
  			page === current ? link.setAttribute("aria-current", "page") : link.removeAttribute("aria-current");
  		}
  	});
  	toggle_visible(pagination_container.querySelector("#start-ellipsis"), first > 2);
  	toggle_visible(pagination_container.querySelector("#end-ellipsis"), last < total_pages - 1);
  	toggle_visible(pagination_container.querySelector("#prev-page")?.parentElement, current > 1);
  	toggle_visible(pagination_container.querySelector("#next-page")?.parentElement, current < total_pages);
  }

  function toggle_visible(element, visible) {
  	if (element) {
  		visible ? show(element) : hide(element);
  	}
  }
  ```

  The `active` toggle is not optional: it is the one place that sets the active page, so an
  `active` class left behind by any handler is cleared on the next load. Compare pages as
  numbers (`current`), never `current_page` directly: when that holds text, `===` never
  matches and `current_page + 2` concatenates, which shows every page from the current one
  up and hides the end `…`.
- **CSS** (scoped to `.hr-pagination-container`, values from step 4g) — the `…` cell gets the
  page buttons' own box: same height, border, font, `-1px` overlap, not clickable; the page
  items become `display: inline-flex` (the base `li { display: inline }` renders the
  whitespace between the `…` and its button as a visible gap); and at the shop's mobile band
  shrink the cells (e.g. `min-width: 30px; padding: 6px 4px`) — a middle page is 11 cells,
  ~400 px at desktop size, which wraps on a 375 px phone. When the shop's pagination has
  rounded ends, a hidden arrow still counts as `:first-child` / `:last-child`, so move the
  end radius to the first/last visible button as well:
  `.pagination > li.hr-hidden:first-child + li > .page-link` (left) and
  `.pagination > li:has(+ li.hr-hidden:last-child) > .page-link` (right).

Verify on-site by clicking, not by reading the code: page 1, next several times, a middle page,
the last page, prev twice, back to 1 — at each step exactly one active page, a `…` only where
two or more pages are skipped, arrows hidden at the ends, rounded ends on the outer visible
buttons (when the shop rounds them), one row of equal-height cells at 1440 and 375 px. Then
reload on a middle page: the same window and one active page.

4i. **"Load more" button — opt-in, the third loading mode.** The base knows two: infinite
   scroll (`paginated = false`) and numbered pages (`paginated = true`). Some shops want the
   first page, then a button under the grid that appends the next page on each click, with a
   "24 of 339 products" counter and no auto-loading on scroll — and the shop's own listing
   usually already looks like that (a centred button after the grid, a counter, the button
   gone once everything is shown). Field-proven 2026-09-30. Build it as a switch on top of
   the infinite-scroll path so the base's request, append and reload-restore logic is reused:

- **Liquid** — a new token section below the last base token,
  `{# section Load more #}` with `{# text load_more_text = "Load more" #}` and
  `{# text load_more_count_separator = "of" #}` (copy the shop's own words), and a new
  capture rendered between `{{ product_container }}` and `{{ pagination_container }}` in
  **both** `filter_position` branches:

  ```liquid
  {% capture load_more_container %}
  	<div class="hr-load-more-container">
  		<p class="hr-load-more-count"><span class="hr-load-more-shown">{{ count }}</span> {{ load_more_count_separator }} <span class="hr-load-more-total">{{ totalResults }}</span> {{ product_title_multiple }}</p>
  		<button type="button" class="hr-load-more-button">{{ load_more_text }}</button>
  	</div>
  {% endcapture %}
  ```

- **JS** — `/* boolean */ var load_more_button = true;` next to `paginated` (which stays
  `false`), and `var page_size = 24;` under it — the base has no page-size variable, it
  hard-codes `24` (use the number the base you read hard-codes; without the declaration the
  first click throws a ReferenceError). Then seven guarded edits, none of them a rewrite: (1) the scroll listeners are
  registered only `if (!paginated && !load_more_button)`; (2) the same guard on the viewport
  check in `load_more()`; (3) the auto-fill `if (options.hasMore) load_more()` at the end of
  `insert_results` becomes `options.hasMore && !load_more_button`; (3b) the placeholder
  guard at the top of `insert_results` becomes
  `if (!options.hasMore || paginated || load_more_button) hide(options.placeholder)` — the
  animated loader image is infinite scroll's "more is coming" cue; left in place it sits
  under the button as a stray row of dots (operator-reported); (4) on the first batch,
  `load_more_container = page_container.querySelector(".hr-load-more-container")` — remove it
  when `paginated || !load_more_button` (the way the base removes the pagination container
  in infinite mode), otherwise bind its button:
  `options.count = page_size; load_more(true);`; (5) call `update_load_more(productsTotal)`
  right after `post_insert(is_first_batch)`; (6) add that function: it writes
  `Math.min(options.start, total)` into `.hr-load-more-shown`, the total into
  `.hr-load-more-total`, and shows the container while `options.hasMore`, hides it otherwise.
  The `options.count = page_size` on click is not optional: the base's reload-restore path
  sets `options.count` to the restored remainder and never resets it, so without it every
  click after a reload loads that remainder (48, 72 …) instead of one page.
- **CSS** — scope everything to `.hr-pages-container` / `.hr-load-more-container`: the
  container is a centred column with the shop's spacing under the grid; the counter takes
  the shop's body text; the button is a value-copy of the shop's own listing button (its
  primary/secondary button rules: padding, font, colour, background, border, radius, hover),
  never HR defaults. Measure the shop's load-more button when it has one, its primary button
  otherwise.

Verify on-site by doing, at desktop and phone width: the first page renders with the counter
and the button, scrolling to the bottom loads **nothing**, each click appends exactly one page
and updates the counter and the `hr-page` URL state, a reload restores what was loaded and the
next click still adds one page, no duplicate products across clicks, and on the last page the
whole block disappears. Pagination must not render in this mode, and the base's loading
image (`img[alt="loading"]`) must be hidden at every step — idle, during a click and after.

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

4l. **Phone filter drawer — a bottom sheet, when the shop's is one.** Below the mobile
   breakpoint the base slides `.hr-category-page-results__filter-wrapper` in from the left,
   80 % wide, under a dark overlay, with a small round close button pinned to the page
   corner. Most shops open a sheet from the bottom instead, with a title, a close icon and
   a clear/apply footer. Field-proven 2026-09-30 (Shopify Impact). Measure the shop's drawer
   open (sheet height and radius, title font, footer button sizes and colours) and build:

- **Sheet (CSS, inside the existing `@media (max-width: <mobile>)` block).** The wrapper
  becomes `display: flex; flex-direction: column; top: auto; bottom: 0; left: 0; right: 0;
  width: 100%; height: 75dvh !important` (with a `75vh` fallback), `box-sizing: border-box`,
  the shop's padding and top radius (fixture `24px 16px 0` / `24px 24px 0 0`),
  `overscroll-behavior: contain`, `transition: transform 0.3s ease`; the hidden state
  (`.hr-slide-hidden … .hr-category-page-results__filter-wrapper`) is `left: 0;
  transform: translateY(100%)` instead of the base's `left: -100%`. Drop the base's dark
  overlay (`.hr-filters-container:not(.hr-slide-hidden) .hr-category-page-filters.hr-filters::after
  { background-color: transparent }`) when the shop has none. Each
  `.aw-filter__single-wrapper` gets `flex: 0 0 auto !important; width: 100% !important;
  padding: 0`, so the column does not squash the groups.
- **Title and close (JS in `post_insert`, first batch).** Prepend a `p.hr-drawer-title` to
  the wrapper with the mobile filter button's own text (`.hr-mobile-filter-button`), styled
  to the shop's drawer heading (fixture 18 px/600, 24 px below). Restyle the base's
  `.hr-category-page-mobile-close` as the shop's × — a data-URI icon, no circle, placed at
  the sheet's top-right corner (`top: calc(25dvh + <sheet padding>)`, `right: 16px`) with
  a z-index above the sheet. Its click handler is the base's; leave it.
- **Footer (JS + CSS).** Append a `div.hr-drawer-footer` with two buttons. The clear
  button (`button.hr-drawer-clear`: the shop's outlined pill with its trash icon inline as
  SVG, label from the design's `#clear-filters-button` text) forwards its click to that
  base button — the base already clears filters and sorting and refreshes. The apply
  button (`button.hr-drawer-apply`: the shop's filled pill, label from a new
  `{# text apply_button_text #}` token plus a count `(n)` where n is
  `page_container.querySelectorAll(".aw-search-overlay-selected-filter").length`)
  calls `slide_out(filters_container)` and clears `active_filter`. The footer is
  `display: flex; position: sticky; bottom: 0; flex: none; margin-top: auto` inside the
  sheet, with the shop's gap and padding, so it sits at the sheet's bottom edge whether
  the groups are collapsed or scrolling. At desktop `.hr-drawer-title` and
  `.hr-drawer-footer` are `display: none` — the sidebar is untouched.
- **Scroll lock.** `slide_in` adds the theme's own body-lock class on `<html>` (Impact:
  `lock`; read it from the shop's open drawer) and `slide_out` removes it, guarded by a
  flag so the design never strips a lock the theme set itself. Without it the page
  scrolls behind the sheet.
- **Row fixes that only bite in the sheet.** The base makes `.aw-filter-tag-count`
  `position: absolute` and `span.aw-filter-tag-title` 80 % wide below the breakpoint, so
  "Katoen (11)" splits to the two edges; reset both (`position: static`, `width: auto`)
  when the shop keeps the count next to the label. Group headings take the shop's row
  height through their padding (fixture 17 px → 58 px rows).
- **Known gap to state in the hand-off.** The shop applies filters only on the apply
  button; the design applies on every tick, and apply merely closes the sheet. Matching
  that means rewriting the base's `register_filter` binding — do not; report it.
- **Verify at the shop's phone size (fixture 390×844) by doing:** the sheet's position,
  height and radius equal the shop's; title and × sit where the shop's do; the footer is
  at the sheet's bottom edge with the shop's button sizes; a wheel on the page behind
  moves nothing; × / apply / a tap outside each close the sheet and release the lock;
  clear returns the full result count; then at desktop and just below the breakpoint the
  title, footer and × are hidden and the sidebar matches step 4k unchanged.

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
7. **Tile fidelity, by eye.** Where a native reference exists, put a rendered HR tile next to
   the native tile of the same state at 1440 and 375 px (the FIDELITY CHECK harness in
   `../tile-extractor/references/survey-snippets.md` works on the live page). Same → done.
   Different → a tile problem goes back to `tile-extractor`, a hook is mirrored (step 4), a theme
   rule that cannot reach the design is restated verbatim and rescoped — never a rule that
   re-creates the tile's look. Then **QA.** Run the `pages-qa` skill with the checklist catalogue
   (`../qa-checklists/references/pages.md`): native-reference survey first, the
   test-div browser probe from the pages cheat sheet, four widths (1440/1024/820/375),
   worst-case tiles, measured verdicts. A FAIL verdict is a successful QA run.
8. **Hand-off record.** Run `customer-handoff` (`../customer-handoff/SKILL.md`; record mode, stage `pages`; mandatory — do not ask whether to, do not skip) so the design keys, filters/sorting decisions and any
   workaround land in the customer's living hand-off document under `output/handoffs/` (local for now).

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
     the live category page), e.g. lowest/highest price → `price`, newest/oldest →
     `created`.
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
rendered (*API (JSON) workflow*). On SEO-sensitive stores the API-HTML mode is the default recommendation —
note the store's mode in your report. REST request shapes and tracking events (page-view,
click, `hello_retail_id` bootstrap) are in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/pages/general.md`.

## Hard rules recap

- Draft-only; publishing is a human dashboard step. Never publish/archive/delete.
- Extend, never rewrite: foundation survives byte-identical outside sanctioned edits.
- Comments you add: one short line, only where the code isn't obvious ("doing X because Y").
  `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md` → *Comments in the code you add*.
- Read-back verify every write; 3 strikes → NOT applied.
- Tile body verbatim from the tile skill; no invented classes; no Hello Retail class inside
  the tile; no `hr-product` boilerplate where the design's own wrapper differs. A difference
  after the push is a tile fix, a hook or a restated theme rule — never CSS that re-creates the look.
- CSS authoring: extend a rule that already exists before adding a second one for the same
  selector, never re-declare a value that already holds, and put a new rule in the section that
  already styles that element.
  → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md` → *Writing the CSS itself*
- Settings from real fields + live tool schema — never from memory.
- Integration mode first (Step 0). API-JSON: no template edits, no product conditions
  unless the operator confirms the caller always sends that field. Both asked with the
  `AskUserQuestion` picker when the prompt, the card or the widget hasn't settled them.
- Platform guides exist for Shopify and DanDomain Classic Pages setups — read them
  before touching those platforms (`${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/pages/pages.md` → guides).
