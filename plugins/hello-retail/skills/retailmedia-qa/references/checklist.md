# Retail Media QA checklist

Source: the D&TS master checklist (`../../qa-checklists/references/retail-media.md`, the "RETAIL MEDIA" and
"BANNER" blocks of the QA sheet), expanded with how to verify each item and what counts as
PASS / FAIL / WARN. Items marked **(card)** come from patterns on real onboarding cards.
Walk it line by line into the coverage manifest — one manifest line per item, per design or per
page × viewport where it applies — each line ending in `— VERDICT: <X>` so the counts can be
derived mechanically. Before grading any FAIL, check the card brief's decisions (a symptom the
PO/CSM already accepted is KNOWN).

## Setup — code pass (MCP: `recoms_getDesign`, `search_getDesign`, `pages_getDesign`, `retailMedia_getSettings`)

| ID | Item | How to check | PASS | FAIL |
|---|---|---|---|---|
| S1 | `isBanner` code missing | grep the design's template for `isBanner`; confirm the branch renders the banner markup inside the product loop | branch present in **every** design that hosts banners (each recom design incl. upsell/sidecart; each search config desktop + mobile; pages) | no branch in a design that should show banners → the campaign never appears there (High) |
| S2 | Use `class='hr-b-image'` — never the word "banner" | look at the banner `<img>`/`<div>` and its link: `hr-b-image` on the image, `hr-b-container` on the link; scan CSS/HTML class names for `banner` | classes are `hr-b-*`; `bannerImages` / `isBanner` data fields are fine | a class name containing "banner" (ad-blockers hide such elements — the banner vanishes for those shoppers) |
| S3 | Placement: is it shown where it is supposed to be shown? | which boxes/configs the card + settings say should carry banners vs the designs that have the branch; `recoms_getPlacement` selectors; positions from `getSettings` | every intended slot has the branch and a resolvable placement | an intended slot has no branch, or its anchor/selector does not exist on that page type |
| S4 | Use the correct image (SIZE) | the `bannerImages.<size>` used in each design vs `getSettings`: search desktop, search mobile, recoms main, recoms upsell, pages | each design uses the size configured for its own solution | a design uses another solution's size, or a size that is not configured |
| S5 | Added the correct image name in the code — replace `BANNER_SIZE_NAME_PLACEHOLDER` | grep for the literal | the real size name sits in the `{% assign banner_size_… = product.bannerImages.<name>.url %}` line | the placeholder is still in an `{% assign %}` (nothing renders). In a `{% comment %}` only → INFO |

Additional code observations (INFO, "code-only / non-rendering, user-visible: no"): dead banner
selectors, duplicated rules, CSS that sets `grid`/`list` classes the markup never gets.

## Campaign — MCP (`retailMedia_getSettings`, `_listCampaigns`, `_getCampaign`)

| ID | Item | PASS | FAIL / note |
|---|---|---|---|
| C1 | Banner sizes configured for every solution that hosts banners | one size per solution present (sizes/positions for an unsold feature = INFO) | no sizes → website cannot take banner campaigns (blocker, say so) |
| C2 | A banner campaign exists and its status | ACTIVE (or intentionally REVIEW/SCHEDULED, stated) | none → rendered items SKIPPED; REVIEW only → banners visible to the QA session only |
| C3 | `sizesReady` is true, no `generationError` | true / null | false / error → FAIL, the missing size shows nothing |
| C4 | Destination URL of each banner is set and sensible | resolves to the intended page (not a staging/homepage placeholder without comment) | empty or wrong → feeds B3 |

## Banner rendering — rendered pass (desktop 1440 · desktop 1024 · tablet 820 · mobile 375)

| ID | Item | How to check | PASS | FAIL / WARN |
|---|---|---|---|---|
| B0 | The banner image loads | `naturalWidth > 0`, no failed image request | loads | broken image (FAIL) |
| B1 | Placement — shown where supposed to be (**incl. 404**) | **One-per-page rule:** HR puts the banner in only ONE recom box per page — the relevant box, or the one with the lowest load order (`priority` 1 first). Per page type, list boxes with/without a banner next to their load order; `index` among siblings vs configured positions | exactly one recom box per page has it, normally the lowest-load-order box; each search config and the sidecart show it; position within configured positions | no box on the page has it, or two boxes on one page do (FAIL); it sits in a different box than the lowest load order (WARN — relevance may explain it) |
| B2 | Correct image (SIZE) | the `/<size>/` segment of the image URL + natural dimensions | size name = the slot's configured size; natural = 2× configured | wrong size name for the slot (FAIL); right name, wrong pixels (WARN) |
| B3 | URL: does it redirect to the "correct page"? | `href` vs campaign destination; click it once; confirm landing URL and `POST /serve/collect/click` | matches + click tracked | wrong/empty href, no tracking (FAIL) |
| B4 | Image gets stretched out | natural ratio vs rendered ratio; computed `object-fit` | `cover` (crops) or ratios equal | ratios differ with fit `fill`/unset (distortion, Medium) |
| B5 | Tablet (search): image format doesn't work for the screen | 820 on the ≤992px search config: slot ratio vs artwork ratio; crop % | artwork fits or crop loses nothing important | portrait mobile artwork cropped heavily in a squarer slot (WARN; FAIL if text lost) |
| B6 | Text within the banner gets cut off | `cropW`/`cropH` from the probe **and** a screenshot of the banner at the widest/narrowest slot | no text/CTA/logo pixels lost | text or CTA clipped (Medium); crop with nothing visible lost (WARN + safe-zone advice) |
| B7 | Covers the whole tile (height/width) — hides the tile border | banner rect vs slide rect; slide border computed `0`; probe `overlaps` (rect intersection — the centre hit-test alone misses an arrow sitting on the banner's edge or text) | equal within 1px, no border, `overlaps` empty | gap or visible tile border (Medium); arrows/labels over the banner (Low) |
| B8 | Not shown in some recoms (e.g. on the 404 page) | recom box inventory per page (probe `boxes`) against the one-per-page expectation; every add-to-cart path for the sidecart (`trace-cart-box.js`) | the expected box on each page (404 included) has it — the other boxes on that page correctly don't (`N/A — one-per-page rule`); the sidecart has it on every path | the page's expected box lacks it and no other box has it; the box itself missing after one add-to-cart path (High if the box is live) |
| B9 | **(card)** Styling parity | corner radius on image **and** link **and** slide (the radius can sit on any of them), border, shadow vs the product tile on the shop's own category page (the reference) | same as tiles, or confirmed deliberate | differs → **NOTE** (`VERDICT: INFO`, never a finding): record the banner and category-page tile radii/border/shadow and add an operator question ("banner corners are rounded, the category-page tiles are square — intentional?") |
| B10 | **(card)** Load behaviour / cart page | image weight (`kb`, encodedBodySize); when the card mentions "larger than expected", sample the banner rect every ~20 ms for the first second after load | normal weight, no pre-init flash | transient flash before the slider initialises (Low); persistently oversized image or heavy file (Medium) |

## Dashboard — OPERATOR (not automatable; goes to the manual list)

- Campaign status/schedule, CPM, goals; the placement sizes/positions themselves; AI-generated
  artwork. State the value you read through the MCP and ask the operator to confirm.
- Only when the banner sits in a box other than the lowest-load-order one and relevance doesn't
  obviously explain it: is that the intended box?
- Banner artwork safe zone for the campaign owner (keep text ≥ 12% from left/right edges on recom
  slides and ≥ 10% from top/bottom on tablet search until slot shapes are fixed).
