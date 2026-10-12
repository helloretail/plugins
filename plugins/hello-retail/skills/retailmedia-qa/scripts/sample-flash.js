// B10 — does the banner render at the wrong size before the slider initialises?
// Loads one page and samples every banner's rendered size every ~20 ms for the first ~1.5 s.
// Run with Playwright browser_run_code_unsafe (filename under the project folder) per viewport.
async (page) => {
  // ---- CONFIG ----
  const URL = 'https://www.example.com/a-page-with-a-banner';
  const SAMPLES = 75, EVERY_MS = 20;
  // ----------------
  await page.addInitScript(({ SAMPLES, EVERY_MS }) => {
    window.__rmFlash = [];
    const t0 = performance.now();
    let n = 0;
    const tick = () => {
      document.querySelectorAll('.hr-b-image').forEach((img, i) => {
        const r = img.getBoundingClientRect();
        if (r.width) window.__rmFlash.push({ t: Math.round(performance.now() - t0), i, w: Math.round(r.width), h: Math.round(r.height) });
      });
      if (++n < SAMPLES) setTimeout(tick, EVERY_MS);
    };
    setTimeout(tick, EVERY_MS);
  }, { SAMPLES, EVERY_MS });
  await page.goto(URL, { waitUntil: 'load' });
  await page.waitForTimeout(SAMPLES * EVERY_MS + 500);
  const s = await page.evaluate(() => window.__rmFlash);
  // collapse to size changes per banner so the result stays small
  const out = {};
  for (const x of s) {
    const k = 'banner' + x.i, last = out[k] && out[k][out[k].length - 1];
    if (!last || last.w !== x.w || last.h !== x.h) (out[k] = out[k] || []).push({ t: x.t, size: x.w + 'x' + x.h });
  }
  return { vw: page.viewportSize().width, changes: out };
}
// NB: addInitScript stays on the page for later navigations in this context — run this last
// for a viewport, or in a fresh tab, so it can't affect other measurements.
