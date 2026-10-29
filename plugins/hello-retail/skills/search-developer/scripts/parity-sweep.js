// parity-sweep.js — compare every product tile in the open search overlay with the same product's tile
// on the shop's own category pages, by computed style, and check that every tile fits its grid cell.
//
// A Playwright MCP code file: run it with browser_run_code_unsafe { filename } while the overlay is open
// with results (several broad queries, scrolled to load more). The Playwright MCP loads code files only
// from its allowed roots (the working directory and its QA/screenshots), so copy this file there first
// and fill in CONFIG. It opens the category pages in a second tab, so the overlay stays as it is.
//
// Output: the number of overlay tiles, native tiles and products found on both sides; every computed-style
// difference with the products it affects, most frequent first; and every tile wider than its cell.
// Read a difference as a question, never as a value to set: find the rule that sets it natively
// (references/shell-structure.md) before changing anything.

async (page) => {
	const CONFIG = {
		origin: "https://www.example-shop.com",
		categoryPaths: ["/category-a/", "/category-a/page/2/", "/sale/"],   // plain, sale, variable and range products
		nativeTile: "ul.products li.product",                              // the shop's own grid tile
		title: ".woocommerce-loop-product__title",                         // the element that names the product
		props: ["display", "position", "marginTop", "marginRight", "marginBottom", "marginLeft", "paddingTop", "paddingRight",
			"paddingBottom", "paddingLeft", "color", "backgroundColor", "fontSize", "fontWeight", "fontFamily", "lineHeight",
			"textAlign", "borderTopWidth", "borderTopColor", "borderRadius", "boxShadow", "textTransform", "opacity",
			"flexDirection", "gap", "transform", "visibility", "letterSpacing", "objectFit", "zIndex", "textDecorationLine",
			"whiteSpace", "overflow", "justifyContent", "alignItems", "minHeight", "listStyleType", "fontStyle", "wordBreak"],
		top: 40,
	};

	const collect = ({ nativeTile, title, props }) => {
		const signature = (root) => [root, ...root.querySelectorAll("*")].map((el) => {
			const cs = getComputedStyle(el);
			const row = { el: el.tagName.toLowerCase() + "." + (el.className + "").split(" ")[0] };
			props.forEach((p) => { row[p] = cs[p]; });
			return row;
		});
		const out = { tiles: {}, tooWide: [] };
		const overlayTiles = [...document.querySelectorAll(".hr-overlay-search .hr-search-overlay-product > *")]
			.filter((t) => !t.closest("#addwish-panel-root"));
		const tiles = overlayTiles.length ? overlayTiles : [...document.querySelectorAll(nativeTile)]
			.filter((t) => !t.closest("#addwish-panel-root, .hr-overlay-search, .aw-item, [id^=hello-retail]"));
		tiles.forEach((t) => {
			const name = t.querySelector(title);
			if (!name) return;
			const key = name.textContent.trim();
			if (!out.tiles[key]) out.tiles[key] = signature(t);
			const cell = t.parentElement;
			if (overlayTiles.length && t.getBoundingClientRect().width > cell.getBoundingClientRect().width + 0.5) {
				out.tooWide.push(key.slice(0, 40) + " — tile " + Math.round(t.getBoundingClientRect().width) + "px in a " + Math.round(cell.getBoundingClientRect().width) + "px cell");
			}
		});
		return out;
	};

	const overlay = await page.evaluate(collect, CONFIG);
	const native = {};
	const tab = await page.context().newPage();
	for (const path of CONFIG.categoryPaths) {
		try {
			await tab.goto(CONFIG.origin + path, { waitUntil: "load", timeout: 45000 });
			await tab.waitForTimeout(1500);
			const got = await tab.evaluate(collect, CONFIG);
			for (const [k, v] of Object.entries(got.tiles)) if (!native[k]) native[k] = v;
		} catch (e) {
			native["__error " + path] = String(e).slice(0, 80);
		}
	}
	await tab.close();

	const common = Object.keys(overlay.tiles).filter((k) => Array.isArray(native[k]));
	const tally = {};
	common.forEach((k) => {
		const a = native[k];
		const b = overlay.tiles[k];
		if (a.length !== b.length) {
			(tally["element count " + a.length + " → " + b.length] = tally["element count " + a.length + " → " + b.length] || []).push(k.slice(0, 30));
			return;
		}
		a.forEach((x, i) => {
			CONFIG.props.forEach((p) => {
				if (x[p] !== b[i][p]) {
					const label = x.el + " " + p + ": " + x[p] + " → " + b[i][p];
					(tally[label] = tally[label] || []).push(k.slice(0, 30));
				}
			});
		});
	});
	const differences = Object.entries(tally)
		.sort((x, y) => y[1].length - x[1].length)
		.slice(0, CONFIG.top)
		.map(([label, products]) => products.length + "× " + label + "  (e.g. " + products.slice(0, 2).join("; ") + ")");

	return {
		overlayTiles: Object.keys(overlay.tiles).length,
		nativeTiles: Object.keys(native).length,
		compared: common.length,
		differences,
		tooWide: overlay.tooWide,
	};
}
