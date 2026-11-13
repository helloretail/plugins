# Writing a design through the MCP — read, diff, approval, draft, read back

**The rule: nothing reaches a customer's configuration until the operator has seen the diff and
said yes, and what is written is always a draft that the operator publishes in the dashboard.**

Shared by `search-developer` (`search_updateDesign`), `recom-developer`
(`recoms_updateDesign`) and `pages-developer` (`pages_updateDesign`), and by their settings
writes (filters, sorting, algorithm, placement, crawl config, page configs, field indexing). The
tool names, the fields and what each product adds are in the skill's own steps and, where it
has one, its `references/mcp-flow.md`.

`newsletter-developer` is different — an edit lands in place, with no draft — and has its own
write rules.

## The sequence

1. **Read first, whatever the state.** Call the `get*` tool for the design the operator named —
   LIVE, REVIEW, internal review or archived. Do not branch on the state to decide whether to
   read. What you read is the base you modify in place; nothing is regenerated from memory or
   from a template.
2. **The payload spills to a file — never read it whole.** A real design is tens of KB and
   exceeds the tool-result limit. Extract each field to a file in the session's scratch folder
   (`jq -r .<field> <spilled file> > <field file>`) and keep an untouched copy of each for the
   diff.
3. **Edit only the regions the skill owns**, with tools that leave the rest byte-identical (the
   skill's own scripts, targeted `sed` / `python` replacements).
4. **Show the diff.** Only the changed regions, labelled by field, against the untouched copy.
   Offer the full files on request; never paste a whole field unasked.
5. **Ask — the `Push` gate.** `AskUserQuestion`, header `Push`, exactly two options: *Push as
   draft* / *Don't push*, plus the automatic *Other* for changes. Nothing else: no third option,
   no tool names or steps in the option descriptions, and neither option recommended — the
   choice is the operator's.
   - *Don't push* ends the build without a write.
   - *Other* carries a change: make it, show the new diff, ask again.
6. **Write only the fields you changed**, as raw HTML / Liquid / CSS / JS. A field you did not
   touch is left out of the call so it cannot be clobbered. Never HTML-entity-escape a field:
   `&lt;div&gt;` saves without an error and renders as literal text on the storefront.
7. **Read back.** A successful call proves nothing about what was stored. Re-fetch with the
   `get*` tool, extract the written fields (step 2 applies) and `diff` each against the local
   copy you sent. Whitespace the platform changes on save (a trailing newline, dropped blank
   lines — `diff -wB` ignores them) is not a difference; anything else is. Spot-check that one
   field you did not write is unchanged. This step is `recom-developer`'s and
   `pages-developer`'s (Pages: not verified after three attempts → report the write as **not
   applied**); `search-developer` checks its push in the rendered overlay instead, in its own
   verification step.
8. **Tell the operator what is now a draft** — the design, and every box, page or config the
   write drafted — and that **they publish it in the My Hello Retail dashboard**. The MCP cannot
   publish, and neither can you.

## Check before you report

- [ ] The diff of the changed regions was shown, labelled by field, with the full fields offered.
- [ ] The `Push` answer came before the write.
- [ ] Only the changed fields were written, raw, as a draft; nothing was published.
- [ ] The operator was told what is a draft and that they publish it in the dashboard.
- [ ] Nothing was written to disk beyond what *What never happens* allows.

## When a call fails

A read, create or write that errors is reported **once**, and the build stops there. No retry
loop. What to offer instead (an inline copy-paste of the full files, or nothing) is in the
skill's own step.

## Settings that are written as whole lists

Filters, sorting, an algorithm's steps and filters, and a crawl config are **replaced in full**
by their `update*` tool. Read the list with its `get*` first and send back everything you keep,
or the entries you left out are dropped without an error. Show current → new and wait for a
go-ahead, exactly as for a design.

## What never happens

- **No publish, archive, delete or lock.** Those stay with the operator in the dashboard.
- **No write without the `Push` answer**, and no write "to save time" before the diff was shown.
- **No customer output on disk** beyond the session's scratch files. Two exceptions, each with
  one destination: evidence screenshots in `QA/screenshots/` (gitignored, where the Playwright
  servers already write — never the repo root, never committed), and the customer's hand-off document that `customer-handoff` writes under
  `output/handoffs/`.
- **Nothing is written into `${CLAUDE_PLUGIN_ROOT}/docs/wiki/base-templates/`.** Those files are
  the team's shared base.
