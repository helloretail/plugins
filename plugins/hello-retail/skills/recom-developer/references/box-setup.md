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

## 2. Ask: which recoms, on which pages

With a card, show its list as a pre-fill and ask the operator to confirm or correct it:

> The card mentions 4 recoms: front page, product page ×2, cart. Is that the set?

Without a card, ask: *"How many recoms, and on which pages?"* Existing boxes from step 1 count
toward the set — say which already exist.

## 3. Ask: where does each recom go — placement first

**One question per box, before anything else about that box.** Ask it in these words:

> Where should the **\<page\>** recom go? Give me a page URL and one of:
> a CSS selector · the heading or section it should sit next to (and before / after it) ·
> or "the customer will place the div".

Resolve the answer on the live page with the browser MCP — the snippets are in
`placement-snippets.md`:

| The operator gives | Do |
|---|---|
| **A CSS selector** | Run *Verify a selector*. It must match exactly one visible element, again after a hard reload, and on 2 more pages of the same type. A volatile selector (Shopify's numeric section IDs, hashed classes, `:nth-child`) is rewritten to its stable form — say so. |
| **A heading, section name or visible text** ("below *You may also like*", "above the newsletter block") | Run *Find the section by its text* → the section that holds it, with candidate selectors ranked by stability. Take the most stable one that matches exactly one element, then verify it as above. |
| **"The customer will place the div"** | Keep the default `#hr-recom-<key>`. Its `placementDivExample` goes into the hand-off with the page it belongs on. |
| **Nothing matches, or the answer is vague** | Run *Section map* and show the page's sections as a numbered list (heading and position). Ask: *"Which one — and before or after it?"* |

Then settle the rest of the placement from the same answer:

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

**Show the spot before you move on.** Run *Preview the spot* (a dashed marker, in your browser
only — a reload removes it), screenshot it into `QA/screenshots/`, and ask the operator to
confirm. Several boxes on one page: preview them together, so their order is visible.

## 4. Ask: what each recom shows

- **Algorithm — ask how the recom should pick its products.** Offer the best-practice algorithms
  for the page type as a numbered list, with a suggestion, and take an answer in the operator's own
  words just as well. Translate the words into steps, ask only the follow-ups they leave open
  (fallback, stock, exclusions, price), read the result back in plain words and get a yes.
  → **`algorithm-intake.md`** §1–4. The write is step 7.
- **Heading** — ask for every box: *"What should the heading be for the \<page\> recom?"* Suggest
  one in the shop's language — the heading of the shop's own section the box replaces or sits next
  to (the slider survey's `heading`), or a plain one for the algorithm ("Others also bought") —
  and let the operator confirm or change it. It becomes the value of the box's
  `{% input headline %}` field.
- **Cart and upsell boxes — offer a free-shipping heading.** Ask: *"Should this heading show how
  far the shopper is from free shipping — e.g. 'Add 120 kr. more for free shipping'?"* On yes, ask
  the threshold, the text below it (with `{amount}`), the text once reached, and — non-Shopify —
  where the page shows the cart subtotal. The build is `free-shipping-heading.md`; the normal
  heading above stays as its fallback. On no, the plain heading only.
- **Load order** — only when several boxes share a page: which gets products first (step 6).
- **Product count — how many products the box holds.** A **general setting**, not part of the
  algorithm: asked here on its own, written in step 6 with `recoms_updateGeneralSettings`, never
  through `recoms_updateAlgorithm`. Run *Survey the shop's own sliders*
  (`placement-snippets.md`) on the page the box goes on — homepage and PDP placements usually have
  one. Then:
  - **The shop has a product slider there** → its `products` is the default. Say where it came
    from and let the operator change it:

    > The shop's own slider "\<heading\>" on this page holds **12** products. Use 12 for this
    > recom? (or 8 / 10 / another number)

    Several sliders with different counts → prefer the one the box replaces or sits next to, and
    name the others.
  - **No slider on that page** → ask: *"How many products should this recom show — 8, 10 or 12?"*

  The count must fit the non-supervisor limit (step 6 → `productCount`).
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
temporary), algorithm (the plain-words read-back), product count (and where it came from), heading (free-shipping or plain), then every other field as current → new — and wait for an explicit
go-ahead. A change to a **LIVE** box drafts it; say which ones will turn DRAFT.

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
- **`priority`** is the load order: 1 loads first and gets the **first batch of products**. On the
  PDP, **Alternatives gets the lowest value**. Load order is about product allocation, not the
  box's position on the page.
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

## Hand-off lines

- Per box: name, key, state, page, and its placement — the selector with `insertMode` and
  **final** or **temporary**, or the **div** the customer's developer must paste and where. A
  temporary selector carries "move to the `#hr-recom-<key>` div once the customer places it".
- Per box, the algorithm in plain words, as the operator confirmed it.
- Boxes created or changed. All of them are DRAFT: **the operator publishes them in the dashboard.**
- **Dashboard field values per box** — the MCP writes the design, not what goes in its
  `{% input %}` fields: list `headline` (and, with a free-shipping heading, `free_shipping_threshold`,
  `free_shipping_left`, `free_shipping_reached`) with the value the operator confirmed, for them to
  enter in the dashboard.
- Operator-only items: publishing, deleting or archiving boxes and designs, renaming a design,
  locking, and the `{% input %}` field values above.
