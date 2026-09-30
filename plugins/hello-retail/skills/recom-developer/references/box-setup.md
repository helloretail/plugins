# Box setup — create and configure the recommendation boxes

A design renders nothing on its own: a **box** (a recommendation) decides which products fill it
(strategy), where it attaches (placement), what page context it reads (crawl config), and how it
loads (general settings). Every part is now readable and writable through the MCP. This file is
the procedure; the tool reference is `mcp-flow.md` → *Tools*.

**Run it when** the operator asks to "set up the recoms", "create the boxes", "configure the recom
for [page]", "set the load order", "fix the placement", "change the algorithm" — or when the
inventory (step 1) shows boxes missing or misconfigured against what the operator wants. On a
fresh onboarding this is where the build starts, and the boxes are set up **before** the design
push, so the draft design has a box to render in for Step 7.5.

Same governance as a design push: **read → plan → show → explicit go-ahead → write → read back.**
Every write lands as a **DRAFT** and nothing here can publish.

## How to ask — the `AskUserQuestion` tool, in rounds

Every question below goes through Claude Code's **`AskUserQuestion`** tool: a header, two to four options with a one-line
description, the recommended option first and marked "(Recommended)", and the automatic *Other*
for anything else — never a prose question the operator answers in a paragraph. The tool shows
the questions of one call one at a time, so a call may hold **up to four questions that don't
depend on each other**; a question whose options come from an earlier answer waits for the next
call. The options come from what you already read — the page's *Section map*, the best-practice
list, the shop's own slider — never from guesswork. The rounds:

| Round | Questions in the call | Options come from |
|---|---|---|
| **A** — the set | Which recoms, on which pages (step 2) | the page types; the card's text and the step 1 boxes in the descriptions |
| **B** — per box: where | Placement (step 3) | the page's *Section map* — its likely spots, plus "the customer places the div" |
| **C** — per box: the spot | Confirm the previewed spot; category box: hide below N, hide while filtered / sorted (step 3) | fixed |
| **D** — per box: what | Algorithm (step 4; `algorithm-intake.md` §1) | `recoms_listBestPracticeAlgorithms` for the page type |
| **E** — per box: left open | Fallback, stock, exclusions, price — only the ones the words left open (`algorithm-intake.md` §3) | fixed |
| **F** — per box: the rest | Read-back yes / no (`algorithm-intake.md` §4); cart / upsell: free-shipping offer; product count; Retargeted box: load order (step 4) | the slider survey, the shop's section heading |
| **G** — the plan | Go-ahead for the plan table (step 5) | fixed |

Rounds B–F run for **one box at a time — finish a box before starting the next**. Skip a question
the prompt, the card's text or an earlier answer already settled, and say what you took. Round E
is skipped when nothing is open. Any other yes / no or pick-one question this procedure raises —
`REPLACE` confirmation, hide by selector or by JS guard (`mcp-flow.md`) — is asked the same way;
free text with nothing to suggest (a free-shipping threshold, a URL) is asked in prose.

**No `AskUserQuestion` tool in the session** (a subagent, the SDK) → the same questions in prose,
one per message, the options as a numbered list. No operator to answer at all → don't ask: take
the recommended option and list the question under OPEN QUESTIONS.

## 1. Read what exists (silent — no questions yet)

- **The inventory.** `recoms_list(websiteUuid)`, then for each LIVE/DRAFT box:
  `recoms_getGeneralSettings`, `recoms_getPlacement`, `recoms_getAlgorithm`,
  `recoms_getContextCrawlConfig`. These payloads are small — read them in full. Build one table:

  | key | name | type | state | designKey | priority | productCount | responsiveMode | selector (default?) | algorithm | crawl fields |
  |---|---|---|---|---|---|---|---|---|---|---|

  For `algorithm`, write `matchesBestPractice` when it isn't null, otherwise "tuned — N steps".
  For `crawl fields`, list the field names (`hierarchies`, `urls`, …) or "none".
- **The ClickUp card, when it's available** (ClickUp MCP connected, or the operator linked it).
  Take only what its **text** says: how many recoms, on which pages, algorithm names, headlines.
  The card's placement information is mostly **screenshots — never derive a placement from
  them.** At most, a screenshot tells you which page to ask about.

## 2. Ask: which recoms, on which pages — round A

One call, one question, `multiSelect: true`, header *Recoms*: *"Which recoms should this
onboarding set up?"* The options are the page types — *Front page*, *Product page*, *Category
page*, *Cart / upsell* — each described with what the card's text says for it ("card: 2 boxes —
Alternatives, Others also bought") and which step 1 box already exists there ("existing:
`front-page-1`, LIVE — kept as is"). Picking a page accepts the count in its description (the
card's, else one box); a different count, another page (search results, 404) or a change to an
existing box goes in *Other*. With a card, the chat line before the call says its set is the
suggestion. Existing boxes the operator didn't pick are left alone — say so.

Nothing about placement or algorithms yet: those options need the pages first.

## 3. Ask: where does each recom go — placement first (rounds B and C)

**One box at a time, and placement before anything else about that box** — the algorithm and
count wait until the spot is confirmed.

**Round B — the placement question, with the page's own sections as the options.** Open a page
of the box's type in the browser MCP first — the homepage; the surveyed category; a product from
it; the cart after adding that product — and run *Section map* (`placement-snippets.md`). Then
one call, header *Placement*: *"Where should the \<page\> recom go?"* The options are the two or
three spots where a recom usually sits on that page type (PDP: below the product details or the
shop's own related-products slider; front page: below the hero or the featured products;
category: below the grid; cart: below the cart lines), each named by the section and the side —
*After "You may also like"*, *Before the newsletter block* — with the section's position in the
description ("section 4 of 9"); the one that matches the shop's own related-products slider, or
the card's text, goes first as "(Recommended)". The last option is always *The customer places
the div*. *Other* takes a CSS selector, another section, or a different page URL. No usable
section map (a one-block page, a cart drawer) → ask in prose for a selector or a section name.

Resolve the answer on the live page — the snippets are in `placement-snippets.md`:

| The operator gives | Do |
|---|---|
| **A CSS selector** | Run *Verify a selector*. It must match exactly one visible element, again after a hard reload, and on 2 more pages of the same type. A volatile selector (Shopify's numeric section IDs, hashed classes, `:nth-child`) is rewritten to its stable form — say so. |
| **A heading, section name or visible text** ("below *You may also like*", "above the newsletter block") | Run *Find the section by its text* → the section that holds it, with candidate selectors ranked by stability. Take the most stable one that matches exactly one element, then verify it as above. |
| **"The customer will place the div"** | Keep the default `#hr-recom-<key>`. Its `placementDivExample` goes into the hand-off with the page it belongs on. |
| **Nothing matches, or *Other* is vague** | Show the full *Section map* as a numbered list (heading and position) and ask again — the next most likely sections as the options, *before* / *after* in the labels. |

Then settle the rest of the placement from the same answer:

- **Width** — when the resolved anchor sits outside the theme's content container, the box would
  render full-bleed: prefer an anchor (or `insertMode`) that puts it **inside** the container that
  holds the sibling sections. The width is fixed by the placement, never by copying the
  container's class into the design (`slider-structure.md` → *Width — prefer placement*).

- **`insertMode`** — "above / before" → `BEFORE`, "below / after" → `AFTER`, "inside, at the top /
  bottom" → `PREPEND` / `APPEND`. **`REPLACE` removes the shop's own section** — only when the
  operator said "replace", and confirm it once more.
- **`selectorMode`** — `NORMAL`, unless *Verify a selector* finds the anchor missing from the
  server HTML (a late-rendered app block or lazy section) → `LIVE_ONCE`; an anchor that
  re-renders (a cart drawer opened again) → `LIVE_MULTI`.
- **`type`** — from the page: homepage `FRONT_PAGE`, category `CATEGORY_PAGE`, PDP `PRODUCT_PAGE`,
  cart `CART_PAGE`, cart drawer / add-to-cart step `UPSELL_STEP`, search results `SEARCH_PAGE`,
  404 `E404_PAGE`. Don't ask for it.
- **Final or temporary.** A selector is **final** when it matches exactly one element on every page
  you tested (3 of the type where the shop has them), survives a hard reload, carries no volatile
  token, and doesn't sit in a hidden container. Otherwise it is **temporary**: it goes in the
  hand-off with "move to the `#hr-recom-<key>` div once the customer places it".

**Round C — confirm the spot, and for a category box the hide conditions.** Run *Preview the
spot* (a dashed marker, in your browser only — a reload removes it), screenshot it into
`QA/screenshots/`, and ask in one call:

1. Header *Spot*: *"Is the marked spot right?"* — *Yes, that's the spot* / *No, move it*
   (*Other* says where).
2. Category box only, header *Hide small*: *"Hide this recom on categories with few products?"*
   — *Don't hide* / *Hide below 8 products* / *Hide below 12 products* (*Other* = another number).
3. Category box only, header *Hide filter*: *"Hide it while a filter or sort is active?"* —
   *No* / *While a filter is active* / *While a filter or a non-default sort is active*.

"Move it" → resolve again, preview again, ask question 1 again on its own. Several boxes on one
page: when the later one is placed, preview them together, so their order is visible.

On a hide answer, find on the live category the product tile, the page scope and the "filter
active" signal, build the conditions into the placement selector, and run *Check the hide
conditions* (`placement-snippets.md`) on a big category, a small one and a filtered one before it
goes into the plan. The pattern, the preconditions and the fallback for themes that filter without
a reload are in `mcp-flow.md` → *Hiding a category recom*.

## 4. Ask: what each recom shows (rounds D–F)

Three calls per box, in this order: **D** the algorithm; **E** the follow-ups its answer left
open; **F** the read-back, the free-shipping offer (cart / upsell), the product count and — for a
Retargeted box only — the load order together. Devices, arrows and the heading are not questions:
the heading is a dashboard field the MCP cannot write, so the operator enters it after the write
(step 12). Load order is asked only for a Retargeted box; every other box keeps its default
(step 6 → `priority`).

- **Round D — algorithm: how the recom should pick its products.** One call, header *Algorithm*,
  the best-practice algorithms for the page type as the options (the fitting one first,
  "(Recommended)"), *Other* for the operator's own words. Translate the answer into steps
  → **`algorithm-intake.md`** §1–2. The write is step 7.
- **Round E — only what the words left open:** fallback, stock, exclusions, price — one call, the
  questions and their fixed options in **`algorithm-intake.md`** §3. Skipped when nothing is open
  (a best-practice option, nothing else).
- **Round F — one call of up to four questions:**
  1. **Read-back** (`algorithm-intake.md` §4): show the plain-words steps in chat first, then
     header *Algorithm*: *"Is this how the \<page\> recom should pick its products?"* — *Yes* /
     *No, I'll correct a step* (*Other* carries the correction). A correction → change the step,
     read back again, ask this question again on its own.
  2. **Cart and upsell boxes — the free-shipping heading**, header *Free ship*: *"Should the
     heading show how far the shopper is from free shipping — 'Add 120 kr. more for free
     shipping'?"* — *Yes, show the amount left* / *No, the plain heading*. On yes, the threshold,
     the two texts (with `{amount}`) and — non-Shopify — where the page shows the cart subtotal
     are asked in prose afterwards (`free-shipping-heading.md`); the plain heading stays as the
     fallback.
  3. **Product count — how many products the box holds.** A **general setting**, not part of the
     algorithm: written in step 6 with `recoms_updateGeneralSettings`, never through
     `recoms_updateAlgorithm`. Run *Survey the shop's own sliders* (`placement-snippets.md`) on
     the page the box goes on first — homepage and PDP placements usually have one. Header
     *Products*: *"How many products should this recom show?"*
     - **The shop has a product slider there** → its `products` is the first option,
       "(Recommended)", described as *the shop's own slider "\<heading\>" on this page holds N*;
       then *8* / *10* / *12* without the duplicate. Several sliders with different counts → the
       one the box replaces or sits next to, the others named in the descriptions.
     - **No slider on that page** → *8* / *10* / *12*, none recommended.

     The count must fit the non-supervisor limit (step 6 → `productCount`).
  4. **Load order — Retargeted boxes only** (the algorithm confirmed in round D is *Retargeted*,
     or its first step is `RETARGETED`). A Retargeted box should load first so it gets the
     visitor's retargeted products before other boxes on the page take them. Header *Load order*:
     *"Should this box load first on the \<page\>, so it gets the visitor's retargeted products?"*
     — *Load first — priority 1* "(Recommended)" / *Keep the default* (the value the box has now,
     read with `recoms_getGeneralSettings`, usually 5), with the page's other boxes and their
     priorities in the descriptions. **Another Retargeted box already on the same page** (from
     the step 1 inventory: same `type`, algorithm *Retargeted* or a first step `RETARGETED`) →
     say so in the question: both compete for the same products, and whichever loads first takes
     them. Name the other box and its priority, add the option *Load after \<other box\> —
     priority \<its value + 1\>*, and repeat the warning in the plan table (step 5) and the
     hand-off.
- **Arrows — from the same survey.** Keep the `prev` / `next` it reports for the design step
  (SKILL.md Step 4 → *Box-shell parity*; `slider-structure.md` → *Prev/next arrows*): visible
  arrows → the box copies their design; arrows hidden at 375 px → the box hides its arrows at the
  same breakpoint; `null` → the shop's slider has no arrows: keep the base template's arrows, or hide
  them when the shop's slider is an arrow-less scroll row (`slider-structure.md` → `cssMode`). The placement page has no slider →
  take the arrows from the homepage or a PDP slider instead — one design serves every box. Also
  keep `perView` at 375 / 768 / 1280 for the box's `breakpoints`.
- **Devices** — from the card; otherwise `BOTH` (step 6).

## 5. Plan, show, wait for approval

Show one plan table for all boxes — box, page, placement (selector, `insertMode`, final /
temporary, hide conditions for category boxes), algorithm (the plain-words read-back), product count (and where it came from), free-shipping heading (cart / upsell, when offered), then every other field as current → new — and wait for an explicit
go-ahead. A change to a **LIVE** box drafts it; say which ones will turn DRAFT. The go-ahead is
**round G**: one call, header *Plan*: *"Write these boxes as drafts?"* — *Yes, write them* / *No,
change something first* (*Other* says what). No option is marked recommended: this gate is the
operator's.

## 6. Create the boxes and set their general settings

1. `recoms_create(websiteUuid, type, algorithmName)` with the algorithm confirmed in step 4 →
   returns the new `key` and `placementDivExample`. **Record the div for the hand-off.**
2. Set the placement from step 3 right away (step 9), so the box attaches where the operator
   confirmed.
3. The box is born named after the algorithm ("Retargeted - Box 1") — rename it below.

### General settings — `recoms_updateGeneralSettings`

Send only the fields that change.

- **`name`** — the customer-facing name (the card's, or page + purpose: "PDP – Alternatives"). No `DK` / `TEST` / `[NOTE]` style tags;
  QA fails those.
- **`priority`** is the load order: 1 loads first and gets the **first batch of products**. Send it
  **only for a Retargeted box**, with the value confirmed in round F. Every other box keeps the value
  it was created with (a box drafted from scratch usually gets 5) — don't send it. The operator can
  change any box's load order at any time in the dashboard, or ask you to; then write it here. Load
  order is about product allocation, not the box's position on the page.
- **`productCount`** — the count confirmed in step 4 (the shop's own slider, or the operator's 8 / 10 / 12). A non-supervisor cannot go above the greater of 20 and
  the current value; if the list asks for more, flag it.
- **`responsiveMode`** — `BOTH` unless the operator or the card splits devices. A sidebar / drawer cart recom
  usually needs its own mobile box: one `DESKTOP` box and one `MOBILE` box, each on the design
  that fits it.
- **`renderIfEmpty`**, **`retailMediaInjectionMode`** — leave as they are unless the operator asks.
  Retail Media injection needs Retail Media on the website's agreement.
- **`locked`** — never. Supervisor only.

## 7. Strategy — write the algorithm the operator confirmed

Write exactly what was read back and confirmed in step 4 → **`algorithm-intake.md`** §5:

- **A best-practice algorithm as it stands** → `recoms_create` with it (new box) or
  `recoms_applyBestPracticeAlgorithm` (existing box); the steps are replaced, the box's own global
  filters are kept — fix those separately when they differ from the confirmed plan.
- **Anything else** → `recoms_getAlgorithm` → `recoms_updateAlgorithm` with the **whole** `steps` list
  (and the whole `filters` list if you change it). Anything you leave out is deleted. Send back
  `numberReceipts`, `skipReceipts` and `priceInfluence` exactly as they were read.
- Field names from the read's `filterableFields`; literal values from `productData_getFieldValues`.
- Talk about steps by their **dashboard `number`** — it's what the customer sees.
- A refused input names the offending step: fix that step once, then tell the operator. Warnings
  from the tool go to the operator as they are.
- Read back with `recoms_getAlgorithm` and compare with the confirmed plan.

## 8. Page context — `recoms_updateContextCrawlConfig`

The crawl config is what the dashboard and the QA checklist call the **hierarchies / urls /
productNumbers selector**. It runs in the visitor's browser on the page the box renders on, and
each field it defines is `$input.<field>` in the strategy.

- **Category boxes** — `hierarchies`, taken from the page, so "top products in category" picks
  from the category the visitor is on instead of the whole shop.
- **Cart and upsell boxes** — `urls` or `productNumbers` of the cart lines, so the box knows what
  is in the cart.
- **PDP boxes** normally need none: the product on the page is already the context.

How:

1. `docs_get("docs://crawl-strings/syntax")` (field families, selectors, processors).
2. **Reuse before you write.** Read the crawl config of the website's other boxes of the same type
   first — a working line is often already there.
3. **Test the selector on the live page** in the browser before writing
   (`document.querySelectorAll(sel)` gives the count and text). HR's own example of the shape is
   `hierarchies: [$(".breadcrumb a")]`. Replace the selector with the one you tested on this theme.
4. The update **replaces the whole config**: send the existing lines plus yours. A syntax error
   comes back with its line number.
5. A read that returns `null` can't be edited through the MCP → operator item.

## 9. Placement — `recoms_updatePlacement`

Write what step 3 resolved: `selector`, `insertMode`, `selectorMode` (an existing box: read
`recoms_getPlacement` first). The customer div needs no write — it is the default. After the
write, reload the page with a fresh cache-busting param and check the box attaches at the
previewed spot. The rest is in `mcp-flow.md` → *Box placement*, including the two ways to hide a
category box while a filter or sort is active (ask the operator which one).

## 10. Design assignment — `recoms_updateSelectedDesign`

A new box renders with the website's default design. Point every box that should use the
customer's design at it in **one** call (`keys[]`). Boxes already on it come back UNCHANGED.

## 11. GA / UTM — only when the operator or the card asks

`recoms_getGoogleAnalyticsSettings` first, then `recoms_updateGoogleAnalyticsSettings`. The
dashboard's UTM suggestion is
`utm_source=helloretail&utm_medium=productbox&utm_campaign=<url-encoded box name>`.

## 12. Verify

- Re-read every facet you wrote with its `get*` and compare it with the approved plan. A
  difference is reported, not retried.
- `recoms_list`: every box you touched now shows a DRAFT row. That is expected.
- Render check through the staff widget (SKILL.md Step 7.5) on a page where the placement matches
  and the strategy can return products.

After the read-back, tell the operator the boxes are written and ask them to set each box's heading
in the dashboard (*Hand-off lines*, below) — the MCP cannot write it.

## Hand-off lines

- Per box: name, key, state, page, and its placement — the selector with `insertMode` and
  **final** or **temporary**, or the **div** the customer's developer must paste and where. A
  temporary selector carries "move to the `#hr-recom-<key>` div once the customer places it".
- Per box, the algorithm in plain words, as the operator confirmed it.
- Boxes created or changed. All of them are DRAFT: **the operator publishes them in the dashboard.**
- **Ask the operator to set each box's heading.** The MCP writes the design, not what goes in its
  `{% input %}` fields, so the heading was not asked during the intake. Per box, tell the operator to
  open it in the dashboard and fill in `headline`, with a suggestion in the shop's language — the
  heading of the shop's own section the box sits next to, or a plain one for the algorithm ("Others
  also bought", "Recommended for you"). With a free-shipping heading, also list
  `free_shipping_threshold`, `free_shipping_left` and `free_shipping_reached` with the values the
  operator confirmed.
- Operator-only items: publishing, deleting or archiving boxes and designs, renaming a design,
  locking, and the `{% input %}` field values above.
