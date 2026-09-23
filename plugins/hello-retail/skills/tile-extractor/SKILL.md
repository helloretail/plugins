---
name: tile-extractor
description: >
  Extract a customer's live product tile and convert it into a production-ready Hello Retail Liquid
  template + JavaScript for an onboarding. Visits the live category page via the Playwright MCP
  (Claude in Chrome is the fallback when it isn't available), detects the platform (Shopify,
  Magento, WooCommerce, Shopware, DanDomain, Lightspeed, PrestaShop and other webshop platforms),
  surveys every tile variation (sale, sold-out, badges, ratings, swatches, hover images), maps each
  element to the HR feed with a parity table, and returns the Liquid tile body plus ATC / rating /
  slider JS — never CSS. Use whenever someone wants to build or convert a Hello Retail product tile,
  a ".hr-product" tile, a dynamic tile template, or to turn a live storefront card or static HTML
  tile into HR Liquid. This skill produces the tile BODY that search-developer, recom-developer and
  pages-developer drop into their shells.
model: sonnet
---

# Hello Retail — Product Tile Extractor & Converter

Full end-to-end workflow: visit a live category page, extract the exact tile HTML, map every element
to the Hello Retail feed, and return a production-ready Liquid template + JavaScript.

This file is the procedure and the hard rules. Everything long — the full text of each rule, the
browser policy, the detection snippet, the survey snippets, the field-level Liquid rules, the
platform quirks — lives in `references/`; the table at the end says which file to read before which
step.

---

## What you need before starting

| Input                  | Example                                | Notes                                                                                                                                      |
| ---------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Live category-page URL | `https://shop.example.com/c/shoes`     | A page with multiple product tiles, not the homepage. If no browser MCP is available at all, the operator pastes the raw tile HTML instead (see `references/browser.md`). |
| Feed access            | `website-uuid` **or** pasted feed JSON | With a `website-uuid`, fetch real fields via the hello-retail MCP `productData_get`; otherwise the operator supplies feed rows.             |
| Target surface         | `search` / `recom` / `pages` / `newsletter` | What the tile body is being built for — set by the caller skill. `search` and `recom`: markup + JS, no CSS. `newsletter`: markup only (rendered to an image, no JS runs). |
| Locale                 | `da`, `sv`, `de`                       | For the label sweep word list and any static fallback text. The caller passes it; otherwise infer from `<html lang>`.                      |

If any of these are missing, ask before proceeding — unless you are running as a subagent (see
*Running as a subagent* under RESPONSE FORMAT), in which case you work with what you were given and
list the gap under OPEN QUESTIONS.

---

## BROWSER — Playwright default, Claude in Chrome fallback

All live-site inspection goes through a real browser MCP. **Playwright is the default**
(`mcp__plugin_hello-retail_playwright__browser_*`); **Claude in Chrome is the fallback**
(`mcp__claude-in-chrome__*`) when no `playwright*` server exposes tools. Tool names in this file are
the Playwright ones; the fallback equivalents, the login and mobile-viewport rules, and the
pasted-HTML mode for when neither MCP is connected are in `references/browser.md`.

Three prohibitions hold on every backend:

- **Never** read the storefront with WebFetch, curl or any HTTP client — tiles are client-rendered.
- **Never** type credentials; a logged-out Playwright session is the operator's to fix (`browser-login`).
- **Never** drive any my.helloretail.com page — dashboard data comes from the `hello-retail` MCP.

---

## OUTPUT RULES — NON-NEGOTIABLE

The short form. The full text, with the reasons and the field cases behind each rule, is
`references/output-rules.md` — read it once per build, before step 8.

1. **Always deliver both HTML (Liquid) and JavaScript** — never one without the other.
2. **Never output CSS.** The site stylesheet styles the tile; anything the tile needs from CSS is *reported* under `PARENT HOOKS`, `ALIGNMENT` and `SHELL CSS NOTES`, and the shell writes it. Documented exception: CSS-in-JS storefronts (MUI/Emotion, styled-components) ship a self-contained `CSS BLOCK` — `references/centra.md`.
3. **Never add comments** — no `{% comment %}`, `{# #}` or `/* */` anywhere in the output code.
4. **Never hardcode currency** — `{{ product.currency | currencySymbol }}` or `| priceWithCurrency: product.currency`.
5. **Every ATC `<form>` has an `action` attribute.**
6. **Never skip or omit a tile element.** Missing feed data → a harmless static fallback plus a note in the response text. Two exceptions: a fallback that would mislead (a different colour's packshot as hover image) is omitted with operator approval; Viskan / Streamline wishlist stars are omitted by design.
7. **Unsure about an element's data source → say so in the response**, and still include the element with your best guess or a fallback.
8. **Restore every URL attribute** stripped during extraction (`src`, `href`, `srcset`, `data-src`, `data-image`, …). All image URL attributes bind to `{{ product.imgUrl }}`; never rewrite a URL per platform (`_400x`, `?width=`); compare the feed image's natural width with the rendered tile width and flag full-size feed images under MISSING DATA.
9. **Never change element types** — a native `<button>` stays a `<button>`, an `<a>` stays an `<a>`.
10. **Preserve every `id`, `class`, inline `style` and attribute verbatim**, swapping only dynamic values. The complete strip list: attributes the site did not author (browser-extension and security-tool stamps such as `bis_skin_checked` — provenance decides, never familiarity); on the outermost tile element only, every class or inline declaration whose only job is column width or position (Rule 14); Shopify `section-id` / `data-section-id`; framework loading-state inline styles normalised to the loaded state. Nothing else is ever dropped — when unsure, keep it.
11. **HR cart tracking on every add-to-cart button, and only there:** `onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"` — prepended to an existing `onclick`, never added to variant / view / sold-out CTAs or the tile links (`fix_links` covers those).
12. **Report the native content alignment** (computed `text-align` of title, price, description) as the `ALIGNMENT` line — the shells centre by default and must be told otherwise.
13. **Keep every control the native tile has** (quick view, notify-me, compare, wishlist, size pickers) in the markup; whether it is wired is the shell's decision.
14. **The tile root is the per-product card, never the grid cell around it, and the shell owns the width.** The shell's own cell replaces the customer's cell: drop the cell element and report any of its classes the tile's CSS needs under PARENT HOOKS as cell-level. Width and position classes on the root go (Rule 10) even when they also style the card — if the card then breaks in the visual check, say so under OPEN QUESTIONS. An `<li>` root stays an `<li>` and gets `style="list-style-type:none;"` added, because the shell's container is a `<div>`.

---

## WORKFLOW — ALWAYS FOLLOW THIS ORDER

Tool names below are the Playwright ones; on the Claude in Chrome fallback use the equivalents from
`references/browser.md`. **Every snippet in the references uses placeholder selectors**
(`.product-tile-selector`, `.title-selector`, `.tile-root`, `.tile-main-img`, `.swatch-strip`,
`.product-card`) — replace each with the selector you found in step 3 before running it; a literal
run returns nothing.

1. **Detect the platform** — `browser_navigate` to the site, then run the detection snippet in `references/platform-detection.md` (scripts, meta, globals, markup). Record every hit under `PLATFORM`, then read the platform's file from that reference's routing list before writing the ATC form, rating widget or ATC JavaScript.

2. **Navigate to a real category page** — `browser_navigate` to a page with multiple product tiles, not the homepage.

2b. **Sweep blocking popups before reading anything** (canonical rules: `../qa-checklists/SKILL.md` → "First-load popup sweep"). ACCEPT the cookie/consent banner by clicking its real accept button — never decline and never JS-delete the overlay: prices, lazy images, and HR itself are often consent-gated, and a swept-away-but-unanswered banner silently yields a wrong tile survey. Close newsletter/discount popups via their ✕ (never enter an email). Answer region/language pickers with the market matching `category-url`, then re-verify the URL didn't redirect. The default `playwright` server and the workers run **isolated** sessions, so the sweep repeats in every new session (only `playwright-profile` and Claude in Chrome remember answers). Popups still open during extraction also contaminate the DOM dump — confirm none are open before step 3.

3. **Copy the tile HTML verbatim** — pick a clean specimen, settle it, then capture its `outerHTML` via `browser_evaluate` (`references/survey-snippets.md` → TILE INSPECTION; the `collect()` walk only on the Claude in Chrome fallback). Decide the tile root with the ancestor-chain probe (Output Rule 14): the per-product card, never the grid cell around it. URL values come out as `[URL:<attribute>]` tokens — every one MUST be restored with the correct HR feed value in the final Liquid output (Output Rule 8) — and the snippet reports the injected attributes it removed; list them under ASSUMPTIONS.

3b. **Scan the extracted markup for template-syntax collisions** — `{{`, `{%`, `{#`, and Alpine/Vue attributes (`x-data`, `x-text`, `:class`, `@click`, `v-if`) whose values contain braces. Hello Retail's Liquid parses `{{ … }}` and `{% … %}` inside the template, so such markup breaks or renders empty. See *Native template syntax in the markup* in `references/liquid-rules.md`.

4. **Survey ALL tiles on the page** — find every variation: sale badge, sold-out, labels, ratings, swatches, hover images (`references/survey-snippets.md` → TILE SURVEY). For every badge decide **DOM element or baked into the product image**: a label with no text node in the tile's DOM is part of the image, travels with `imgUrl`, and needs nothing — record it as *baked into image* in VARIATIONS so QA does not report it missing.

4b. **Detect ancestor-scoped CSS** — check whether the tile's styling requires ancestor classes that won't exist inside the HR container, and report them as PARENT HOOKS (`references/survey-snippets.md` → ANCESTOR-SCOPED CSS; who writes what: `references/css-ownership.md`).

4c. **Check tile content alignment** — read the native tile's computed `text-align` and report it as an ALIGNMENT line so the shell can match it (`references/survey-snippets.md` → TILE CONTENT ALIGNMENT).

4d. **Check image sizing** — compare the feed image's natural width with the rendered tile width (Output Rule 8); flag full-size feed images.

5. **Check third-party widgets** — inspect how ratings actually work (Loox, rateit, Lipscore, Yotpo, etc.) and what the native ATC / quick-view / wishlist controls are bound to (`references/rating-widgets.md`).

6. **Check price format** — separators, decimals, symbol position, symbol in DOM text or CSS pseudo-element, a trailing `,-`, incl./excl. VAT pairs, "from" prices on variant products, unit prices (per kg / l), a lowest-30-day (Omnibus) price next to sale prices.

6b. **Label vocabulary sweep — survey the dedicated label pages, not just the reference category.** Most shops concentrate labels on dedicated pages: "New" on the New Arrivals page, discount/sale tags on Sale/Offers/Outlet, "Bestseller" on Top sellers — the reference category may show none of them. From the main navigation, open each such page, re-run the tile survey there, and capture every label type's design + variations (`references/survey-snippets.md` → LABEL VOCABULARY). Labels found only on these pages are still tile variations — the template must render them.

7. **Map feed fields & produce a parity table** — pull 3–5 `productData_get` rows (one per tile state found) and, for every native tile element **including every label type from the 6b sweep**, record the feed field and one of: ✓ present · ⚠ field exists but empty (e.g. `brand`, `extraDataList.size`) · ✗ no feed field (e.g. dietary certs, popular/new flags — sale tags map to `product.isOnSale`; "new"/"bestseller" usually need an `extraDataList.*` flag → ✗, flag to the feed team). Check every row of `references/missing-data.md` that the tile needs. Deliver this native-vs-feed table in the response so the feed team knows exactly what to map.

8. **Build the Liquid template** — complete, nothing skipped, no comments, missing data gets a static fallback. Field-level rules: `references/liquid-rules.md`; the full output rules: `references/output-rules.md`; Magento price box, ids and CTA: `references/magento.md`.

9. **Write JavaScript** — ATC form/handler markup hooks, rating init, in-tile sliders. Ship the `MutationObserver` engine (`references/js-engine.md`) **only** for a standalone tile; for `search` and `recom` the shell owns re-init (`fix_links` / `afterInit`).

10. **Return the response in the RESPONSE FORMAT** — every section, exact headings.

---

## RESPONSE FORMAT — the contract the shell skills consume

`search-developer`, `recom-developer` and `pages-developer` read your response **by section
name**. Return every section below, in this order, with these exact headings, even when a section is
empty (write `none`). Code goes in fenced blocks; everything else is short lines. Nothing may exist
only in your own context — if you learned it, it is in one of these sections.

````markdown
### TILE_BODY
```liquid … ```                      ← the complete tile Liquid, verbatim markup, feed fields bound

### JS
```javascript … ```                  ← ATC / rating / in-tile slider hooks the tile needs, or `none — <why>`
                                       (standalone tiles only ship the MutationObserver engine)

### CSS BLOCK
```css … ```                         ← CSS-in-JS storefronts only; otherwise `not applicable — classic theme`

### PLATFORM
- platform: <name> (+ frontend, e.g. Magento 2 Hyvä) · signals: <what matched>
- spa: yes/no · jquery: yes/no
- native ATC mechanism: <form POST to … / AJAX … / custom element … / navigation only>
- rating widget: <lib + global + init fn seen> · other controls: <quick view / wishlist / notify …> and what binds them natively

### PARITY TABLE
| Native element | Feed field | Status ✓ / ⚠ / ✗ | Fallback used |

### VARIATIONS
- one line per state found: normal, sale, sold-out, each badge type (DOM or baked into image),
  rating, swatches, hover image — with one carrier product URL each

### LABEL VOCABULARY
| Label type | Page found on | Carrier products (1–2) | Feed condition |

### PARENT HOOKS
- minimal verified class set for the products container: `…`  (or `none — tile is self-styled`)
- cell-level: classes of the customer's dropped grid cell that the tile's CSS needs: `…` (or `none`)
- `body.`/`#id`-scoped rules that need restating: selector → computed values

### ALIGNMENT
- native tile content is <left|center|right>-aligned (computed `text-align: …` on title/price/description)

### SHELL CSS NOTES
- hover-only: <selector> shown on <trigger>: <declarations>
- tile root: rendered width <N>px · real card / gutter-padded cell · grid <N> columns, gap <N>px
- buy button: background <rgb> · color <rgb>; accent colour <rgb>
- rules that can't reach the tile, preview-only differences, mobile hover behaviour

### MISSING DATA
- one line per missing / empty / unverifiable feed field, with the fallback used and who fixes it

### OPEN QUESTIONS
- decisions the operator must take (raw vs strip, omit misleading element, escape test …)

### ASSUMPTIONS
- anything not surveyed (pasted-HTML mode, pages not reachable, states never seen)
- injected attributes removed by the capture: <names> (or `none`)
````

**Running as a subagent.** The shell skills start you in the background as soon as they have a
`category-url` and a `website-uuid` (or feed rows), and continue their own intake with the operator
while you work. In that mode:

- You have no operator. Never block on a question — take the safe default (strip HTML, omit a
  misleading element, keep an ambiguous control unbound) and put the decision under
  `OPEN QUESTIONS`; the caller relays it.
- Your final message **is** the hand-off. The caller sees nothing else — not your tool calls, not
  the survey. Return the full RESPONSE FORMAT; a heading missing or renamed means the caller treats
  that information as absent.
- Inputs you receive: `category-url`, `website-uuid` or feed rows, `target surface`, `locale`, and
  the platform if the caller already detected it. Anything else you need, infer or list under
  `ASSUMPTIONS`.
- You run **once per customer**, before the first shell build. A Search onboarding that covers
  desktop and mobile builds desktop first, then mobile, from the **same** tile body — the caller
  does not start you again for the second variant. So survey every state and both the desktop and
  a mobile viewport of the native grid in this single run (mobile differences go under
  VARIATIONS / SHELL CSS NOTES).
- Do not write files and do not push anything through the MCP. Reads (`productData_get`) are fine.

---

## QUICK REFERENCE CHEATSHEET

| Rule                 | Correct                                                                                                                   | Wrong                                         |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Output               | HTML + JS always, no CSS                                                                                                  | CSS included / JS missing                     |
| Comments             | None — flag issues in response text only                                                                                  | `{% comment %}`, `/* */`, `{# #}`             |
| Element types        | preserve exact tags from native tile                                                                                      | `<button>` → `<a>`, `<object>` → `<div>`      |
| Attributes           | preserve EVERY `id`/`class`/inline `style`/attr verbatim; strip only injected attributes, root-only width/position classes and declarations, Shopify `section-id` | stripping `id`, `style`, `data-*`, `tabindex` |
| Injected attributes  | remove what the site did not author (`bis_*`, `data-gramm*`, `data-lastpass-*`, …) and anything stamped on nearly every element; keep every site `data-*` | keeping `bis_skin_checked`; dropping Vue `data-v-*` or Alpine `x-data` as "noise" |
| Tile root            | the per-product card; the customer's grid cell is dropped and its needed classes reported as cell-level PARENT HOOKS; an `<li>` root keeps its tag + inline `list-style-type:none` | copying the grid cell into the shell's cell; converting `<li>` to `<div>`; keeping a width class on the root |
| Images               | `src`/`srcset`/`data-src` → `{{ product.imgUrl }}`; flag full-size feed images                                            | rewriting URLs per platform (`_400x`, `?width=`) |
| Classes              | keep the full class list, incl. runtime/JS ones (`lazyloaded`, `lazyautosizes`, `is-loaded`, `active`)                     | dropping "artifact" classes; trusting a static opacity probe to delete one |
| Price filter         | `\| price`                                                                                                                | `\| money`                                    |
| Currency             | `\| currencySymbol`, `\| priceWithCurrencySymbol`, or `\| priceWithCurrency: product.currency` — match the customer's format | hardcoded `kr`, `€`; bare `\| priceWithCurrency` with no argument |
| Stock check          | `product.inStock == false`                                                                                                | `product.inStock != true`                     |
| JSON parse           | `\| jsonParse`                                                                                                            | `\| parse_json`                               |
| extraData boolean    | `== "true"`                                                                                                               | `== true`                                     |
| Sale check           | `{% if product.isOnSale %}` (outlet label only: `priceLowered`)                                                          | `{% if product.oldPrice > product.price %}`; `priceLowered` as a sale condition |
| Price suffix         | static `,-` or a translated "from" word around the filter; suffix on both prices of a sale pair                          | hardcoded currency; `\| remove: '.'`; suffix once after `<del>…<ins>` |
| Unique IDs (general) | `{{ product.productNumber }}`                                                                                             | hardcoded IDs                                 |
| Unique IDs (Magento) | `{{ product.extraData.itemNumber }}`                                                                                      | hardcoded entity number                       |
| Discount %           | `\| minus \| divided_by \| times: 100 \| round`                                                                           | hardcoded                                     |
| Swatch active        | `{% if forloop.first %}`                                                                                                  | hardcoded first item                          |
| Missing data         | static fallback + note in response                                                                                        | silently omit / code comment                  |
| Free text            | descriptions: ask operator `\| rawHtml` (keep HTML) or `\| strip_html \| truncate: N \| escape` (plain text); `\| escape` ONLY inside attributes (`alt`, `aria-label`); title as element text stays bare `{{ product.title }}` | bare `{{ product.description }}` / `\| escape` on title in element text |
| Form action          | always present on every `<form>`                                                                                          | missing or assumed                            |
| Cart tracking        | `onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"` on every ATC button — and ONLY on ATC (never variant/view/sold-out navigation CTAs; `fix_links` covers those) | ATC button without `trackClick` / `trackClick` on a navigation CTA |
| ATC init             | standalone tile: MutationObserver engine; `search`/`recom`: none — the shell re-inits after `fix_links` / `afterInit`     | shipping the observer into a Search or Recom design; per-tile listeners bound at load |
| Double init          | `if (el._hrXxxInit) return;`                                                                                              | none                                          |
| Content alignment    | survey native `text-align`, report ALIGNMENT line; shell matches it in the tile-fill rule                                 | assuming left / letting HR's `text-align: center` cascade in |
| Hover / theme CSS    | report under SHELL CSS NOTES (selector, trigger, computed values); shell writes the rule                                  | writing overlay CSS in this skill             |
| Template syntax      | scan for `{{` `{%` `x-data` `:class` in native markup; keep braces out of the template; flag                             | shipping an untested `{% raw %}`              |
| Response             | all RESPONSE FORMAT sections, exact headings, nothing left in the subagent's context                                      | prose without the named sections              |

---

## Reference files — read before the step named

| File | Read before | What it holds |
| --- | --- | --- |
| `references/browser.md` | any live-site step | The two browser backends, the tool table, login and mobile rules, pasted-HTML mode, the off-limits pages |
| `references/platform-detection.md` | step 1 | The signal table, the detection snippet, and the per-platform routing list (which file to read for which platform) |
| `references/survey-snippets.md` | steps 3–6b | Verbatim `outerHTML` capture (specimen, settle, injected-attribute strip, ancestor-chain probe; `collect()` on the Chrome fallback), the variation survey, the label-vocabulary sweep, the PARENT HOOKS scan and harness, the alignment probe, hover-state inspection |
| `references/css-ownership.md` | steps 4b–4c and the SHELL CSS NOTES section | Who writes CSS on classic vs CSS-in-JS themes, and what to report to the shell |
| `references/rating-widgets.md` | step 5 | How to identify the rating system and where each system's recipe lives; when the generic JS engine applies |
| `references/missing-data.md` | step 7 and the MISSING DATA section | Feed fields that are routinely missing or empty, with the fallback for each |
| `references/output-rules.md` | step 8 | The full text of the 13 output rules with reasons and field cases |
| `references/liquid-rules.md` | step 8 | Field-level Liquid: free text, template-syntax collisions, the four price forms, discount, "from" prices, VAT / Omnibus / unit price, sale vs outlet, labels, JSON, booleans, ids, swatches, alt image, swatch sliders |
| `references/magento.md` | step 8 on a Magento hit | Luma / Breeze / Hyvä detection, `itemNumber` ids, the price box, configurable-vs-simple CTA, swatches |
| `references/shopify.md` · `references/dandomain.md` · `references/centra.md` | step 8 on that platform | Platform quirks and pointers to the wiki's ATC, rating, swatch and wishlist code |
| `references/js-engine.md` | step 9, standalone tiles only | The slider + rating init engine with its `MutationObserver` |
