#!/usr/bin/env node
/**
 * splice-tile.mjs — put the customer's tile into a Search design's resultTemplate by structure,
 * not by marker.
 *
 * The design Hello Retail attaches to a new config (search_createConfig) carries no placeholder.
 * The slot is the {% else %} branch of the banner check inside {% for product in product_list %},
 * and its content is the default tile (<a class="hr-search-overlay-product-link" …>…</a>). This
 * script finds that branch by parsing the Liquid tags, replaces its whole content with the tile
 * body, and optionally mirrors the tile skill's PARENT HOOKS onto every hr-products-container and
 * onto the hr-search-overlay-product cell. There is no placeholder to look for: the branch itself is the
 * slot, so a design read from the MCP and the overlay's wiki files splice the same way.
 *
 * Input (session scratch folder — never in the repo or the plugin):
 *   --liquid resultTemplate.liquid   the design's resultTemplate, extracted from the spilled
 *                                    search_getDesign result:  jq -r .resultTemplate <spilled.json>
 *   --design <spilled.json>          alternative to --liquid: the spilled file itself
 *   --tile tile.liquid               the tile body from tile-extractor (bind-tile.mjs output)
 *   --hooks "products-grid catalog"  container-level PARENT HOOKS → every hr-products-container
 *   --cell-hooks "grid__item"        cell-level PARENT HOOKS → the hr-search-overlay-product cell
 *   --out resultTemplate.liquid      where to write (may be the input file)
 *   --show                           print the branch that would be replaced and exit; writes nothing
 *
 * Gates (exit 1, nothing written): no or several product loops; no banner if/else inside the loop;
 * a token or marker left unbound in the tile; --hooks given but no hr-products-container found;
 * Liquid block tags unbalanced after the splice.
 *
 * Usage:
 *   node "<skill-base-dir>/scripts/splice-tile.mjs" --liquid resultTemplate.liquid --tile tile.liquid \
 *        --hooks "products-grid" --cell-hooks "grid__item" --out resultTemplate.liquid
 */

import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);

const fail = (msg, detail) => {
  console.error(`splice-tile: ${msg}`);
  if (detail) console.error(typeof detail === "string" ? detail : JSON.stringify(detail, null, 2));
  process.exit(1);
};
const warn = (msg) => console.error(`splice-tile: warning — ${msg}`);

const show = args.show === "true";
const outPath = args.out || args.liquid || "resultTemplate.liquid";

let src;
try {
  if (args.design) {
    const design = JSON.parse(readFileSync(args.design, "utf8"));
    src = design.resultTemplate;
  } else {
    src = readFileSync(args.liquid || "resultTemplate.liquid", "utf8");
  }
} catch (e) {
  fail(`cannot read the design: ${e.message}`);
}
if (typeof src !== "string" || !src.trim()) fail("resultTemplate is empty");

let tile = "";
if (!show) {
  try {
    tile = readFileSync(args.tile || "tile.liquid", "utf8").replace(/\s+$/, "");
  } catch (e) {
    fail(`cannot read the tile ${args.tile || "tile.liquid"}: ${e.message}`);
  }
  if (!tile) fail("the tile body is empty");
  const leftover = tile.match(/\[(TEXT|ATTR|URL|CLASS|BRANCH|INPUT):[^\]]*\]|\[TRACKING\]|<!--HR-(IF|ENDIF):[^>]*-->/g);
  if (leftover) fail("the tile still carries unbound tokens or markers — finish bind-tile.mjs first", [...new Set(leftover)]);
  if (/class=["'][^"']*\bhr-/.test(tile)) warn("the tile carries an hr-* class; the shell keeps nothing of Hello Retail inside the tile (Output Rule 15)");
}

// ---------------------------------------------------------------------------------------------
// Liquid tag scan. Comment and raw blocks are opaque: nothing inside them counts as a tag.
// ---------------------------------------------------------------------------------------------
const OPENERS = new Set(["if", "unless", "case", "for", "tablerow", "capture", "comment", "raw"]);
const CLOSER_OF = { endif: "if", endunless: "unless", endcase: "case", endfor: "for", endtablerow: "tablerow", endcapture: "capture", endcomment: "comment", endraw: "raw" };

function scanTags(text) {
  const re = /\{%-?\s*(\w+)\b([\s\S]*?)-?%\}/g;
  const tags = [];
  let opaque = null; // "comment" | "raw" while inside one
  for (const m of text.matchAll(re)) {
    const name = m[1];
    if (opaque) {
      if (name === `end${opaque}`) {
        tags.push({ name, expr: "", start: m.index, end: m.index + m[0].length });
        opaque = null;
      }
      continue;
    }
    tags.push({ name, expr: m[2].trim(), start: m.index, end: m.index + m[0].length });
    if (name === "comment" || name === "raw") opaque = name;
  }
  return tags;
}

const lineOf = (text, offset) => text.slice(0, offset).split("\n").length;

// Index of the tag that closes the block opened at tags[i]; also the first depth-0 `else`.
function matchBlock(tags, i) {
  const open = tags[i].name;
  let depth = 0;
  let elseAt = -1;
  for (let j = i + 1; j < tags.length; j++) {
    const t = tags[j];
    if (OPENERS.has(t.name)) depth++;
    else if (CLOSER_OF[t.name]) {
      if (depth === 0) return CLOSER_OF[t.name] === open ? { close: j, elseAt } : { close: -1, elseAt };
      depth--;
    } else if (depth === 0 && t.name === "else" && elseAt < 0) elseAt = j;
  }
  return { close: -1, elseAt };
}

function checkBalance(text) {
  const stack = [];
  for (const t of scanTags(text)) {
    if (OPENERS.has(t.name)) stack.push(t);
    else if (CLOSER_OF[t.name]) {
      const top = stack.pop();
      if (!top || top.name !== CLOSER_OF[t.name]) return `${t.name} at line ${lineOf(text, t.start)} closes ${top ? top.name : "nothing"}`;
    }
  }
  return stack.length ? `${stack[stack.length - 1].name} at line ${lineOf(text, stack[stack.length - 1].start)} is never closed` : null;
}

// ---------------------------------------------------------------------------------------------
// 1. The product loop.
// ---------------------------------------------------------------------------------------------
const before = checkBalance(src);
if (before) fail(`the design's Liquid is not balanced before the splice: ${before}`);

const tags = scanTags(src);
let loops = tags.map((t, i) => ({ t, i })).filter(({ t }) => t.name === "for" && /\bproduct\s+in\s+product_list\b/.test(t.expr));
if (!loops.length) loops = tags.map((t, i) => ({ t, i })).filter(({ t }) => t.name === "for" && /\bproduct\s+in\b/.test(t.expr));
if (!loops.length) fail("no {% for product in product_list %} loop in resultTemplate");
if (loops.length > 1) fail("several product loops — say which one is the tile slot", loops.map(({ t }) => `line ${lineOf(src, t.start)}: {% ${t.name} ${t.expr} %}`));
const loop = loops[0];
const loopEnd = matchBlock(tags, loop.i).close;
if (loopEnd < 0) fail(`the product loop at line ${lineOf(src, loop.t.start)} has no matching endfor`);

// ---------------------------------------------------------------------------------------------
// 2. The banner check with an else branch inside that loop.
// ---------------------------------------------------------------------------------------------
// The desktop designs open the loop with a skip guard that also tests isBanner and has an else
// holding only {% continue %}. The slot is the isBanner/else whose else branch holds an element:
// the default tile, or the customer's tile on a re-run.
const candidates = [];
for (let i = loop.i + 1; i < loopEnd; i++) {
  const t = tags[i];
  if (t.name !== "if" || !/isBanner/.test(t.expr)) continue;
  const { close, elseAt } = matchBlock(tags, i);
  if (close < 0 || close > loopEnd || elseAt < 0) continue;
  const content = src.slice(tags[elseAt].end, tags[close].start);
  if (!/<[a-zA-Z]/.test(content)) continue;
  candidates.push({ ifIdx: i, elseIdx: elseAt, endIdx: close, content });
}
if (!candidates.length) fail(`no {% if … isBanner … %} … {% else %} … {% endif %} with an element in its else branch inside the product loop at line ${lineOf(src, loop.t.start)}`);
const branch =
  candidates.find((c) => /hr-search-overlay-product-link/.test(c.content)) ||
  candidates.reduce((a, b) => (b.content.length > a.content.length ? b : a));

const elseTag = tags[branch.elseIdx];
const endifTag = tags[branch.endIdx];
const current = branch.content;

if (show) {
  console.log(`product loop: line ${lineOf(src, loop.t.start)}  {% ${loop.t.name} ${loop.t.expr} %}`);
  console.log(`banner check: line ${lineOf(src, tags[branch.ifIdx].start)}  {% if ${tags[branch.ifIdx].expr} %}`);
  console.log(`slot: lines ${lineOf(src, elseTag.end)}–${lineOf(src, endifTag.start)} (${current.length} chars) — the content of the {% else %} branch, replaced whole:`);
  console.log(current);
  process.exit(0);
}

// ---------------------------------------------------------------------------------------------
// 3. Splice.
// ---------------------------------------------------------------------------------------------
const lineStart = src.lastIndexOf("\n", elseTag.start) + 1;
const indent = (src.slice(lineStart, elseTag.start).match(/^[ \t]*/) || [""])[0];
const tileIndented = tile.split("\n").map((l) => (l.trim() ? indent + "\t" + l : l)).join("\n");
let out = src.slice(0, elseTag.end) + "\n" + tileIndented + "\n" + indent + src.slice(endifTag.start);

const applied = { containers: 0, cell: 0 };
const classTokens = (value) => value.replace(/\{%[\s\S]*?%\}|\{\{[\s\S]*?\}\}/g, " ").split(/\s+/).filter(Boolean);

// Cell-level hooks: the hr-search-overlay-product opener between the for tag and the else tag.
const cellHooks = (args["cell-hooks"] || "").split(/\s+/).filter(Boolean);
if (cellHooks.length) {
  const regionEnd = elseTag.end; // offsets before the else tag are unchanged by the splice
  const region = out.slice(loop.t.start, regionEnd);
  const cellRe = /(<div[^>]*?class=["']hr-search-overlay-product)(?=["'\s{])/;
  const m = region.match(cellRe);
  if (!m) fail("--cell-hooks given but no <div class=\"hr-search-overlay-product…\"> cell found inside the product loop");
  // class values may embed Liquid tags ({% if … %} hr-search-overlay-b{% endif %}); strip them before tokenising
  const existing = new Set(classTokens((region.slice(m.index).match(/class=["']([^"']*)/) || ["", ""])[1]));
  const add = cellHooks.filter((c) => !existing.has(c));
  const patched = region.replace(cellRe, `$1${add.length ? " " + add.join(" ") : ""}`);
  out = out.slice(0, loop.t.start) + patched + out.slice(regionEnd);
  applied.cell = add.length;
}

// Container-level hooks: every hr-products-container, both quote styles.
const hooks = (args.hooks || "").split(/\s+/).filter(Boolean);
if (hooks.length) {
  const containerRe = /(<div[^>]*?class=)(["'])hr-products-container([^"']*)\2/g;
  let n = 0;
  out = out.replace(containerRe, (whole, lead, q, rest) => {
    n++;
    const existing = new Set(classTokens(rest));
    const add = hooks.filter((c) => !existing.has(c));
    return `${lead}${q}hr-products-container${add.length ? " " + add.join(" ") : ""}${rest}${q}`;
  });
  if (!n) fail("--hooks given but no hr-products-container found in resultTemplate");
  applied.containers = n;
}

// ---------------------------------------------------------------------------------------------
// 4. Gates on the result, then write.
// ---------------------------------------------------------------------------------------------
const after = checkBalance(out);
if (after) fail(`the Liquid is not balanced after the splice — the tile body opens or closes a block it should not: ${after}`);
// early copies of the wiki's Search files carried a TILE_BODY marker comment; one outside the slot means this is not a design the script understands
if (/TILE_BODY/.test(out)) fail("a TILE_BODY marker survived outside the slot — the design is not one this script understands");

writeFileSync(outPath, out);

const preview = current.trim().replace(/\s+/g, " ");
console.log(`splice-tile: replaced the {% else %} branch at line ${lineOf(src, elseTag.start)} (${current.length} chars) with the tile (${tile.length} chars)`);
console.log(`  removed: ${preview.slice(0, 140)}${preview.length > 140 ? " …" : ""}`);
if (hooks.length) console.log(`  container hooks "${hooks.join(" ")}" on ${applied.containers} hr-products-container element(s)`);
if (cellHooks.length) console.log(`  cell hooks "${cellHooks.join(" ")}" on the hr-search-overlay-product cell (${applied.cell} added)`);
console.log(`  wrote ${outPath} (${out.length} chars, was ${src.length}); diff it against the extract before pushing it as resultTemplate`);
