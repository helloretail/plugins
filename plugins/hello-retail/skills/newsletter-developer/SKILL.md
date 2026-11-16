---
name: newsletter-developer
description: >
  Build a Hello Retail newsletter / email product-tile Liquid template that matches a customer's
  live storefront category-page tiles. Use whenever someone wants a newsletter product tile, email
  product tile, "email tile", "newsletter Liquid", "make a newsletter tile for [URL]", "build an
  email product tile matching this shop", "turn these tiles into a newsletter template", or pastes
  category-page / product-card markup and asks for an email version. Trigger even on just
  "newsletter tile" with a URL, or a question about which feed fields to use in a newsletter.
  Starts from the shared default design, scans the live tile, and produces a template Hello Retail
  renders to an image for the email. Designs are read, rendered and saved directly via the
  hello-retail MCP (newsletterContent_listDesigns / getDesign / getRenderingInfo / renderDesign /
  updateDesign / createDesign). Does NOT handle on-site Search or Recommendations tiles, or
  inbox-rendered triggered emails — that's triggered-email-developer.
---

# Newsletter tile developer

<!-- gap-watch:start -->
## Gap watch — when the MCP cannot do a step

While you run this skill, watch for a step the hello-retail MCP cannot do: no tool for it, a tool that errors, or a tool that does not return or change what the step needs.

- Say so in your next reply, with the manual route (what the operator does in the My Hello Retail dashboard). Never work around it by driving my.helloretail.com in a browser.
- A gap that blocks the task → offer the `plugin-feedback` report (`../plugin-feedback/SKILL.md`) right away. A gap with a workaround → offer it once, in your last message of the task.
- One offer per gap per session. Not for typos, MCP authorization, browser login or problems on the customer's own site.
<!-- gap-watch:end -->

## What this skill produces

A single self-contained Liquid template, **written directly into the customer's
Newsletter Content design via the hello-retail MCP** (with the operator's
approval — see step 7; the old manual copy-paste into the dashboard is only the
fallback when the `newsletterContent_*` tools are unavailable). Hello Retail
renders this tile into an
**image server-side** at send-time and drops the image into the marketing email,
so the recipient's email client never sees the HTML — it shows a picture. Two
consequences shape every decision:

1. Build it like a normal, simple web component — the shared default template is
   the model (plain `<div>`s, a `<style>` block, `background-image`). Stick to
   simple block flow and `inline-block`; **avoid flexbox/grid** — the renderer
   does NOT support them reliably, so a `display:flex` row silently falls back to
   stacked blocks (e.g. the CTA drops below the price). The default uses no flex —
   follow that. No email-client hardening either: no layout tables, no MSO
   conditional comments, no `bgcolor`.
2. Avoid only what that renderer can't do: no SVG, icon fonts, emoji glyphs, or
   JavaScript widgets (they don't render), and always give a web-safe font
   fallback. See the embedded rendering-rules reference below.

The goal is a newsletter tile that looks like it was lifted straight off the
customer's category page.

## Resources

The rendering rules and the HR feed-field reference are embedded in the sections at the end of
this file. Three things live outside it, shared with the other skills — read each where the
workflow names it:

- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/newsletters/newsletter-tile-default.liquid` —
  the base template every tile starts from.
- `${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspection.md` and its script
  `${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspect.js` — how to read the shop's live tile and how to
  check a render in the browser (shared with `triggered-email-developer`).
- `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/price-formatting.md` — every price rule,
  with the email exception.

**Work fresh, not from memory.** Build every tile from (a) the embedded
references in this file, (b) the shared default template, and (c) a fresh
inspection of the live page. Tokens, layout, feed-field names, and price formats
differ per shop and must come from the live tile each time. If something seems
missing, re-read the references rather than filling the gap from memory.

## The newsletterContent MCP tools — the direct path (field-verified 2026-08-25)

The hello-retail MCP now carries first-class Newsletter Content tools, so the
whole loop — read the current design, dry-run it through HR's REAL renderer,
save it, verify the saved version — happens directly from the session. Nothing
is copy-pasted into the dashboard anymore.

| Tool | Use |
| --- | --- |
| `newsletterContent_listDesigns` | Enumerate the website's designs (id, name, state, width×height, rendering size). The lifecycle states are New, Draft, Internal review, Live, Archived; only LIVE designs are pickable in the campaign editor. |
| `newsletterContent_getDesign` | Full Liquid/HTML of one design. **Always read before overwriting** — check whether the target is the untouched shared default or someone's real work (a colleague may have created/edited it the same day). |
| `newsletterContent_getRenderingInfo` | **Read this before writing a single line.** Authoritative per-website renderer facts: the render engine (Flying Saucer/Java2D, XHTML + CSS 2.1 + border-radius), the installed-font list, min/max dimensions, retina multiplier, available Liquid filters, the design-marker syntax rules, and `product.*` variables sampled from a real product on THIS website (incl. its extraData keys). |
| `newsletterContent_renderDesign` | Render to real JPEG tiles **without persisting** — the canonical verification, because it IS the production pipeline. Pass `template`+`width`+`height` for an unsaved draft, or `designId`+`template` to preview an edit against a saved design before writing it. Pass `productUrls` (max 4) to test specific title lengths / sale states; omit to get top products, on-sale first. Returns the images, any Liquid parse error (line/char), and per-tile image-load failures. |
| `newsletterContent_listStarterTemplates` | The built-in starters the dashboard's "New design" page offers: name plus the width×height each was authored for. The names are the newsletter layouts they suit — the Mailchimp ones are sized for 2, 3 or 4 tiles per row. Use it to pick the **canvas** when the operator hasn't given one. |
| `newsletterContent_getStarterTemplate` | Full Liquid/HTML of one starter. A worked example of the idiom that actually renders — table/float/absolute layout, fixed-height overflow-hidden text boxes, marker syntax, sale/full-price branch. Read one when a construct you need isn't in the shared default. |
| `newsletterContent_updateDesign` / `createDesign` / `copyDesign` | Save. Partial updates (template/name/width/height). `copyDesign` is the SAFE route when live campaigns render the target — see below. |

**Hard cautions for the write path:**

- **Edits land in place — no linked draft.** Newsletter designs carry their own
  lifecycle state — one of **New, Draft, Internal review, Live, Archived** — but
  unlike Search/Recoms there is **no draft-of-a-LIVE-design mechanic**: an edit
  never spawns a linked draft — `updateDesign` writes to the design in whatever
  state it is in, so editing a LIVE design changes what campaigns render. So:
  render-verify BEFORE saving, and only save with the operator's explicit go.
- **Campaign adoption semantics** (from the tool's own contract): Manual and
  Rolling campaigns keep their own template copy and adopt an edit only when
  someone re-saves the campaign with the design selected (until then the
  dashboard shows their design as "custom"). Auto campaigns reference the design
  and pick the edit up at once — and because tile images are fetched when the
  recipient OPENS the mail, an adopted edit also changes pictures in mail
  already sitting in inboxes (trailing up to ~30 s of cache). Say this out loud
  to the operator when editing a design that live campaigns use.
- **When live campaigns render the target, offer `copyDesign` first.** Copy the
  design, edit and render the copy, and let the operator point the campaign at
  the copy in the dashboard — the switch then happens at a moment a person
  chose, instead of an edit landing on live sends. The copy carries the uploaded
  image assets across, so `asset://` references keep resolving, and it is
  created LIVE and pickable in the campaign editor. Editing in place is still
  fine for a design no campaign uses yet.
- **Fonts are the render host's, not the web's.** No `@font-face`; a font not in
  `getRenderingInfo.availableFonts` silently falls back. E.g. a shop using Inter
  gets **Roboto** and Segoe UI gets **Open Sans** as the closest installed stand-in —
  check the list every time.
- The rare design HR staff configured to render at 1× is refused by
  `updateDesign` — read/render it here, edit it in the dashboard.
- Renders are opaque JPEGs — paint an explicit background; unpainted areas are
  undefined.

## The workflow

Work through these steps in order. Steps 1–3 are research; don't start writing
the template until you've actually looked at the live tile.

**Three things to get right above all:**

1. **Take the styles from the customer's category page** — first sweep any
   blocking popups (`${CLAUDE_PLUGIN_ROOT}/docs/browser-login.md` → *First page on each storefront domain*) —
   then read fonts, colours,
   sizes, weights, letter-spacing, alignment, spacing — and re-implement them on
   our tile, adapted so they survive the email image render (see step 5: no
   flex/grid, no JS, web-safe font fallbacks, image-pipeline-safe CSS only).
2. **Get the feed-field variables from the dynamic tile** the customer already
   has in Search or Recommendations (step 3b) — that markup is the authoritative
   source for which HR fields/bindings carry the title, price, brand, labels,
   etc. Reuse those variables rather than guessing field names.
3. **Match the live tile as closely as possible** — the finished newsletter tile
   should look like it was lifted straight off the category page.

### 1. Gather inputs

You need the customer's **category-page URL** (a page showing the product
tiles). Helpful but optional: a CSS selector for the product card if the page is
unusual. With only a website UUID, ask for the URL (or offer to pick a category
with sale items yourself).

**Always ask how many tiles sit in one newsletter row** — it sets the canvas
width. Ask it together with the other open questions, once:

| Tiles per row | Width (px) | Height |
| --- | --- | --- |
| 2 | 298 | the existing design's height, else the matching starter's |
| 3 | 198 | the existing design's height, else the matching starter's |
| 4 | 147 | the existing design's height, else the matching starter's |

Different counts in different campaigns mean different widths: build one design
per width, never stretch one. Also ask whether the design is a **test** (see
step 7 — `createDesign` always creates it LIVE).

### 2. Load the default design (the starting point)

Read the shared default newsletter template, which lives in the wiki at:

```
base-templates/newsletters/newsletter-tile-default.liquid
```

This is the canonical base — always start from it rather than from memory or a
previous customer's file, so every tile inherits the same parameter conventions.
The default is a simple web template (centered, divs plus a `<style>` block,
`background-image`, a percentage badge); keep that simple structure and
**restyle** it to match the customer. (Strip the default's banner branch — see
step 5.)

In the same breath, pull the website's ground truth via the MCP:

- `newsletterContent_getRenderingInfo` — the renderer facts, the installed-font
  list (pick the shop's font from THIS list, not from the storefront: e.g. a
  shop set in Inter renders as Roboto because Inter isn't on the host), the
  marker syntax, and the real `product.*`/extraData variables for this website.
- `newsletterContent_listDesigns` + `getDesign` — does a design already exist?
  Note its id, state, and **canvas width×height** (build for that canvas, not an
  assumed one), and whether its template is the untouched default (safe to
  replace) or someone's live work (stop and surface it before overwriting).
- `newsletterContent_listStarterTemplates` — only when there is **no existing
  design and no canvas was given**. The starters are named for the newsletter
  layout they suit and carry the width×height they were authored for; pick the
  one matching the customer's ESP layout (e.g. 3 tiles per row in Mailchimp) and
  build the shared default onto that canvas. If a construct you need isn't in
  the shared default — a layout the renderer accepts, a marker form — read that
  starter with `getStarterTemplate` and copy the idiom from it rather than
  inventing one. The shared default stays the base for parameter conventions.

### 3. Inspect the live tile (don't guess)

Open the category page in a real browser and read the **real** tile rather than
assuming a layout. **Follow `${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspection.md` → *1. Read the
live tile*** — the popup sweep, the computed-style dump with
`${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspect.js`, the zoomed screenshot, whether the tile has a
CTA and its real colour and label, and the on-sale tile. On top of that, for a newsletter tile:

- **Find every badge and label slot, not just the ones on the first tile.** Read
  one product that carries many badges with `productData_get` (url) and compare
  its `extraData` keys (`badge`, `isBadge2` + `Badge2Text`, `isBadge3` +
  `Badge3Text`, …) and `extraDataList` (e.g. colour variants → "N farver") with
  what the live tiles show. Every slot the feed fills gets a conditional in the
  template, stacked the way the live tile stacks them.

Record the design tokens you find (colors as hex, px sizes, weights,
alignment, row layout, price format).

### 3b. Pull the existing HR tile markup (when given a website UUID + key)

If the operator hands you a **website UUID and a search key** (or a recom key)
instead of — or in addition to — a live URL, pull the already-built HR design
markup rather than inspecting only the storefront:
`${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspection.md` → *Before the live tile — the field map from the customer's Hello Retail tile*
(`search_getDesign` and the first `[class^="hr-search-overlay-product"]` element, or
`recoms_getDesign` and the content of `.hr-product` in the non-banner branch — only the
markup inside it).

That markup is the authoritative product-tile markup: it shows the exact element
structure, classes, and HR feed-field bindings this customer already uses. Treat it
the same way you'd treat pasted on-site markup — reuse its field mapping and layout
(see step 4) rather than guessing. Still cross-check against the live tile / a zoomed
screenshot for visual tokens (italics, colours, what shares a row) per step 3.

### 4. Map the HR feed fields

The customer's on-site tile markup (if the operator pasted it) tells you exactly
which HR feed fields carry which data — reuse that mapping. Common fields and
the Liquid patterns (`extraLabel` split, `reviewScore` `jsonParse`, stock state) are in
the **HR feed fields** section below; the price patterns are in the wiki's price page (step 5). Only
include elements the customer's tile actually shows.

### 5. Build the template

Adapt the default into the customer's look. **Every rule for this step is in the
*Rendering rules* section below — read it before writing, and apply each part:**

| What you do | Rule section |
| --- | --- |
| Restyle; keep every variable of the default, add one only when there is no slot | *Preserve the default template's variables* |
| Strip the banner branch | *A newsletter tile is one product — no banner branch* |
| Block flow and `inline-block` only; no flex / grid, SVG, icon fonts, emoji, JS; a web-safe font fallback | *The renderer is limited — avoid these* |
| Alignment and what shares a row, as the live tile has it; only the elements it shows | *Match the live tile's layout* |
| A CTA only if the tile has one, as a text button with the shop's label | *CTA: only if the tile has one* |
| Sale styling from a real on-sale tile | *Sale styling: copy the real on-sale tile* |
| Fill the canvas, with every derived size still derived | *Fill the canvas* |
| One border; no arithmetic left behind for a removed element | *Avoid a double border*, *Remove an element, remove its arithmetic* |
| The image never stretched | *Image without stretching* |
| The shop's exact price markup, for the current and the old price | `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/price-formatting.md` → *Email tiles copy the shop's price markup* — read it before writing the price |

The customer's tokens are exposed via the parameter block at the top (the
`{# color ... #}`, `{# boolean ... #}` HR dashboard param syntax) with sensible
`show_*` toggles, so the operator can tweak without editing markup.

### 6. Verify through HR's real renderer

**The canonical verification is `newsletterContent_renderDesign`** — it runs the
actual production pipeline (Liquid resolution, JTidy, Flying Saucer, real feed
products) and returns the JPEGs the email will embed, plus any Liquid parse
error and per-tile image-load failures. Render **before** any save:

- unsaved draft: pass `template` + the target design's real `width`/`height`;
- previewing an edit to an existing design: pass `designId` + `template` (the
  override renders without persisting);
- render at least a long-title product, an on-sale product, a non-sale product,
  the product with the **most badges**, and one with **no variants** (`productUrls`)
  — a design that only fits the average product is a design that clips, and
  empty-list guards only fail on the product that has none. Check the
  whole canvas is used, nothing is cut off, the badge/prices/CTA render, and the
  font came out as intended;
- render once more with a **marker changed** in the template override (e.g.
  `lines_of_text` +1, a different `margin`) and confirm the image shrinks to make
  room instead of the text overlapping — that is the only render that proves the
  layout is still derived rather than hardcoded.

The browser-injection preview (resolve the Liquid with a sample product's
values, inject into a blank tab, zoom-screenshot —
`${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspection.md` → *2. Check the render in a browser*; for a newsletter tile also check that a CTA is there only
if the shop's tile has one and is a text button, and that a rating shows as a number) remains useful for quick side-by-side comparison
against the live tile while iterating, and is the fallback when the
`newsletterContent_*` tools are unavailable — but it is a browser, not the
render host: fonts and CSS support differ, so never ship on a browser preview
alone when the MCP render is available.

### 7. Deliver — save directly via the MCP

Show the **full template inline** in chat so the operator can review it, and
save the `.liquid` to the working/output folder. Then, **with the operator's
explicit approval**, write it straight to the customer's design:

- existing design → `newsletterContent_updateDesign` (designId + template;
  partial update, leave width/height/name alone unless asked);
- no design yet → `newsletterContent_createDesign`. It always creates the design
  **LIVE** (pickable in the campaign editor, though no campaign changes); there is
  no tool to set New or Draft. Say so and get the operator's yes before calling it.

After saving, render the **saved** design once more (`renderDesign` with just
`designId`) and confirm the persisted version produces the same tiles — that
render is exactly what campaigns will embed. Remember an edit lands in place —
no linked draft is created, so editing a LIVE design changes production (see
the MCP-tools section above: adoption semantics, live-campaign warning) and the
approval before `updateDesign` is not optional. Manual copy-paste into
the dashboard is only the fallback when the MCP tools are unavailable. **Do not
write into the wiki unless the operator explicitly asks** — the wiki holds the
shared default, not per-customer outputs.

Then run `customer-handoff` in record mode, stage `newsletter` — mandatory, as
`${CLAUDE_PLUGIN_ROOT}/docs/hand-off.md` → *The record — `customer-handoff`* says — so the design key, the feed fields used and any
customer-specific decision are in the customer's hand-off document.

Last, close the browser: call `browser_close` on every `playwright*` server the
inspection used — also when the build stopped midway
(`${CLAUDE_PLUGIN_ROOT}/docs/browser-login.md` → *Close the browser when the work is done*).

## Quick reference: the rules that bite

These are the mistakes that have actually broken tiles, kept here so you don't
have to scroll to the reference sections to remember them:

- **`getRenderingInfo` first, and pick the font from its list** — no
  `@font-face` on the render host, so a storefront font that isn't installed
  silently falls back (Inter → use Roboto). The storefront tells you the look;
  `availableFonts` tells you what you may write.
- **Marker names are letters and underscores only** — `badge2_color` is not
  recognised and prints as text at the top of the tile, pushing everything down.
  Stray text on the render means a bad marker.
- **Test an empty list with `.size > 0`**, not `!= blank` — an empty list is not blank.
- **Read the design before overwriting** (`getDesign`) — a same-day "Main
  design" may be a colleague's work, not the untouched default.
- **Newsletter-design edits land in place — no linked draft is created** (the
  designs have their own lifecycle states, but there's no draft-of-LIVE
  mechanic like Search/Recoms): render-verify first, save only on the
  operator's explicit go, and warn about campaign adoption when live campaigns
  use the design.
- **Extend the default, don't rewrite it.** Unless the operator explicitly says
  otherwise, keep the default's structure, CSS approach and variable names and
  **restyle** — never regenerate the template from scratch. If the design can't be
  reached that way, **ask the operator for approval before altering the
  foundation**. → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md`
- The tile is rendered to an **image** server-side → build simple HTML/CSS like
  the default; **no** layout tables, MSO comments, or `bgcolor` (that's
  live-HTML-email hardening this pipeline doesn't need).
- **No banner code** in a newsletter tile → strip the `isBanner` /
  `bannerImages` / `hrBImage` / `BANNER_SIZE_NAME_PLACEHOLDER` entirely; the
  container holds the product directly.
- **Only include elements the live tile shows** → no CTA button if the storefront
  tile has none, and never invent CTA copy (use the real label or omit it).
- Flexbox/grid aren't reliably supported by the renderer → a flex row drops to
  stacked blocks (CTA falls under the price). Use `inline-block` +
  `vertical-align:middle` in a `white-space:nowrap` parent for same-line rows.
- Stick to the CSS the default already uses (`background-image`/`background-size`,
  `border-radius`, `position`, `overflow`, `display`) plus basic CSS2
  (`inline-block`, `vertical-align`, `white-space`). Don't introduce other modern
  CSS — no `box-sizing`, `calc()`, `var()`, `clamp()`, `object-fit`,
  `aspect-ratio`, transforms/transitions. If the default doesn't use it and it
  isn't plain CSS2, assume the renderer might not support it.
- SVG / icon fonts / emoji don't render → any CTA is a **text** button, no icons.
- JavaScript doesn't run → a JS-only rating (Lipscore) can't appear; show a
  **number** only if it's a real feed field, otherwise omit it.
- Web fonts may not load → always add a web-safe fallback stack.
- Match the customer's exact price markup (`kr&nbsp;`, `€`, `,-`, `.00`) → copy
  it from their tile; the rules are in the wiki's price page (step 5).
- Sale styling differs per shop → inspect a real on-sale product and copy its
  structure; the price colour often changes (e.g. green → red) and many shops
  show no discount badge. Don't invent a badge.
- Content shorter than the canvas pools at the bottom → keep the default's
  `image_height` and/or center the content vertically so the slack is balanced.
- Never hardcode a derived size (`image_height = 170`) → it breaks the
  dashboard's `margin` / `lines_of_text` / height fields; derive it and verify
  with a changed-marker render.
- Avoid a double border → the dashboard and campaign already frame each tile, so
  a border inside the image shows as a second one next to it.
- Removed an element? → remove the arithmetic that sized it too.
- Don't stretch the product shot → `background-size:contain` (default) or a real
  `<img>` with `width:100%; height:auto`.
- Don't rename or delete the default's variables (`image_height`, `font_size`,
  `lines_of_text`, `button_text`, `offer_*`, `badge_*`, the `show_*` toggles, …)
  → restyle by changing the HTML/CSS and default values; add a new variable only
  if the customer truly needs one the default lacks.

---

# Embedded reference: Rendering rules (image pipeline)

## How a newsletter tile renders

Hello Retail rasterizes the tile into an **image server-side** at send-time, and
that image is placed into the marketing email. The recipient's email client only
ever sees a picture, so email-client quirks (Outlook's Word engine, Gmail
stripping `<style>`, dropped `background-image`) DO NOT apply. Build the tile like
a normal, simple web component — the default template is the model: plain
`<div>`s, a `<style>` block, and `background-image`, rendered by a browser-class
engine. Do **not** add email-client hardening: no layout `<table>`s, no MSO
conditional comments, no `bgcolor`.

## A newsletter tile is one product — no banner branch

The default template carries a `product.isBanner` branch that renders a banner
image from `product.bannerImages.<SIZE>.url`. That belongs to recommendation /
on-site placements, not newsletters. Remove it from a newsletter tile: drop the
`{% if product.isBanner %}` / `{% else %}` wrapper, the
`banner_size_newsletter` assignment, the `.hrBImage` element and its style, and
the `BANNER_SIZE_NAME_PLACEHOLDER`. The `#container` holds the product tile
directly.

## The renderer is limited — avoid these

It is not a full interactive browser:

- **No SVG, icon fonts, emoji glyphs or JavaScript, and no web font without a web-safe
  fallback** — the limits every email tile shares: `${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspection.md` → *What no email tile can show*.
  Here: a plain text CTA button and CSS shapes; ratings as a **number**, never star icons;
  JS-only elements left out; a fallback stack such as
  `'PT Sans Narrow', 'Arial Narrow', Arial, sans-serif`.
- **No flexbox or grid** — a `display:flex` row silently degrades to stacked
  blocks (the CTA drops below the price). Use block flow and `inline-block`. For
  elements that must share a line (e.g. price + CTA), use `display:inline-block`
  with `vertical-align:middle`, and wrap them in a `white-space:nowrap` parent so
  they can't drop. For a left/right row (price left, CTA right), use `float`: the
  price as `inline-block` on the left, the button `float:right`, and the parent
  `overflow:hidden` to contain the float.
- **Stick to the default's CSS palette** — `background-image`/`background-size`,
  `border-radius`, `position`, `overflow`, `display`, `background-position`/
  `repeat`, plus basic CSS2 (`inline-block`, `vertical-align`, `white-space`,
  `text-decoration`, `float`, `em`/`px`). If a property isn't used by the default
  and isn't plain CSS2, assume the renderer may not support it — avoid
  `box-sizing`, `calc()`, `var()`, `clamp()`, `object-fit`, `aspect-ratio`,
  `gap`, and transforms/transitions.

External images (the product `imgUrl`, label PNGs, custom badge images) DO load.

## Match the live tile's layout

Replicate the storefront tile's structure — alignment (centered vs left) and
whether the price and CTA share a row (price left, button right is common). Copy
what the live tile does rather than defaulting to one arrangement. **Only include
elements the live tile actually shows.**

## Fill the canvas

The tile renders onto a fixed width x height. Use the default's `image_height` so
the image consumes the leftover space and the tile fills the canvas, and/or center
the content vertically so any slack is balanced rather than pooling at the bottom
(you can't rely on flex centering).

**Keep the derived sizes derived.** `image_height`, `title_box_height` and `space`
must stay computed from `height`, `margin`, `font_size` and `lines_of_text` — never
replace one with a literal (`image_height = 170`). A literal looks right in the
render and breaks the moment the operator edits a marker: raise `lines_of_text` and
the title runs into the price. When your text block differs from the default's, put
its fixed part in one named assign (e.g. `text_block_px`) and keep subtracting it
from the canvas.

## Avoid a double border

The dashboard preview and the campaign layout already frame each tile, so a
border painted inside the image sits next to that frame and reads as a double
border. Check the render with that frame in mind and make sure the finished tile
shows a single border; if the operator still wants one in the image, say it will
look doubled in the dashboard preview.

## Remove an element, remove its arithmetic

When you drop a border, padding or a row, also drop every `minus:` / `plus:` that
accounted for it (a leftover `minus: 2` from a removed 1px border shifts the card
off-centre).

## Image without stretching

Use the default's `background-image` with `background-size:contain` (no
distortion), or a real `<img>` with `width:100%; height:auto`. Never force a fixed
pixel height on a real `<img>` — it squashes the product shot.

## CTA: only if the tile has one — text button, never invented copy

Only add a CTA if the storefront tile shows one. Many tiles have no visible
button (the add-to-cart is a hover-only quick-add, or there's none at all); in
that case the newsletter tile has no button either. When there is one, storefront
cart icons can't render (no SVG/icon fonts), so use a text button (a styled
`<div>`/`<a>`) in the shop's button colour, with the shop's **actual** label —
never made-up text. To match a price-left / cart-right tile, `float:right` the
button.

## Sale styling: copy the real on-sale tile

Inspect an actual on-sale product. The current price colour often changes (e.g.
green -> red), the old price is struck through, and many shops show **no** discount
badge. Copy exactly what the on-sale tile does; don't invent a badge.

## Preserve the default template's variables

**Restyle, don't rename.** Keep the default's parameter block and its derived
`assign` variables exactly as named (e.g. `font`, `margin`, `font_size`,
`lines_of_text`, `title_font_color`, `offer_background_color`, `offer_font_color`,
`button_text`, `button_background_color`, `badge_size_px`, and the derived `space`,
`title_box_height`, `image_height`, the `show_*` toggles, …). Adapt to the customer
by changing only the **design** — the HTML structure, the inlined CSS, and the
variables' default *values* — never by renaming or deleting a variable. Reuse the
existing slots: style the sale price with the `offer_*` colours, the CTA with the
`button_*` variables and `button_text`, the title with `title_font_color`, clamp
lines with `lines_of_text` / `image_height`, and so on. Add a *new* variable only
when the customer genuinely needs something the default has no slot for — and even
then leave all the existing ones in place. This keeps every customer's template
consistent and predictable for the next person to maintain. (The banner branch is
the one exception that is removed outright — it is not a parameter, and a
newsletter tile has no banner slot.)

## Keep comments minimal

Add comments only where they genuinely help (a short header, a non-obvious branch),
each one short line ("doing X because Y"), never an explanation of what the markup
plainly does: `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/foundation-rules.md` → *Comments in the code you add*.

---

# Embedded reference: HR feed fields

The newsletter tile is rendered per product, so inside the template `product`
is the current item. If the operator pasted the customer's on-site product-card
markup, **that markup is the authoritative mapping** — it shows exactly which
field carries the title, price, label, etc. for this customer. Reuse it. The
fields below are the common ones and the Liquid patterns that go with them.

## Core fields

The standard fields — `title`, `url`, `imgUrl`, `brand`, `price`, `oldPrice`, `currency`,
`isOnSale`, `inStock` — are listed in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/general.md` → *The standard fields on `product`*. What a
newsletter tile does with them:

- `product.imgUrl` → use in a real `<img>` (or the default's `background-image`).
- `product.url` → in a render-to-image tile usually not clickable, but harmless to include.
- `product.inStock` → controls the stock colour and which delivery text to show.
- `product.isBanner` / `product.bannerImages` exist on the product object but are **not used
  in newsletter tiles** — there is no banner slot here. Ignore them.

## extraData (customer-specific extras)

`product.extraData.*` holds fields the customer configured in their feed. Names
are defined per customer — always confirm against the pasted tile. Only render the
ones the customer's tile actually uses, and guard each with
`{% if product.extraData.<field> != blank %}`. Seen in the field:

- `product.extraData.prisSomNy` — "price as new", shown on a separate line for
  used / B-stock items; also `productnumber`, `id`

- `product.extraData.unit` — e.g. "Per set" (shown after the price)
- `product.extraData.deliveryText` — generic delivery/stock line
- `product.extraData.stockText` — e.g. "25 op voorraad"
- `product.extraData.deliveryInStock` / `deliveryOutOfStock` — delivery copy per
  stock state
- `product.extraData.shortDescription` — short description under the title
- `product.extraData.extraLabel` — a label encoded as `"<bgcolor>,<text>"`
  (split on comma)
- `product.extraData.reviewScore` — a JSON string with rating + review count
- `product.extraData.highestPrice` / `priceExTax` / `oldPriceExTax` /
  `highestPriceExTax` — price variants (ex-VAT, price range)
- `product.extraData.altImg` — hover image (on-site only; not needed in email)
- `product.extraData.mainVariantId`, `product.productNumber` — IDs (on-site
  cart forms; not needed in a render-to-image tile)

## extraDataList

- `product.extraDataList.labels` — a list of label **image URLs** (e.g. "actie"
  PNGs) to overlay top-left of the product image. Loop and render each as an
  `<img>` using the overlay pattern in the Rendering rules section.

## Common Liquid patterns

**Price, old price, discount percentage, price range:** the forms and the guards are in
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/price-formatting.md` — *Email tiles copy the shop's price markup* for the format, *Sale pair* and
*Discount percentage* for a sale, *From prices and price ranges* when the variant price varies
(e.g. `product.extraData.highestPrice`). In this template the old price is styled
inline (`text-decoration:line-through`) and rendered only when
`product.isOnSale and product.oldPrice != blank`.

**extraLabel (color + text encoded as "bg,text"):**

```liquid
{% if product.extraData.extraLabel != blank %}
  {% assign parts = product.extraData.extraLabel | split: "," %}
  {% assign label_bg = parts[0] | strip %}
  {% assign label_text = parts[1] | strip %}
  <span style="background-color:{{ label_bg }}; color:#fff; font-size:12px; font-weight:700; padding:6px 14px;">{{ label_text }}</span>
{% endif %}
```

**reviewScore → NUMBER only (no stars):**

```liquid
{% if product.extraData.reviewScore != blank %}
  {% assign reviewData = product.extraData.reviewScore | jsonParse %}
  {% assign rating = reviewData.cumulative_rating %}
  {% assign total_reviews = reviewData.total_reviews | replace: ".0", "" %}
  <span style="font-weight:700;">{{ rating }}</span>/5
  <span style="color:#525252; font-size:12px;">({{ total_reviews }} reviews)</span>
{% endif %}
```

Do not render the stars the on-site tile draws — star icons/SVG/unicode don't
render reliably. The number conveys the same information and never looks broken.

**Stock state:**

```liquid
{% if product.inStock %}{% assign stock_color = stock_in_color %}{% else %}{% assign stock_color = stock_out_color %}{% endif %}
<span style="color:{{ stock_color }}; font-weight:700;">{{ product.extraData.stockText }}</span><br/>
<span style="color:{{ stock_color }};">{% if product.inStock %}{{ product.extraData.deliveryInStock }}{% else %}{{ product.extraData.deliveryOutOfStock }}{% endif %}</span>
```

## Ratings: feed field vs JS widget

A storefront rating may be either a real feed value or a client-side widget.

- If the feed carries a numeric rating (e.g. `product.extraData.reviewScore` with
  `cumulative_rating` / `total_reviews`), render it as a **number** (no stars).
- If the rating is only a JS widget on the site (Lipscore etc.) with no feed
  field, it can't render — omit it.
