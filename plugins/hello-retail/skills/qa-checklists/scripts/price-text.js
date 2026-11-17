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
// read and matched, the price formats seen on each side, every matched product whose price text differs,
// every HR tile with no price or a zero price, and every HR tile that found no native tile to compare with.
// Each difference is a finding to check, not a verdict: a decision on the card (ex-VAT prices, another
// currency) can explain it — then it is a question for the CSM.
//
// Read `warnings` first: a run that read no tiles or matched no products measured nothing, and its empty
// difference list is not a pass — fix CONFIG and run it again. HR tiles listed as not compared are not
// covered either: add the category pages that hold them, or check those tiles by hand.
//
// The price of a tile is read from its innermost price elements. When a "from" prefix or the currency sits
// outside that element on one side, set nativePrice / hrPrice to the wrapper that holds the whole price.

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
		// A currency code counts only as a word of its own: the "kr" inside "Skruetrækker 18V" is not a currency.
		const CURRENCY = /(?<!\p{L})(kr\.?|sek|dkk|nok|eur|chf|zł|pln|kč|czk|ft|huf|lei|ron)(?!\p{L})|[€$£]|,-/iu;
		const NUMBER = /\d/;
		const clean = (s) => s.replace(/\s+/g, " ").trim();   // \s also covers no-break and narrow no-break spaces
		const path = (href) => {
			try {
				const u = new URL(href, location.href);
				return u.pathname.replace(/\/+$/, "").toLowerCase();
			} catch (e) {
				return "";
			}
		};
		// Price texts of one tile: the given selector, else the elements whose class or itemprop says "price" —
		// of those, the innermost ones that hold a number and that a shopper can see — else lines of the tile
		// text that hold a number next to a currency. A price element hidden by CSS inside a visible tile is
		// skipped (themes keep a second, hidden price block in the DOM); a tile that is hidden as a whole is
		// read as it is.
		const prices = (tile, sel) => {
			const tileInvisible = getComputedStyle(tile).visibility === "hidden";
			const hidden = (el) => {
				if (!tileInvisible && getComputedStyle(el).visibility === "hidden") return true;
				for (let n = el; n && n !== tile; n = n.parentElement) if (getComputedStyle(n).display === "none") return true;
				return false;
			};
			// Only elements that hold a number are candidates, so a currency-symbol span with "price" in its class
			// does not push the real price element out.
			const found = [...tile.querySelectorAll(sel || "[class*=price i], [itemprop=price]")]
				.filter((el) => NUMBER.test(el.textContent) && !hidden(el));
			const els = found.filter((el) => !found.some((c) => c !== el && el.contains(c)));
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
	const byTitle = new Map(native.filter((n) => n.title).map((n) => [n.title.toLowerCase(), n]));
	const differences = [];
	const noPrice = [];
	const notCompared = [];
	let matched = 0;
	for (const h of hr) {
		if (!h.prices.length || h.prices.every((x) => !/[1-9]/.test(x))) noPrice.push(h.title || h.path);
		const n = byPath.get(h.path) || (h.title && byTitle.get(h.title.toLowerCase()));
		if (!n) {
			notCompared.push((h.title || h.path).slice(0, 40));
			continue;
		}
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

	// A run that read or matched nothing measured nothing: say so, so its empty difference list is not read as a pass.
	const warnings = [];
	if (!hr.length) warnings.push("no HR tiles matched CONFIG.hrTile on the current page — nothing was measured");
	if (!native.length) warnings.push("no native tiles matched CONFIG.nativeTile on the category pages — nothing was compared");
	if (hr.length && native.length && !matched) warnings.push("no HR tile matched a native tile by link path or title — add category pages that hold these products");

	return {
		warnings,
		hrTiles: hr.length,
		nativeTiles: native.length,
		matched,
		hrFormats: formats(hr),
		nativeFormats: formats(native),
		differences: differences.slice(0, CONFIG.top),
		differenceCount: differences.length,
		hrTilesWithoutPrice: noPrice.slice(0, CONFIG.top),
		hrTilesNotCompared: [...new Set(notCompared)].slice(0, CONFIG.top),
		notComparedCount: notCompared.length,
		errors,
	};
}
