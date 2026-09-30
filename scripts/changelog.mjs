#!/usr/bin/env node
/**
 * Turn a plugin's release-note fragments into CHANGELOG.md, and CHANGELOG.md into
 * GitHub Release notes.
 *
 * The notes are written by hand (with Claude Code) in the PR that makes the change, as
 * one **fragment file** per PR under `plugins/<plugin>/changelog.d/` — see CLAUDE.md →
 * "Release notes". A fragment is a new file, so two PRs open at the same time never
 * conflict over it. CHANGELOG.md holds released versions only: there is no `## Unreleased`
 * section, so a reader never sees notes that are not in a release yet. This script only moves
 * and reads the prose; it never writes any of its own beyond a maintenance fallback.
 *
 * Commands:
 *   preview <plugin>            print the notes the next release will carry. Changes nothing.  [npm run changelog]
 *   roll <plugin> <version>     fold every changelog.d/*.md into a new `## <version> — <date>`
 *                               section at the top of CHANGELOG.md and delete the fragments.
 *                               A leftover `## Unreleased` heading (the old layout) is folded in
 *                               and removed. Idempotent: a changelog that already has a
 *                               `## <version>` section is left alone — but if fragments are still
 *                               waiting, that is an error, because they would never be released.  [release.yml]
 *   extract <plugin> <version>  print that version's section body to stdout, for --notes-file. [release.yml]
 *
 * extract never fails a release: a missing file or section falls back to a one-line note,
 * because a thin release note is better than a release that did not happen.
 *
 * Env:  DRY_RUN=1   roll reports what it would write, and writes nothing
 */
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(fileURLToPath(new URL("..", import.meta.url)));
const DRY = process.env.DRY_RUN === "1" || process.argv.includes("--dry-run");

const [cmd, plugin, version] = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (!cmd || !plugin || (cmd === "roll" && !version) || (cmd === "extract" && !version)) {
  console.error("usage: changelog.mjs preview <plugin>");
  console.error("       changelog.mjs <roll|extract> <plugin> <version>");
  process.exit(2);
}

const FILE = resolve(ROOT, "plugins", plugin, "CHANGELOG.md");
const FRAGMENTS = resolve(ROOT, "plugins", plugin, "changelog.d");
const FALLBACK = "Maintenance release — no user-visible changes.";

/** The only headings a release section may carry, in the order they are published. */
const SECTIONS = ["Added", "Changed", "Fixed", "Removed"];

/** Every regex metacharacter, so a version string can be dropped into a pattern verbatim. */
const escapeRegExp = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

/**
 * Heading that opens a release section, e.g. "## 1.2.3 — 2026-09-08". Matches the whole
 * heading line so the date does not leak into the section body.
 */
const versionHeading = (v) => new RegExp(`^## +${escapeRegExp(v)}(?:[ \\t][^\\n]*)?$`, "m");
const UNRELEASED = /^## +Unreleased *$/m;

/**
 * Split the text after a heading into that section's body and everything from the next
 * `## ` heading onward.
 */
function splitSection(text, afterHeading) {
  const rest = text.slice(afterHeading);
  const next = /^## /m.exec(rest);
  return {
    body: (next ? rest.slice(0, next.index) : rest).trim(),
    tail: next ? rest.slice(next.index) : "",
  };
}

/**
 * Parse a release section body into { Added: "…", Changed: "…" } keyed by its `###`
 * headings. Text before the first heading is returned as `preamble` so the caller can
 * complain about it rather than dropping it on the floor.
 */
function parseSections(body) {
  const out = {};
  const parts = body.split(/^### +(.+?) *$/m);
  const preamble = parts.shift().trim();
  for (let i = 0; i < parts.length; i += 2) {
    const heading = parts[i].trim();
    const text = (parts[i + 1] ?? "").trim();
    if (!text) continue;
    out[heading] = out[heading] ? `${out[heading]}\n${text}` : text;
  }
  return { sections: out, preamble };
}

/** Render { Added: "…" } back into a section body, headings in canonical order. */
function renderSections(sections) {
  const known = SECTIONS.filter((h) => sections[h]);
  const unknown = Object.keys(sections).filter((h) => !SECTIONS.includes(h));
  if (unknown.length > 0) {
    console.error(
      `${plugin}: unknown changelog heading(s) ${unknown.map((h) => `"### ${h}"`).join(", ")} —` +
        ` only ${SECTIONS.map((h) => `### ${h}`).join(", ")} are published.`,
    );
    process.exit(1);
  }
  return known.map((h) => `### ${h}\n\n${sections[h]}`).join("\n\n");
}

/** Every fragment file under changelog.d, in a stable order. README.md is the format note. */
function fragmentFiles() {
  if (!existsSync(FRAGMENTS)) return [];
  return readdirSync(FRAGMENTS)
    .filter((f) => f.endsWith(".md") && f !== "README.md" && !f.startsWith("."))
    .sort()
    .map((f) => join(FRAGMENTS, f));
}

/**
 * Everything waiting for the next release: every fragment, plus the body of a leftover
 * `## Unreleased` heading if the file still has one (the old layout). `before` and `tail` are
 * the text around the point where the new version section goes.
 */
function pending(text) {
  const { sections, files } = readFragments();
  const m = UNRELEASED.exec(text);
  if (m) {
    const { body, tail } = splitSection(text, m.index + m[0].length);
    const legacy = parseSections(body).sections;
    for (const [heading, t] of Object.entries(legacy)) {
      sections[heading] = sections[heading] ? `${t}\n${sections[heading]}` : t;
    }
    return { sections, files, before: text.slice(0, m.index), tail, hadLegacy: true };
  }
  const next = /^## /m.exec(text);
  return {
    sections,
    files,
    before: next ? text.slice(0, next.index) : text,
    tail: next ? text.slice(next.index) : "",
    hadLegacy: false,
  };
}

/** Parse every fragment into one { Added: "…", … } map, in a stable order. */
function readFragments() {
  const sections = {};
  const files = fragmentFiles();
  for (const file of files) {
    const { sections: add, preamble } = parseSections(readFileSync(file, "utf8").trim());
    if (preamble) {
      console.error(
        `${file}: text before the first "### " heading — a fragment is only ` +
          `${SECTIONS.map((h) => `### ${h}`).join(" / ")} sections and their bullets.`,
      );
      process.exit(1);
    }
    for (const [heading, text] of Object.entries(add)) {
      sections[heading] = sections[heading] ? `${sections[heading]}\n${text}` : text;
    }
  }
  return { sections, files };
}

// ---------------------------------------------------------------- preview
if (cmd === "preview") {
  if (!existsSync(FILE)) {
    console.log(`${plugin}: no CHANGELOG.md — nothing to preview`);
    process.exit(0);
  }
  const body = renderSections(pending(readFileSync(FILE, "utf8")).sections);
  process.stdout.write(body ? `${body}\n` : `${FALLBACK}\n`);
  process.exit(0);
}

// ---------------------------------------------------------------- roll
if (cmd === "roll") {
  if (!existsSync(FILE)) {
    console.log(`${plugin}: no CHANGELOG.md — nothing to roll`);
    process.exit(0);
  }
  const text = readFileSync(FILE, "utf8");
  const { sections, files, before, tail, hadLegacy } = pending(text);
  const body = renderSections(sections);

  if (versionHeading(version).test(text)) {
    // Release notes waiting behind a version that is already published would never ship:
    // this is the silent miss a rename once caused (the version did not move, so the
    // notes stayed where they were). Say so instead of carrying on.
    if (body) {
      console.error(
        `${plugin}: CHANGELOG.md already has a ${version} section, but release notes are still ` +
          `waiting (${files.length} fragment(s)${hadLegacy ? " and an Unreleased section" : ""}). ` +
          `They would never be released — the version did not move. Bump the version in plugin.json, ` +
          `or write the notes into a release that has not been cut yet.`,
      );
      process.exit(1);
    }
    console.log(`${plugin}: CHANGELOG.md already has a ${version} section — leaving it alone`);
    process.exit(0);
  }

  const date = new Date().toISOString().slice(0, 10);
  const section = `## ${version} — ${date}\n\n${body || FALLBACK}`;
  const updated = `${[before.trimEnd(), section, tail.trimEnd()].filter(Boolean).join("\n\n")}\n`;

  if (DRY) {
    console.log(`${plugin}: would roll ${files.length} fragment(s) → ${version} — ${date}`);
  } else {
    writeFileSync(FILE, updated);
    for (const f of files) rmSync(f);
    console.log(`${plugin}: rolled ${files.length} fragment(s) → ${version} — ${date}`);
  }
  process.exit(0);
}

// ---------------------------------------------------------------- extract
if (cmd === "extract") {
  if (!existsSync(FILE)) {
    process.stdout.write(`${FALLBACK}\n`);
    process.exit(0);
  }
  const text = readFileSync(FILE, "utf8");
  const m = versionHeading(version).exec(text);
  if (!m) {
    process.stdout.write(`${FALLBACK}\n`);
    process.exit(0);
  }
  const { body } = splitSection(text, m.index + m[0].length);
  process.stdout.write(`${body || FALLBACK}\n`);
  process.exit(0);
}

console.error(`unknown command "${cmd}" — expected preview, roll or extract`);
process.exit(2);
