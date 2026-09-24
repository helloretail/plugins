# Centra / headless CSS-in-JS (MUI + Emotion) — tile reference

**Detection:** Centra API calls (`/api/centra/`), Centra CDNs (`*.centracdn.net`), headless React
(`#__next`, `window.__NUXT__`), MUI class names (`MuiTypography-root`, `MuiButtonBase-root`),
Emotion hashes (`css-1xdhyk6`).

Centra storefronts are usually headless React with MUI + Emotion CSS-in-JS. That changes the
rules of this skill more than any other platform — read all of this before building.

## Class names: copy them, but know what they are

Elements carry two kinds of Emotion classes — copy **both** verbatim (Output Rule #10):

- **Label classes** (`e6yp90u16`, `e1bwhb8d3`) — component labels from the Emotion babel plugin.
  Reasonably stable across builds; use these as your JS selectors.
- **Hash classes** (`css-1xdhyk6`) — content hashes of the style rules. They change whenever the
  styles change **and different variants of the same component get different hashes per state**
  (sale vs normal price row, selected vs unselected swatch, each badge color).

## The big one — Emotion CSS is injected per page; the tile brings no styling with it

Emotion inserts a rule only on pages that rendered a component using it. The HR Search overlay
opens from the header on **every** page — PDP, blog, cart, homepage — where the category-tile
rules may not exist at all, or exist only for the states that page happened to render.

Verified on a live onboarding (headless Centra/MUI storefront, 2026-07): the same tile markup rendered a **red uppercase
OUTLET badge on a PDP but a beige lowercase one on a category page** (the badge-state rule wasn't
injected there), and the swatch-row layout collapsed on the PDP. Worse, the site's own rule for a
copied class can **actively break** the tile out of context — the image class resolved to the PDP
gallery's `position: absolute`, pulling the tile image out of flow and collapsing the image box.

### Prove it before treating a shop as CSS-in-JS

Both checks must hold; fail either and it is a classic theme — Output Rule 2 applies unchanged and
you write no CSS:

1. **Injected style tags on the page.** `document.querySelectorAll('style[data-emotion], style[data-styled], style[data-s]').length > 0`,
   or the tile's classes are content hashes (`css-1xdhyk6`) with no matching rule in any
   `<link rel="stylesheet">` sheet.
2. **The tile loses its rules on another page type.** Run the body-level harness
   (`survey-snippets.md` → ANCESTOR-SCOPED CSS) with the captured tile on a PDP or content page: if
   the computed styles differ from the category page for the same markup, the CSS is page-dependent.

### Then, in this order

1. **Ask the operator first** — put it under OPEN QUESTIONS: *can the customer make the tile's CSS
   global?* Most CSS-in-JS setups can extract the product-card styles into a plain stylesheet loaded
   on every page (a static CSS export, or a global style block for the card component). That fixes
   every Hello Retail surface at once and keeps the tile CSS-free.
2. **Only if the answer is no, copy the customer's own rules.** Collect the actual declarations that
   match the tile's classes from the injected style tags and sheets on the category page (walk
   `document.styleSheets` and the `data-emotion` tags' `sheet.cssRules`; keep the rules whose
   selectors match an element of the tile), rescope them under the Hello Retail root
   (`.hr-overlay-search …` for Search, `#hello-retail-{{ key }}` for Recom), keyed on the **label
   classes** (hash classes change per state — see above), and return that as `CSS BLOCK`. It is a
   copy, not a reconstruction: never rebuild a stylesheet from `getComputedStyle`, never invent a
   value. Include the rules for every surveyed state (sale, sold-out, badge variants), since each
   state has its own hash. Say under SHELL CSS NOTES which rules were copied and from which tags.
3. **Verify on two page types**: harness the tile with the copied block on a category page AND a
   PDP/content page. If it only looks right on the category page, the copy is missing state rules.

Geometry the copied rules do not cover (an image box that collapses because a class resolves
differently out of context) is reported, not patched: name the element and the native computed
values under SHELL CSS NOTES and let the shell decide.

## Lazy-load / reveal inline styles — normalize to the loaded state

React media components (e.g. `OuiMediaReveal`) render images with
`style="opacity:0;visibility:hidden"` and flip them on load. HR never runs that JS — copied
verbatim, the images stay invisible. **Normalize these loading-state inline styles to their
loaded state** (e.g. `opacity: 1`, drop `visibility:hidden`) — the one sanctioned inline-style
edit beyond dynamic values. Flag it in the response.

## State-driven UI (CSS variables) — reimplement with JS + inline styles

Native show/hide state often runs through CSS custom properties set by React (e.g. a slider
arrow with `display: var(--_next-button-display)`). Those vars never update in HR. Control such
elements from your own JS via inline `style.display`, and give them a sensible **no-JS CSS
default** — the HR dashboard preview renders templates *without* running any init JS, so
JS-only-revealed elements look "missing" to a CSM reviewing there. A `:has()` rule works well,
e.g. show a swatch-slider's forward arrow when the strip has 7+ swatches:
`.strip:has(> a:nth-child(7)) ~ button.next { display:flex }`.

## Swatch/slider scrolling — Chrome smooth-scroll gotcha

Native swatch strips are often `overflow-x: hidden` with CSS `scroll-behavior: smooth`. In
Chrome, smooth scrolling on a hidden-overflow container is a **silent no-op** — `scrollBy`/
`scrollTo`/`scrollLeft` assignment all do nothing while smooth is in effect. Set
`strip.style.scrollBehavior = "auto"` at bind time and animate with a small rAF ease to keep the
native feel.

## No canonical ATC

Centra has no single ATC form — read the real product card's form/button in the live DOM and
reproduce its `action`, field names, and classes exactly. Many Centra category tiles have **no**
ATC at all (navigation-only tiles) — don't invent one. Whatever the ATC turns out to be, it must
carry HR cart tracking (Output Rule #11):
`onclick="hrq.push(['trackClick','{{ product.trackingCode }}'])"`.

## Surveying — headless React caveats

- The tile only exists after JS renders — always inspect via a real browser MCP (Playwright
  `mcp__plugin_hello-retail_playwright__browser_*` by default; Claude in Chrome
  `mcp__claude-in-chrome__*` as the fallback), never a static fetch, or you'll get an empty shell.
- **React reconciliation removes foreign DOM injected inside its tree.** When testing/harnessing
  a tile on the live page, append it to `document.body` (fixed-position) — like the real HR
  overlay — never inside the React-managed grid.
- On the Claude in Chrome fallback, the `javascript_tool` blocks outputs containing URLs/query
  strings; return structural summaries and sliced data per the SKILL.md extraction snippets
  (Playwright's `browser_evaluate` has no such restriction).
