# Placement snippets — turn the operator's answer into a selector

Browser-console snippets for `box-setup.md` → step 3. Run them with the browser MCP's evaluate
tool on the live page the box goes on. They only read the page — except *Preview the spot*, which
adds a marker in **your** browser that a reload removes. Nothing here writes to Hello Retail.

## Section map — when there is no selector and no match

Lists the page's top-level sections in order, so the operator can answer "number 4, after it".

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

Show the result as a numbered list (`n`, heading, position). Pass the chosen section's element to
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
