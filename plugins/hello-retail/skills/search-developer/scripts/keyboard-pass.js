// keyboard-pass.js — count the Tab presses from the shop's search input to the embedded panel's close
// button, and list every stop that lands on content the panel covers.
//
// A Playwright MCP code file: run it with browser_run_code_unsafe { filename } while the embedded panel
// is open with results (siblings hidden in the on-site widget, rule 19). The Playwright MCP loads code
// files only from its allowed roots (the working directory and its QA/screenshots), so copy this file
// there first and fill in CONFIG.
//
// Output: tabsToClose (shopper presses, the Hello Retail widget's own stops left out), every stop with
// whether the panel covers it, the covered stops on their own, and the number of inert elements left
// after the panel is closed. Pass = coveredStops is empty, the close button was reached, inertAfterClose
// equals themeInert (the elements the theme itself keeps inert). A covered stop means set_page_inert() is missing or misses a container:
// references/shell-structure.md → "Embedded — the page behind the panel stays in the keyboard order".

async (page) => {
	const CONFIG = {
		trigger: "#search",                                  // the shop's search input (trigger_selector)
		panel: ".hr-overlay-search",                         // the embedded panel
		closeButton: ".hr-overlay-search .hr-close-btn",     // where the pass ends
		widget: "#addwish-panel-root, #addwishPageAdd",      // on-site Hello Retail widget: its stops are not the shopper's
		maxPresses: 150,
	};

	const themeInert = await page.evaluate(() => document.querySelectorAll("[inert]:not([data-hr-inert])").length);
	await page.focus(CONFIG.trigger);

	const stops = [];
	let reached = false;
	for (let press = 1; press <= CONFIG.maxPresses; press++) {
		await page.keyboard.press("Tab");
		const stop = await page.evaluate((config) => {
			const element = document.activeElement;
			const rect = element.getBoundingClientRect();
			const x = rect.left + rect.width / 2;
			const y = rect.top + rect.height / 2;
			const inViewport = x > 0 && y > 0 && x < innerWidth && y < innerHeight;
			const hit = inViewport ? document.elementFromPoint(x, y) : null;
			const panel = document.querySelector(config.panel);
			const inPanel = !!(panel && panel.contains(element));
			const reachable = !!(hit && (element.contains(hit) || hit.contains(element)));
			return {
				name: (element.innerText || element.getAttribute("aria-label") || element.title || element.id || element.tagName).trim().replace(/\s+/g, " ").slice(0, 50),
				tag: element.tagName.toLowerCase(),
				inWidget: !!element.closest(config.widget),
				isClose: element.matches(config.closeButton),
				// covered: outside the panel and either off-screen or hidden behind something else
				covered: !inPanel && !reachable,
			};
		}, CONFIG);
		stops.push(stop);
		if (stop.isClose) {
			reached = true;
			break;
		}
	}

	const shopperStops = stops.filter((stop) => !stop.inWidget);
	await page.keyboard.press("Escape");
	await page.waitForTimeout(1500);
	const inertAfterClose = await page.evaluate(() => document.querySelectorAll("[inert]").length);

	return {
		closeButtonReached: reached,
		tabsToClose: reached ? shopperStops.length : null,
		widgetStopsLeftOut: stops.length - shopperStops.length,
		coveredStops: shopperStops.filter((stop) => stop.covered).map((stop) => stop.tag + " \"" + stop.name + "\""),
		stops: shopperStops.map((stop) => (stop.covered ? "COVERED " : "") + stop.tag + " \"" + stop.name + "\""),
		themeInert,
		inertAfterClose,
	};
};
