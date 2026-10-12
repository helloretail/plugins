// Trace a cart / sidecart recom box through ONE add-to-cart path (trusted click), to tell
// "box never inserted" from "box inserted, then thrown away by the theme's cart refresh", and
// measure the banner inside it. Run with Playwright browser_run_code_unsafe (filename under the
// project folder). Edit CONFIG, then run once per path (PATH_NAME + BUTTON) and per viewport:
//   pdp     — the theme's own add-to-cart button on a product page
//   hrtile  — the add-to-cart button inside an HR recom tile
//   carticon — the header cart icon (no add; reopens the cart)
async (page) => {
  // ---- CONFIG ----
  const PATH_NAME = 'pdp';
  const START_URL = 'https://www.example.com/path/to/a-product';
  // The theme's button for this path. For 'pdp', exclude HR boxes — HR tiles often reuse the
  // theme's button class: e.g. 'button.buy-button:not([id^="hello-retail-"] *)'.
  const BUTTON = 'button.add-to-cart:not([id^="hello-retail-"] *)';
  const WRAP = '#cart-drawer';                      // element the theme rewrites when the cart refreshes
  const BOX_ID = 'hello-retail-kXXXXXXXXXXXXXXXX';  // the upsell / sidecart box id
  const DIR = 'C:/Users/.../QA/example.com/screenshots/';
  const PREFIX = 'example-com--rm--sidecart-';
  // ----------------
  const vw = page.viewportSize().width;
  const errs = [];
  const onErr = m => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 120)); };
  const onPageErr = e => errs.push('pageerror: ' + String(e.message || e).slice(0, 120)); // uncaught theme errors
  page.on('console', onErr);
  page.on('pageerror', onPageErr);
  await page.goto(START_URL, { waitUntil: 'load' });
  await page.waitForTimeout(3500);
  // DOM trace: every insertion/removal of the box and every rewrite of the wrapper, timestamped
  await page.evaluate(({ WRAP, BOX_ID }) => {
    window.__rmTrace = []; const t0 = performance.now();
    const log = (e) => window.__rmTrace.push({ t: Math.round(performance.now() - t0), ...e });
    new MutationObserver(muts => muts.forEach(m => {
      m.addedNodes.forEach(n => { if (n.nodeType === 1 && (n.id === BOX_ID || n.querySelector?.('#' + BOX_ID))) log({ ev: 'box added' }); });
      m.removedNodes.forEach(n => { if (n.nodeType === 1 && (n.id === BOX_ID || n.querySelector?.('#' + BOX_ID))) log({ ev: 'box removed' }); });
      if (m.target.matches?.(WRAP) && m.type === 'childList') log({ ev: 'wrap children rewritten', added: m.addedNodes.length, removed: m.removedNodes.length });
      if (m.type === 'attributes' && m.target.matches?.(WRAP)) log({ ev: 'wrap class', cls: String(m.target.className).slice(0, 60) });
    })).observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ['class'] });
  }, { WRAP, BOX_ID });
  const btn = page.locator(BUTTON).first();
  await btn.scrollIntoViewIfNeeded();
  await btn.click();
  await page.waitForTimeout(6000);
  const result = await page.evaluate((BOX_ID) => {
    const box = document.getElementById(BOX_ID);
    let banner = null;
    const c = box && box.querySelector('.swiper-slide:not(.swiper-slide-duplicate) .hr-b-container, .hr-b-container');
    const img = c && c.querySelector('img.hr-b-image');
    if (img && img.naturalWidth) {
      const ir = img.getBoundingClientRect();
      const s = Math.max(ir.width / img.naturalWidth, ir.height / img.naturalHeight);
      banner = { natural: img.naturalWidth + 'x' + img.naturalHeight, css: Math.round(ir.width) + 'x' + Math.round(ir.height),
        cropW: Math.round(img.naturalWidth * s - ir.width), cropH: Math.round(img.naturalHeight * s - ir.height), href: c.getAttribute('href') };
    }
    return { boxPresent: !!box, bannerPresent: !!c, banner, trace: window.__rmTrace.slice(0, 40) };
  }, BOX_ID);
  const shot = DIR + PREFIX + PATH_NAME + '-' + vw + '.png';
  await page.screenshot({ path: shot });
  page.off('console', onErr);
  page.off('pageerror', onPageErr);
  return { path: PATH_NAME, vw, ...result, errors: errs.slice(0, 8), shot };
}
