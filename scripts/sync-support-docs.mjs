#!/usr/bin/env node
/**
 * Mirrors the published articles of support.helloretail.com into
 * plugins/hello-retail/docs/support-docs/, text only, so the plugin's skills can grep them.
 *
 * The source is a local checkout of the private helloretail/support-docs repository (the
 * MkDocs project behind the site). The script reads it and never writes to it; it never
 * clones or fetches, so it needs no token — clone the repository yourself first.
 *
 *   npm run sync:support-docs                       # checkout at ../support-docs
 *   npm run sync:support-docs -- --from <checkout>  # checkout elsewhere
 *   npm run sync:support-docs -- --changelog        # also write the release-note fragment
 *
 * What it does:
 *   - takes only the pages listed in mkdocs.yml `nav` whose `pageType` is `page`; drafts,
 *     category listings and anything outside the nav never reach this public repository
 *   - drops images, scripts, styles, iframes, template markers and copied click-tracking
 *     fragments; turns admonitions into blockquotes
 *   - rewrites site links to the mirrored file, or to the live site when it is not mirrored
 *   - writes provenance frontmatter and a generated index.md
 *   - replaces the whole mirror folder, so an article removed upstream is removed here
 *   - stops, writing nothing, on a UUID or e-mail address that scripts/support-docs-allowlist.json
 *     does not allow or redact (hosts are checked afterwards by wiki-lint, against the same file)
 *
 * The output is generated: never edit docs/support-docs/ by hand — fix the article upstream
 * and sync again. wiki-lint checks the result with its support-docs profile.
 */
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, renameSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join, posix, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { load as parseYaml } from "js-yaml";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PLUGIN = join(ROOT, "plugins", "hello-retail");
const OUT = join(PLUGIN, "docs", "support-docs");
const SITE = "https://support.helloretail.com";
const ALLOWLIST_FILE = join(ROOT, "scripts", "support-docs-allowlist.json");

const args = process.argv.slice(2);
const argValue = (flag) => {
  const i = args.indexOf(flag);
  return i === -1 ? undefined : args[i + 1];
};
const FROM = resolve(ROOT, argValue("--from") ?? "../support-docs");
const WRITE_CHANGELOG = args.includes("--changelog");

const fail = (msg) => {
  console.error(`sync-support-docs: ${msg}`);
  process.exit(1);
};

if (!existsSync(join(FROM, "mkdocs.yml")) || !existsSync(join(FROM, "docs"))) {
  fail(`no MkDocs project at ${FROM} — clone helloretail/support-docs there, or pass --from <checkout>`);
}

const git = (...a) => execFileSync("git", ["-C", FROM, ...a], { encoding: "utf8" }).trim();
const COMMIT = git("rev-parse", "HEAD");
const COMMIT_DATE = git("log", "-1", "--format=%cs");
if (git("status", "--porcelain")) {
  console.warn("sync-support-docs: the support-docs checkout has uncommitted changes — the mirror records only its commit");
}

// ---------------------------------------------------------------------------
// mkdocs.yml — read the nav and the redirect map. The file carries Python-only YAML tags
// (emoji functions), so only those two blocks are parsed.
// ---------------------------------------------------------------------------
const mkdocs = readFileSync(join(FROM, "mkdocs.yml"), "utf8").split("\n");

function topLevelBlock(key) {
  const start = mkdocs.findIndex((l) => l === `${key}:`);
  if (start === -1) return null;
  let end = start + 1;
  while (end < mkdocs.length && (mkdocs[end] === "" || /^\s/.test(mkdocs[end]))) end++;
  return parseYaml(mkdocs.slice(start, end).join("\n"))[key];
}

function redirectMaps() {
  const start = mkdocs.findIndex((l) => /^\s+redirect_maps:\s*$/.test(l));
  if (start === -1) return {};
  const indent = mkdocs[start].search(/\S/);
  let end = start + 1;
  while (end < mkdocs.length && (mkdocs[end].trim() === "" || mkdocs[end].search(/\S/) > indent)) end++;
  const block = mkdocs.slice(start, end).map((l) => l.slice(indent)).join("\n");
  return parseYaml(block).redirect_maps ?? {};
}

const navFiles = [];
(function walkNav(node) {
  if (typeof node === "string") {
    if (node.endsWith(".md")) navFiles.push(node);
  } else if (Array.isArray(node)) {
    node.forEach(walkNav);
  } else if (node && typeof node === "object") {
    Object.values(node).forEach(walkNav);
  }
})(topLevelBlock("nav"));

const redirects = redirectMaps();

// ---------------------------------------------------------------------------
// articles
// ---------------------------------------------------------------------------
function splitFrontmatter(text) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) return { meta: {}, body: text };
  return { meta: parseYaml(m[1]) ?? {}, body: text.slice(m[0].length) };
}

const articles = [];
const sectionTitles = {};
for (const file of [...new Set(navFiles)].sort()) {
  const src = join(FROM, "docs", file);
  if (!existsSync(src)) fail(`mkdocs.yml nav lists ${file}, which does not exist`);
  const { meta, body } = splitFrontmatter(readFileSync(src, "utf8"));
  const section = file.includes("/") ? file.split("/")[0] : "";
  if (meta.pageType !== "page" || !section) continue;
  articles.push({ file, section, meta, body });
}
const mirrored = new Set(articles.map((a) => a.file));
for (const section of new Set(articles.map((a) => a.section))) {
  const index = join(FROM, "docs", section, "index.md");
  const title = existsSync(index) ? splitFrontmatter(readFileSync(index, "utf8")).meta.title : undefined;
  sectionTitles[section] = title ?? section;
}

const liveUrl = (file) => `${SITE}/${file.replace(/(?:^|\/)index\.md$/, "").replace(/\.md$/, "")}/`.replace(/\/\/$/, "/");

/** Map a link as written in an article to a mirror-relative path or a live URL. */
function rewriteLink(target, fromFile) {
  target = target.replace(/#aw_source=[^#]*$/, ""); // a Hello Retail click-tracking code copied along with the link
  if (!target) return "#";
  if (/^(?:[a-z]+:|#)/i.test(target)) return target;
  const [, pathPart, rest = ""] = /^([^#?]*)(.*)$/.exec(target);
  let sitePath;
  if (pathPart.startsWith("/")) {
    sitePath = pathPart.slice(1);
  } else {
    sitePath = posix.normalize(posix.join(posix.dirname(fromFile), pathPart));
  }
  sitePath = sitePath.replace(/^\.\//, "");
  // a site URL (`search/search-synonyms/`) or a source path (`search/search-synonyms.md`)
  let file = sitePath.endsWith(".md") ? sitePath : `${sitePath.replace(/\/$/, "")}.md`;
  if (redirects[file]) file = redirects[file];
  else if (redirects[`${sitePath.replace(/\/$/, "")}/index.md`]) file = redirects[`${sitePath.replace(/\/$/, "")}/index.md`];
  if (/^https?:/.test(file)) return file + rest;
  if (mirrored.has(file)) return posix.relative(posix.dirname(fromFile), file) + rest;
  const section = sitePath.replace(/\/$/, "");
  if (sectionTitles[section]) return posix.relative(posix.dirname(fromFile), "index.md") + `#${section}`;
  return `${SITE}/${sitePath}${rest}`;
}

function convertBody(body, file) {
  let text = body
    .replace(/\{%-?\s*(?:raw|endraw)\s*-?%\}/g, "")
    .replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, "")
    .replace(/<iframe\b[\s\S]*?(?:<\/iframe>|\/>)/gi, "*A video is embedded in the live article.*")
    .replace(/<img\b[^>]*>/gi, "")
    .replace(/!\[[^\]]*\]\([^)]*\)(?:\{[^}]*\})?/g, "");

  // markdown links, and href attributes in inline HTML
  text = text.replace(/(\]\()([^)\s]+)((?:\s+"[^"]*")?\))/g, (_, a, t, b) => a + rewriteLink(t, file) + b);
  text = text.replace(/(href=")([^"]+)(")/g, (_, a, t, b) => a + rewriteLink(t, file) + b);

  // admonitions (`!!! note "Title"` / `??? example`) → blockquotes; the body is indented 4
  const lines = text.split("\n");
  const out = [];
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    const l = lines[i];
    if (/^\s*(?:```|~~~)/.test(l)) inFence = !inFence;
    const m = !inFence && /^(\s*)(?:!!!|\?\?\?\+?)\s+(\w+)(?:\s+"([^"]*)")?\s*$/.exec(l);
    if (!m) {
      out.push(l);
      continue;
    }
    const [, indent, kind, title] = m;
    const label = title || kind.charAt(0).toUpperCase() + kind.slice(1);
    const inner = [];
    while (i + 1 < lines.length && (lines[i + 1].trim() === "" || lines[i + 1].startsWith(indent + "    "))) {
      inner.push(lines[++i].slice(indent.length + 4));
    }
    while (inner.length && inner[inner.length - 1].trim() === "") inner.pop();
    out.push(`${indent}> **${label}:**`, `${indent}>`);
    for (const il of inner) out.push(il.trim() === "" ? `${indent}>` : `${indent}> ${il}`);
    out.push("");
  }
  return out
    .join("\n")
    .replace(/[ \t\u00a0]+$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim() + "\n";
}

// ---------------------------------------------------------------------------
// identifiable data — the same patterns wiki-lint uses, against the allowlist
// ---------------------------------------------------------------------------
const allow = JSON.parse(readFileSync(ALLOWLIST_FILE, "utf8"));
const UUID_RE = /\b[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\b/gi;
const EMAIL_RE = /\b[\w.+-]+@[\w-]+(?:\.[\w-]+)+\b/g;

function redact(text) {
  for (const r of allow.redact ?? []) text = text.replace(new RegExp(r.pattern, "g"), r.replace);
  return text;
}

function unexpected(text, where) {
  const hits = [];
  for (const m of text.matchAll(UUID_RE)) {
    if (!(m[0].toLowerCase() in (allow.uuids ?? {}))) hits.push(`${where}: UUID ${m[0]}`);
  }
  for (const m of text.matchAll(EMAIL_RE)) {
    const [local, host] = m[0].toLowerCase().split("@");
    if (/^example(?:-shop)?\.(?:com|dk)$/.test(host)) continue; // placeholder
    if (/^helloretail(?:mail)?\.com$/.test(host) && /^(?:no-?reply|support|info|hello|sales)$/.test(local)) continue; // our role address
    if (!(m[0].toLowerCase() in (allow.emails ?? {}))) hits.push(`${where}: e-mail ${m[0]}`);
  }
  return hits;
}

// ---------------------------------------------------------------------------
// write
// ---------------------------------------------------------------------------
const yamlString = (s) => JSON.stringify(String(s ?? "").replace(/\s+/g, " ").trim());
const tagNames = (meta) => (meta.tags ?? []).map((t) => (typeof t === "string" ? t : t.title)).filter(Boolean);

const rendered = [];
const problems = [];
for (const a of articles) {
  const body = redact(convertBody(a.body, a.file));
  const h1 = /^# /.test(body) ? "" : `# ${a.meta.title}\n\n`;
  const page = [
    "---",
    "source: support-docs",
    `upstream: ${liveUrl(a.file)}`,
    `upstream-commit: ${COMMIT.slice(0, 12)}`,
    `upstream-date: ${COMMIT_DATE}`,
    `title: ${yamlString(a.meta.title)}`,
    `description: ${yamlString(a.meta.description)}`,
    `tags: ${yamlString(tagNames(a.meta).join(", "))}`,
    "---",
    "",
    h1 + body,
  ].join("\n");
  problems.push(...unexpected(page, a.file));
  rendered.push({ ...a, page });
}

if (problems.length) {
  console.error([...new Set(problems)].join("\n"));
  fail(`${problems.length} identifiable value(s) above — add each to scripts/support-docs-allowlist.json \`emails\` / \`uuids\` with the reason it is safe to publish, or a \`redact\` rule that replaces it; nothing was written`);
}

const sections = [...new Set(rendered.map((a) => a.section))].sort(
  (x, y) => (sectionTitles[x] ?? x).localeCompare(sectionTitles[y] ?? y),
);
const cell = (s) => String(s ?? "").replace(/\s+/g, " ").replace(/\|/g, "\\|").trim();
const index = [
  "---",
  "source: index",
  "---",
  "",
  "# Support docs — mirror of support.helloretail.com",
  "",
  `Every published article of [support.helloretail.com](${SITE}/), as text, synced from support-docs commit \`${COMMIT.slice(0, 12)}\` (${COMMIT_DATE}). Generated by \`npm run sync:support-docs\` — do not edit these files; fix the article upstream and sync again.`,
  "",
  "Some articles describe an older dashboard or older behaviour. Treat an article as what the support site says, not as proof of how the product behaves now: confirm against the live configuration, and prefer a `source: field` page of the wiki where the two disagree. For problems re-cut by symptom, start at the [solutions](../wiki/support-knowledge/solutions/solutions.md) pages instead.",
  "",
  "Search this file for a topic, or grep the folder for a setting name, error text or field.",
  "",
];
for (const s of sections) {
  index.push(`## ${sectionTitles[s] ?? s}`, "", "| Article | What it covers |", "| --- | --- |");
  for (const a of rendered.filter((r) => r.section === s).sort((x, y) => String(x.meta.title).localeCompare(String(y.meta.title)))) {
    index.push(`| [${cell(a.meta.title)}](./${a.file}) | ${cell(a.meta.description)} |`);
  }
  index.push("");
}

const tmp = `${OUT}.tmp`;
rmSync(tmp, { recursive: true, force: true });
for (const a of rendered) {
  const dest = join(tmp, a.file);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, a.page);
}
writeFileSync(join(tmp, "index.md"), index.join("\n"));
rmSync(OUT, { recursive: true, force: true });
renameSync(tmp, OUT);

console.log(`sync-support-docs: ${rendered.length} articles in ${sections.length} sections → ${relative(ROOT, OUT)} (support-docs ${COMMIT.slice(0, 12)}, ${COMMIT_DATE})`);

if (WRITE_CHANGELOG) {
  const branch = execFileSync("git", ["-C", ROOT, "rev-parse", "--abbrev-ref", "HEAD"], { encoding: "utf8" }).trim();
  const name = branch.replace(/^[^/]+\//, "").replace(/[^\w.-]+/g, "-");
  const fragment = join(PLUGIN, "changelog.d", `${name}.md`);
  writeFileSync(
    fragment,
    `### Changed\n\n- \`hello-retail-knowledge\` and \`support-debugging\` read the support articles as published on ${COMMIT_DATE}.\n`,
  );
  console.log(`sync-support-docs: wrote ${relative(ROOT, fragment)}`);
}
