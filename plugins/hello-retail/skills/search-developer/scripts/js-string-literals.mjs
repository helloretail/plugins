#!/usr/bin/env node
/**
 * js-string-literals.mjs — list the string literals in a design's initializationCode that can reach
 * the page, so untranslated copy built by concatenation is found before the push.
 *
 * The `{# text … #}` declarations are translated in Step 12a, but the base JS also builds strings at
 * runtime — accessible names, recent-search labels, status texts — by joining literals around a
 * variable (`"Remove search '" + term + "'"`). Those never appear as a declaration and are easy to miss
 * with a search for whole sentences. This script tokenises the JavaScript (string, template and
 * comment aware), and reports every literal that contains a word, marking the ones that are likely
 * user-visible: the literal has a space or ends in punctuation, or its line writes text or an
 * accessible name (aria-label, title, placeholder, alt, textContent, innerText, innerHTML).
 *
 * Input (session scratch folder — never in the repo or the plugin):
 *   --js initializationCode.js     the design's initializationCode, extracted from the spilled
 *                                  search_getDesign result
 *   --all                          also print the literals that look like selectors or identifiers
 *
 * Output: one line per literal — line number, VISIBLE / other, the literal — then a count. Translate
 * every VISIBLE literal that is not in the customer's language, keep interpolation and spacing, and
 * list each in the Step 12d translation table. A selector, class name or event name is never translated.
 *
 * Usage:
 *   node "<skill-base-dir>/scripts/js-string-literals.mjs" --js initializationCode.js
 */

import { readFileSync } from "node:fs";

const args = Object.fromEntries(
  process.argv.slice(2).reduce((acc, a, i, arr) => {
    if (a.startsWith("--")) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith("--") ? arr[i + 1] : "true"]);
    return acc;
  }, []),
);

if (!args.js || args.js === "true") {
  console.error("js-string-literals: --js <initializationCode.js> is required");
  process.exit(1);
}

const src = readFileSync(args.js, "utf8").split("\r\n").join("\n");
const lines = src.split("\n");

const literals = [];
let i = 0;
let line = 1;
while (i < src.length) {
  const c = src[i];
  const next = src[i + 1];
  if (c === "\n") { line++; i++; continue; }
  if (c === "/" && next === "/") { while (i < src.length && src[i] !== "\n") i++; continue; }
  if (c === "/" && next === "*") {
    i += 2;
    while (i < src.length && !(src[i] === "*" && src[i + 1] === "/")) { if (src[i] === "\n") line++; i++; }
    i += 2;
    continue;
  }
  if (c === '"' || c === "'" || c === "`") {
    const quote = c;
    const startLine = line;
    let value = "";
    i++;
    while (i < src.length && src[i] !== quote) {
      if (src[i] === "\\") { value += src[i] + (src[i + 1] || ""); i += 2; continue; }
      if (src[i] === "\n") line++;
      value += src[i];
      i++;
    }
    i++;
    literals.push({ line: startLine, value });
    continue;
  }
  i++;
}

const hasWord = (s) => /\p{L}{2,}/u.test(s);
const markupText = (s) => s.replace(/<[^>]*>/g, " ").replace(/\$\{[^}]*\}/g, " ");
const looksTechnical = (s) =>
  /^[\w-]+$/.test(s) ||
  /^(https?:)?\/\//.test(s) ||
  /(^|[\s\]'"(,>+~])[.#][\w-]/.test(s) ||
  /\[[\w-]+([~|^$*]?=[^\]]*)?\]/.test(s) ||
  /^[\]'"\s]*\]/.test(s) ||
  /^:/.test(s) ||
  /\s[>+~]\s/.test(s) ||
  /^[\w-]+\s*:[^;]*;/.test(s) ||
  !hasWord(markupText(s));
const textSink =
  /setAttribute\(\s*["'`](aria-label|aria-description|title|placeholder|alt)["'`]|\.(textContent|innerText|innerHTML|title|placeholder|alt|ariaLabel)\s*[+]?=|insertAdjacentHTML/;
const devOnly = /console\.(log|warn|error|info|debug)\s*\(/;

const rows = [];
for (const lit of literals) {
  if (!hasWord(lit.value)) continue;
  const v = lit.value;
  const code = lines[lit.line - 1] || "";
  const sink = textSink.test(code);
  const prose = /\s/.test(v.trim()) || /[\s:.,!?'"]$/.test(v) || /^[\s'"]/.test(v);
  const visible = (prose || sink) && !looksTechnical(v.trim()) && !devOnly.test(code);
  if (!visible && args.all !== "true") continue;
  rows.push({ line: lit.line, visible, value: v });
}

for (const r of rows) {
  console.log(`${String(r.line).padStart(5)}  ${r.visible ? "VISIBLE" : "other  "}  ${JSON.stringify(r.value)}`);
}
console.log(`\n${rows.filter((r) => r.visible).length} likely visible literal(s) of ${literals.length} in total`);
