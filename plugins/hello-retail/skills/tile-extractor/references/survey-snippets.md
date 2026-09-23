# Survey snippets — extraction, variations, labels, parent hooks, alignment, hover

Read this before workflow steps 3–6 of `../SKILL.md`. Every snippet uses **placeholder selectors**
(`.product-tile-selector`, `.title-selector`, `.tile-root`, `.product-card`) — replace them with the
selector found for this storefront before running; a literal run returns nothing. Tool names are the
Playwright ones (`browser_evaluate`, `browser_hover`); the Claude in Chrome fallback equivalents are in
the SKILL.md BROWSER TOOL table. What each snippet finds goes into the named RESPONSE FORMAT section:
VARIATIONS, LABEL VOCABULARY, PARENT HOOKS, ALIGNMENT, SHELL CSS NOTES.

## TILE INSPECTION — COPY THE REAL HTML

The template starts from a byte-faithful copy of one native tile. On Playwright, capture the
element's `outerHTML` directly. The node-list `collect()` walk is kept only for the Claude in Chrome
fallback, whose `javascript_tool` refuses output that contains URLs. On either path only two kinds
of value are touched: URL-bearing attribute values become `[URL:<attribute>]` tokens (Output Rule 8
restores every one from the feed), and attributes the site did not author are removed (Output
Rule 10). Everything else comes out exactly as the storefront has it.

### 1. Pick a clean specimen

Take the tile from the main product grid of the category page — never a slider clone
(`.swiper-slide-duplicate`, `.slick-cloned`), never a tile inside a third-party recommendation
widget, never one inside an existing Hello Retail box (`[id^="hello-retail"]`). Prefer a tile in the
viewport whose product is a plain in-stock product; the sale, sold-out and badge specimens come from
the survey in the next section, captured the same way.

### 2. Settle it before capturing

The DOM at first paint is not the DOM the customer sees. Scroll the tile into view, wait until its
images have loaded, and move the pointer off it so no hover state is captured:

```javascript
(async () => {
  const tile = document.querySelector(".product-tile-selector");
  tile.scrollIntoView({ block: "center" });
  const imgs = [...tile.querySelectorAll("img")];
  await Promise.all(imgs.map((i) => (i.complete ? null : new Promise((r) => { i.onload = i.onerror = r; }))));
  await new Promise((r) => setTimeout(r, 600));
  return imgs.map((i) => ({ loaded: !!i.currentSrc, naturalWidth: i.naturalWidth }));
})();
```

Then `browser_hover` on the page header (anything outside the grid) and capture.

### 3. Capture on Playwright — `outerHTML`

```javascript
(() => {
  const tile = document.querySelector(".product-tile-selector");
  const clone = tile.cloneNode(true);
  const INJECTED = /^(bis_|__processed_|data-gramm|data-gr-|data-new-gr-|data-lastpass|data-1p-|data-dashlane|data-kwimpala|data-darkreader|data-ms-editor|cz-shortcut-listen)/i;
  const all = document.querySelectorAll("*");
  const seen = {};
  all.forEach((el) => [...el.attributes].forEach((a) => {
    const k = a.name + "=" + a.value;
    seen[k] = (seen[k] || 0) + 1;
  }));
  const uniform = new Set(Object.entries(seen)
    .filter(([, n]) => n > all.length * 0.8)
    .map(([k]) => k.split("=")[0]));
  const removed = new Set();
  [clone, ...clone.querySelectorAll("*")].forEach((el) => {
    for (const a of [...el.attributes]) {
      if (INJECTED.test(a.name) || uniform.has(a.name)) {
        removed.add(a.name);
        el.removeAttribute(a.name);
        continue;
      }
      if (/^(src|href|srcset|data-src|data-srcset|data-image|data-href|poster|action)$/i.test(a.name) ||
          a.value.includes("://")) el.setAttribute(a.name, `[URL:${a.name}]`);
      if (a.name === "style" && /url\(/i.test(a.value))
        el.setAttribute("style", a.value.replace(/url\([^)]*\)/gi, "url([URL:style])"));
    }
  });
  return { removedAttributes: [...removed], html: clone.outerHTML };
})();
```

`html` is the tile as-is with `[URL:*]` tokens. `removedAttributes` is what the injected-attribute
rule dropped — repeat it under ASSUMPTIONS so the operator sees the decision.

**Injected attributes — strip by provenance, and only those.** Browser extensions and security tools
stamp the DOM they scan: Bitdefender's `bis_skin_checked`, `bis_size`, `bis_id`, `bis_register`;
Grammarly's `data-gramm*` / `data-gr-*`; password managers' `data-lastpass-*` / `data-1p-*` /
`data-dashlane-*`; Dark Reader's `data-darkreader-*`. The snippet removes those families and, because
a scanner marks nearly every element on the page with the same attribute and value, any attribute
that appears with a constant value on more than 80 % of all elements — so a new tool is caught
without a list update. Everything the site authored stays, however odd it looks: Vue `data-v-*`,
Alpine `x-data`, Magento `data-mage-init`, Shopware `data-product-information`, theme-JS `aria-*`.
Playwright sessions run without extensions, so on the default backend the list is normally empty; it
matters on the Claude in Chrome fallback and for pasted HTML, where you apply the same denylist by
hand and list what you dropped.

### 3, fallback — Claude in Chrome: `collect()`

Same tokens, same injected-attribute rule, but as a node list because that tool blocks URL output.
Call it in slices (`results.slice(0, 50)`, then `results.slice(50)` …) to avoid truncation, and
rebuild the markup from the list without reordering, dropping or renaming anything.

```javascript
const INJECTED = /^(bis_|__processed_|data-gramm|data-gr-|data-new-gr-|data-lastpass|data-1p-|data-dashlane|data-kwimpala|data-darkreader|data-ms-editor|cz-shortcut-listen)/i;
const results = [];
let idx = 0;
function collect(el, depth) {
  if (!el || depth > 15) return;
  const tag = el.tagName?.toLowerCase();
  const attrs = {};
  Array.from(el.attributes || []).forEach((a) => {
    if (INJECTED.test(a.name)) return;
    if (a.name === "class" || a.name === "style") { attrs[a.name] = a.value; return; }
    const hasUrl =
      a.value.includes("://") || (a.value.includes("/") && a.value.length > 15);
    attrs[a.name] = hasUrl ? `[URL:${a.name}]` : a.value;
  });
  const txt =
    el.children.length === 0 ? el.textContent.trim() : "";
  results.push({ i: idx++, d: depth, tag, attrs, txt });
  Array.from(el.children).forEach((c) => collect(c, depth + 1));
}
collect(document.querySelector(".product-tile-selector"), 0);
JSON.stringify(results.slice(0, 50));
```

### 4. Record the ancestor chain — for the root decision and PARENT HOOKS

Output Rule 14 says the tile root is the per-product card, never the grid cell around it. Decide it
with evidence, not by eye:

```javascript
(() => {
  const tile = document.querySelector(".product-tile-selector");
  const sig = (el) => el.tagName.toLowerCase() + (el.id ? "#" + el.id : "") + [...el.classList].map((c) => "." + c).join(".");
  const probe = (el) => {
    const s = getComputedStyle(el);
    const p = getComputedStyle(el.parentElement);
    return {
      el: sig(el),
      chrome: s.borderTopWidth !== "0px" || s.backgroundColor !== "rgba(0, 0, 0, 0)" || s.boxShadow !== "none",
      width: Math.round(el.getBoundingClientRect().width),
      parentDisplay: p.display,
      siblings: el.parentElement.children.length,
      children: el.children.length,
    };
  };
  const out = [];
  let el = tile;
  for (let i = 0; i < 4 && el && el !== document.body; i++) { out.push({ level: i, ...probe(el) }); el = el.parentElement; }
  return out;
})();
```

Read it upward from the element you selected. The first level with card chrome (border, background
or shadow), or the first level that holds the whole card as its only child, is the **root**. A level
above it whose parent is `display: grid` or `flex`, that has many siblings and no chrome of its own,
is the customer's **cell**: it is dropped, and any of its classes the tile's CSS needs go under
PARENT HOOKS as *cell-level*. Where the same element is both (WooCommerce `li.product`, Lightspeed
`li.data-product`), it is the root and Rule 10's width strip applies to it.

Every `[URL:*]` token in the captured markup MUST be restored in the Liquid template with the correct
HR feed field. Never leave a token in the final output.

## TILE SURVEY — FIND ALL VARIATIONS

Always survey 10–15 tiles to find every state before writing the template:

```javascript
const tiles = document.querySelectorAll(".product-tile-selector");

Array.from(tiles)
  .slice(0, 15)
  .map((t, i) => ({
    i,
    title: t
      .querySelector(".title-selector")
      ?.textContent?.trim()
      ?.slice(0, 40),
    badges: Array.from(
      t.querySelectorAll('[class*="badge"],[class*="label"],[class*="sale"]'),
    ).map((b) => ({
      cls: b.className,
      text: b.textContent.trim().slice(0, 30),
    })),
    stockClass: t.querySelector('[class*="stock"]')?.className,
    stockText: t.querySelector('[class*="stock"]')?.textContent?.trim(),
    btnText: t.querySelector('button[type="submit"]')?.textContent?.trim(),
    btnDisabled: t
      .querySelector('button[type="submit"]')
      ?.hasAttribute("disabled"),
    hasRating: !!t.querySelector(
      '[class*="rating"],[class*="rateit"],[class*="star"]',
    ),
    ratingVal:
      t
        .querySelector("[data-rateit-value],[data-rating]")
        ?.getAttribute("data-rateit-value") ||
      t.querySelector("[data-rating]")?.getAttribute("data-rating"),
    hasAltImg: !!t.querySelector(
      'img:nth-child(2), .second-img, [class*="hover"]',
    ),
  }));
```

## MULTI-TILE DIFF — DYNAMIC SPOTS AND STATE BRANCHES

The template is the normal tile's copy with two kinds of change: product values swapped for feed
expressions, and state-only markup wrapped in conditions. Both are found by comparing tiles, not
by judgment:

- a value that differs between **two normal tiles** of the same shop is **dynamic** (title, price,
  alt text, a product id inside `id`, `data-*` or `href`);
- markup present in a **state tile** (sale, sold-out, badge) but not in the normal tile — or missing
  from it — is a **branch**; a class that only a state tile carries is a **class token**.

Run once, after the survey has given you one selector per state (workflow steps 4 and 6b). Two
normal tiles are mandatory; omit states the shop does not have. Two more settings feed the
additions the rules require, so that nothing is ever added to the copy by hand:

- `ATC_SELECTOR` — the add-to-cart control inside the tile (`""` when the tile has none). The
  snippet puts the Output Rule 11 tracking call on it, prepended to any existing `onclick`, as a
  `[TRACKING]` token the script binds to `{{ product.trackingCode }}` on its own.
- `FIXED_TEXTS` — `target = recom` only: the fixed texts that become dashboard inputs (Output
  Rule 16), as `{ add_to_cart_label: "Læg i kurv", sold_out_label: "Udsolgt" }`. Each exact text
  node becomes `[INPUT:name]`, which the script binds to `{% input name %}`; list the same names
  under TEXT INPUTS. Leave it `{}` for Search and Pages.

```javascript
(() => {
  const SPECIMENS = {
    normal: ".product-tile-selector:nth-child(1)",
    normalB: ".product-tile-selector:nth-child(2)",
    sale: ".product-tile-selector.sale-example",
    soldout: ".product-tile-selector.soldout-example",
    badge: ".product-tile-selector.badge-example",
  };
  const ATC_SELECTOR = "button.add-to-cart-selector";
  const FIXED_TEXTS = {};
  const INJECTED = /^(bis_|__processed_|data-gramm|data-gr-|data-new-gr-|data-lastpass|data-1p-|data-dashlane|data-kwimpala|data-darkreader|data-ms-editor|cz-shortcut-listen)/i;
  const URLATTR = /^(src|href|srcset|data-src|data-srcset|data-image|data-href|poster|action)$/i;
  const pathOf = (el, root) => {
    const p = [];
    while (el && el !== root) {
      const parent = el.parentElement;
      const idx = [...parent.children].filter((c) => c.tagName === el.tagName).indexOf(el);
      p.unshift(el.tagName.toLowerCase() + "[" + idx + "]");
      el = parent;
    }
    return p.join(">") || ".";
  };
  const scan = (root) => {
    const m = new Map();
    [root, ...root.querySelectorAll("*")].forEach((el) => {
      const attrs = {};
      [...el.attributes].forEach((a) => { if (!INJECTED.test(a.name)) attrs[a.name] = a.value; });
      const texts = [...el.childNodes].filter((t) => t.nodeType === 3 && t.textContent.trim()).map((t) => t.textContent.trim());
      m.set(pathOf(el, root), { el, attrs, texts });
    });
    return m;
  };
  const origUrls = new Map();
  const remember = (e, name, values) => { const m = origUrls.get(e) || {}; m[name] = values; origUrls.set(e, m); };
  const tokenise = (el) => {
    [el, ...el.querySelectorAll("*")].forEach((e) => {
      for (const a of [...e.attributes]) {
        if (INJECTED.test(a.name)) { e.removeAttribute(a.name); continue; }
        if (URLATTR.test(a.name) || a.value.includes("://")) { remember(e, a.name, [a.value]); e.setAttribute(a.name, "[URL:" + a.name + "]"); continue; }
        if (a.name === "style" && /url\(/i.test(a.value)) { remember(e, "style", [...a.value.matchAll(/url\(([^)]*)\)/gi)].map((x) => x[1])); e.setAttribute("style", a.value.replace(/url\([^)]*\)/gi, "url([URL:style])")); }
      }
    });
  };
  const tiles = {};
  for (const [k, s] of Object.entries(SPECIMENS)) { const el = document.querySelector(s); if (el) tiles[k] = el; }
  if (!tiles.normal || !tiles.normalB) return { error: "two normal specimens are required" };
  const maps = {};
  for (const [k, el] of Object.entries(tiles)) maps[k] = scan(el);
  const base = maps.normal, other = maps.normalB;
  const skeleton = tiles.normal.cloneNode(true);
  const skel = scan(skeleton);
  const spots = [];
  const branches = [];
  let n = 0;
  for (const [path, a] of base) {
    const s = skel.get(path), b = other.get(path);
    const textNodes = [...s.el.childNodes].filter((t) => t.nodeType === 3 && t.textContent.trim());
    a.texts.forEach((txt, i) => {
      if (b && b.texts[i] !== undefined && b.texts[i] !== txt) {
        const id = "TEXT:" + (++n);
        textNodes[i].textContent = textNodes[i].textContent.replace(txt, "[" + id + "]");
        spots.push({ id, path, kind: "text", normal: txt, normalB: b.texts[i] });
      }
    });
    for (const [name, v] of Object.entries(a.attrs)) {
      if (b && b.attrs[name] !== undefined && b.attrs[name] !== v && name !== "class" && name !== "style" && !URLATTR.test(name) && !v.includes("://")) {
        const id = "ATTR:" + name + ":" + (++n);
        s.el.setAttribute(name, s.el.getAttribute(name).replace(v, "[" + id + "]"));
        spots.push({ id, path, kind: "attr", attr: name, normal: v, normalB: b.attrs[name] });
      }
    }
  }
  tokenise(skeleton);
  [...skeleton.querySelectorAll("*"), skeleton].forEach((e) => {
    for (const a of [...e.attributes]) { const m = /\[URL:([^\]]+)\]/.exec(a.value); if (m && !spots.find((x) => x.id === "URL:" + m[1])) spots.push({ id: "URL:" + m[1], kind: "url", attr: m[1] }); }
  });
  if (ATC_SELECTOR) {
    const atc = [skeleton, ...skeleton.querySelectorAll("*")].filter((e) => e.matches(ATC_SELECTOR));
    atc.forEach((e) => {
      const existing = e.getAttribute("onclick");
      e.setAttribute("onclick", "hrq.push(['trackClick','[TRACKING]'])" + (existing ? "; " + existing : ""));
    });
    spots.push({ id: "TRACKING", kind: "tracking", elements: atc.length });
  }
  for (const [name, text] of Object.entries(FIXED_TEXTS)) {
    let hits = 0;
    [skeleton, ...skeleton.querySelectorAll("*")].forEach((e) => [...e.childNodes].forEach((t) => {
      if (t.nodeType === 3 && t.textContent.trim() === text) { t.textContent = t.textContent.replace(text, "[INPUT:" + name + "]"); hits++; }
    }));
    spots.push({ id: "INPUT:" + name, kind: "input", text, hits });
  }
  for (const [state, m] of Object.entries(maps)) {
    if (state === "normal" || state === "normalB") continue;
    for (const [path, x] of m) {
      if (base.has(path)) {
        const a = base.get(path), s = skel.get(path);
        if (a.attrs.class !== undefined && x.attrs.class !== undefined && a.attrs.class !== x.attrs.class) {
          const extra = x.attrs.class.split(/\s+/).filter((c) => c && !a.attrs.class.split(/\s+/).includes(c));
          if (extra.length) {
            const id = "CLASS:" + state + ":" + (++n);
            s.el.setAttribute("class", (s.el.getAttribute("class") + " [" + id + "]").trim());
            branches.push({ id, state, path, kind: "class-only-in-state", adds: extra.join(" ") });
          }
        }
        continue;
      }
      if ([...m.keys()].some((p) => p !== path && path.startsWith(p + ">") && !base.has(p))) continue;
      const parentPath = path.includes(">") ? path.slice(0, path.lastIndexOf(">")) : ".";
      const parent = skel.get(parentPath);
      if (!parent) continue;
      const id = "BRANCH:" + state + ":" + (++n);
      const clone = x.el.cloneNode(true);
      tokenise(clone);
      const fixed = new Set(Object.values(FIXED_TEXTS));
      [clone, ...clone.querySelectorAll("*")].forEach((e) => [...e.childNodes].forEach((t) => {
        const txt = t.nodeType === 3 ? t.textContent.trim() : "";
        if (!txt || fixed.has(txt)) return;
        const tid = "TEXT:" + (++n);
        t.textContent = t.textContent.replace(txt, "[" + tid + "]");
        spots.push({ id: tid, path, kind: "text", state, normal: txt });
      }));
      const idx = [...x.el.parentElement.children].indexOf(x.el);
      const ref = parent.el.children[idx] || null;
      const open = document.createComment("HR-IF:" + id), close = document.createComment("HR-ENDIF:" + id);
      parent.el.insertBefore(close, ref);
      parent.el.insertBefore(clone, close);
      parent.el.insertBefore(open, clone);
      branches.push({ id, state, path, kind: "only-in-state" });
    }
    for (const path of base.keys()) {
      if (m.has(path)) continue;
      if ([...base.keys()].some((p) => p !== path && path.startsWith(p + ">") && !m.has(p))) continue;
      const s = skel.get(path);
      const id = "BRANCH:not-" + state + ":" + (++n);
      s.el.before(document.createComment("HR-IF:" + id));
      s.el.after(document.createComment("HR-ENDIF:" + id));
      branches.push({ id, state, path, kind: "missing-in-state" });
    }
  }
  const urlValues = [];
  [skeleton, ...skeleton.querySelectorAll("*")].forEach((e) => [...e.attributes].forEach((a) => {
    const count = (a.value.match(/\[URL:/g) || []).length;
    if (!count) return;
    const vals = (origUrls.get(e) || {})[a.name] || [];
    for (let i = 0; i < count; i++) urlValues.push(vals[i] || "");
  }));
  return { specimens: Object.keys(tiles), spots, branches, skeleton: skeleton.outerHTML, urlValues };
})();
```

Save the whole result as `diff.json` in the scratch folder (the fidelity check reads it) and its
`skeleton` field as `skeleton.html`. The result has three parts, and each goes somewhere:

- **`skeleton`** — the normal tile with `[TEXT:n]`, `[ATTR:name:n]`, `[URL:name]` and `[CLASS:state:n]`
  tokens, and `<!--HR-IF:…-->` / `<!--HR-ENDIF:…-->` markers around state-only markup. Save it as
  `skeleton.html` in the session scratch folder. **Never edit it by hand.**
- **`spots`** and **`branches`** — the rows of the BINDINGS table. For each spot decide the feed
  expression (`{{ product.title }}`, `{{ product.price | price }} {{ product.currency | currencySymbol }}`,
  `{{ product.extraData.itemNumber }}`; `| escape` inside attributes); for each branch the Liquid
  condition (`product.isOnSale`, `product.inStock == false`, `product.inStock`), or `always` when the
  difference was noise (a "new" badge that happened to sit on the normal specimen, a class the theme
  toggles at random). Texts inside an inserted branch (a badge's "-20 %", a "Sold out" label) come
  out as `TEXT` rows of their own, carrying the state specimen's value: bind a computed one to its
  expression (`{{ product.oldPrice | minus: product.price | times: 100 | divided_by: product.oldPrice | round }}`)
  and a fixed label to the literal text itself (or list it in `FIXED_TEXTS` for recom).
- Save the filled table as `bindings.json` (shape in `scripts/bind-tile.mjs`) and run the script
  (workflow step 8). It substitutes, refuses to write a template while any token or marker is
  unbound, and refuses when the element sequence changed — the two ways a hand edit would show.

Paths are `tag[index]` chains from the tile root, so the same path names the same element in every
specimen. A shop whose normal tiles differ in structure between themselves (one has a swatch strip,
one has not) shows those as `missing-in-state` rows against `normalB`; bind them to the feed field
that drives the element (`extraDataList.swatchIMG`) or `always`.

## LABEL VOCABULARY — SURVEY THE DEDICATED LABEL PAGES

The reference category is never enough for labels. Shops concentrate them on dedicated pages —
"New" on the New Arrivals page, discount tags on Sale/Offers/Outlet, "Bestseller" on Top
sellers — so a one-page survey misses whole label types (field-confirmed: a shop's "New" label
never made it into the HR tile because the reference category carried no new products).

1. **Scan the main navigation** for label-heavy pages. Match localized nav text:
   - **New:** new, news, new arrivals, new in, nyheder, nyheter, nyt, nytt, neu, neuheiten,
     nouveautés, nieuw, uutuudet, novità, nowości, novidades
   - **Sale:** sale, offers, discounts, deals, outlet, clearance, tilbud, udsalg, rea,
     erbjudanden, salg, angebote, sonderangebote, soldes, promo, ofertas, aanbiedingen, ale,
     tarjoukset, saldi, offerte, wyprzedaż, promocje, promoções
   - **Bestsellers:** bestsellers, top sellers, most popular, mest solgte, mest populære,
     bästsäljare, bestselgere, populair, suosituimmat, più venduti, bestsellery, mais vendidos
   - Locale not in the list → use the two or three words the site itself uses for those pages and
     note them under ASSUMPTIONS.
2. **Visit each hit** (the popup sweep is already done for the domain) and re-run the tile
   survey snippet above; diff the badge lists against the reference category.
3. **For every label type not seen before:** capture its full markup, computed styles
   (background, color, font-size/weight, padding, border-radius, corner position/offsets),
   any icon, and 1–2 carrier product names. Multiple labels on one tile? Note the stacking
   order and spacing.
4. **Reproduce every label type in the template** with the right feed condition — sale tags via
   `product.isOnSale` (discount % from the price fields; `priceLowered` only for a separate
   outlet label); "new"/"bestseller"
   usually have no feed field → parity-table row with ✗ plus the `extraDataList.*` flag the
   feed team should add, and render the label from that flag so it lights up the moment the
   feed carries it. Copy each label element verbatim — no inline spacing added (`liquid-rules.md`
   → Labels & badges).
5. **Report the carrier product names** in your response — the shell skill and QA verify each
   label type by pulling exactly those products in the live overlay.

## ANCESTOR-SCOPED CSS — DETECT REQUIRED PARENT HOOKS

A recurring field issue: the tile's rules are scoped under **ancestor classes that won't exist
inside the HR container** — the immediate grid parent (`.products-grid .card`) or deeper page
wrappers (`.catalog-category-view … .card`). Copied verbatim, the tile renders unstyled in the
overlay even though the markup is byte-perfect. Detect this during every survey and report the
missing ancestors as **PARENT HOOKS** — the calling shell skill mirrors them onto its products
container (`hr-products-container` for Search; see
`../search-developer/references/shell-structure.md` for the application rules and the `body.`/`#id` limits).

Candidate scan — list ancestor tokens required by rules that target the tile's own classes:

```javascript
const tile = document.querySelector(".product-card"); // tile root
const tileClasses = new Set([...tile.classList]);
tile.querySelectorAll("*").forEach((el) =>
  el.classList.forEach((c) => tileClasses.add(c)),
);
const hooks = new Set();
for (const sheet of document.styleSheets) {
  let rules;
  try { rules = sheet.cssRules; } catch (e) { continue; } // CORS-blocked sheets are invisible
  const walk = (rs) => {
    for (const r of rs) {
      if (r.cssRules) { walk(r.cssRules); continue; }
      if (!r.selectorText) continue;
      r.selectorText.split(",").forEach((sel) => {
        sel = sel.trim();
        const targetsTile = [...tileClasses].some((c) =>
          new RegExp("\\." + c + "(?![\\w-])").test(sel),
        );
        if (!targetsTile) return;
        const ctx = sel.match(/^(.*[ >~+])\S+$/); // everything left of the last combinator
        if (!ctx) return;
        (ctx[1].match(/[.#][A-Za-z0-9_-]+/g) || []).forEach((tok) => {
          if (!tileClasses.has(tok.slice(1))) hooks.add(tok);
        });
      });
    }
  };
  walk(rules);
}
[...hooks]; // candidate PARENT HOOKS — verify before shipping
```

**Verify empirically — the scan is only a candidate list** (substring noise; CORS-blocked sheets
missed). Render the tile in a body-level harness on the live site, diff `getComputedStyle` per
element against the native tile, add the candidate hook classes to the harness container, and
re-diff — clean diff = confirmed hook set. Report the **minimal** set that makes the tile styled,
and flag `body.<class>`/`#id`-scoped rules separately (they can't be hooked with a class — the
shell skill copies those rules rescoped instead).

The harness, in one snippet (run on the category page; `TILE_HTML` is the native tile's
`outerHTML`, `HOOKS` the candidate classes):

```javascript
(() => {
  const TILE_HTML = document.querySelector(".product-tile-selector").outerHTML;
  const HOOKS = [];                       // e.g. ["products-grid"] — run once empty, once with candidates
  const PROPS = ["display", "width", "fontSize", "fontWeight", "color", "backgroundColor",
                 "padding", "margin", "textAlign", "borderRadius", "aspectRatio", "objectFit"];
  const host = document.createElement("div");
  host.className = HOOKS.join(" ");
  host.style.cssText = "position:fixed;top:0;left:0;width:300px;z-index:2147483647;background:#fff";
  host.innerHTML = TILE_HTML;
  document.body.appendChild(host);          // body-level, like the real HR overlay
  const native = document.querySelector(".product-tile-selector");
  const clone = host.firstElementChild;
  const n = [native, ...native.querySelectorAll("*")];
  const c = [clone, ...clone.querySelectorAll("*")];
  const diff = [];
  n.forEach((el, i) => {
    if (!c[i]) return;
    const a = getComputedStyle(el), b = getComputedStyle(c[i]);
    const d = PROPS.filter((p) => a[p] !== b[p]).map((p) => `${p}: ${a[p]} → ${b[p]}`);
    if (d.length) diff.push({ el: el.tagName + "." + [...el.classList].join("."), d });
  });
  host.remove();
  return diff;                              // [] = the tile is fully styled with these HOOKS
})();
```

Run it with `HOOKS = []` first (the raw diff), then with the candidate classes; the smallest
`HOOKS` array that returns `[]` is the PARENT HOOKS set. Properties that still differ with every
candidate applied are `body.`/`#id`-scoped rules — list those under `SHELL CSS NOTES` with the
native computed value so the shell can restate them. On headless React storefronts the harness
**must** stay at `document.body` (never inside the framework's tree — `references/centra.md`).

## TILE CONTENT ALIGNMENT — MATCH THE NATIVE TILE (left vs center)

The HR shells are not alignment-neutral: the Search base CSS sets `text-align: center` on both
`.hr-overlay-search` (the overlay root) and `.hr-search-overlay-product` (the grid cell that
directly wraps the tile). `text-align` inherits — and most native tiles never set their own
(every element computes to the inherited default `start`) — so a byte-perfect reproduced tile
silently renders **centered** inside HR while the customer's category page shows it
**left-aligned**. Field-confirmed on store-NL-1 (Magento/Alpine, 2026-07): all tile
text computed `start` natively and centered in the overlay until compensated.

**Survey it on every extraction** — read the computed `text-align` of the content elements:

```javascript
const t = document.querySelector(".product-tile-selector"); // tile root
const ta = (sel) => {
  const el = sel ? t.querySelector(sel) : t;
  return el ? getComputedStyle(el).textAlign : "N/A";
};
({
  tileRoot: ta(null),
  title: ta(".title-selector"),
  price: ta('[class*="price"]'),
  description: ta('[class*="description"],[class*="sku"],ul'),
});
```

**Report the result as an ALIGNMENT line** in your response, e.g.
`ALIGNMENT: native tile content is left-aligned (all elements compute text-align: start)` —
or `center`, if the theme genuinely centers its tiles (some do; never assume left).

**Who fixes it:** this skill never outputs CSS (Output Rule #2). The calling shell skill applies
the value — Search in its tile-fill rule, Recom on the `.hr-product` cell (the base recom CSS
centers it too):

```css
.hr-overlay-search .hr-search-overlay-product > * {
	flex: 1 1 0;
	width: 100%;
	height: 100%;
	text-align: left; /* ← the surveyed native value */
}
```

The whole tile subtree then inherits the native alignment. Elements that set their own alignment
directly (e.g. a badge with a `text-center` class) are unaffected — their own declaration beats
inheritance, exactly as on the storefront, so preserving classes verbatim (Output Rule #10) keeps
them correct automatically. When the native value is `center`, set `center` instead — the rule is
*match the customer*, not *always left*.

## MOBILE MARKUP CHECK — one copy, unless JavaScript swaps the DOM

The same tile body serves the desktop and the mobile designs, and the customer's own CSS handles
the width — so the mobile viewport is a check, not a second extraction. `browser_resize` to
375 × 812, reload, settle the same product's tile and capture it again, then compare structure:

```javascript
(() => {
  const tile = document.querySelector(".product-tile-selector");
  return [tile, ...tile.querySelectorAll("*")].map((e) => e.tagName.toLowerCase() + "." + [...e.classList].sort().join("."));
})();
```

Run it at desktop and at phone width and diff the two arrays.

- **Identical arrays** (or differences only in state classes such as `lazyloaded`): nothing to do —
  the markup is responsive by CSS.
- **Different arrays** (elements present at one width only, different tags, a different wrapper):
  the theme swaps the DOM with JavaScript per breakpoint. Report it under OPEN QUESTIONS with the
  differing elements; the desktop copy is the tile body, and the operator decides whether the mobile
  differences matter. Never build a second tile body on your own.

Note what the native tile shows at phone width for hover-only elements (hidden, or shown statically)
under SHELL CSS NOTES, as before.

## HIDDEN-STATE CLASSES — rules that keep a copied tile invisible

A class captured at survey time can mean "not loaded yet" or "not scrolled into view yet"; the
theme's script that would flip it never runs inside Hello Retail. Find stylesheet rules keyed on a
class the tile carries that hide or displace the element:

```javascript
(() => {
  const tile = document.querySelector(".product-tile-selector");
  const classes = new Set();
  [tile, ...tile.querySelectorAll("*")].forEach((e) => e.classList.forEach((c) => classes.add(c)));
  const esc = (c) => c.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const hits = [];
  for (const sheet of document.styleSheets) {
    let rules;
    try { rules = sheet.cssRules; } catch (e) { continue; }
    const walk = (rs) => {
      for (const r of rs) {
        if (r.cssRules) { walk(r.cssRules); continue; }
        if (!r.selectorText || !r.style) continue;
        const hides = r.style.opacity === "0" || r.style.visibility === "hidden" || (r.style.transform && r.style.transform !== "none");
        if (!hides) continue;
        const cls = [...classes].filter((c) => new RegExp("\\." + esc(c) + "(?![\\w-])").test(r.selectorText));
        if (cls.length) hits.push({ selector: r.selectorText, classes: cls, css: r.style.cssText.slice(0, 120) });
      }
    };
    walk(rules);
  }
  return hits;
})();
```

- Classes on the known list (`lazyload`, `scroll-trigger--offscreen`, `x-cloak`, `aos-init` without
  `aos-animate`) are normalised to the settled state per Output Rule 10.
- Anything else the scan returns is reported under SHELL CSS NOTES with the selector and the
  declaration — the shell decides; you never patch it with CSS. This case has not been seen in the
  field yet; the visual fidelity check catches what the scan misses.

## FIDELITY CHECK — OUR TILE NEXT TO THE SHOP'S, JUDGED BY EYE

The hand-over gate (workflow step 8b). It answers one question per state and viewport: does the
tile we will emit look like the shop's own tile? The comparison is **visual** — a side-by-side
screenshot judged by you — and it tests the markup and the reach of the theme's CSS, which is what
this skill controls. It does not test the feed bindings (the parity table and QA do) and it cannot
see the shell's own overlay CSS (the shell repeats the check after the push).

### 1. Render the preview for a state

The script renders the skeleton with the specimen's native values — no Liquid engine, so nothing
depends on the dashboard — and applies the same root edits the template will carry:

```bash
node "<skill-base-dir>/scripts/bind-tile.mjs" --preview --diff diff.json --state sale --bindings bindings.json --out preview-sale.html
```

One preview per surveyed state: `normal`, `sale`, `soldout`, each badge state you captured. A
`missingValues` entry in the script's summary means the diff did not record a value — re-run the
diff snippet rather than editing the preview.

### 2. Place it beside the native tile

Encode the preview so it can travel inside `browser_evaluate` (`base64 < preview-sale.html | tr -d '\n'`),
then run this on the category page with the specimen of the same state. `CONTAINER_HOOKS` and
`CELL_HOOKS` are the PARENT HOOKS you verified — the harness stands in for the shell's products
container and cell:

```javascript
(() => {
  const PREVIEW_B64 = "…";
  const NATIVE = ".product-tile-selector.sale-example";
  const CONTAINER_HOOKS = [];
  const CELL_HOOKS = [];
  document.getElementById("hr-fidelity")?.remove();
  const native = document.querySelector(NATIVE);
  native.scrollIntoView({ block: "center" });
  const r = native.getBoundingClientRect();
  const fitsRight = r.right + 24 + r.width <= window.innerWidth;
  const host = document.createElement("div");
  host.id = "hr-fidelity";
  host.className = CONTAINER_HOOKS.join(" ");
  host.style.cssText = "position:fixed;top:" + Math.round(r.top) + "px;left:" + Math.round(fitsRight ? r.right + 24 : r.left - 24 - r.width) + "px;width:" + Math.round(r.width) + "px;z-index:2147483647;background:#fff;outline:2px dashed #e11;outline-offset:6px";
  const cell = document.createElement("div");
  cell.className = CELL_HOOKS.join(" ");
  cell.innerHTML = decodeURIComponent(escape(atob(PREVIEW_B64)));
  host.appendChild(cell);
  document.body.appendChild(host);
  const h = host.getBoundingClientRect();
  return { native: { w: Math.round(r.width), h: Math.round(r.height) }, preview: { w: Math.round(h.width), h: Math.round(h.height) }, placed: fitsRight ? "right" : "left" };
})();
```

Then `browser_take_screenshot` (viewport, `filename: fidelity-<state>-desktop.png`). The dashed
red outline marks our tile. On headless React storefronts the host must stay on `document.body`,
as here (`centra.md`).

### 3. Judge, classify, repeat

Look at the pair as a customer would: layout and proportions, image fit and ratio, type size and
weight, colours, spacing, badge and price placement, the buy control. Then decide:

- **Same** → that state passes; write it under FIDELITY with the screenshot name.
- **Different** → every difference gets one of three causes, and only these three:
  1. **Markup deviation** — something the pipeline changed or missed: a root strip that also
     styled the card, a wrong root choice, a class token resolved wrongly, a branch that should
     not be there. Fix it in `bindings.json` (root block, `always`) or in the diff configuration,
     re-run the script and the harness. Never edit the preview or the template.
  2. **Parent hook** — the theme's rule needs an ancestor the harness lacks. Add the class to
     `CONTAINER_HOOKS` or `CELL_HOOKS`, re-run; when the pair matches, that is the PARENT HOOKS
     line for the shell.
  3. **Shell-side** — a difference the harness cannot resolve with markup or hooks (a theme rule
     scoped to `body.`/`#id`, a rule the overlay's own CSS will override). Report it under
     SHELL CSS NOTES with the selector and the native computed values; the shell decides.
  A CSS patch from you is never one of the answers.
- **Repeat at phone width**: `browser_resize` to 375 × 812, re-run step 2 (the host's width follows
  the native tile), screenshot as `fidelity-<state>-mobile.png`.

When a difference is not obvious from the screenshot, the computed-style diff in ANCESTOR-SCOPED
CSS is the debugging aid: run it with the preview as `TILE_HTML` and read which properties differ.
It is a lens, not the gate — the screenshot decides.

Remove the host when done: `document.getElementById("hr-fidelity")?.remove()`.

## HOVER STATE INSPECTION

Always hover over a product tile and capture what changes. Use `browser_hover` (Chrome fallback: `computer` hover) then screenshot, then extract CSS rules:

```javascript
const hoverRules = [];
for (const sheet of document.styleSheets) {
  try {
    for (const rule of sheet.cssRules) {
      if (
        rule.selectorText &&
        rule.selectorText.includes(":hover") &&
        (rule.selectorText.includes(".product") ||
          rule.selectorText.includes(".inner") ||
          rule.selectorText.includes(".quick-view") ||
          rule.selectorText.includes(".details") ||
          rule.selectorText.includes(".buy") ||
          rule.selectorText.includes(".wishlist"))
      ) {
        hoverRules.push({
          sel: rule.selectorText,
          css: rule.cssText.substring(0, 300),
        });
      }
    }
  } catch (e) {}
}
hoverRules;
```

**What to look for:**

- Buttons that are `display: none` by default and revealed on hover (Se produktet, wishlist, ATC)
- Quick-view overlay that slides up from the bottom of the product image
- Card border/shadow that appears on hover
- Elements that fade out on hover to show an actions layer
- `opacity` transitions on `.properties-additional` or `.product-actions`

**Report, don't write.** This skill outputs no CSS (Output Rule #2). For every hover-only element,
put one line under `SHELL CSS NOTES` with the element selector, the trigger (`:hover` on which
ancestor) and the computed declarations that change (`display`, `opacity`, `transform`, `box-shadow`).
The shell skill turns each line into a rule scoped to its own root — for Search:

```css
.hr-overlay-search .hr-search-overlay-product:hover .element {
  display: block;
}
```

If the theme's hover rule is scoped to an ancestor that is inside the tile (e.g. `.card:hover .actions`),
it works as-is once the classes are preserved — note it as *works natively* instead. On mobile and
tablet the native tile has no hover; say what the native tile shows there (element hidden, or shown
statically) so the shell can match it at those widths.
