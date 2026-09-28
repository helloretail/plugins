# Box setup — create and configure the recommendation boxes

A design renders nothing on its own: a **box** (a recommendation) decides which products fill it
(strategy), where it attaches (placement), what page context it reads (crawl config), and how it
loads (general settings). Every part is now readable and writable through the MCP. This file is
the procedure; the tool reference is `mcp-flow.md` → *Tools*.

**Run it when** the operator asks to "set up the recoms", "create the boxes", "configure the recom
for [page]", "set the load order", "fix the placement", "change the algorithm" — or when the
inventory (step 1) shows boxes missing or misconfigured against the order list. On a fresh
onboarding, set the boxes up **before** the design push, so the draft design has a box to render
in for Step 7.5.

Same governance as a design push: **read → plan → show → explicit go-ahead → write → read back.**
Every write lands as a **DRAFT** and nothing here can publish.

## Inputs

- `website-uuid`.
- **The order list** — which boxes, on which page type, with which algorithm, product count,
  headline and placement. Source: the ClickUp card (through the ClickUp MCP when it is connected)
  or the operator. **Never invent a box, an algorithm or a placement** — anything the list
  doesn't say, ask.
- A live URL per page type the boxes go on (category, PDP, cart), for testing selectors.

## 1. Read the inventory (read-only, always)

`recoms_list(websiteUuid)`, then for each LIVE/DRAFT box under work:
`recoms_getGeneralSettings`, `recoms_getPlacement`, `recoms_getAlgorithm`,
`recoms_getContextCrawlConfig`. These payloads are small — read them in full. Build one table:

| key | name | type | state | designKey | priority | productCount | responsiveMode | selector (default?) | algorithm | crawl fields |
|---|---|---|---|---|---|---|---|---|---|---|

For `algorithm`, write `matchesBestPractice` when it isn't null, otherwise "tuned — N steps".
For `crawl fields`, list the field names (`hierarchies`, `urls`, …) or "none".

Compare the table with the order list: each row becomes **create**, **change** (name the fields)
or **leave**.

## 2. Plan, show, wait for approval

Show one plan table — box, tool, field, current → new — and wait for an explicit go-ahead. A
change to a **LIVE** box drafts it; say which ones will turn DRAFT.

## 3. Create missing boxes

1. `recoms_listBestPracticeAlgorithms(websiteUuid, type)` — pick the entry whose one-line
   description matches what the order list asks for. No clear match → show the candidates and ask.
2. `recoms_create(websiteUuid, type, algorithmName)` → returns the new `key` and
   `placementDivExample`. **Record the div for the hand-off.**
3. The box is born named after the algorithm ("Retargeted - Box 1") — rename it in step 4.

## 4. General settings — `recoms_updateGeneralSettings`

Send only the fields that change.

- **`name`** — the customer-facing name the order list uses. No `DK` / `TEST` / `[NOTE]` style tags;
  QA fails those.
- **`priority`** is the load order: 1 loads first and gets the **first batch of products**. On the
  PDP, **Alternatives gets the lowest value**. Load order is about product allocation, not the
  box's position on the page.
- **`productCount`** — from the order list. A non-supervisor cannot go above the greater of 20 and
  the current value; if the list asks for more, flag it.
- **`responsiveMode`** — `BOTH` unless the order list splits devices. A sidebar / drawer cart recom
  usually needs its own mobile box: one `DESKTOP` box and one `MOBILE` box, each on the design
  that fits it.
- **`renderIfEmpty`**, **`retailMediaInjectionMode`** — leave as they are unless the order list asks.
  Retail Media injection needs Retail Media on the website's agreement.
- **`locked`** — never. Supervisor only.

## 5. Strategy — prefer a best-practice algorithm

- **The order list names a standard algorithm** → `recoms_applyBestPracticeAlgorithm`. It replaces
  the steps only and keeps the box's global filters.
- **Anything custom** (a price range on a cart box, "only this brand", an out-of-stock filter):
  1. `docs_get("docs://product-algorithms/format")` first.
  2. `recoms_getAlgorithm` → edit → `recoms_updateAlgorithm` with the **whole** `steps` list (and
     the whole `filters` list if you change it). Anything you leave out is deleted.
  3. Send back `numberReceipts`, `skipReceipts` and `priceInfluence` exactly as they were read.
  4. Filter field names come from the read's `filterableFields`. Real values come from
     `productData_getFieldValues` — hierarchies are `$`-separated (`kids$shoes`) and nest one
     level deeper (`[["kids","shoes"]]`). List-valued fields always take a JSON list.
  5. Hiding sold-out products = a global `inStock EQUALS true` filter, if `inStock` is in
     `filterableFields`.
- Talk about steps by their **dashboard `number`** — it's what the customer sees.
- A refused input names the offending step: fix that step. Warnings from the tool go to the
  operator as they are.

## 6. Page context — `recoms_updateContextCrawlConfig`

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

## 7. Placement — `recoms_updatePlacement`

Read `recoms_getPlacement` first. The rules are in `mcp-flow.md` → *Box placement*: the
customer-placed `#hr-recom-<key>` div is the durable choice, a theme selector is temporary and gets
flagged, Shopify section IDs are volatile, and you verify it live after setting it. The two ways to
hide a category box while a filter or sort is active are also there; ask the operator which one.

## 8. Design assignment — `recoms_updateSelectedDesign`

A new box renders with the website's default design. Point every box that should use the
customer's design at it in **one** call (`keys[]`). Boxes already on it come back UNCHANGED.

## 9. GA / UTM — only when the order list asks

`recoms_getGoogleAnalyticsSettings` first, then `recoms_updateGoogleAnalyticsSettings`. The
dashboard's UTM suggestion is
`utm_source=helloretail&utm_medium=productbox&utm_campaign=<url-encoded box name>`.

## 10. Verify

- Re-read every facet you wrote with its `get*` and compare it with the approved plan. A
  difference is reported, not retried.
- `recoms_list`: every box you touched now shows a DRAFT row. That is expected.
- Render check through the staff widget (SKILL.md Step 7.5) on a page where the placement matches
  and the strategy can return products.

## Hand-off lines

- Per box: name, key, state, and the **placement div** the customer's developer must paste, with
  the page it goes on. Also any temporary theme selector, with "migrate to the div once it's
  placed".
- Boxes created or changed. All of them are DRAFT: **the operator publishes them in the dashboard.**
- Operator-only items: publishing, deleting or archiving boxes and designs, renaming a design,
  locking.
