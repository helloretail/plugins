#!/usr/bin/env node
/**
 * Gate on the release notes, so a bad fragment fails the PR instead of the release.
 *
 * Checks, per plugin:
 *   - every changelog.d/*.md fragment carries only `### Added / Changed / Fixed / Removed`,
 *     has at least one bullet, and no prose outside one;
 *   - fragment filenames are kebab-case `.md`;
 *   - `CHANGELOG.md` has no `## Unreleased` section. Released versions only live there;
 *     notes for the next release go in a fragment. A note written into CHANGELOG.md directly
 *     conflicts with every other open PR and is not tied to any version, so nothing releases it.
 *
 * Run from `npm run lint:changelog`, and as part of `npm run check`.
 */
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { basename, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const PLUGINS = resolve(ROOT, "plugins");
const SECTIONS = ["Added", "Changed", "Fixed", "Removed"];
const rel = (p) => p.slice(ROOT.length + 1);

let errors = 0;
const fail = (file, msg) => {
  console.error(`  ✗ ${rel(file)}: ${msg}`);
  errors += 1;
};

function lintFragment(file) {
  // basename, not a "/" split: on Windows the separator is "\" and the whole path
  // ended up being matched against the kebab-case rule, failing every valid fragment.
  const name = basename(file);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*\.md$/.test(name)) {
    fail(file, `name it in kebab-case after your branch, e.g. "script-loading-triage.md"`);
  }

  const text = readFileSync(file, "utf8").trim();
  if (!text) return fail(file, "empty — delete it, or write the bullet it is missing");

  if (/^## /m.test(text)) {
    fail(file, `has a "## " heading — a fragment carries no version and no title, only "### " sections`);
  }

  const parts = text.split(/^### +(.+?) *$/m);
  const preamble = parts.shift().trim();
  if (preamble) fail(file, `text before the first "### " heading: "${preamble.split("\n")[0].slice(0, 60)}…"`);
  if (parts.length === 0) {
    return fail(file, `no "### " heading — start with one of ${SECTIONS.map((s) => `### ${s}`).join(", ")}`);
  }

  for (let i = 0; i < parts.length; i += 2) {
    const heading = parts[i].trim();
    const body = (parts[i + 1] ?? "").trim();
    if (!SECTIONS.includes(heading)) {
      fail(file, `"### ${heading}" is not published — use ${SECTIONS.map((s) => `### ${s}`).join(", ")}`);
      continue;
    }
    if (!/^[-*] /m.test(body)) fail(file, `"### ${heading}" has no bullet under it`);
    // Every line must belong to a bullet: the bullet itself, or an indented continuation.
    for (const line of body.split("\n")) {
      if (line.trim() && !/^[-*] /.test(line) && !/^\s/.test(line)) {
        fail(file, `"### ${heading}" has prose outside a bullet: "${line.slice(0, 60)}…"`);
        break;
      }
    }
  }
}

function lintPlugin(name) {
  const dir = join(PLUGINS, name);
  const changelog = join(dir, "CHANGELOG.md");
  const fragments = join(dir, "changelog.d");

  if (existsSync(fragments)) {
    for (const f of readdirSync(fragments).sort()) {
      if (!f.endsWith(".md") || f === "README.md" || f.startsWith(".")) continue;
      lintFragment(join(fragments, f));
    }
  }

  if (!existsSync(changelog)) return;
  const text = readFileSync(changelog, "utf8");
  if (/^## +Unreleased *$/m.test(text)) {
    fail(
      changelog,
      `has a "## Unreleased" section — CHANGELOG.md holds released versions only. Move any ` +
        `notes under it to a new file under plugins/${name}/changelog.d/ (see its README) and ` +
        `delete the heading.`,
    );
  }
}

const names = existsSync(PLUGINS)
  ? readdirSync(PLUGINS, { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => d.name).sort()
  : [];

console.log("Linting release notes…");
for (const name of names) lintPlugin(name);

if (errors > 0) {
  console.error(`\n${errors} problem(s) in the release notes.`);
  process.exit(1);
}
console.log(`  ✓ ${names.length} plugin(s) — fragments well-formed, no Unreleased section`);
