# The product tile comes from `tile-extractor`

**The rule: a shell skill never builds the tile. It invokes `tile-extractor` itself, drops the
returned body into its slot unchanged, and sends every tile problem back to the tile skill.**

Shared by `search-developer`, `recom-developer` and `pages-developer`. Each skill's own step says
which slot the body goes into and what its surface adds.

## Getting the tile

1. **Single entry point.** The operator invokes only the shell skill. You invoke
   `tile-extractor` yourself (the Skill tool, or read `../skills/tile-extractor/SKILL.md` and
   follow it) — never ask the operator to run it separately.
2. **Pass it** the category page(s) you surveyed, the `website-uuid` (it reads the feed rows with
   `productData_get`; the operator does not paste them), the locale, and the **target surface**
   (`search`, `recom` or `pages`).
3. **Reuse before extracting.**
   - A tile built earlier in this same conversation for the same customer is reused.
   - A finished Recommendations tile can be reused for Search and Pages: `recoms_list` +
     `recoms_listDesigns`; a candidate is an editable company design that a LIVE box renders
     with, or a REVIEW draft whose latest `recom-qa` report under `QA/<customer>/` says it is
     ready to publish, and whose tile is the customer's card rather than the base default
     tile (read its non-banner branch with `recoms_getDesign`; the payload spills to a file).
     Candidates found → ask with `AskUserQuestion` (header `Tile source`: *Extract from the
     category page (Recommended)* / *Reuse the tile from <recom design name>*). The new survey
     is the default: no answer, or anything but a named recom design, means extract. Reuse →
     pass `reuse: recom design <design-key>`; the tile skill checks the tile still matches the
     category tile or falls back to full extraction
     (`../skills/tile-extractor/references/reuse-recom-tile.md`).
4. **The native reference stays the shop's own product grid** — for every check, in every skill.
   Never a tile inside a Hello Retail box (`.aw-item`, `[data-aw_source]`, `#aw-box-…`): it
   carries the shop's classes but is Hello Retail's copy.

## What comes back, and what you do with each section

| Section | What you do with it |
| --- | --- |
| **FIDELITY** | Every state is PASS or fully classified before the tile goes into the slot. A *shell-side* item becomes one of the shell's sanctioned edits, a restated theme rule or a NOTES line — the skill's own step says which; a *markup* item goes back to the tile skill — never into your CSS. |
| **PARENT HOOKS** | Products-container hooks go on the shell's container, cell-level hooks on the tile's cell. Scope classes only, never width or layout classes. |
| **BINDINGS**, **PARITY TABLE** | Into the build record. |
| **PRICE BASIS** | The feed field the visible price binds to (`price` or `priceExVat`). Missing → ask the tile skill, never assume `price`. |
| **TEXT INPUTS** | Recommendations only: the `{% input %}` names with their native values. Nothing to declare — they become dashboard fields — but they are carried into the hand-off so the operator fills each per domain. `none` for Search — fixed texts are copied verbatim. |
| **MISSING DATA**, **OPEN QUESTIONS**, **ASSUMPTIONS** | Carried into your own output. The two open questions for the operator go out with the diff, asked with `AskUserQuestion` unless already answered — *Sized images*: *Yes, the feed will carry them* / *No, one URL for every slot*; *Global CSS*: *Yes, the customer makes it global* / *No, copy the customer's own rules*. |

## What the shell never does

- **No tile logic.** Tile fidelity, feed mapping, price / sale / stock logic, swatches, ratings
  and the add-to-cart form markup are the tile skill's. The shell does not re-implement or
  "fix" any of them, and the tile skill's Output Rules bind the shell too — they are not
  restated or improvised here.
- **No CSS that re-creates the tile's look.** A difference between the rendered tile and the
  native tile is one of three things: a tile problem (back to `tile-extractor`), a hook (mirror
  it onto the container or the cell), or a theme rule that cannot reach the design (restate it
  word for word, rescoped to the shell's root, with the theme's own values).
- **No Liquid outside the tile skill's rules.** Liquid you write or edit in the shell follows
  `../skills/tile-extractor/references/liquid-rules.md`:
  - every block tag on its own line (→ *Formatting*);
  - every variant branch gated on `extraData.hasVariants`, which you first confirm in the
    `productData_get` rows. Field missing → stop and ask the operator to map it or name another
    field. Never fall back to `variantProductNumbers.size` (→ *Variant conditions*);
  - prices as in `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/liquid/price-formatting.md`.
- **No edit to the banner branch** (`{% if product.isBanner == true %}`): it is Retail Media
  markup. One exception — remove a stray `</img>` after its `<img class="hr-b-image" …>` (`<img>` is void, and the
  closing tag breaks HTML formatters).

## After the push — the same check again

With the draft showing on the storefront, put one Hello Retail tile beside a native tile of the
same state (the FIDELITY CHECK harness in `../skills/tile-extractor/references/survey-snippets.md`
works on the live page; or take two crops at the same zoom), at desktop and 375 px, idle and
hovered. Same → done. Different →
classify it as above. What each surface adds — other widths, one pair per tile state, its
scripts — is in the skill's own verification step.
