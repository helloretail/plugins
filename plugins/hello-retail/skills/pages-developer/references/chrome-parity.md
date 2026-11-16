# Chrome parity — sidebar, top bar, sort control and the phone filter drawer

Read *Chrome parity* on every build (step 4k), and *Phone filter drawer* when the shop's own drawer is a bottom sheet (step 4l). Step numbers in this file are the workflow steps of `../SKILL.md`.

## Chrome parity (step 4k)

**Chrome parity — the sidebar, the top bar and the sort control are the shop's too.**
4b/4e/4f match the grid; everything around it still renders as the base design's own
chrome, so the page reads as Hello Retail's even with a perfect tile. Field-proven
2026-09-29 on a Shopify Impact theme. Give the chrome the same measure → value-swap →
verify treatment, at the shop's own change points (this fixture: sidebar only ≥ 1000 px):

- **Left sidebar.** Measure the shop's sidebar width and its gap to the grid (fixture
  305 px + 32 px) and swap `.hr-filters-container` flex-basis/max-width and
  `.hr-results-container` margin-left/flex-basis to them. **Measure it in every band where
  the sidebar shows, not only at desktop:** walk the same width ladder as 4b (1440 → the
  sidebar breakpoint) and record width + gap at each step. A shop often narrows the
  sidebar before it hides it (field case 2026-10, Shopify Enterprise theme: 273 px + 32 px
  at 1024 px, wider at desktop), and a desktop-only measurement ships the desktop width
  into that band. Each band's values go in that band's `@media` block. Then the rows: the title row
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
- **Verify by computed style, not by screenshot**, at the shop's desktop, at every width
  where its sidebar width changes, and both sides of its sidebar breakpoint (fixture
  1440 / 999 / 390): sidebar width and gap, title and
  heading font, option row pitch, checkbox size, pill size and gap, sort weight and panel
  width, and the vertical rhythm heading → pills → grid (fixture 16 px and 48 px). A 10 px
  spacing difference is invisible by eye and obvious in numbers.

## Phone filter drawer (step 4l)

**Phone filter drawer — a bottom sheet, when the shop's is one.** Below the mobile
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
