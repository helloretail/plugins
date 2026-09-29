# Hello Retail MCP — read the live recom design, push a REVIEW draft

The `hello-retail` MCP server (`https://core.helloretail.com/mcp`) exposes the customer's **live** Recommendations configuration — the designs **and** the boxes that render them — so you read the current state and push edits back as a **draft** instead of relying on copy-paste.

This is the default flow. It needs a `website-uuid`; the `design-key` is discovered from it (see *Resolving the design-key*). The uuid is unique per site/domain, so there is no domain to resolve or pick.

## Two kinds of key

A **box** (a recommendation: `FRONT_PAGE`, `PRODUCT_PAGE`, … with its strategy, placement and settings) and a **design** (the Liquid/CSS it renders with) have **separate keys**. `recoms_list` returns each box's `key` **and** its `designKey`. The box tools take a box key; `recoms_getDesign` / `recoms_updateDesign` / `recoms_copyDesign` take a design key. Never pass one where the other is expected.

## Tools (all keyed by `websiteUuid`)

**Designs — what the box looks like (this skill's core flow):**

| Tool | Use |
|---|---|
| `website_getInfo(websiteUuid)` | Language + currency — confirm locale / price-format expectations instead of guessing from `<html lang>`. |
| `recoms_listDesigns(websiteUuid)` | List every design available to the website: the company's **custom** designs (incl. archived) **and** the shared **standard** designs. Returns `key`, `title`, `archived`/`standard` flags and last-modified. **Archived and standard designs are read-only — never target them with `recoms_updateDesign`.** |
| `recoms_getDesign(websiteUuid, key)` | Read the current design fields (`templateCode` + `templateStyles`) for the named design **regardless of state**. Read before editing so you modify the customer's real design in place. The payload can be large and **spills to a file — never ingest it whole** (see Payload spill below). |
| `recoms_updateDesign(websiteUuid, key, templateCode?, templateStyles?)` | Write design fields. **Partial** — omit a field to leave it unchanged, but at least one of `templateCode` / `templateStyles` must be provided. Saving **auto-creates a DRAFT of every LIVE box using this design**, leaving them in DRAFT for review. **Publishing is not possible through this tool.** |
| `recoms_copyDesign(websiteUuid, sourceKey[, title])` | Copy a design (incl. a read-only standard one) into a new editable company design. **The title is set here and only here** — see "Confirm the title first" below. |
| `recoms_updateSelectedDesign(websiteUuid, designKey, keys[])` | Point one or more boxes at a design — all of them in **one** call. Boxes already on it report UNCHANGED. |

**Boxes — which products, where, and how (procedure: `box-setup.md`):**

| Tool | Use |
|---|---|
| `recoms_list(websiteUuid[, includeArchived])` | Every box (LIVE + DRAFT by default): `key`, `name`, `type`, `state`, `draft`, `designKey`, last-changed. A LIVE box with a pending draft is listed **twice under one key** — `state` tells the rows apart. Every tool resolves a key **to the draft**, so a read shows the draft and a write never changes what the shop is serving. |
| `recoms_create(websiteUuid, type, algorithmName)` | New box for a page type, started from a best-practice algorithm. Born **DRAFT**, named after the algorithm ("Retargeted - Box 1"), on the website's default design, at its default selector. Returns `placementDivExample` — the div the shop pastes into its page. |
| `recoms_getGeneralSettings` / `recoms_updateGeneralSettings` | `name`, `type`, `productCount`, `responsiveMode` (`MOBILE`/`DESKTOP`/`BOTH`), **`priority` = load order** (1 loads first, 10 last), `renderIfEmpty`, `retailMediaInjectionMode`, `locked` (Supervisor only). Partial update. A non-supervisor cannot raise `productCount` above the greater of 20 and its current value. |
| `recoms_getPlacement` / `recoms_updatePlacement` | `selector`, `selectorMode`, `insertMode`, whether the selector is the default, what the default is, and the default div. Partial update; empty-string `selector` resets to `#hr-recom-<key>`. See "Box placement" below. |
| `recoms_getAlgorithm` / `recoms_updateAlgorithm` | The strategy: ordered `steps`, global `filters`, `filterByGroupingKey`, plus read-only `productCount` (the box's general setting — written with `recoms_updateGeneralSettings`, never here), `filterableFields` and `matchesBestPractice` (the best-practice algorithm the steps still run unchanged; `null` once tuned). **`steps` and `filters` each replace the whole list.** |
| `recoms_listBestPracticeAlgorithms(type)` / `recoms_applyBestPracticeAlgorithm(key, algorithmName)` | The proven step sequences per page type; applying one replaces **only the steps** and keeps the box's global filters and `filterByGroupingKey`. |
| `recoms_getContextCrawlConfig` / `recoms_updateContextCrawlConfig` | The crawl strings the box runs against the page it renders on (the hierarchies / urls / productNumbers "selectors"); each field is `$input.<field>` in the strategy. **Replaces the whole config**; `""` removes it. `null` on read = not representable as crawl strings, so not editable here either. |
| `recoms_getGoogleAnalyticsSettings` / `recoms_updateGoogleAnalyticsSettings` | GA click/view events and `extraLinkParams` (UTM tags on product links). Partial update; `""` clears a text field. |
| `docs_get(uri)` | `docs://product-algorithms/format` (step catalogue, filters, `$context` expressions, conditions) and `docs://crawl-strings/syntax` — read the one you need **before** writing a strategy or a crawl config. |

Every box write, like a design write, **auto-drafts a LIVE box** and cannot publish.

**Not possible through the MCP** — goes on the operator list: publishing, deleting or archiving a box or a design, renaming a **design** (`recoms_updateGeneralSettings` renames the *box*), `locked` for non-supervisors, and the **values of a design's `{% input %}` fields** (`headline`, the tile's fixed texts, free-shipping fields) — the operator enters those in the dashboard. The `recoms_getAnalytics*` tools exist but only LIVE boxes produce numbers — they belong to reports and support, not to a build.

## Field mapping — MCP fields to this skill's two files

| MCP field | This skill's file | Notes |
|---|---|---|
| `templateCode` | `recom.liquid` | The HTML/Liquid template — the slider scaffold, banner branch, `{{ TILE_BODY }}` slot, and the inline swiper `<script>`. **All recom JS lives here** (there is no separate JS field, unlike Search's `initializationCode`). |
| `templateStyles` | `recom.css` | CSS for the box. You leave the `{{ CUSTOM_STYLING_BLOCK }}` slot empty (the slider is injected into the live page; theme CSS styles the tile), so this is normally pushed back **unchanged** — or omitted from the update entirely. |

## Resolving the `design-key`

1. If the operator gave a `design-key`, confirm it with `recoms_listDesigns` and check the `archived`/`standard` flags — **bail if it's standard or archived** (read-only) and ask for the editable company design instead.
2. If the operator only knows the **box**, call `recoms_list` and read the box's `designKey`.
3. If neither is known, derive it — don't ask first. `recoms_list` + `recoms_listDesigns`, then group the LIVE/DRAFT boxes by `designKey`:
   - **one editable company design** behind the boxes under work → that is the design-key; say so and proceed.
   - **only standard designs** (no company design yet) → propose `recoms_copyDesign` from the standard one the boxes use (confirm the title first, below), then `recoms_updateSelectedDesign` to point the boxes at the copy.
   - **several editable designs** → show the grouping (design title → box names) and ask which one to edit. Don't guess.

> **Shared-design caution.** One design can back several boxes. Because `recoms_updateDesign` drafts **every** LIVE box using the design, confirm the key is the intended one before pushing — you may be drafting more boxes than you think. If the customer wants the change on one box only, they need a dedicated design; flag that rather than editing a shared one.

## Copying a design — confirm the title FIRST

`recoms_copyDesign` is the route to an editable design when the box sits on a read-only standard one. **The title can only be set at copy time**: no MCP tool renames a design (`recoms_updateGeneralSettings` renames a *box*, not its design), and there is no MCP delete — a mis-titled copy means either a manual dashboard rename by the operator, or an orphaned design cluttering the list forever. So before calling it, confirm the intended design title with the operator (they often have a naming convention — "Main Design", per-page names, per-brand names). After copying, point the target box(es) at the new key with `recoms_updateSelectedDesign`.

## Box placement — `recoms_updatePlacement`

A design renders nothing until its **box** attaches somewhere. Placement has three parts: `selector` (CSS selector for the anchor element), `insertMode` (`REPLACE` / `PREPEND` / `APPEND` / `BEFORE` / `AFTER`), and `selectorMode` (`NORMAL` = evaluated on script load; `LIVE_ONCE` / `LIVE_MULTI` = re-evaluated as the DOM changes — for SPA-ish or late-rendered anchors).

**Read it first with `recoms_getPlacement`** — it says whether the box is on its default selector, what that default is, and the div the shop pastes for it. Before changing a placement you know what you are replacing; in the hand-off you can name the div per box.

- **Where the selector comes from.** On an onboarding the operator says where each box goes — a selector, a heading or section, or "the customer places the div" — and `box-setup.md` → step 3 turns that into a verified selector (snippets: `placement-snippets.md`). Never take a placement from a ClickUp screenshot.
- **Final or temporary.** The default selector `#hr-recom-<key>` is the customer-placed div — always final. A selector on theme markup is **final too when it is stable**: exactly one match on every tested page of the type, survives a hard reload, no volatile token, not in a hidden container. A selector that fails any of those is **temporary**: flag it in the hand-off with "move to the `#hr-recom-<key>` div once the customer places it".
- **Shopify section IDs are volatile.** IDs like `shopify-section-template--26550883189082__slideshow_gzQ4aj` regenerate their numeric middle on every theme publish (and can differ between sessions) — an exact-ID selector will match today and silently never match again. Anchor on the **stable suffix** instead, tag-qualified for uniqueness: `section[id$="__slideshow_gzQ4aj"]`. Verify it matches exactly one element (`document.querySelectorAll(...)` — nested inner elements often share the suffix, which is what the tag qualifier is for).
- **Verify the placement live after setting it** — reload the target page (fresh cache-busting query param), confirm the box appears at the intended spot, and confirm the selector still matches after a hard reload. `REPLACE` on a theme element destroys that element; prefer `BEFORE`/`AFTER` when placing next to native content that should survive.

## Hiding a category recom — too few products, or a filter / sort active

A recurring ask for **category recom boxes only** (never front-page / PDP / cart boxes), on every
platform: don't show the recom on a category with fewer than **N** products (8 and 12 are common),
and don't show it while a filter — and, when asked, a non-default sort — is active. Asked in
`box-setup.md` → step 3; checked with *Check the hide conditions* in `placement-snippets.md`.

**The team's way: conditions in the placement selector.** The box's selector gets conditions in
front of its anchor, so on a page where they fail the selector matches nothing and helloretail.js
never inserts the box — no empty gap, no design code, and no served impression. The shape, with
the theme's own selectors substituted in:

```
<page scope>:has(<tile>:nth-child(<N>)):not(:has(<filter active>)) <anchor>
```

The two conditions can also sit on **two different ancestors** — the count on one that holds the
grid, the filter check on one between it and the anchor:

```
<count scope>:has(<tile>:nth-child(<N>)) <filter scope>:not(:has(<filter active>)) <anchor>
```

Two real shapes (class names generic, box key replaced):

- `.catalog-page:has(.product-card:nth-child(12)):not(:has(.catalog-filter input:checked)) #catalog-container`
  — one scope: at least 12 product cards and no filter ticked, anchored on a theme element.
- `body:has(ol.products li.product:nth-child(12)) .page-wrapper:not(:has(.filter-current)) #hr-recom-<key>`
  — the count on `body`, the filter check on the page wrapper (`.filter-current` exists only while
  a filter is applied), anchored on the customer div.

- **`<page scope>`** — an element that exists on category pages and contains both the product grid
  and the filters: the catalog wrapper, a category body class, or `body`. In the two-ancestor
  form, the **count scope** must contain the grid and the **filter scope** must contain both the
  filter signal and the anchor.
- **`<tile>:nth-child(<N>)`** — "the Nth product tile exists", i.e. at least N products. "Hide below
  8" → `:nth-child(8)`. `:nth-child` counts **every** child of the grid, so when the grid holds
  anything besides tiles (a promo banner, a heading) use **`:nth-child(<N> of <tile>)`**, which
  counts tiles only — otherwise a banner shifts the count, and a banner that happens to be the Nth
  child hides the box on every category. Never jQuery's `:eq()`: the engine resolves selectors
  with plain `document.querySelectorAll` (when `jquery_enabled` is false), where `:eq()` is invalid
  and the box never attaches anywhere.
- **`:not(:has(<filter active>))`** — an element that exists **only** while a filter is on: a
  checked filter input (`.catalog-filter input:checked`), an active-filter chip row, a "clear all"
  link, a body class. Sorting: add a second `:not(:has(<active sort>))` when the operator wants the
  box hidden while sorted too.
- **`<anchor>`** — the placement anchor from `box-setup.md` → step 3: the customer div
  `#hr-recom-<key>` or the theme element.
- A category level that shows no product grid at all (a landing category) has no tiles, so the box
  hides there too — the "only on levels that show products" rule comes for free.
- `:has()`, `:not()` and `:nth-child(… of …)` need ~2023+ browsers. The whole selector stays under
  2000 characters.

**Two preconditions — check both before writing it:**

1. **Filtering reloads the page.** The selector is evaluated when the page loads (`NORMAL`); a theme
   that filters without a reload leaves an already-inserted box in place. *Check the hide
   conditions* includes the reload test.
2. **The tiles and the filter state are in the page when HR places the box** — server-rendered is
   race-free (*Verify a selector* → `inServerHtml`). A grid rendered by JavaScript: confirm on the
   live page that the box stays out on a small category.

**When filtering doesn't reload the page — JS guard in the design (`templateCode`).** Tell the
operator why the selector can't do it on this theme and ask before building this instead. At the
top of the design's script, detect the filtered/sorted state and bail: hide the box's outer
wrapper and skip the swiper init. The race-free signal when filtering navigates is `location.search`
— treat **any** query param as "filtered" except a benign allowlist (the sort param if sorting
shouldn't hide, paging, `utm_*`, click-tracking ids); for AJAX filtering, hook the filter events.
Two costs the selector doesn't have: the box still registers a served impression (suppression is
client-side), and it needs a **page-specific design** — if the box shares its design with other
pages, `recoms_copyDesign` a dedicated one first; never put a page-specific guard in a shared design.

**Verify on live categories via the staff widget**, whichever route: a category with at least N
products → box shows; one with fewer → gone; filter applied → gone; sort applied → gone (when
included) — with no empty gap left behind. The box only serves where its own strategy can return
products, so test on a category where it actually renders.

## Reads aren't gated on state

Read whatever design the operator names — LIVE, DRAFT, internal review — `recoms_getDesign` returns it regardless. Don't branch on state before reading; just read, then modify in place.

## Payload spill — never ingest the whole design

A real `templateCode` is tens of KB. When the tool result overflows a single response it **spills to a file** rather than into context. Do **not** read the spilled payload whole. Instead:

- Extract only the regions you edit — the `{% for product in products %}` loop body (the `{{ TILE_BODY }}` slot inside `<div class="hr-product">`) and the swiper `<script>`.
- Diff against just those regions.
- Push back only the changed field(s).

## Write governance — REVIEW draft only, with approval

- **Never auto-push.** Show the diff, get an explicit "go ahead," then push.
- `recoms_updateDesign` **cannot publish** — it only drafts. Publishing stays a human step in the dashboard. Always tell the operator they must publish there.
- Push **only the changed fields**. If you didn't touch CSS, omit `templateStyles` so you can't clobber it.
- **Send raw HTML/Liquid/CSS — never entity-escaped.** `&lt;div&gt;` instead of `<div>` saves without any error and then renders as literal text on the storefront. The API does no validation that would catch it.
- **Verify every push.** `recoms_updateDesign` succeeding proves nothing about *what* was stored. Re-fetch with `recoms_getDesign`, extract the pushed field(s) (payload-spill rules apply), and `diff` against your local copy — only a trailing-newline difference is acceptable. Spot-check that a field you did NOT push is unchanged.
- **Name the boxes the push drafted.** Re-run `recoms_list` and list every box on this `designKey` that now shows a DRAFT row — those are what the operator must publish (or review) in the dashboard. More boxes than expected means the design is shared; say so.
- **Box writes follow the same rules** — diff (current → new per field), approval, write, read back with the matching `get*`. → `box-setup.md`
- **The external-integration rule:** `recoms_updateDesign` is a live-customer **write** path — confirm sign-off from the D&TS lead before using it in a real onboarding. Reads (`get*`, `list*`) are low-risk.
- If a read or push **errors**, report it once and stop — don't retry-loop. Offer the inline copy-paste fallback (show the full modified files in chat) so the onboarding isn't blocked.

## No MCP? Inline fallback

If there's no `website-uuid` / `design-key`, or the `hello-retail` server isn't registered/authorized, skip the MCP entirely and **output the full modified `recom.liquid` + `recom.css` inline** for the operator to paste into the dashboard. The generation logic is identical — only the delivery changes.

## Registering the server

To make the MCP available team-wide, add it to the project `.mcp.json`:

```json
"hello-retail": { "type": "http", "url": "https://core.helloretail.com/mcp" }
```

Otherwise each operator registers it in their own Claude config. The server must be OAuth-authorized.
