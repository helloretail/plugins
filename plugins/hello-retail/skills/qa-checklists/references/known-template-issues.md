# Known template issues — the standing defect catalogue

Template-level defects that recur across customers and platforms because they live in the
**shared base templates**, not in any one onboarding. Every QA run walks this file so that
recurrence never depends on rediscovery — the cross-card manual-vs-Claude comparison
(2026-08-24, QA team) found the typed-price-filter bug manually on five domains across five
platforms and by the skills on zero, and the thousands-separator bug root-caused on four
domains yet missed on two others in the same period.

**How this file is used (wired into `../SKILL.md` Step 3):**

1. **PRE-QA — every run, every feature.** Read this file and append every entry that applies to
   the feature under QA to the coverage manifest (source: `known-template-issues`). Each gets a
   per-site verdict like any other item: **verified (reproduces)** / **not reproduced** /
   **N/A** (feature absent) / **SKIPPED** (with reason).
2. **REPORT — the "Known template issues" NOTE section.** Every report carries a NOTE block
   listing the standing entries with their per-site status. Entries here are *template-level*:
   when one reproduces, tag it `template-level — inherited from the default template` (Step 3
   attribution rule), route it to the base-template owners' sub-block, and keep it out of the
   onboarding's defect counts — the onboarding didn't introduce it.
3. **POST-QA — log new template-level finds back here.** When a run's attribution check traces
   a defect to the shared base (identical code in the design a fresh `search_createConfig` attaches, in
   `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/`, or in an untouched `standard: true` design), add an entry: defect, feature(s), how to verify, date + first
   domain class observed. Generic content only — **no customer SKUs, prices, or per-customer
   code** (the no-customer-data rule); per-site reproduction status lives in the per-customer report
   under gitignored `QA/`, never in this file. An entry is **retired** (moved to the Retired
   section, never deleted) when the fix ships — upstream in Hello Retail's default design (Search), or in the wiki's base files (Recommendations and emails).
4. **Accepted template defaults (D-entries, below) are the opposite of a defect.** They are how the
   default template is meant to behave, confirmed by the QA team. Never put one in the bug list
   or the defect counts; record it as **ACCEPTED** in the NOTE block, one line, with the viewport.
   Only a **deviation from the described default** is reportable (the control is missing, broken
   or visibly different from what the entry says).

---

## Standing entries — walk these on every run

### T1 · Typed price-filter input is dead (only slider drag registers)

- **Features:** Search, Pages (any design using the shared `ui_utility.register_filter` price
  component).
- **Verify:** type a value into the price **min** and **max** fields, then **blur AND press
  Enter** (both paths) — the result set must change. Dragging the slider working is not a PASS
  for this item; the typed path is the defect. **Then run the two-field sequence:** type min,
  Tab, type max, Tab — and again in the reverse order (max first, then min) — then repeat both
  orders confirming each field with **Enter** instead of Tab. Both values must stay set, and
  the dropdown must not close or apply after the first field (a filter that closes after one
  field leaves the second one impossible to set, and a second attempt can clear both). Run it
  at **every viewport** (1440, 1024, 820, 375) and check the input boxes are not cut off.
  "Not reproduced" is only a valid verdict after **both orders, with Tab and with Enter**, pass.
- **Not this item:** the dropdown closing after a **slider drag** is released is expected
  behaviour — never report it. Closing or applying after **one typed field** is this entry:
  it goes in the report's standing "Known template issues" NOTE block, not the bug list.
- **Origin:** found manually on 5 domains / 5 platforms, never by a skill run (2026-08-24
  comparison). Base fix (wiring the inputs to the slider's handler) is parked with the
  base-template owners.

### T2 · Custom/extraData-filter applied-state chips missing

- **Features:** Search, Pages.
- **Verify:** apply one **custom/extraData** facet (length/width-style, not a standard
  brand/size facet) — the applied-state chip must render in the selected-filters row and must
  be clearable. Standard facets rendering chips is not a PASS for this item. **Mobile filter
  panel:** no chip row exists by default (D4) — grade this on desktop only.
- **Origin:** custom facets bypass the standard selected-filters render path (store-NL-2,
  2026-08).

### T3 · Facet ordering not alphabetical / not size-logical

- **Features:** Search, Pages.
- **Verify:** open **every** facet and record its option order — sizes in logical
  S-M-L(+numeric) order, Category following the hierarchy, and the other option lists
  graded against the **agreed** order. Whether options should be alphabetical is
  customer-dependent: take it from the card, else from the operator question at the start
  (`../SKILL.md` Step 1.5), and grade against that answer. **Check the card comments FIRST:**
  some customers order a custom sort that must NOT be "fixed" to alphabetical (real case: a
  customer's custom size order, explicitly protected in comments — blind alphabetical sorting
  would have broken it). Ticket-covered order → PASS (by spec).
  **Out of scope:** the order of the filter **groups** (headings) — set by usage, never graded
  or reported — and the sorting control's own options — they follow the configured order
  (default sort first) and are never alphabetised, so neither is a T3 finding.
- **Origin:** caught on 2 cards, missed on 5 with the same defect class (2026-08-24 comparison).

### T4 · Discount/sale labels bleed over opened filter panels (z-index)

- **Features:** Search, Pages.
- **Verify:** with tiles carrying discount/sale labels in view, open each filter
  panel/dropdown — nothing from the result grid may paint over the open panel. Screenshot on
  reproduction.

### T5 · Thousands separator / unconditional currency suffix on prices

- **Features:** Search, Recoms, Pages — plus cart-recom JS that re-parses rendered totals.
- **Verify:** already fixture-driven — run the Step 2.5 **max-price** and **decimals/øre**
  fixtures through every surface, and read the emit site in the code pass (`<del>`/`<ins>`
  branches separately). In JS, trace any `.replace(",", ".")`-style parse chain against a
  hand-written ≥1.000 total.
- **Origin:** root-caused on 4 domains, missed on 2 others in the same period — the fixture
  discipline exists precisely so this never depends on which products a run happened to sample.

### T6 · Page scroll-lock survives closing the search overlay

- **Features:** Search (desktop AND mobile configs).
- **Verify:** open the overlay, interact (type, filter), close it — then **scroll the page**.
  A page that no longer scrolls is Blocker-grade (real case: store-G mobile — the severest
  manual find on that card, absent from every comment thread; only the rendered check sees it).

### T7 · Stray popup / oversized image on back-navigation from a PDP

- **Features:** Recoms, Search.
- **Verify:** open a PDP from an HR tile, press browser Back — the restored page must show no
  stray large-image popup and no oversized tile image (bfcache restore re-runs lazy-load/slider
  JS badly). Same bug hit two unrelated shops (store-F, store-CH). The flash can last a
  fraction of a second, so take a **rapid screenshot burst** right after Back and right after
  removing an applied filter; any hint of an oversized image is recorded as "possible flash —
  needs a manual look" on the operator list, never as "not reproduced".

### T8 · OOS products served inside recoms with a clickable ATC

- **Features:** Recoms.
- **Verify:** rendered scan of every sampled box for `inStock: false` products (cross-check
  suspicious tiles via `productData_get`); any OOS tile must carry the sold-out state with ATC
  disabled — "never show OOS in recoms" is a standing HR rule, not a judgment call. The
  dashboard OOS-filter/boost setting itself stays OPERATOR; the rendered symptom is checkable.

### T9 · Removing one applied filter removes the wrong one (or leaves the price filter behind)

- **Features:** Search, Pages.
- **Verify:** apply the **price filter plus two other filters**, then remove each applied
  filter **one at a time** (once per filter, each from a fresh set of three). Only the filter
  you removed may go: the other two must stay applied, the result set must match what is left,
  and the price filter must not stay behind while a different filter disappears. Then remove
  the chips **in a different order** and flag any chip that needs **two clicks** to go.
  "Clear all" working is not a PASS for this item — the single-removal path is the defect.
  On the mobile filter panel there are no chips (D4): un-tick each applied option instead.
  **Mandatory, never skipped**, on desktop **and** on tablet/mobile.
- **Origin:** found manually, never by a skill run — runs only exercised "clear all" and the
  filter counts.

---

## Accepted template defaults — record as ACCEPTED, never report

Behaviour of the **default Search template's mobile filter panel** (the config served at ≤992 px,
so 375 and 820) that looks like a defect but is how the template is built — confirmed
not-an-issue by the QA team. Walk each one, note it as `ACCEPTED (default template)` with the
viewport, and keep it out of the bug list, the defect counts and the fix list. They are *not*
T-entries: nothing is wrong, so nothing goes to the base-template owners.

### D1 · The reset button ("Clear all" / "Nulstil alle") is pure red in the browser's default font

- **Features:** Search (mobile / tablet-served-by-mobile config).
- **Looks like:** the reset button in the filter panel is `#ff0000`-style red, in Arial or the
  UA default sans-serif, not the shop's font and brand colour.
- **Still reportable:** the button is missing, does nothing, or does not reset the filters
  (and, per the checklist, the sorting) — function is graded as normal. Only its colour and
  font are accepted.

### D2 · The filter-button count badge also counts the active sort

- **Features:** Search (mobile / tablet-served-by-mobile config).
- **Looks like:** with 3 filters and a sort applied the badge on the filter button reads 4.
- **Still reportable:** a badge that is missing, not updated when a filter is added or
  removed, or that disagrees with the applied filters by more than the sort.

### D3 · Stray scroll-arrow glyphs in the filter panel

- **Features:** Search (mobile / tablet-served-by-mobile config).
- **Looks like:** small grey scroll arrows at the bottom of the price block and of the panel.
- **Still reportable:** anything that overlaps text, a control or an option, or hides one.

### D4 · No applied-filter chips in the mobile filter panel

- **Features:** Search (mobile / tablet-served-by-mobile config). **Desktop is not covered** —
  the desktop design renders the selected-filters row and T2 / T9 apply there as written.
- **Looks like:** nothing shows which filters are applied except the checked options and the
  count badge (D2).
- **Consequence for T2 and T9:** with no chip row on mobile, do not grade chip rendering. Run
  the T9 sequence through the panel instead — un-tick each applied option one at a time, same
  three-filter set, same order change — and grade the same outcome (only that filter goes,
  the price filter does not stay behind, one action per filter).

### D5 · Focus leaves the price field after typing the min value

- **Features:** Search (mobile / tablet-served-by-mobile config).
- **Looks like:** type a min price, press Tab, and `document.activeElement` is the page body
  instead of the max field, so the max field has to be tapped.
- **Still reportable (T1 is unchanged):** the typed value must still register — both values
  stay set, the dropdown does not close or apply after the first field, and the result set
  changes. Only the lost focus itself is accepted. This is the **price** field; losing focus
  in the **search** input while typing stays a defect.

---

## Retired entries

*(none yet — move entries here with the date and the base-template change that fixed them)*
