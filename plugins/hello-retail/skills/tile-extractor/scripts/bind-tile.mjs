#!/usr/bin/env node
/**
 * bind-tile.mjs — turn the captured tile skeleton into the Liquid tile body by substitution.
 *
 * Input (all in the session scratch folder — never in the repo or the plugin):
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
 *
 * Output: tile.liquid. The script exits 1 without writing when a token or marker is left unbound,
 * or when the output has a different element count than the skeleton — the copy is never edited
 * by hand, so an unbound token means the table is incomplete, not that the model should improvise.
 *
 * Usage:
 *   node "<skill-base-dir>/scripts/bind-tile.mjs" --skeleton skeleton.html --bindings bindings.json --out tile.liquid
 */

import { readFileSync, writeFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);
const skeletonPath = args.skeleton || "skeleton.html";
const bindingsPath = args.bindings || "bindings.json";
const outPath = args.out || "tile.liquid";

const fail = (msg, detail) => {
  console.error(`bind-tile: ${msg}`);
  if (detail) console.error(typeof detail === "string" ? detail : JSON.stringify(detail, null, 2));
  process.exit(1);
};

let skeleton;
let bindings;
try {
  skeleton = readFileSync(skeletonPath, "utf8");
} catch (e) {
  fail(`cannot read skeleton ${skeletonPath}: ${e.message}`);
}
try {
  bindings = JSON.parse(readFileSync(bindingsPath, "utf8"));
} catch (e) {
  fail(`cannot read bindings ${bindingsPath}: ${e.message}`);
}
const spots = bindings.spots || {};
const branches = bindings.branches || {};
const root = bindings.root || {};

let out = skeleton;

// 1. Root-only edits: width/position classes and inline declarations, and the <li> bullet reset.
//    Only the first start tag is ever touched (Output Rules 10 and 14).
const rootTag = /^\s*<([a-zA-Z][\w-]*)([^>]*)>/.exec(out);
if (!rootTag) fail("skeleton does not start with an element");
{
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
  if (/\sstyle="[^"]*"/.test(attrsText)) {
    attrsText = attrsText.replace(/\sstyle="([^"]*)"/, (m, v) => editStyle(v));
  } else if (root.liReset && tag === "li") {
    attrsText += editStyle("");
  }
  out = out.replace(rootTag[0], `<${rootTag[1]}${attrsText}>`);
}

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

// 3. Branch markers: <!--HR-IF:id--> … <!--HR-ENDIF:id--> become {% if cond %} … {% endif %},
//    or vanish when the branch is bound to "always".
for (const [id, cond] of Object.entries(branches)) {
  if (id.startsWith("CLASS:")) continue;
  const open = `<!--HR-IF:${id}-->`;
  const close = `<!--HR-ENDIF:${id}-->`;
  if (out.includes(open)) used.add(id);
  out = out.split(open).join(cond === "always" ? "" : `{% if ${cond} %}`);
  out = out.split(close).join(cond === "always" ? "" : "{% endif %}");
}

// 4. Gate: nothing unbound may remain.
const leftoverTokens = [...out.matchAll(/\[(TEXT|ATTR|URL|CLASS|BRANCH|INPUT):[^\]]*\]|\[TRACKING\]/g)].map((m) => m[0]);
const leftoverMarkers = [...out.matchAll(/<!--HR-(IF|ENDIF):[^>]*-->/g)].map((m) => m[0]);
if (leftoverTokens.length || leftoverMarkers.length) {
  fail("the BINDINGS table is incomplete — add a line for each of these, then run again", {
    tokens: [...new Set(leftoverTokens)],
    markers: [...new Set(leftoverMarkers)],
  });
}
const unused = [...Object.keys(spots), ...Object.keys(branches)].filter((id) => !used.has(id));

// 5. Gate: the output must have the same elements as the skeleton — substitution never adds or
//    removes an element. Compare start-tag sequences with Liquid and markers removed.
const tagSequence = (html) =>
  html
    .replace(/<!--HR-(IF|ENDIF):[^>]*-->/g, "")
    .replace(/{%[\s\S]*?%}|{{[\s\S]*?}}/g, "")
    .match(/<([a-zA-Z][\w-]*)\b/g)
    ?.map((t) => t.slice(1).toLowerCase()) || [];
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
      out: outPath,
      elements: after.length,
      spotsBound: Object.keys(spots).length,
      branchesBound: Object.keys(branches).length,
      unusedBindings: unused,
      rootEdits: {
        strippedClasses: root.stripClasses || [],
        strippedStyleProps: root.stripStyleProps || [],
        liReset: !!(root.liReset && rootTag[1].toLowerCase() === "li"),
      },
    },
    null,
    2,
  ),
);
