// rescope-archive-css.js — copy the theme's own tile rules that only apply inside the category-page
// product list, rewritten to reach the tile inside a Hello Retail shell cell.
//
// Some themes style the card only under a literal list ancestor: `ul.products li.product …`,
// `.elementor-1234 .elementor-wc-products ul.products li.product …`, `.woocommerce ul.products li …`.
// A shell cell is a <div>, so no class hook can satisfy an element ancestor, and the card renders
// unstyled wherever the overlay opens. This file collects every rule that matches a native tile (or
// anything inside it) on the given category pages, keeps the ones scoped to the list or to the
// `.woocommerce` body class, rewrites the part up to the tile root to the shell cell, pads the new
// selector with the shell root class until it is at least as specific as the original (so the theme's
// own cascade order survives), keeps media queries and source order, and merges the pages.
//
// Left out on purpose: rules scoped to Hello Retail's own boxes (#slider-…, .aw-…, .hr-…), rules that
// float or size the grid cell (the shell owns the cell), and global rules that need no rescoping.
//
// A Playwright MCP code file: run it with browser_run_code_unsafe { filename }. The Playwright MCP loads
// code files only from its allowed roots (the working directory and its QA/screenshots), so copy this
// file there first and fill in CONFIG. Use pages that between them show every tile state (plain, sale,
// variable, price range, sold out). It returns the CSS block as a string: hand it to the shell skill
// under SHELL CSS NOTES (`archive-scoped:`), which appends it after its TILE FILL rule; then compare the
// same tile from every page type.

async (page) => {
	const CONFIG = {
		origin: "https://www.example-shop.com",
		categoryPaths: ["/category-a/", "/sale/", "/category-with-variants/"],
		nativeTile: "ul.products li.product",                   // the native tile root, inside its list
		shellCell: ".hr-overlay-search .hr-search-overlay-product", // the shell cell the tile root sits in
		rootClass: ".hr-overlay-search",                         // repeated to raise specificity
		list: "ul\\.products(?:\\.[\\w-]+|\\[class\\*=\"columns-\"\\])*", // regex for the list ancestor
		bodyScope: "\\.woocommerce(?::where\\((?:[^()]|\\([^()]*\\))*\\))?", // regex for the body-class scope
		skip: "#slider-|\\.hr-|\\.aw-|hello-retail|addwish",
	};

	const collect = (C) => {
		const specificity = (sel) => {
			let s = sel.replace(/:where\((?:[^()]|\([^()]*\))*\)/g, "");
			s = s.replace(/:(not|is)\(((?:[^()]|\([^()]*\))*)\)/g, (m, k, inner) => " " + inner + " ");
			const a = (s.match(/#[\w-]+/g) || []).length;
			const b = (s.match(/\.[\w-]+|\[[^\]]*\]|:(?!:)[\w-]+(?:\([^)]*\))?/g) || []).length;
			const c = (s.match(/(^|[\s>+~(])[a-zA-Z][\w-]*/g) || []).length + (s.match(/::[\w-]+/g) || []).length;
			return [a, b, c];
		};
		const atLeast = (x, y) => (x[0] !== y[0] ? x[0] > y[0] : x[1] !== y[1] ? x[1] > y[1] : x[2] >= y[2]);
		const listRe = new RegExp("^(.*?)\\b" + C.list + "\\s+(li(?![\\w-])(?:\\.[\\w-]+)?.*)$");
		const bodyRe = new RegExp("^" + C.bodyScope + "\\s+(.*)$");
		const rescope = (part) => {
			const s = part.trim();
			let tail = null;
			let m = s.match(listRe);
			if (m) tail = C.shellCell + " > " + m[2];
			else if ((m = s.match(bodyRe)) && !/^(ul|div\.product)\b/.test(m[1])) tail = C.shellCell + " " + m[1];
			if (!tail) return null;
			const original = specificity(s);
			let sel = tail;
			let k = 0;
			while (!atLeast(specificity(sel), original) && k < 8) {
				k++;
				sel = sel.replace(C.rootClass, C.rootClass + C.rootClass.repeat(k));
			}
			return sel;
		};
		const strip = (s) => s.replace(/::?(before|after|hover|focus|active|focus-within|focus-visible|disabled|first-child|last-child|nth-child\([^)]*\)|nth-of-type\([^)]*\)|first-of-type|last-of-type|not\([^)]*\)|placeholder)/g, "").trim();
		const tiles = [...document.querySelectorAll(C.nativeTile)].filter((t) => !t.closest("#addwish-panel-root, .aw-item, [id^=hello-retail]"));
		const elements = [];
		tiles.forEach((t) => { elements.push(t); t.querySelectorAll("*").forEach((e) => elements.push(e)); });
		const matches = (sel) => { try { return elements.some((e) => e.matches(sel)); } catch (e) { return false; } };
		const skip = new RegExp(C.skip, "i");
		const out = [];
		const walk = (rules, ctx) => {
			for (const r of rules) {
				if (r.type === 1) {
					const m = r.cssText.match(/^([^{]+)\{([\s\S]*)\}\s*$/);
					if (!m || skip.test(m[1])) continue;
					const body = m[2].trim();
					if (/(^|;\s*)float\s*:\s*(left|right)/.test(body) || /(^|;\s*)clear\s*:/.test(body)) continue;
					const parts = m[1].split(/,(?![^(]*\))/).map((x) => x.trim()).filter((p) => { const t = strip(p); return t && matches(t); });
					const selectors = [...new Set(parts.map(rescope).filter(Boolean))];
					if (selectors.length) out.push({ ctx, selectors, body });
				} else if (r.type === 4) walk(r.cssRules, (ctx ? ctx + " " : "") + "@media " + r.conditionText);
				else if (r.type === 12) walk(r.cssRules, (ctx ? ctx + " " : "") + "@supports " + r.conditionText);
			}
		};
		for (const sheet of document.styleSheets) {
			let rules;
			try { rules = sheet.cssRules; } catch (e) { continue; }
			const media = sheet.media && sheet.media.mediaText;
			if (media && /print/.test(media)) continue;
			walk(rules, media && media !== "all" ? "@media " + media : "");
		}
		return { tiles: tiles.length, rules: out };
	};

	const merged = [];
	const key = (r) => r.ctx + "|" + r.selectors.join(",") + "|" + r.body;
	const log = [];
	for (const path of CONFIG.categoryPaths) {
		try {
			await page.goto(CONFIG.origin + path, { waitUntil: "load", timeout: 45000 });
			await page.waitForTimeout(1500);
			const { tiles, rules } = await page.evaluate(collect, CONFIG);
			let last = -1;
			let added = 0;
			for (const r of rules) {
				const at = merged.findIndex((x) => key(x) === key(r));
				if (at >= 0) { last = at; continue; }
				merged.splice(last + 1, 0, r);
				last++;
				added++;
			}
			log.push(path + ": " + tiles + " tiles, " + rules.length + " rules, " + added + " new");
		} catch (e) {
			log.push(path + ": " + String(e).slice(0, 80));
		}
	}

	const css = merged.map((r) => {
		const body = r.body.replace(/;\s*$/, "").split(/;\s*(?![^()]*\))/).map((x) => x.trim()).filter(Boolean).map((x) => "\t" + x + ";").join("\n");
		let block = r.selectors.join(",\n") + " {\n" + body + "\n}";
		if (r.ctx) block = r.ctx.replace(/^@media all /, "@media ") + " {\n" + block.split("\n").map((l) => "\t" + l).join("\n") + "\n}";
		return block;
	}).join("\n\n");

	return { log, rules: merged.length, css };
}
