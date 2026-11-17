// tracking-check.js — the code and network layers of the HR tracking checks (Step 3, "Tracking verdicts need
// all three layers") in one run: is the tracking code there, and does a real click send the requests?
//
// A Playwright MCP code file: run it with browser_run_code_unsafe { filename } on a page where HR tiles have
// rendered (the search overlay open with results, or a page with recom boxes). The Playwright MCP loads code
// files only from its allowed roots (the working directory and its QA/screenshots), so copy this file to
// QA/[customer]/ first and fill in CONFIG. Accept the shop's cookie consent first — tracking is often held
// back until consent is given.
//
// Layer 1, code (always): HR's script and `hrq` present, how many buy buttons inside HR tiles carry
// `trackClick`, and whether the shop's own scripts call `setCart` (cart tracking — only relevant when it is
// part of the onboarding, see references/setup-and-data.md → Tracking). No `setCart` in the shop's code is
// not a verdict on its own: on some platforms HR's own script sends the cart (seen on a Shopify shop with no
// `setCart` anywhere and a working `/serve/collect/cart` request), so the network layer decides.
// Layer 3, network (when CONFIG.click is set): clicks that element once and lists every
// `/serve/collect/click` and `/serve/collect/cart` request it causes, with the start of its payload. Run it
// once with an HR tile's buy button and once with the native tile's button to compare the two paths.
// Layer 2 (does the rendered button carry the handler) stays a DOM check in the skill. Removing the product
// from the cart again is shop-specific: do it by hand and re-run with CONFIG.click on the remove button.

async (page) => {
	const CONFIG = {
		hrTile: ".hr-overlay-search .hr-search-overlay-product, [id^=hr-recom-] .hr-product, [id^=hello-retail-] .hr-product",
		click: "",        // e.g. "[id^=hr-recom-] .hr-product button" — empty = code layer only, nothing is clicked
		clickIndex: -1,   // which match of CONFIG.click to press; -1 = the first visible one
		waitMs: 5000,     // how long to listen after the click
		scriptLimit: 25,  // how many same-origin script files to search for setCart
	};

	const code = await page.evaluate(async ({ hrTile, scriptLimit }) => {
		const tiles = [...document.querySelectorAll(hrTile)];
		// Buttons and buy-looking links inside HR tiles. Plain product links go through fix_links and need no
		// trackClick, so they are not counted; slider arrows and the like show up in the untracked tally,
		// where they are easy to tell apart from a buy button that lost its trackClick.
		const buttons = tiles.flatMap((t) => [...t.querySelectorAll("button, [onclick], a[class*=atc i], a[class*=cart i], a[class*=buy i]")]);
		const tracked = buttons.filter((b) => /trackClick/.test(b.getAttribute("onclick") || ""));
		const untracked = {};
		buttons.filter((b) => !tracked.includes(b)).forEach((b) => {
			const key = b.tagName.toLowerCase() + "." + (b.className + "").trim().split(/\s+/)[0] + ' "' + (b.innerText || "").trim().slice(0, 25) + '"';
			untracked[key] = (untracked[key] || 0) + 1;
		});
		const inline = [...document.querySelectorAll("script:not([src])")].map((s) => s.textContent);
		const srcs = [...document.querySelectorAll("script[src]")].map((s) => s.src)
			.filter((u) => { try { return new URL(u).origin === location.origin; } catch (e) { return false; } })
			.slice(0, scriptLimit);
		const external = [];
		for (const u of srcs) {
			try {
				const ctrl = new AbortController();
				const timer = setTimeout(() => ctrl.abort(), 4000);
				const text = await (await fetch(u, { signal: ctrl.signal })).text();
				clearTimeout(timer);
				if (/setCart/.test(text)) external.push(u.replace(location.origin, ""));
			} catch (e) { /* unreachable or slow script: skipped */ }
		}
		return {
			helloretailJs: [...document.querySelectorAll("script[src]")].some((s) => /helloretail/i.test(s.src)),
			hrq: typeof window.hrq !== "undefined",
			hrTiles: tiles.length,
			buttonsInHrTiles: buttons.length,
			withTrackClick: tracked.length,
			withoutTrackClick: Object.entries(untracked).sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k, c]) => c + "× " + k),
			setCartInline: inline.some((t) => /setCart/.test(t)),
			setCartInScripts: external,
			sameOriginScriptsSearched: srcs.length,
		};
	}, CONFIG);

	let network = "not run (CONFIG.click is empty)";
	if (CONFIG.click) {
		const seen = [];
		const listen = (req) => {
			const m = req.url().match(/\/serve\/collect\/(click|cart)\b/);
			if (m) seen.push({ type: m[1], method: req.method(), payload: (req.postData() || req.url().split("?")[1] || "").slice(0, 300) });
		};
		page.on("request", listen);
		try {
			// Carousels and duplicated boxes hide many matches; -1 picks the first one a shopper could click.
			const index = CONFIG.clickIndex >= 0 ? CONFIG.clickIndex : await page.evaluate((sel) => [...document.querySelectorAll(sel)]
				.findIndex((el) => {
					const r = el.getBoundingClientRect();
					const cs = getComputedStyle(el);
					return r.width > 0 && r.height > 0 && cs.visibility !== "hidden" && cs.display !== "none" && el.closest("[aria-hidden=true], [inert]") === null;
				}), CONFIG.click);
			if (index < 0) throw new Error("no visible match for CONFIG.click");
			const target = page.locator(CONFIG.click).nth(index);
			const product = await target.evaluate((el) => ((el.closest(".hr-product") || el.closest("li, article, product-card, [class*=card]"))
				?.querySelector("a[href]")?.pathname) || "");
			await target.scrollIntoViewIfNeeded({ timeout: 5000 });
			await target.click({ timeout: 5000 });
			await page.waitForTimeout(CONFIG.waitMs);
			network = { clicked: CONFIG.click + " #" + index, product, requests: seen, url: page.url() };
		} catch (e) {
			network = { error: String(e).slice(0, 160), requests: seen };
		}
		page.off("request", listen);
	}
	return { code, network };
}
