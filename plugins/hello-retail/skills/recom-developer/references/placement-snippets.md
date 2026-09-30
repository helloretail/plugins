# Placement snippets — where the box goes, and what the shop's own sliders do

Browser-console snippets for `box-setup.md` → steps 3 and 4. Run them with the browser MCP's evaluate
tool on the live page the box goes on. They only read the page — except *Preview the spot*, which
adds a marker in **your** browser that a reload removes. Nothing here writes to Hello Retail.

## Section map — when there is no selector and no match

Lists the page's top-level sections in order — they become the options of the placement question
(`box-setup.md` → round B), and the operator can still answer "number 4, after it".

```js
(() => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  let root = document.querySelector('main, [role="main"], #MainContent') || document.body;
  // Some themes wrap every section in one extra div: step down until the sections are siblings.
  while (root.children.length < 3 && root.firstElementChild) {
    root = [...root.children].sort((a, b) => b.offsetHeight - a.offsetHeight)[0];
  }
  return [...root.children]
    .filter(el => el.offsetHeight > 40 && getComputedStyle(el).display !== 'none')
    .map((el, i) => ({
      n: i + 1,
      heading: clean(el.querySelector('h1, h2, h3, [class*="title"], [class*="heading"]')?.textContent).slice(0, 60) || '(no heading)',
      tag: el.tagName.toLowerCase(),
      id: el.id || null,
      classes: clean(el.className?.toString()).slice(0, 80) || null,
      top: Math.round(el.getBoundingClientRect().top + scrollY),
    }));
})()
```

Offer the likely sections as the options of the placement question; show the whole result as a
numbered list (`n`, heading, position) when none of them fits. Pass the chosen section's element to
*Find the section by its text* using its heading, or build the selector from its `id` / classes
and run *Verify a selector*.

## Find the section by its text

The operator named a heading or visible text. Finds it, climbs to the section that holds it, and
ranks candidate selectors for that section. Replace `NEEDLE`.

```js
((needle) => {
  const clean = s => (s || '').replace(/\s+/g, ' ').trim().toLowerCase();
  const want = clean(needle);
  const has = el => clean(el.textContent).includes(want);
  // The deepest visible elements holding the text (works when the text is split over tags).
  const hits = [...document.body.querySelectorAll('*')].filter(el =>
    !el.closest('script, style, noscript, head') && el.offsetHeight > 0 && has(el) && ![...el.children].some(has));
  if (!hits.length) return { found: false, hint: 'Run the section map and ask the operator to pick one.' };
  // Prefer a real heading over body text that merely mentions the phrase.
  const hit = hits.find(el => el.closest('h1, h2, h3, h4, [class*="title"], [class*="heading"]')) || hits[0];
  // The same section list the section map uses: climb until the parent is that list.
  let root = document.querySelector('main, [role="main"], #MainContent') || document.body;
  while (root.children.length < 3 && root.firstElementChild) {
    root = [...root.children].sort((a, b) => b.offsetHeight - a.offsetHeight)[0];
  }
  const isSection = el => el.matches('section, [id^="shopify-section"], .shopify-section, [data-section-type], [data-section-id]');
  let section = hit;
  while (section.parentElement && section.parentElement !== root && section !== root && !isSection(section)) section = section.parentElement;
  const tag = section.tagName.toLowerCase();
  const volatileId = id => /\d{5,}|template--/.test(id);
  const stableClasses = [...section.classList].filter(c => !/\d{3,}|^(is-|js-|aos|active|visible|loaded|animate)|^css-/.test(c));
  const candidates = [];
  if (section.id && !volatileId(section.id)) candidates.push('#' + CSS.escape(section.id));
  if (section.id && volatileId(section.id)) {
    const suffix = section.id.split('__').pop();
    if (suffix && suffix !== section.id) candidates.push(`${tag}[id$="__${suffix}"]`);
  }
  for (const a of ['data-section-type', 'data-section-id', 'data-section']) {
    const v = section.getAttribute(a);
    if (v && !volatileId(v)) candidates.push(`${tag}[${a}="${v}"]`);
  }
  if (stableClasses.length) candidates.push(tag + '.' + stableClasses.slice(0, 3).map(c => CSS.escape(c)).join('.'));
  return {
    found: true,
    textHits: hits.length,                                 // > 1 → the text is in several places: ask which
    matchedText: hit.textContent.replace(/\s+/g, ' ').trim().slice(0, 80),
    candidates: candidates.map(sel => ({ sel, matches: document.querySelectorAll(sel).length, isThisSection: document.querySelector(sel) === section })),
  };
})('NEEDLE')
```

Take the first candidate with `matches: 1` and `isThisSection: true`, then run *Verify a selector*
on it. `textHits` above 1 (the phrase appears in several places) → show both to the
operator. No usable candidate → the section has only volatile or generic markup: say so and offer
the customer div instead.

## Verify a selector

Run on the page, again after a hard reload, and on 2 more pages of the same type. Replace `SELECTOR`.

```js
(async (sel) => {
  const els = document.querySelectorAll(sel);
  const el = els[0];
  const html = await fetch(location.href, { credentials: 'same-origin' }).then(r => r.text());
  const inServerHtml = new DOMParser().parseFromString(html, 'text/html').querySelectorAll(sel).length;
  return {
    matches: els.length,                                   // must be 1
    visible: !!el && el.offsetHeight > 0 && getComputedStyle(el).display !== 'none',
    inHiddenContainer: !!el?.closest('[hidden], [aria-hidden="true"], details:not([open])'),
    volatile: /\d{5,}|template--|:nth-(child|of-type)|css-[a-z0-9]{5,}/i.test(sel),
    inServerHtml,                                          // 0 while matches is 1 → selectorMode LIVE_ONCE
  };
})('SELECTOR')
```

- `matches` must be **1** on every page tested. 0 → wrong page or wrong selector; more than 1 →
  make it more specific.
- `volatile: true` → rewrite it to the stable form (a Shopify id → `tag[id$="__<suffix>"]`) and verify
  again.
- `inHiddenContainer: true` → the slider needs `observer: true` (`slider-structure.md` →
  hidden-container placements) and the placement counts as temporary unless that is in place.
- `inServerHtml: 0` with `matches: 1` → the anchor is rendered by JavaScript: `selectorMode`
  `LIVE_ONCE`.

Final vs temporary: all four checks clean on every tested page, and after a hard reload → **final**.
Anything else → **temporary**, flagged in the hand-off.

## Preview the spot

Draws a dashed marker where the box will go, for the screenshot the operator confirms. Only in
your browser — reload to remove it. Replace `SELECTOR` and `MODE` (`BEFORE`, `AFTER`, `PREPEND`,
`APPEND`, `REPLACE`).

```js
((sel, mode, label) => {
  const el = document.querySelector(sel);
  if (!el) return 'no match';
  const mark = document.createElement('div');
  mark.className = 'hr-placement-preview';
  mark.textContent = `${label} — Hello Retail recom (${mode})`;
  mark.style.cssText = 'box-sizing:border-box;padding:32px 16px;margin:12px 0;border:3px dashed #e5007d;background:rgba(229,0,125,.06);color:#e5007d;text-align:center;font:600 16px/1.4 sans-serif;';
  const place = { BEFORE: () => el.before(mark), AFTER: () => el.after(mark), PREPEND: () => el.prepend(mark), APPEND: () => el.append(mark) };
  if (mode === 'REPLACE') { el.style.outline = '3px solid #e5007d'; el.before(mark); mark.textContent += ' — replaces the outlined section'; }
  else place[mode]();
  mark.scrollIntoView({ block: 'center' });
  return 'marked';
})('SELECTOR', 'MODE', 'PDP recom 1')
```

Take the screenshot with the marker and its neighbouring sections in view, and save it into
`QA/screenshots/`. For several boxes on one page, run it once per box with a different label
before taking the screenshot.

## Survey the shop's own sliders — product count and arrows

Run on the page the box goes on (`box-setup.md` → step 4), after the page has settled. Finds the
shop's own product sliders — Swiper, Splide, Slick, Flickity, Glide, Owl, Keen and plain
scroll containers — skipping Hello Retail boxes, and reports per slider how many products it
holds (clones not counted), how many tiles are in view at this width, and its prev/next buttons
with their computed look.

```js
(() => {
  const own = el => !el.closest('[id^="hello-retail-"], [id^="aw-box-"], .hr-placement-preview');
  const clean = s => (s || '').replace(/\s+/g, ' ').trim();
  const stable = c => !/\d{3,}|initialized|^(is-|js-)|active|visible|loaded|^css-/.test(c);
  const sel = el => {
    if (el.id && !/\d{5,}/.test(el.id)) return '#' + CSS.escape(el.id);
    const label = el.getAttribute('aria-label');
    return el.tagName.toLowerCase() + [...el.classList].filter(stable).slice(0, 3).map(c => '.' + CSS.escape(c)).join('') +
      (label ? `[aria-label="${label.replace(/"/g, '\\"')}"]` : '');
  };
  const LIBS = [
    ['swiper', '.swiper, .swiper-container, swiper-container', '.swiper-slide:not(.swiper-slide-duplicate)'],
    ['splide', '.splide', '.splide__slide:not(.is-clone)'],
    ['slick', '.slick-slider', '.slick-slide:not(.slick-cloned)'],
    ['flickity', '.flickity-enabled', '.flickity-slider > *'],
    ['glide', '.glide', '.glide__slide:not(.glide__slide--clone)'],
    ['owl', '.owl-carousel', '.owl-item:not(.cloned)'],
    ['keen', '.keen-slider', '.keen-slider__slide'],
  ];
  const found = [];
  for (const [lib, rootSel, slideSel] of LIBS) {
    document.querySelectorAll(rootSel).forEach(el => { if (own(el)) found.push({ el, lib, slides: [...el.querySelectorAll(slideSel)] }); });
  }
  // Native scroll containers (Dawn-style slider sections): scroll sideways, hold several images.
  document.querySelectorAll('ul, ol, div, slider-component').forEach(el => {
    if (!own(el) || found.some(f => f.el.contains(el) || el.contains(f.el))) return;
    if (!/(auto|scroll)/.test(getComputedStyle(el).overflowX) || el.scrollWidth <= el.clientWidth + 20) return;
    const slides = [...el.children].filter(c => c.querySelector('img'));
    if (slides.length >= 3) found.push({ el, lib: 'scroll', slides });
  });
  const viewport = window.innerWidth || document.documentElement.clientWidth;
  return found
    .filter(f => !found.some(g => g !== f && g.el.contains(f.el)))        // outermost slider only
    .map(({ el, lib, slides }) => {
      // Swiper 11's loop keeps no duplicate class: count distinct slide indexes instead.
      const idx = new Set(slides.map(s => s.getAttribute('data-swiper-slide-index')).filter(v => v !== null));
      const box = el.getBoundingClientRect();
      const perView = slides.reduce((sum, s) => {
        const r = s.getBoundingClientRect();
        const vis = Math.min(r.right, box.right) - Math.max(r.left, box.left);
        return r.width > 0 && vis > 0 ? sum + vis / r.width : sum;
      }, 0);
      const scope = el.closest('section, .shopify-section, [data-section-type]') || el.parentElement;
      const btn = dir => [...scope.querySelectorAll(
        `.swiper-button-${dir}, .splide__arrow--${dir}, .slick-${dir}, .flickity-prev-next-button.${dir === 'prev' ? 'previous' : 'next'}, ` +
        `.glide__arrow--${dir === 'prev' ? 'left' : 'right'}, .owl-${dir}, ` +
        `button[aria-label*="${dir}" i], a[aria-label*="${dir}" i], button[class*="${dir}"], [role="button"][class*="${dir}"]`)]
        .find(own);
      const arrow = b => {
        if (!b) return null;
        const cs = getComputedStyle(b);
        return { selector: sel(b), visible: b.offsetWidth > 0 && cs.display !== 'none' && cs.visibility !== 'hidden',
          width: cs.width, height: cs.height, background: cs.backgroundColor, border: cs.border,
          borderRadius: cs.borderRadius, color: cs.color, boxShadow: cs.boxShadow };
      };
      return {
        lib, slider: sel(el),
        heading: clean(scope.querySelector('h1, h2, h3, [class*="title"], [class*="heading"]')?.textContent).slice(0, 60) || '(no heading)',
        products: idx.size || slides.length,                               // → the productCount default
        perView: Math.round(perView * 100) / 100, viewport,               // run at 375 / 768 / 1280
        prev: arrow(btn('prev')), next: arrow(btn('next')),                // null → the slider has no arrows
        top: Math.round(box.top + scrollY),
      };
    })
    .sort((a, b) => a.top - b.top);
})()
```

Reading it:

- **`products`** is the suggested product count for the box. When several sliders report different
  counts, prefer the one the box replaces or sits next to (same `heading` as the placement's
  section), and name the others when you ask.
- A slider that loads its products lazily (a "Recently viewed" row filled after load, a slider
  that fetches more on scroll) can report fewer than it holds — when `products` looks low, scroll
  the slider to its end and run it again.
- **`perView`** is what the shop shows at this width — fractional values (`4.48`) are a peeking
  last tile. Run at 375, 768 and 1280 px and use the three values for the box's `breakpoints`
  (`slider-structure.md` → *Swiper init*).
- **`prev` / `next`** with `visible: true` → copy that design (`slider-structure.md` →
  *Prev/next arrows*). `visible: false` at 375 px while true at 1280 → the theme hides its arrows
  on mobile: hide the box's at the same breakpoint. `null` → the shop's slider has no arrows.
- Nothing returned → the page has no slider of its own.

## Check the hide conditions — category boxes

Builds the conditional placement selector for a category box (`mcp-flow.md` → *Hiding a category
recom*) and says whether it matches on this page. Replace the values — `FILTER_SCOPE` only when the
filter check sits on a different ancestor than the count (`'body'` + `'.page-wrapper'`); leave it
`null` for the one-scope form. Run it on a category with plenty of products, one with fewer than N,
and one with a filter applied.

```js
((scope, tile, n, filterActive, anchor, filterScope) => {
  const root = document.querySelector(scope);
  const tiles = root ? [...root.querySelectorAll(tile)] : [];
  const grid = tiles[0]?.parentElement || null;
  const nonTiles = grid ? [...grid.children].filter(el => !el.matches(tile))
    .map(el => el.tagName.toLowerCase() + [...el.classList].map(c => '.' + c).join('')) : [];
  // :nth-child counts every child of the grid — count tiles only when anything else sits in it.
  const count = nonTiles.length ? `${tile}:nth-child(${n} of ${tile})` : `${tile}:nth-child(${n})`;
  const selector = filterScope
    ? `${scope}:has(${count}) ${filterScope}:not(:has(${filterActive})) ${anchor}`   // two ancestors
    : `${scope}:has(${count}):not(:has(${filterActive})) ${anchor}`;                 // one scope
  return {
    scopeFound: !!root,
    filterScopeHoldsAnchor: filterScope ? !!document.querySelector(`${filterScope} ${anchor}`) : null,   // must be true
    anchorMatches: document.querySelectorAll(anchor).length,   // must be 1
    tiles: tiles.length,
    oneGrid: tiles.every(t => t.parentElement === grid),       // false → the tile selector is too broad
    nonTileSiblings: nonTiles,                                  // anything here → the `of` form is used
    filtersActive: document.querySelectorAll(filterActive).length,
    selector,                                                   // → recoms_updatePlacement
    matches: document.querySelectorAll(selector).length,       // 1 → the box shows here, 0 → hidden
  };
})('SCOPE', 'TILE', 12, 'FILTER_ACTIVE', 'ANCHOR', null)
```

Expected: `matches: 1` on the big unfiltered category, `0` on the small one, `0` with a filter on.
Anything else → fix the part that's wrong (`tiles` counts the wrong thing, `filtersActive` is not 0
before filtering) and run it again.

**Does filtering reload the page?** Before applying a filter run `window.__hrReloadMark = 1`; after
the results update, run `typeof window.__hrReloadMark`. `"undefined"` → the page reloaded and the
selector works. `"number"` → the theme filters without a reload: the selector can't remove a box
that's already there — take the JS-guard route in `mcp-flow.md` and tell the operator why.
