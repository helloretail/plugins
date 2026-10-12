// Retail Media banner probe — one viewport per call, all listed pages.
// Run with Playwright browser_run_code_unsafe (filename = a copy of this file under QA/[customer]/;
// run_code only reads files under the project folder). Before running:
//   1. browser_resize to the viewport under test (1440x900, 1024x768, 820x1180, 375x667),
//   2. edit the CONFIG block: SIZES from retailMedia_getSettings, BASE, PAGES, DIR, PREFIX.
// Order PAGES so prerequisites come first: the PDP before the front/404 pages (retargeted
// boxes need browsing history); the cart page needs a non-empty cart — run it after the
// sidecart add-to-cart test, not in this list.
// PAGES = [] → measures the CURRENT page without navigating: use that for the search overlay
// (open it and type first), the open sidecart, or the cart page.
// Image weight: kb is null when the image CDN hides timing (no Timing-Allow-Origin) — then get
// the real weight with page.request.get(src) once per size, not from the network log.
// Returns compact JSON per page: boxes (with/without banner) and per-banner measurements;
// writes an element screenshot of every box that carries a banner. Swiper loop duplicates are
// skipped. Keep the return value small: run_code echoes the script into every result.
async (page) => {
  // ---- CONFIG ----
  const SIZES = ['search_desktop', 'search_mobile', 'recoms_main', 'recoms_upsell'];
  const BASE = 'https://www.example.com';
  const PAGES = [
    ['pdp', '/path/to/a-product'],
    ['front', '/'],
    ['category', '/a-category/'],
    ['subcategory', '/a-category/a-subcategory/'],
    ['404', '/qa-rm-does-not-exist-404'],
  ];
  const DIR = 'C:/Users/.../QA/example.com/screenshots/';
  const PREFIX = 'example-com--rm--';
  const SETTLE_MS = 4000;
  // ----------------
  const vw = page.viewportSize().width;
  const res = [];
  const list = PAGES.length ? PAGES : [['current', null]];
  for (const [name, path] of list) {
    const t0 = Date.now();
    const resp = path === null ? null : await page.goto(BASE + path, { waitUntil: 'load' });
    await page.waitForTimeout(path === null ? 800 : SETTLE_MS);
    const m = await page.evaluate((SIZES) => {
      const sizeRe = new RegExp('/(' + SIZES.join('|') + ')/');
      const out = { w: innerWidth, boxes: [], banners: [] };
      document.querySelectorAll('[id^="hello-retail-"]').forEach(b => {
        const r = b.getBoundingClientRect();
        out.boxes.push({
          id: b.id.replace('hello-retail-', ''),
          h2: ((b.querySelector('h2') || {}).innerText || '').slice(0, 40),
          w: Math.round(r.width), h: Math.round(r.height),
          slides: b.querySelectorAll('.swiper-slide:not(.swiper-slide-duplicate)').length,
          hasBanner: !!b.querySelector('.swiper-slide:not(.swiper-slide-duplicate) .hr-b-container, .hr-b-container')
        });
      });
      document.querySelectorAll('.hr-b-container').forEach(c => {
        const img = c.querySelector('.hr-b-image');
        if (!img) { out.banners.push({ href: c.getAttribute('href'), error: 'no .hr-b-image inside .hr-b-container' }); return; }
        const box = c.closest('[id^="hello-retail-"]') || c.closest('.hr-overlay-search, [class*=hr-search]');
        // closest() with a selector LIST returns the nearest match (.hr-product sits inside
        // .swiper-slide), so resolve the slide in priority order.
        const slide = c.closest('.swiper-slide') || c.closest('.hr-search-overlay-product') || c.closest('.hr-product') || c.parentElement;
        if (slide.classList.contains('swiper-slide-duplicate')) return;
        c.scrollIntoView({ block: 'center', inline: 'nearest' });
        const ir = img.getBoundingClientRect(), sr = slide.getBoundingClientRect(), cr = c.getBoundingClientRect();
        // <img> or a <div> with a background-image (search designs use the latter)
        let src = null, nw = 0, nh = 0;
        if (img.tagName === 'IMG') { src = img.currentSrc || img.src; nw = img.naturalWidth; nh = img.naturalHeight; }
        else { const mm = /url\(["']?(.*?)["']?\)/.exec(getComputedStyle(img).backgroundImage); src = mm && mm[1]; }
        let crop = null;
        if (nw && ir.width) {
          const s = Math.max(ir.width / nw, ir.height / nh);
          crop = { cropW: Math.round(nw * s - ir.width), cropH: Math.round(nh * s - ir.height),
            fit: getComputedStyle(img).objectFit, rN: +(nw / nh).toFixed(3), rC: +(ir.width / ir.height).toFixed(3) };
        } else if (ir.width) {
          crop = { bgSize: getComputedStyle(img).backgroundSize, note: 'background-image: get the natural size from the URL' };
        }
        // anything painted over the banner: centre hit-test + every other visible element whose
        // rect intersects the banner (arrows, labels, badges)
        const el = document.elementFromPoint(ir.left + ir.width / 2, ir.top + ir.height / 2);
        const overlaps = [];
        (box || document).querySelectorAll('.swiper-button-prev, .swiper-button-next, [class*=label], [class*=badge]').forEach(o => {
          if (c.contains(o)) return;
          const orr = o.getBoundingClientRect();
          if (!orr.width || getComputedStyle(o).visibility === 'hidden' || getComputedStyle(o).display === 'none') return;
          if (!(orr.right <= ir.left || orr.left >= ir.right || orr.bottom <= ir.top || orr.top >= ir.bottom))
            overlaps.push(String(o.className).slice(0, 30));
        });
        const sib = [...slide.parentElement.children].filter(x => !x.classList.contains('swiper-slide-duplicate'));
        const rt = src && performance.getEntriesByType('resource').find(e => e.name === src);
        // radius/border can sit on the image, the link or the slide — report all three
        const cs = x => getComputedStyle(x);
        out.banners.push({
          box: box ? (box.id ? box.id.replace('hello-retail-', '') : String(box.className).slice(0, 30)) : null,
          href: c.getAttribute('href'),
          srcSize: (src && (sizeRe.exec(src) || [])[1]) || null,
          natural: nw ? nw + 'x' + nh : null, loaded: img.tagName === 'IMG' ? nw > 0 : !!src,
          css: Math.round(ir.width) + 'x' + Math.round(ir.height),
          container: Math.round(cr.width) + 'x' + Math.round(cr.height),
          slide: Math.round(sr.width) + 'x' + Math.round(sr.height),
          ...crop,
          radius: { img: cs(img).borderRadius, link: cs(c).borderRadius, slide: cs(slide).borderRadius },
          slideBorder: cs(slide).borderTopWidth + ' ' + cs(slide).borderTopStyle,
          index: sib.indexOf(slide), siblings: sib.length,
          hit: el ? el.tagName + '.' + String(el.className).slice(0, 25) : null,
          overlaps,
          alt: img.getAttribute('alt'),
          // encodedBodySize survives the cache (transferSize is 0 on a cached hit)
          kb: rt && (rt.encodedBodySize || rt.transferSize) ? Math.round((rt.encodedBodySize || rt.transferSize) / 1024) : null
        });
      });
      return out;
    }, SIZES);
    for (const b of m.boxes.filter(x => x.hasBanner)) {
      const loc = page.locator('#hello-retail-' + b.id).first();
      try {
        await loc.scrollIntoViewIfNeeded();
        await page.waitForTimeout(400);
        const f = PREFIX + name + '-' + b.id.slice(-4) + '-' + vw + '.png';
        await loc.screenshot({ path: DIR + f });
        b.shot = f;
      } catch (e) { b.shot = 'FAILED: ' + String(e).slice(0, 80); }
    }
    res.push({ page: name, status: resp ? resp.status() : null, loadMs: Date.now() - t0, ...m });
  }
  return res;
}
