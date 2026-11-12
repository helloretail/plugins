# Step notes — the reasons and field cases behind the workflow

`../SKILL.md` → WORKFLOW states each step as an action and its outcome, and is binding on its own.
This file holds why a step is written the way it is, with the field case that produced it. Read the
note for a step when its rule seems not to fit the shop in front of you — before deciding to skip
it, not after.

## Step 2b — popup sweep

- **Why accept, never decline or delete.** Prices, lazy images and Hello Retail itself are often
  consent-gated; a banner that was swept away but never answered silently yields a wrong tile
  survey.
- **Why confirm none is open before step 3.** A popup still open during extraction contaminates the
  DOM dump.

## Step 3 — the Hello Retail guard on the specimen

Hello Retail's own recom sliders copy the shop's card with the shop's classes
(`li.aw-item.product.type-product …`), so a tile inside one looks native and is not. Field case
2026-10: a Search build copied `li.aw-item` before the guard existed.

## Step 3b — function scan

Theme helpers are often defined only on some templates. Where one is undefined the framework logs an
error per tile on every render, and Search re-renders on every keystroke. Field case 2026-10, Hyvä:
a price-box helper missing on the homepage gave about 800 console lines per search, and a wishlist
helper missing only on the account pages gave 50 warnings and an inert heart.

## Step 4 — the state survey

- **Why a sale-only page never counts as the only survey page.** The states that bite are the ones
  such a page cannot show.
- **Why "absent" needs two sources, and why the sale branch is built anyway.** States are
  time-dependent — a scheduled sale can start after the survey. Field case 2026-10, WooCommerce:
  surveys of 7 and 16 category pages at 07:18 and 09:30 found no sale tile, a sale tile stood on one
  of those same pages by 12:00, and the shipped tile had no sale branch.
- **Why states are compared structurally.** A non-sale tile frequently keeps the sale tile's
  elements as empty placeholders, and those placeholders set the tile height; a template that wraps
  them in `{% if product.isOnSale %}` ships tiles of two heights and misaligns every mixed row.
  Field case store-FI-1, 2026-10: reference page 100% sale, non-sale tiles 20px shorter in the
  overlay, found four QA rounds later in a cross-category comparison.
- **Why swatches are found by probe, not class name.** The strip may be a sibling of the link, made
  of thumbnail images, and hidden below a breakpoint.
- **Why baked-in badges are recorded.** So QA does not report the label as missing.

## Step 4g — page-type CSS

The shells render the tile on other page types than the one surveyed: Search opens from the
homepage, a product page or the cart; recom sliders sit on product pages. A 404 is often built from
a different template, and plugin stylesheets such as a wishlist's can be missing there. Field case
2026-10: the card sat 92 px lower on the 404 only.

## Step 6 — price basis

The shell skills filter and sort on the field the visible price binds to, so a wrong basis puts a
price slider on numbers the shopper never sees. Field case 2026-10: an ex-VAT B2B tile with the
range filter on `price` — a 1.000–2.000 range returned tiles displayed at 800–1.600.

## Step 7 — feed value → asset mappings

A value that a handful of lookups would settle is not missing data. Field case 2026-10, Hyvä: 13 of
27 country flags were mapped in the first push and the other 14 took 14 lookups.

## Step 8b — the sale preview from a hand-made row

A sale branch built from platform markup has never been seen live, so its preview is rendered from a
hand-made sale row: the branch is at least seen once before hand-over.
