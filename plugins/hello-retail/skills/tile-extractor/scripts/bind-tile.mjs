#!/usr/bin/env node
/**
 * bind-tile.mjs — the tile skill's substitution step. Two modes, no dependencies, Node ≥ 18.
 *
 * BIND (default): skeleton + the filled BINDINGS table → the Liquid tile body.
 *
 *   node bind-tile.mjs --skeleton skeleton.html --bindings bindings.json --out tile.liquid
 *
 *   skeleton.html   the normal tile's outerHTML with tokens and markers, produced by the
 *                   MULTI-TILE DIFF snippet in references/survey-snippets.md:
 *                     [TEXT:3]              a text node that differs between two normal tiles
 *                     [ATTR:data-id:4]      an attribute value that differs between two normal tiles
 *                     [URL:src]             a URL-bearing attribute value
 *                     [CLASS:sale:8]        a class token present only in one state
 *                     [TRACKING]            the trackClick argument on the add-to-cart control
 *                                           (auto-bound to {{ product.trackingCode }})
 *                     [INPUT:add_to_cart_label]  a fixed text turned into a recom dashboard input
 *                                           (auto-bound to {% input add_to_cart_label %})
 *                     <!--HR-IF:BRANCH:sale:7--> … <!--HR-ENDIF:BRANCH:sale:7-->
 *                                           an element present only in one state (or missing in one)
 *   bindings.json   the BINDINGS table the model filled:
 *                     {
 *                       "spots":    { "TEXT:3": "{{ product.title }}", "URL:src": "{{ product.imgUrl }}", … },
 *                       "branches": { "BRANCH:sale:7": "product.isOnSale",
 *                                     "BRANCH:not-soldout:9": "product.inStock",
 *                                     "CLASS:sale:8": "{% if product.isOnSale %}is-sale{% endif %}",
 *                                     "BRANCH:badge:10": "always" },
 *                       "root":     { "stripClasses": ["col-md-3", "first"],
 *                                     "stripStyleProps": ["order"],
 *                                     "liReset": true }
 *                     }
 *                   A branch bound to "always" keeps the element unconditionally (the difference
 *                   was noise); any other value is the Liquid condition for {% if … %}.
 *                   Expressions must be self-contained inline chains — the skeleton has no place
 *                   for a {% assign %} preamble.
 *
 *   Exits 1 without writing when a token or marker is left unbound, or when the output has a
 *   different element sequence than the skeleton. The copy is never edited by hand: an unbound
 *   token means the table is incomplete, not that the model should improvise.
 *
 * PREVIEW: skeleton + the diff result → the tile as the shop shows it for one state, with the
 * specimen's own native values, for the visual fidelity check (no Liquid engine involved).
 *
 *   node bind-tile.mjs --preview --diff diff.json --state sale [--bindings bindings.json] --out preview-sale.html
 *
 *   diff.json       the whole MULTI-TILE DIFF result saved as-is (spots, branches, skeleton,
 *                   urlValues). --state names the specimen to render: normal, sale, soldout,
 *                   badge, … Branch markers keep or drop their element for that state, class tokens
 *                   resolve to the state's classes, [TEXT]/[ATTR] tokens take the normal specimen's
 *                   values, [URL] tokens the recorded native URLs, [INPUT] the native text,
 *                   [TRACKING] a placeholder. --bindings, when given, applies the same root edits
 *                   as BIND so the preview shows the tile exactly as the template will emit it.
 */

import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);

const fail = (msg, detail) => {
  console.error(`bind-tile: ${msg}`);
  if (detail) console.error(typeof detail === "string" ? detail : JSON.stringify(detail, null, 2));
  process.exit(1);
};
const readText = (path, what) => {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    return fail(`cannot read ${what} ${path}: ${e.message}`);
  }
};
const readJson = (path, what) => {
  try {
    return JSON.parse(readText(path, what));
  } catch (e) {
    return fail(`${what} ${path} is not valid JSON: ${e.message}`);
  }
};

/** Root-only edits (Output Rules 10 and 14): width/position classes and declarations, <li> reset. */
const applyRootEdits = (html, root) => {
  const rootTag = /^\s*<([a-zA-Z][\w-]*)([^>]*)>/.exec(html);
  if (!rootTag) fail("skeleton does not start with an element");
  const tag = rootTag[1].toLowerCase();
  let attrsText = rootTag[2];
  const stripClasses = new Set(root.stripClasses || []);
  const stripProps = new Set((root.stripStyleProps || []).map((p) => p.toLowerCase()));
  if (stripClasses.size) {
    attrsText = attrsText.replace(/\sclass="([^"]*)"/, (m, v) => {
      const kept = v.split(/\s+/).filter((c) => c && !stripClasses.has(c));
      return kept.length ? ` class="${kept.join(" ")}"` : "";
    });
  }
  const editStyle = (v) => {
    let decls = v.split(";").map((d) => d.trim()).filter(Boolean);
    if (stripProps.size) decls = decls.filter((d) => !stripProps.has(d.split(":")[0].trim().toLowerCase()));
    if (root.liReset && tag === "li" && !decls.some((d) => /^list-style(-type)?\s*:/i.test(d))) decls.push("list-style-type:none");
    return decls.length ? ` style="${decls.join(";")};"` : "";
  };
  if (/\sstyle="[^"]*"/.test(attrsText)) attrsText = attrsText.replace(/\sstyle="([^"]*)"/, (m, v) => editStyle(v));
  else if (root.liReset && tag === "li") attrsText += editStyle("");
  return {
    html: html.replace(rootTag[0], `<${rootTag[1]}${attrsText}>`),
    summary: {
      strippedClasses: root.stripClasses || [],
      strippedStyleProps: root.stripStyleProps || [],
      liReset: !!(root.liReset && tag === "li"),
    },
  };
};

const TOKEN = /\[(TEXT|ATTR|URL|CLASS|BRANCH|INPUT):[^\]]*\]|\[TRACKING\]/g;
const MARKER = /<!--HR-(IF|ENDIF):[^>]*-->/g;

/** Start-tag sequence with Liquid and markers removed — substitution must never change it. */
const tagSequence = (html) =>
  html
    .replace(MARKER, "")
    .replace(/{%[\s\S]*?%}|{{[\s\S]*?}}/g, "")
    .match(/<([a-zA-Z][\w-]*)\b/g)
    ?.map((t) => t.slice(1).toLowerCase()) || [];

// ─────────────────────────────────────────────────────────────────────────────────────────────
// PREVIEW mode
// ─────────────────────────────────────────────────────────────────────────────────────────────
if (args.preview) {
  const diff = readJson(args.diff || "diff.json", "diff");
  const state = args.state || "normal";
  const outPath = args.out || `preview-${state}.html`;
  let html = args.skeleton ? readText(args.skeleton, "skeleton") : diff.skeleton;
  if (!html) fail("no skeleton: pass --skeleton or a diff.json that carries one");
  let rootSummary = null;
  if (args.bindings) {
    const r = applyRootEdits(html, readJson(args.bindings, "bindings").root || {});
    html = r.html;
    rootSummary = r.summary;
  }
  const spotById = Object.fromEntries((diff.spots || []).map((s) => [s.id, s]));
  const branchById = Object.fromEntries((diff.branches || []).map((b) => [b.id, b]));
  const missingValues = new Set();

  html = html.replace(/\[(TEXT|ATTR):[^\]]*\]/g, (m) => {
    const s = spotById[m.slice(1, -1)];
    if (!s || s.normal === undefined) { missingValues.add(m); return ""; }
    return s.normal;
  });
  html = html.replace(/\[INPUT:([^\]]+)\]/g, (m, name) => spotById[`INPUT:${name}`]?.text ?? name);
  html = html.split("[TRACKING]").join("preview");
  let k = 0;
  const urls = diff.urlValues || [];
  html = html.replace(/\[URL:[^\]]+\]/g, () => {
    const v = urls[k++];
    if (v === undefined) missingValues.add(`[URL] #${k}`);
    return v ?? "";
  });
  html = html.replace(/\[CLASS:([^:\]]+):[^\]]*\]/g, (m, st) => (st === state ? branchById[m.slice(1, -1)]?.adds || "" : ""));

  // Branch markers: keep the element for its own state, drop it otherwise; "not-<state>" inverts.
  const pair = /<!--HR-IF:BRANCH:(not-)?([^:]+):(\d+)-->([\s\S]*?)<!--HR-ENDIF:BRANCH:(?:not-)?[^:]+:\3-->/;
  let guard = 0;
  while (pair.test(html) && guard++ < 10000) {
    html = html.replace(pair, (m, not, st, n, inner) => (not ? st !== state : st === state) ? inner : "");
  }
  const leftoverMarkers = html.match(MARKER) || [];
  if (leftoverMarkers.length) fail("unmatched branch markers in the skeleton", [...new Set(leftoverMarkers)]);

  writeFileSync(outPath, html);
  console.log(
    JSON.stringify(
      { mode: "preview", state, out: outPath, elements: tagSequence(html).length, missingValues: [...missingValues], rootEdits: rootSummary },
      null,
      2,
    ),
  );
  process.exit(0);
}

// ─────────────────────────────────────────────────────────────────────────────────────────────
// BIND mode
// ─────────────────────────────────────────────────────────────────────────────────────────────
const skeletonPath = args.skeleton || "skeleton.html";
const bindingsPath = args.bindings || "bindings.json";
const outPath = args.out || "tile.liquid";

const skeleton = readText(skeletonPath, "skeleton");
const bindings = readJson(bindingsPath, "bindings");
const spots = bindings.spots || {};
const branches = bindings.branches || {};

// 1. Root-only edits.
const rootResult = applyRootEdits(skeleton, bindings.root || {});
let out = rootResult.html;

// 2. Auto-bound tokens: the tracking call and recom text inputs need no table line unless overridden.
out = out.replace(/\[INPUT:([^\]]+)\]/g, (m, name) => (spots[`INPUT:${name}`] !== undefined ? m : `{% input ${name} %}`));
if (spots.TRACKING === undefined) out = out.split("[TRACKING]").join("{{ product.trackingCode }}");

//    Spots and class tokens: plain token replacement, every occurrence.
const used = new Set();
for (const [id, expr] of Object.entries(spots)) {
  const token = `[${id}]`;
  if (out.includes(token)) used.add(id);
  out = out.split(token).join(expr);
}
for (const [id, value] of Object.entries(branches)) {
  if (!id.startsWith("CLASS:")) continue;
  const token = `[${id}]`;
  if (out.includes(token)) used.add(id);
  out = out.split(token).join(value === "always" ? "" : value);
}

// 3. Branch markers → {% if cond %} … {% endif %}, or nothing when bound to "always".
for (const [id, cond] of Object.entries(branches)) {
  if (id.startsWith("CLASS:")) continue;
  const open = `<!--HR-IF:${id}-->`;
  const close = `<!--HR-ENDIF:${id}-->`;
  if (out.includes(open)) used.add(id);
  out = out.split(open).join(cond === "always" ? "" : `{% if ${cond} %}`);
  out = out.split(close).join(cond === "always" ? "" : "{% endif %}");
}

// 4. Gate: nothing unbound may remain.
const leftoverTokens = out.match(TOKEN) || [];
const leftoverMarkers = out.match(MARKER) || [];
if (leftoverTokens.length || leftoverMarkers.length) {
  fail("the BINDINGS table is incomplete — add a line for each of these, then run again", {
    tokens: [...new Set(leftoverTokens)],
    markers: [...new Set(leftoverMarkers)],
  });
}
const unused = [...Object.keys(spots), ...Object.keys(branches)].filter((id) => !used.has(id));

// 5. Gate: the element sequence must not change — substitution never adds or removes an element.
const before = tagSequence(skeleton);
const after = tagSequence(out);
if (before.join(",") !== after.join(",")) {
  fail("element sequence changed between skeleton and output — a binding expression contains markup, or the skeleton was edited", {
    skeletonElements: before.length,
    outputElements: after.length,
  });
}

writeFileSync(outPath, out);
console.log(
  JSON.stringify(
    {
      mode: "bind",
      out: outPath,
      elements: after.length,
      spotsBound: Object.keys(spots).length,
      branchesBound: Object.keys(branches).length,
      unusedBindings: unused,
      rootEdits: rootResult.summary,
    },
    null,
    2,
  ),
);
