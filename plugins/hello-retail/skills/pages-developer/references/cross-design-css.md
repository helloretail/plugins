# Cross-design CSS leaks — other Hello Retail designs' rules reaching the Pages markup

Read it at step 4m, on every build on a website that also runs a Search or Recommendations design. Step numbers in this file are the workflow steps of `../SKILL.md`.

## Cross-design CSS leaks (step 4m)

**Cross-design CSS leaks — other HR designs' rules reach the Pages markup.** Search and
recom designs share class names with Pages (`.hr-products-container`, `.hr-filters-container`,
`.aw-filter-tag-list`, the range slider, the sort label), and their CSS is on every page,
not only where their own widget renders. An unscoped rule in one of them restyles the Pages
grid and drawer. Field-proven 2026-10 (Shopify Enterprise theme): a mobile overlay search
design's `.hr-products-container{display:grid;gap:8px}`, filter-label padding, absolute
filter counts, `.hr-filters-container` height/overflow, slider handle and labels, and a
white sort-label background broke the Pages tablet grid and mobile drawer below 1024 px;
desktop looked clean, so it was found only by measuring at 820. With the Pages draft
rendered, run this at **820 and 375** (and any other width where 4b/4k/4l look wrong) and
read every row:

```js
{
  var root = document.querySelector('[id^="helloretail-category-page-"]');
  var out = [];
  [...document.styleSheets].forEach(function (sheet, i) {
    var rules; try { rules = sheet.cssRules; } catch (e) { return; }
    // The Pages design's own stylesheet is the one that styles .hr-category-page-*
    var own = [...rules].some(function (r) { return /hr-category-page/.test(r.cssText); });
    (function walk(list, media) {
      [...list].forEach(function (r) {
        if (r.media && r.cssRules) { if (matchMedia(r.media.mediaText).matches) walk(r.cssRules, r.media.mediaText); return; }
        if (!r.selectorText || !/\.(hr|aw)-/.test(r.selectorText)) return;
        var hits; try { hits = root.querySelectorAll(r.selectorText).length; } catch (e) { return; }
        if (hits) out.push({ sheet: i, own: own, owner: (sheet.ownerNode && (sheet.ownerNode.id || sheet.ownerNode.className)) || sheet.href || '-',
          media: media || '-', selector: r.selectorText, css: r.style.cssText.slice(0, 120), hits: hits });
      });
    })(rules);
  });
  console.table(out);
}
```

Each row is an `.hr-` / `.aw-` rule that matches an element inside the Pages container at
this width; `own: true` rows come from the Pages design's stylesheet, `own: false` rows from
any other (another HR design, or the theme reusing HR class names). A row is a leak when
its CSS is not in the design's `templateCss` — if every row says `own: true` but the layout
is still wrong, the designs share one stylesheet: compare each row's `css` with
`templateCss` instead. The block and `var` keep it re-runnable at each width. No leak at
either width → note it under the build summary. Otherwise:

- **Fix on the Pages side, never in the other design** — it may be LIVE and belongs to
  another feature. Raise the specificity of the Pages design's own rule for that element:
  prefix its selector with the Pages container
  (`[id^="helloretail-category-page-"] .hr-products-container`) so it outranks the
  unscoped one. Where the design sets no value for a property the leaking rule sets,
  add it to that same rule (under the leaking rule's `@media` condition when the leak is
  band-specific) with the property's initial value — `display: flex` back from `grid`,
  `position: static`, `background: transparent`, `height: auto`, `overflow: visible`.
  Only the properties the leaking rule sets, per the CSS rule in `../SKILL.md` → *Hard rules recap*.
- Re-run the snippet and the 4b grid measurement at the same widths; the rows the
  override covers must now resolve to the Pages values (`getComputedStyle`).
- Report the leaking design and its selectors in the hand-off, so its owner can scope it.
