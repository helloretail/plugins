# Search data config — default filters, sorting, content feed, initial content

Steps 13b–13d: the **config-level** search data that lives next to the design fields — filters, sort options, link content (content feed), and initial content. All edited through the `hello-retail` MCP; like `search_updateDesign`, every update tool here edits the existing INTERNAL_REVIEW/REVIEW draft (or forks one from LIVE) and **cannot publish**. All four update tools are **full replacement** — read the current state first and include existing entries you want to keep.

| Concern | Read | Write |
|---|---|---|
| Filters | `search_getFilters` | `search_updateFilters` |
| Sort options | `search_getSorting` | `search_updateSorting` |
| Content feed (link content) | `search_getLinkContent` | `search_updateLinkContent` |
| Initial content | `search_getInitialContent` | `search_updateInitialContent` |
| Content data per type | `dataFields_getContentFields(contentType)` | — |

After every write, **read back and verify**, then report the resulting table to the operator.

## Default filters & sorting (Step 13b)

The list comes from **core-intake Q2** (SKILL.md → *Core intake*) — the operator's pick from `availableFields`, in their order. The basic set below is the **fallback**, applied when the operator answers "defaults" or picks nothing. Titles and direction texts come from `translations.json` **before anything else** — the sort labels are filed as `sort: Lowest price` / `sort: Highest price`, the filter titles under their English names; the key table is in `references/localization-header.md` → *Search-data strings*. Only a string the file doesn't have is translated by you (or taken from the storefront's own wording), and it is marked as such in the translation table shown with the diff.

```json
// search_updateFilters
[
  { "field": "hierarchies", "title": "<locale: Categories>" },
  { "field": "price",       "title": "<locale: Price>" }
]

// search_updateSorting — price only, both directions
[
  { "field": "price", "ascendingText": "<locale: Lowest price>", "descendingText": "<locale: Highest price>" }
]
```

What the file gives — da: `Kategorier` / `Pris` / `Laveste pris (lav til høj)` / `Højeste pris (høj til lav)`; de: `Kategorien` / `Preis` / `Niedrigster Preis (Preis steigend)` / `Höchster Preis (Preis fallend)`; nl: `Categorieën` / `Prijs` / `Laagste prijs` / `Hoogste prijs` (the first of the file's `/`-separated options). Use the file's value exactly — the brackets are part of it.

- **When the existing config is empty** (fresh scaffold, or a config just created via `search_createConfig`): write the Q2 pick directly — or the default set on "defaults".
- **When it's non-empty**: the update replaces the whole list — fold the existing entries in, or ask the operator before dropping anything (`AskUserQuestion`, header `Existing`: *Keep the existing entries as well (Recommended)* / *Replace them with the pick* — the entries that would be dropped in the description).
- **When the other device's config already exists on the website** (`search_listConfigs` lists a desktop config while you build mobile, or the reverse): read the sibling's `search_getFilters` / `search_getSorting` / `search_getLinkContent` and open Q2/Q3 with the `Sibling` picker — *"same as <desktop|mobile>, or different?"*, options *Same as <desktop|mobile>* / *Different — I'll pick*. "Same" → copy its filters, sort options and link content verbatim into the new config (titles already localized; `sorting_selectors` / `size_selector` re-expressed in the new variant's wrapper form — `references/filter-sorting.md`, which also says what to flag when the sibling's A→Z set includes Category, Size or number filters; the hierarchy boolean and M2 are still asked). "Different" → the normal menu. Offer, never assume — a customer can legitimately want fewer filters on mobile.
- **Q2 not answered on the card → show the menu, then ask.** `search_getFilters` and `search_getSorting` each return, besides the current entries, `availableFields` — every field the website can filter/sort on (standard HR fields + extraData fields indexed for search). Present that list in chat, numbered, with each field's type — **LIST** (option checkboxes), **RANGE** (min–max slider), **BOOLEAN** (yes/no) — and the current entries marked, so the operator picks from what actually exists instead of naming fields from memory; then the `Filters` picker (*Defaults — Categories + Price* / *Keep the current entries* when there are any / *A different set — I'll list the numbers*; the numbers in order through *Other*, or in a prose follow-up) and the `Sorting` picker (*Price ascending + descending* / *Keep the current sort options* when there are any / *A different set — I'll list them*) in the same call as Q3 (`Content`). The A→Z set and the size filter follow in the call after, the picked LIST filters as their options (`references/filter-sorting.md`).
- **Q2 answered on the card → validate, don't trust.** Every named field must appear in `availableFields`; a field that isn't there is a MISSING DATA line with an indexing offer (`dataFields_updateProductFieldsIndexing`, then re-read), **never a near-match substitute** ("Color" is not `extraData.colour` until the operator says so). BOOLEAN fields require localized `trueText` / `falseText` in `search_updateFilters`; in `search_updateSorting` a direction is offered exactly when its text is given, so supply text only for the directions the operator wants. **Flag fields that are empty in the feed** — a null `brand` produces an empty facet (config can be set up ahead of the feed team, but say so).
- Filter on the field the tile **displays** — e.g. if the tile shows `price`, don't range-filter on `priceExVat` (and vice versa), or slider bounds won't match visible prices.

## Content feed / link content (Step 13c)

Content search renders matching **categories, brands, site pages, blog posts** as links next to product results.

**The rule: content feed is core-intake Q3.** Add exactly the types the operator named; on "none", leave it empty. If the card didn't answer Q3 it goes into the batched ask together with Q2 — `AskUserQuestion`, header `Content`, `multiSelect`: *Categories* / *Site pages* / *Brands* / *Blog posts* (none recommended; no content feed → *Other*: "none"), and when Categories is picked, header `Hierarchy` in the call after: *No path* / *Show the parent › child path under each category link* — never silently skip, never silently add, never ask it on its own turn.

```json
// search_updateLinkContent — full replacement, include existing entries
[
  { "contentType": "CATEGORY",  "count": 6, "title": "<locale: Categories>", "subtitle": "<locale subtitle>" },
  { "contentType": "SITE_PAGE", "count": 6, "title": "<locale: Pages>",      "subtitle": "<locale subtitle>" }
]
```

- **Omit `engineId`** — the website's existing engine for that type is reused, or a default one is auto-created. After the first write, read back and pin the returned `engineId` in later updates.
- **Titles from the file, subtitle localized explicitly.** The titles are in `translations.json` (`Categories`, `Brands`). The subtitle is not — and when you omit it, the API fills an **English** default ("Use search to explore Categories") even on a non-English site. So translate the subtitle yourself (nl pattern: "Gebruik de zoekfunctie om categorieën te ontdekken") and mark it `self-translated — no entry` in the translation table.
- **Verify data exists per type** with `dataFields_getContentFields(contentType)` and the storefront survey; a type with no content behind it renders its no-content state on every query. Config-before-data is fine, but flag it.
- Each content type at most once; `count` default 6 fits the content column.
- The overlay's content column strings (`text_go_directly_to`, `text_category_no_content_*`) are part of the Step-12 localization — the titles here are what renders as the section headings.
- **`show_vertical_link_content` (resultTemplate boolean — core-intake **M2** on mobile: categories as their own tab vs the horizontal strip; `references/mobile-toggles.md`) must be `true` for a content-feed type to render as a reliable, always-visible tab.** With it `false` ("horizontal" mode), the base template statically hides the `product-tab` button and the JS-driven `toggle_tab_visibility()` only reveals each tab once its content type has real, non-initial-content results for the current query — so a content-feed tab (e.g. Category) can appear to "not be its own tab" or flicker in/out depending on what's typed, even though the MCP config is correct. Setting it `true` renders every configured content type as a stable top-level tab (`Produkter | Kategorier | ...`) from initial load. Field-proven on store-B, 2026-08-25 — the operator specifically asked for Category as a separate tab, and toggling this single boolean (no template/JS change) was the fix.
- **Hierarchy path under category links — `show_category_content_hierarchy` (Q3 sub-answer, categories only).** The base Liquid already renders each category link's parent › child path inside `.hr-search-hierarchy-wrapper`; the CSS hides it until `{# boolean show_category_content_hierarchy = true #}`. The boolean is declared in **`resultStyles` (search.css) in all three variants — not in the Liquid** — so flip it there, in the `{# Section content tab #}` block near the top of the CSS field:

  ```liquid
  {# Section content tab #}
  {# boolean show_category_content_hierarchy = false #}   ← set to true when the operator wants the path
  {# color content_icon_color = "#232324" #}
  {# color content_hierarchy_text_color = "#74757b" #}
  ```

  Value edit only — never delete or move the declaration, never add a second one, and don't touch the `{% if show_category_content_hierarchy %}` CSS block it gates (base chrome). Default `false`; set `true` only when CATEGORY is in the content feed and the operator said yes; grep `resultStyles` for the declaration before editing rather than assuming its line. Don't confuse it with the Categories *filter* tree (`hierarchies`, Step 13b) or with mobile's `show_vertical_link_content` above — that one is a `resultTemplate` boolean.

## Initial content sizing — ask, with the shop's grid as the recommendation (Step 13d)

**Heading alignment: centered.** The initial-content heading and its italic subtitle share one token, `initial_content_header_alignment`, whose base default is `"left"` — set it to `"center"` in every design that declares it (a value edit on a declared token, never a new declaration). **The token alone does not centre anything when the initial panel is `align-items: flex-start`** (the panel is a flex column, so the heading and subtitle shrink to their text and `text-align` has no room to act — field case: computed `center`, heading still visibly left). Whenever the build left-aligns the initial panel, also append `.hr-overlay-search .hr-results .hr-products.initialcontent .hr-products-header.hr-initial-content-header, .hr-overlay-search .hr-results .hr-products.initialcontent .hr-initial-content-subtitle { align-self: stretch; }`. **Prove it rendered:** the heading text's horizontal centre must equal the panel's centre (±2px) — computed `text-align` alone is not the test. Once a query is typed the heading moves (`.hr-moved`) and is left-aligned by its own base rule; say so in the report if the operator wants both alike.

The initial content ("before you search" panel) is the first thing a shopper sees, so its grid should read like the shop's own category grid. **The operator decides; you work out the recommendation from the survey.**

**Measure during the survey,** on the category page at desktop viewport:

- tiles per row in the shop's product grid;
- whether a **filter sidebar** sits next to the grid, and roughly how wide it is;
- the tile's rendered width (`getBoundingClientRect().width` on the tile root) — the same measurement `product_tile_width` uses (`references/shell-structure.md`), take it once.

**Work out the recommended layout:**

- **Columns** = the shop's tiles per row, **+ 1 when the category page has a filter sidebar** about a tile wide — the initial panel has no sidebar, so that width becomes another tile. (Field case, store-DK-2 2026-10: 4 tiles of 250px plus a sidebar → 5 per row, not the 4 a width rule picked.)
- **Count** = columns × 2 rows (5 per row → 10 products).

**Ask once the survey has measured the grid** — round 2 runs before the survey, so this question comes after it, in the same call as the tile skill's open questions when there are any, and always before the push — `AskUserQuestion`, header `Initial grid`: the calculated layout first, "(Recommended)", the measurement in its description (*"shop: 4 per row + filter sidebar, tiles 250px"*); the base layout second (*10 products, 5 per row*) when it differs, or the next-smaller grid when it doesn't; *Other* for anything else. **No operator to answer, or the question skipped → apply the calculated layout** and list it under *Applied defaults*.

**Count change:** `search_getInitialContent` first, then `search_updateInitialContent` with the existing entry — set `count`, **keep `productSources` as-is** (default: retargeted products filled up with top products), and set the title and subtitle from `translations.json` (`Popular products` / `Top 10 most popular products`; the seeded default is English, and "Before you search" has no entry in the file).

**The width cap — why the base can't always deliver the columns.** The base CSS centres the initial panel at `max-width: 1200px` (`.hr-overlay-search .hr-results .hr-products.initialcontent`), and its grid is `auto-fill` with `product_tile_width` as the minimum. Wide tiles therefore render fewer columns than the count suggests: five 250px tiles plus gaps don't fit in 1200px, and 10 products came out 4 + 4 + 2 on a real build. So whenever the chosen columns differ from what the base renders, append this to `resultStyles` next to the TILE FILL rule — scoped to the initial-content state, so search results keep the base grid:

```css
/* Initial content: <N> per row like the shop's grid */
.hr-overlay-search .hr-results .hr-products.initialcontent {
	max-width: <columns × tile width + gaps + 40px padding>px;   /* only when 1200px is too narrow */
}

.hr-overlay-search .hr-products.initialcontent .hr-products-container {
	grid-template-columns: repeat(4, minmax(0, 1fr));
}

@media (max-width: <width where N columns get narrower than the shop's tile>px) {
	.hr-overlay-search .hr-products.initialcontent .hr-products-container {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
}
```

`minmax(0, 1fr)`, not plain `1fr`: a `1fr` track may grow to its widest item, so a tile with a non-wrapping title makes the four columns uneven (see *Grid tracks* in `references/shell-structure.md`).

Without the override, `count: 8` renders 5+3 — a full row and an orphan row — which looks broken; **whenever you set 8 products, ship the 4-per-row CSS with it** (field-proven on store-NL-1, 2026-07). This is a sanctioned `resultStyles` edit in the same spirit as TILE FILL: structural grid compensation, not tile styling.

## Self-check

- [ ] Filters read before write; default set (Categories + Price) applied when empty; existing non-empty config folded in or confirmed with the operator; titles localized.
- [ ] Sorting = price asc/desc with localized texts (unless the operator asked for more).
- [ ] Q2 not on the card → the `availableFields` menu (field + LIST/RANGE/BOOLEAN, current entries marked) was shown before asking; every configured field exists in `availableFields`; unknown fields → MISSING DATA + indexing offer, never substituted; BOOLEAN entries carry localized true/false texts.
- [ ] Content feed: the Q3 answer added verbatim (or left empty on "none"); if Q3 wasn't on the card it was in the batched ask, not assumed; titles from `translations.json`; subtitles explicitly localized (never the English auto-default) and marked self-translated; empty-data types flagged.
- [ ] `show_category_content_hierarchy` set `true` in `resultStyles` only when CATEGORY is configured and the operator asked for the path; left `false` otherwise.
- [ ] If any content-feed type must show as its own reliable tab, `show_vertical_link_content = true` is set in `resultTemplate` — `false` gates tabs behind "has real results" and can make a correctly-configured content type look like it isn't a separate tab.
- [ ] Shop's tiles per row, filter sidebar and tile width measured; the `Initial grid` question asked with the calculated layout as "(Recommended)" (or that layout applied and listed under *Applied defaults* when nobody answered); count fills whole rows; the column override (and `max-width` when 1200px is too narrow) appended whenever the base wouldn't render the chosen columns; tiles per row counted on the rendered panel after the push.
- [ ] Initial-content title and subtitle, sort labels and filter titles taken from `translations.json` where it has them (`references/localization-header.md` → *Search-data strings*).
- [ ] Every write verified with a read-back and reported to the operator.
