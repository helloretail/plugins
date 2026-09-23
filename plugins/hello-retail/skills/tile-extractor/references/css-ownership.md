# CSS — what you report, what the shell writes

Read this before workflow steps 4b–4c of `../SKILL.md` and before writing the `SHELL CSS NOTES`,
`PARENT HOOKS` and `ALIGNMENT` sections of the response.

Two facts decide who writes CSS:

- On **classic themes** the live Hello Retail overlay and the recom box get the site stylesheet, so a
  tile with its classes preserved verbatim is styled by the theme. This skill writes **no CSS**
  (Output Rule 2). The **dashboard preview** loads no site CSS, so a CSM reviewing there sees an unstyled
  tile — that is expected and not a defect; say so in the response so nobody "fixes" it.
- On **CSS-in-JS storefronts** (MUI/Emotion, styled-components) the live surfaces cannot rely on the
  site stylesheet either — styles are injected per page and per rendered state, so the same tile
  renders differently depending on which page the overlay opens from. Here the tile **must** ship a
  self-contained CSS block (computed styles, scoped, keyed on stable label classes), returned under
  `CSS BLOCK`, verified on a category page **and** a PDP. Details + failure modes: `centra.md`.

What you report under `SHELL CSS NOTES` for every build (the shell decides and writes the rule):

- **Hover-only elements** — selector, trigger, changed declarations (`survey-snippets.md` → HOVER STATE INSPECTION).
- **Theme rules the tile needs that can't reach it** — `body.`/`#id`-scoped rules found by the
  PARENT HOOKS harness, with the native computed values.
- **Tile root geometry** — the native tile's rendered width, whether the root is a real card
  (border / background / shadow) or a gutter-padded grid cell, and the grid's column count and gap.
  The shell uses this for `product_tile_width`, the gutter rule and the fixed-column override.
- **Colours** — the buy button's computed `background-color` and `color`, and the sale/accent
  colour. `primary_shop_color` in the shells is the accent colour (badges, price highlights),
  **not** the button colour; the two often differ.
- **Anything the preview will show wrong** — list it once so the CSM knows.

Every value in these notes is a `getComputedStyle` reading, never a guess.
