// price-text.js — compare the price text in every HR tile on the current page with the same product's price
// text on the shop's own category pages, character for character (separators, decimals, currency position,
// "from" prefix, sale + original price).
//
// A Playwright MCP code file: run it with browser_run_code_unsafe { filename } while the HR tiles are on screen
// — the search overlay open with results (search-qa) or a page where the recom boxes have rendered
// (recom-qa). The Playwright MCP loads code files only from its allowed roots (the working directory and its
// QA/screenshots), so copy this file to QA/[customer]/ first and fill in CONFIG. It opens the category pages
// in a second tab, so the current page stays as it is.
//
// Products are matched by link path (query and #fragment dropped), then by title. Output: how many tiles were
// read and matched, the price formats seen on each side, every matched product whose price text differs, and
// every HR tile with no price or a zero price. Each difference is a finding to check, not a verdict: a
// decision on the card (ex-VAT prices, another currency) can explain it — then it is a question for the CSM.

async (page) => {
	const CONFIG = {
		origin: "https://www.example-shop.com",
		categoryPaths: ["/category-a/", "/sale/"],                            // plain, sale and "from"-price products
		nativeTile: "ul.products li.product",                                 // the shop's own grid tile
		hrTile: ".hr-overlay-search .hr-search-overlay-product > *",          // HR tiles on the current page; for recom
		                                                                      // boxes e.g. "[id^=hr-recom-] .hr-product"
		nativePrice: "",   // optional: the native price element, e.g. ".price" — empty = find it automatically
		hrPrice: "",       // optional: the HR price element — empty = find it automatically
		top: 30,
	};

	const collect = ({ nativeTile, hrTile, nativePrice, hrPrice, side }) => {
		const CURRENCY = /(kr\.?|sek|dkk|nok|eur|€|\$|£|chf|zł|pln|kč|czk|ft|huf|lei|ron|,-)/i;
		const NUMBER = /\d[\d.,\s  ']*\d|\d/;
		const clean = (s) => s.replace(/[  ]/g, " ").replace(/\s+/g, " ").trim();
		const path = (href) => {
			try {
				const u = new URL(href, location.href);
				return u.pathname.replace(/\/+$/, "").toLowerCase();
			} catch (e) {
				return "";
			}
		};
		// Price texts of one tile: the given selector, else the leaf-most elements whose class or itemprop says
		// "price", else lines of the tile text that hold a number next to a currency.
		const prices = (tile, sel) => {
			let els = sel ? [...tile.querySelectorAll(sel)] : [...tile.querySelectorAll("[class*=price i], [itemprop=price]")];
			els = els.filter((el) => NUMBER.test(el.textContent) && ![...el.querySelectorAll("*")].some((c) => els.includes(c)));
			let texts = els.map((el) => clean(el.innerText || el.textContent)).filter(Boolean);
			if (!texts.length) {
				texts = (tile.innerText || "").split("\n").map(clean).filter((l) => NUMBER.test(l) && CURRENCY.test(l) && l.length < 40);
			}
			return [...new Set(texts)];
		};
		const tiles = side === "hr"
			? [...document.querySelectorAll(hrTile)]
			: [...document.querySelectorAll(nativeTile)].filter((t) => !t.closest("#addwish-panel-root, .hr-overlay-search, .aw-item, [id^=hello-retail], [id^=hr-recom-]"));
		return tiles.map((t) => {
			const link = t.matches("a[href]") ? t : t.querySelector("a[href]");
			const title = clean((t.querySelector("h1,h2,h3,h4,h5,[class*=title i],[class*=name i]") || link || t).textContent || "").slice(0, 80);
			return { path: link ? path(link.href) : "", title, prices: prices(t, side === "hr" ? hrPrice : nativePrice) };
		}).filter((r) => r.path || r.title);
	};

	const shape = (s) => s.replace(/\d+/g, "9");   // "1.250,00 kr" → "9.9,9 kr": the format without the amount

	const hr = await page.evaluate(collect, { ...CONFIG, side: "hr" });
	const native = [];
	const errors = [];
	const tab = await page.context().newPage();
	for (const p of CONFIG.categoryPaths) {
		try {
			await tab.goto(CONFIG.origin + p, { waitUntil: "load", timeout: 45000 });
			await tab.waitForTimeout(2000);
			native.push(...(await tab.evaluate(collect, { ...CONFIG, side: "native" })));
		} catch (e) {
			errors.push(p + ": " + String(e).slice(0, 80));
		}
	}
	await tab.close();

	const byPath = new Map(native.filter((n) => n.path).map((n) => [n.path, n]));
	const byTitle = new Map(native.map((n) => [n.title.toLowerCase(), n]));
	const differences = [];
	const noPrice = [];
	let matched = 0;
	for (const h of hr) {
		if (!h.prices.length || h.prices.every((x) => !/[1-9]/.test(x))) noPrice.push(h.title || h.path);
		const n = byPath.get(h.path) || byTitle.get(h.title.toLowerCase());
		if (!n) continue;
		matched++;
		if (h.prices.join(" | ") !== n.prices.join(" | ")) {
			differences.push((h.title || h.path).slice(0, 40) + " — native: " + (n.prices.join(" | ") || "(none)") + "  HR: " + (h.prices.join(" | ") || "(none)"));
		}
	}
	const formats = (rows) => {
		const tally = {};
		rows.forEach((r) => r.prices.forEach((x) => { tally[shape(x)] = (tally[shape(x)] || 0) + 1; }));
		return Object.entries(tally).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([f, c]) => c + "× " + f);
	};

	return {
		hrTiles: hr.length,
		nativeTiles: native.length,
		matched,
		hrFormats: formats(hr),
		nativeFormats: formats(native),
		differences: differences.slice(0, CONFIG.top),
		differenceCount: differences.length,
		hrTilesWithoutPrice: noPrice.slice(0, CONFIG.top),
		errors,
	};
}
