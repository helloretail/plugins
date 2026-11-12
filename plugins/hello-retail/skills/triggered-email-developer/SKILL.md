---
name: triggered-email-developer
description: >-
  Build a Hello Retail Triggered Email design — a real, inbox-rendered HTML
  email (NOT a render-to-image newsletter) that matches the customer's live
  storefront. Use whenever a Hello Retail CSM wants to build or update a
  triggered email, an abandoned-cart email, a price-drop email, a back-in-stock
  email, a post-conversion email, or the shared triggered-email base
  design/shell — e.g. "build a triggered email for [URL]", "make an abandoned
  cart email", "price drop email", "back in stock email", "post conversion
  email", "update the TE base design", or when handed a website UUID + search
  key. Trigger even if they only say "triggered email for [URL]" or just name
  one flow. Covers all four trigger designs plus the base shell, mirrors the
  customer's live HR Search tile, and produces table-based,
  email-client-hardened Liquid with fully inline styles and a 2-up product grid.
  Does NOT handle on-site Search/Recommendations tiles or render-to-image
  Newsletter tiles — those are separate skills.
---

# Triggered Emails UI developer

## What this skill produces

One or more **Liquid templates for Hello Retail Triggered Emails**. Unlike the
Newsletter tile (which HR rasterizes to an image server-side), a Triggered Email
is delivered as **live HTML straight to the recipient's inbox**. The email client
— Gmail, Apple Mail, Outlook (Word engine), Yahoo, mobile clients — renders the
markup itself. That single fact drives every decision and is the opposite of the
newsletter pipeline:

- **Build with tables, not modern CSS.** Layout is `<table role="presentation">`
  with `cellpadding`/`cellspacing`/`border="0"`, `bgcolor` on cells, and explicit
  widths. No flexbox, no grid, no `position`, no `calc()`/`var()`/`clamp()`. A
  multi-column row is two `<td>`s in a `<tr>`, never a flex row.
- **Inline every style.** Gmail strips `<style>` blocks on clipped/forwarded
  messages, so each element carries its own `style="…"`. The shared base shell's
  helper classes (`.btn`, `.previousprice`, `.productimage`) are progressive
  enhancement only — never rely on them in the content block.
- **Harden for Outlook.** Wrap fixed-width containers and images in MSO ghost
  tables (`<!--[if mso]>…<![endif]-->`), put button padding on the `<td>` (not the
  `<a>`), and keep `bgcolor` alongside CSS `background-color`.
- **No SVG, icon fonts, emoji, or JS.** Email clients don't run JS and render SVG
  inconsistently. CTAs are text buttons; ratings (if any) are numbers; web fonts
  always have a web-safe fallback stack.

A Triggered Email is composed of two parts:

1. The **base design** (`base-design.liquid`) — the outer HTML shell:
   `<!doctype>` → `<head><style>` → header logo → the `{{ blocks.content }}` slot
   → footer → unsubscribe sub-footer. One shell is shared by all four triggers.
2. A **per-trigger content block** — the `{% block content %}…{% endblock %}`
   body that renders inside the shell's content slot. This is where the product
   tiles live.

## The four triggers + the base

| Design | What it is | Has related products? | Other structure |
| --- | --- | --- | --- |
| **Abandoned Cart** | Items left in the basket | Yes | "Return to cart" CTA (`cart_url` block); voucher |
| **Price Drop** | A watched product dropped in price | Yes | `{% break %}` after 10 products; voucher |
| **Back in Stock** | A waitlisted product is available again | Yes | `{% break %}` after 10 products; voucher |
| **Post Conversion** | Follow-up after an order | **No** | No break; voucher |
| **Base Design** | The shared outer shell (logo, colours, footer) | — | Only colours + logo change per customer |

These structural differences are **load-bearing — preserve them**. Don't add a
"Return to cart" CTA to Price Drop, don't add related products to Post
Conversion, don't add the `{% break %}` where the base doesn't have it.

## No MCP for Triggered Emails — say so first

The hello-retail MCP has **no Triggered Email tools yet**: nothing reads, creates or updates a
Triggered Email design or a trigger configuration. This skill builds the Liquid; the operator
pastes it into the My Hello Retail dashboard and sets up the triggers there.

Say this in your **first reply**, before any question, in one or two sentences:

> Heads-up: the Hello Retail MCP has no Triggered Email tools yet, so I can't read or update the
> designs directly. I'll build the Liquid here; you paste it into the dashboard and switch on the
> triggers there.

Then offer to report the gap — in the same `AskUserQuestion` call as the Step 1 pickers, as an
extra question:

- question: "Send the plugin team a note that Triggered Email tools are missing from the MCP?"
- header: `Feedback`
- options: `Send it (Recommended)` — "Sent in the background; the build carries on." ·
  `Not now` — "Nothing is sent."

On *Send it*, run `plugin-feedback` (`../plugin-feedback/SKILL.md`) with its Step 2 skipped — the
operator already said yes. The gap is: no MCP tools to list, read or update Triggered Email
designs or trigger configs. The suggested fix is list / get / update tools for Triggered Email
designs and trigger configs, like the `newsletterContent_*` design tools. Skip the offer if a
report on this was already sent this session.

**Never open my.helloretail.com in a browser** (Playwright, Claude in Chrome, any other) to
paste or save a design, not even with the operator's say-so. Dashboard work is the operator's.
In Claude Code a plugin hook blocks it; in Claude chat and Cowork nothing does, so this rule is
the only guard.

## Resources

The base templates ship with this plugin, in
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/triggered-emails/` (outside Claude Code: the
plugin's own `docs/wiki/base-templates/triggered-emails/` folder). Read them from there — never
ask the operator to paste or upload them.

```
${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/triggered-emails/
├── base-design.liquid        ← the shared outer shell (start here for Base Design)
├── abandoned-cart.liquid     ← default Abandoned Cart content block
├── price-drop.liquid         ← default Price Drop content block
├── back-in-stock.liquid      ← default Back in Stock content block
└── post-conversion.liquid    ← default Post Conversion content block
```

Always start from the relevant **default** in that folder,
then restyle it to the customer.

Deeper references are in this skill's `references/` folder — read the one you need:

- `references/rendering-rules.md` — the email-client rules (tables, MSO, inline,
  what to avoid). Read before writing any markup.
- `references/two-up-grid.md` — how to render 2 products per row with one Liquid
  loop (the `modulo` row-chunking pattern) and the odd-count trailing cell.
- `references/hr-feed-fields.md` — HR feed fields + the Liquid price/sale/badge
  patterns.
- `references/inspection-and-verification.md` — how to read the live tile and how
  to prove the render before delivering.
- `references/tile_inspect.js` — paste-in browser snippet for dumping tile tokens.

## The workflow

Steps 1–4 are research. Don't write a template until you've pulled the customer's
real Search tile and looked at the live storefront.

### 1. Gather inputs and pick the design(s)

You need the customer's **category-page URL**, and ideally the **website UUID +
Search key** (so you can pull the authoritative tile markup via MCP). When you ask for the Search
key, say why in the question: the emails reuse the product tile from the customer's Search
design; nothing in Search is changed. If the operator has no Search key, skip Step 3 and build
the tile from the storefront (Step 4).

Then ask the operator **which design(s) to build** using the question picker. The
picker presents **every design plus an "All"** — but the question tool allows at
most **4 options per question**, so the six choices (Base Design, Abandoned Cart,
Price Drop, Back in Stock, Post Conversion, All) won't fit in one list. Split it
into two questions so the operator still sees all designs and the "All" option:

- **Question 1 (single-select) — scope:**
  - **All — base design + all four triggers** (recommended default to surface first)
  - **Base Design only**
  - **Specific trigger design(s)**
- **Question 2 (multi-select, only if "Specific trigger design(s)" was chosen) —
  which triggers:** Abandoned Cart, Price Drop, Back in Stock, Post Conversion.

If **All** is chosen, produce every file: `base-design`, `abandoned-cart`,
`price-drop`, `back-in-stock`, `post-conversion`. Always list all designs to the
operator — never silently drop Back in Stock or Post Conversion.

### 2. Load the default template(s)

Read the matching file(s) from
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/triggered-emails/`. Keep each
file's **parameter block** (`{# text … #}`, `{# color … #}`, `{# boolean … #}`)
and its structural skeleton (which sections exist, related-products presence, the
`{% break %}`, the voucher and `cart_url` blocks). You restyle; you don't
restructure.

### 3. Pull the customer's Search tile (the authoritative field map)

If given a website UUID + Search key, fetch the live Search design via the
hello-retail MCP `search_getDesign`. In the returned `resultTemplate`, find the
**first** element whose class starts with `hr-search-overlay-product`
(`[class^="hr-search-overlay-product"]`) and read the markup **inside** it. That
inner markup is the source of truth for:

- Which HR feed fields carry the title, price, brand, image, etc.
- The exact price formatting (e.g. `{{ product.price | priceWithCurrency:product.currency | replace: 'kr.', 'kr' }}`).
- The tile's structure (centered vs left, where the badge/old price sit).
- Sale handling (`isOnSale`, `oldPrice`, the discount-% math) and sold-out copy.

Reuse those bindings rather than guessing. (`search_getDesign` can be large — if it
exceeds the tool limit, extract the tile in a subagent and have it return just the
inner markup + field list.) See `references/hr-feed-fields.md`.

### 4. Inspect the live storefront tile

Open the category page with the Playwright MCP (Claude in Chrome is the fallback when it isn't available) and read the **real** tile
for brand tokens: font family + web-safe fallback, colours (hex), price format,
title/vendor casing and letter-spacing, and what stacks vs shares a row. Use
`references/tile_inspect.js` and a zoomed screenshot. Details in
`references/inspection-and-verification.md`. Two things to capture exactly,
because they are easy to get wrong by assumption:

- **The real CTA button colour.** Don't assume the brand accent / secondary colour
  is the button colour — they're often different. Read the *computed* background of
  the storefront's add-to-cart button, and resolve any CSS variable or `::before`
  pseudo-element that actually paints it (storefront buttons frequently colour a
  `::before` layer, so the element's own `background-color` can read transparent).
  Use that exact hex for the email's buttons.
- **The CTA label text — and whether a CTA exists at all.** Many storefront tiles
  only reveal the add-to-cart on hover; if the tile shows **no** visible CTA, the
  email tile has **no button** (don't invent one; the image and title link to the
  product). If a CTA **is** visible, take its label from the storefront, in this
  order: (a) a product-level "view product"-style link if the site has one; (b)
  otherwise the storefront's **add-to-cart** label (e.g. "In winkelwagen", "Add to
  cart", "Læg i kurv"). **Never invent generic copy** like "View product". Note the
  visible CTA is often an icon-only add-to-cart — in email you can't add to cart, so
  reuse its text label and link the button to `product.url`.

### 5. Build the content block(s)

Adapt the default into the customer's look, applying every rule in
`references/rendering-rules.md`. The essentials:

- **2 products per row.** Render the product loop as a table that opens/closes a
  `<tr>` every two items, with a trailing empty `<td>` for an odd final item. Use
  this for **both** the main `products` loop and the `relatedProducts` loop. Full
  pattern in `references/two-up-grid.md`. (Only deviate to 1-per-row, 3-up, etc. if
  the operator explicitly asks.)
- **Uniform image cells, never cropped or stretched.** Every product image must
  occupy the **same space** so tiles align row-to-row. Put each image in a
  fixed-height, centre-aligned cell (`<td height="N" align="center"
  valign="middle">`) and let the image scale to fit with `max-width` + `max-height`
  and `width:auto; height:auto` — never force both a fixed width and height (that
  stretches), and email can't `object-fit`-crop. Mirror the fixed height in an MSO
  ghost cell for Outlook. Pattern in `references/rendering-rules.md` (Images).
- **Mirror the Search tile.** Match its layout (e.g. centered image → vendor →
  uppercase title → price), reuse its field bindings and exact price markup, and
  reproduce its sale treatment (discount badge, struck old price, any "from"
  prefix) and sold-out state.
- **CTA colour + label come from the storefront, not from a guess.** Colour the
  buttons with the real CTA hex captured in step 4; use the real label (view-product
  text if it exists, else the add-to-cart label). No invented button copy, and no
  button at all if the storefront hides its CTA on hover.
- **Inline all styles; tables for layout; MSO ghost tables; web-safe fonts.**
- **Preserve per-trigger structure** (the table above): related products only where
  the base has them, `{% break %}` only where the base has it, keep the `cart_url`
  and `include_voucher` blocks' logic as-is, restyling only their appearance.
- **Keep comments out** unless one is genuinely necessary; this engine's comment
  syntax is `{# comment #}…{# endcomment #}` (the `{# … #}` parameter headers are
  declarations, not comments — keep those).

For the **Base Design**, change **only** the colour tokens and the logo
(`header_image_url`, `header_image_width_px`) to match the customer; leave the
shell's structure, classes, and `@media` rules untouched. Note: storefront logos
are often SVG, which many clients (Gmail, Outlook, Yahoo) don't render — recommend
a PNG/JPG logo URL for reliability.

### 6. Verify with a rendered screenshot

Resolve the Liquid with a real sample product (use values from the live page —
include one on-sale item to exercise the sale branch), inject the HTML into a blank
browser tab, and screenshot. Compare side-by-side with the storefront tile and fix
any drift (fonts, colours, **CTA colour + label**, alignment, price format, the
2-up grid, the odd-item trailing cell, and that image cells share one height
without cropping/stretching). See `references/inspection-and-verification.md`.

### 7. Deliver

Show each template inline for review and save the `.liquid` to the output folder. Tell the
operator to paste each one into its design in the My Hello Retail dashboard and set up the
triggers there — the MCP cannot do either (see *No MCP for Triggered Emails*).
Per-customer outputs do **not** go into the wiki — the wiki holds the shared
defaults, not individual customer builds. Then run `customer-handoff` (`../customer-handoff/SKILL.md`; record mode, stage `triggered-emails`; mandatory — do not ask whether to, do not skip) so the flows delivered and any
customer-specific decision are recorded in the customer's living hand-off document under `output/handoffs/` (local for now).

## Quick reference: the rules that bite

- **No MCP for Triggered Emails** → say so in the first reply, offer the `plugin-feedback`
  report, deliver the Liquid for the operator to paste. Never drive the dashboard in a browser.

- **Extend the base, don't rewrite it.** Unless the operator explicitly says otherwise,
  keep the parameter block, variable names, and section skeleton and **restyle** — never
  regenerate a design from scratch, drop a section, or refactor the structure to fit the
  design. If the request can't be met without altering that foundation, **ask the operator
  for approval first** (name what has to change and why). →
  `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md`
- **Comments you add are one short line**, only where the code isn't obvious ("doing X
  because Y"); never explain what the markup plainly does.
- It's a **live HTML email**, not an image → tables, `role="presentation"`, MSO
  ghost tables, `bgcolor`, and **fully inline styles**. Never depend on a `<style>`
  block or the shell's helper classes.
- **No flexbox/grid/modern CSS** → two `<td>`s make a 2-column row.
- **2 products per row** by default, in both loops, with a trailing empty cell on
  an odd count.
- **Uniform image cells** → fixed-height, centred cell + `max-width`/`max-height`
  with auto width/height. Same space for every tile, never cropped or stretched.
- **CTA colour = the storefront's real button colour** (resolve CSS vars/`::before`
  — don't assume it's the accent colour).
- **CTA label = the storefront's real label** → a "view product" link if one
  exists, else the add-to-cart text. Never invent button copy; no button if the
  storefront hides its CTA on hover.
- **Mirror the Search tile** for fields, price format, sale/sold-out treatment.
- **Preserve each trigger's structure** → related products, `{% break %}`,
  `cart_url`, voucher exactly where the base has them.
- **Offer every design + "All"** in the picker (split across two questions to fit
  the 4-option limit); never drop a design from the choices.
- **Base Design = colours + logo only.** SVG logos are unreliable in email →
  recommend PNG/JPG.
- **No SVG/icon fonts/emoji/JS**; always a web-safe font fallback.
