# Email tiles — reading the shop's tile and checking the render

**The rule: an email tile is a copy of the shop's real tile, so read that tile in a real browser
before writing, and put the rendered email tile beside it before delivering.** Nothing about the
look is assumed, and the screenshot wins over computed styles for anything visual.

Shared by `newsletter-developer` and `triggered-email-developer`. Each skill adds its own checks
(the newsletter render host; the triggered-email grid) in its own steps.

## Before the live tile — the field map from the customer's Hello Retail tile

When there is a website UUID and a Search key, the customer's existing Search tile is the
authoritative map of which feed field carries what. Reading it changes nothing in Search.

1. **Fetch the design** with `search_getDesign` (website UUID + Search key) and take its
   `resultTemplate`. For a newsletter tile a recom key works too: `recoms_getDesign`, where the
   tile is the content of `.hr-product` in the non-banner branch. The result is large — when it
   exceeds the tool limit, extract the tile from the spilled file or in a subagent and bring back
   only the tile markup and its field list.
2. **Find the tile:** the **first** element whose class starts with `hr-search-overlay-product`
   (`[class^="hr-search-overlay-product"]`). There may be several; take the first only.
3. **Take the markup inside it**, not the wrapping element itself.
4. **Reuse from it**, rather than guessing: which feed fields carry the title, price, brand,
   image and labels; the exact price formatting; the tile's structure (centred or left, where
   the badge and the old price sit); the sale handling and the sold-out copy.
5. **Still read the live tile** (section 1) for everything visual — italics, colours, what
   shares a row.

No key → skip this and take the field map from the storefront tile and the feed.

## 1. Read the live tile

1. **Open the category page** in a real browser (`browser-login.md` in this folder →
   *Surveying a storefront* and *First page on each storefront domain*). Accept the consent banner with its real button first — styles,
   prices and images are often consent-gated — and close a cart drawer or any other popup
   that opens (screenshot first to find its close button). After navigating, wait a moment
   and re-check the tab: the page title confirms the load finished.
2. **Dump the computed styles** with `${CLAUDE_PLUGIN_ROOT}/docs/email-tile-inspect.js` —
   Playwright `browser_evaluate`, or the Chrome `javascript_tool` with the page's `tabId` on the
   fallback. It returns, for one tile: font family, size, weight, style, casing and
   letter-spacing, colours (as `rgb(...)` — convert to hex), alignment, line-height,
   border-radius and padding for the brand, title, price, old price, unit, discount badge,
   sold-out badge, stock line, rating, label and CTA, plus the card background and width and the
   product image's size and clean URL. Unusual class names → set `CARD_SELECTOR` at the top to
   the selector the operator gave, or adjust the finders.
3. **Zoom-screenshot one tile** and trust the picture over the computed styles: italic or
   normal, what stacks and what shares a row, centred or left, how many lines the title clamps
   to. Computed styles sometimes report a hidden or duplicate element.
4. **Decide whether the tile has a CTA at all.** Many shops show the add-to-cart only on hover
   (`ctaVisibleWithoutHover` in the script's result, confirmed in the screenshot). No visible
   CTA → the email tile has no button.
5. **A visible CTA: read its real colour and its real label.**
   - **Colour:** the *computed* background of the add-to-cart button, not the brand accent
     (a shop can have a teal accent and a green add-to-cart button).
     Shops often paint it on a `::before` layer or through a CSS variable, so the element's own
     `background-color` reads `transparent`: read
     `getComputedStyle(btn, '::before').backgroundColor` and resolve any `--var`
     (`getComputedStyle(root).getPropertyValue('--…')`) until you have a hex.
   - **Label:** a product-level "view product" link when the tile has one, otherwise the
     add-to-cart label word for word ("In winkelwagen", "Add to cart", "Læg i kurv"). An icon-only button still carries the label in its
     accessible text or a hidden span. Never invented copy.
6. **Read a tile that is on sale.** Old price, discount badge and sale colours exist only on
   discounted products; find one on the category page or a sale / outlet page. Copy what it
   does: the current price often changes colour, the old price is struck through, and many
   shops show no discount badge. No sale product anywhere → create a temporary element with the
   sale classes and read its computed style.
7. **Note what cannot come across** (*What no email tile can show*, below). An element drawn
   by a client-side widget with no value in the feed is left out of the email tile and named to
   the operator. A value the feed does carry is shown as text or a number.
8. **Take one real product's values** while you are on the page — title, price, brand, stock,
   rating, image, and an on-sale product's — for the render check below.

**Record:** font and a web-safe fallback, text colour, muted and price colours, sale colour,
old-price colour, CTA colour (resolved hex) and label, page and card background, border colour,
alignment and row layout, and the exact price markup
(`${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/price-formatting.md` → *Email tiles copy the
shop's price markup*).

**Tool notes.** The Chrome `javascript_tool` needs the `tabId` on every call; without it the
error reads "URL could not be parsed". Image URLs with a query string may be redacted in tool
output — use the script's `image.src`, or `new URL(img.src).origin + new URL(img.src).pathname`.

## What no email tile can show

Whatever renders the email — the newsletter image renderer or an inbox client — these never
come across from the shop's tile:

- **SVG, icon fonts and emoji glyphs** render inconsistently or not at all. A CTA is a text
  button; an icon becomes a text label or is left out.
- **JavaScript never runs.** A widget drawn by a script (Lipscore and other review widgets)
  cannot appear. Show a rating only when the feed carries it, as a number.
- **Web fonts may not load.** Always give a web-safe fallback stack.
- **Flexbox, grid and modern CSS** (`calc()`, `var()`, `clamp()`, `object-fit`,
  `aspect-ratio`, transforms) are not supported. What to lay out with instead differs per
  renderer and is in each skill's own rendering rules.

## 2. Check the render in a browser

Liquid runs on the server, so a browser preview means resolving it by hand:

1. **Resolve the template to plain HTML** with the real product's values and the derived values
   (font stack, colours, sizes, formatted prices). Include one on-sale product so the sale
   branch renders.
2. **Inject it into a blank tab** — `document.body.innerHTML = "<div style='padding:40px;background:#eee'>…the resolved tile…</div>"`
   — and zoom-screenshot it.
3. **Compare it with the live tile:** fonts, weights, colours, alignment, row layout, price
   format, sale treatment, the CTA's colour and label, and no button the shop's tile does not
   show. Fix the template and render again until they match.

A browser is not the email's renderer. Where the skill has a real render path (the newsletter
render host), that one is the verdict and this preview is for quick comparison only.
