# Report template — Retail Media QA

Save as `QA/[customer]/[domain]-retailmedia-qa-[YYYY-MM-DD].md` (+ `.html` twin, + `coverage-retail-media-[YYYY-MM-DD].md`).
Fill every section; write "none" or "N/A — reason" rather than deleting one.

```markdown
# Retail Media QA — [domain] — [YYYY-MM-DD]

Ticket context: [card URL + fetch date | pasted by operator | NONE — confirmed no card]
QA surface: [url] (source: description dd/mm | comment by <author> dd/mm | operator confirmed)
Prior reports for this domain: [file + date | none found (searches run)]
Campaign gate: [ACTIVE | REVIEW only — banners visible to the QA session only | no banner campaign — rendered items SKIPPED]
Delivery mode: [...]. Navigation: [full page loads | SPA].
Backend: [Playwright headed, HR login present/absent, consent: "only necessary" chosen / HR consent-gated → operator allowed accept, ...]
Comments: [read in Chrome oldest-first | read via ClickUp MCP only (N comments + M replies) — silent truncation not ruled out]
Coverage: N/N manifest items accounted for (X PASS, Y FAIL, Z WARN, Q KNOWN, … ) — `coverage-retail-media-[date].md`. Counts derived from the `VERDICT: <X>` line suffixes.
Per-viewport coverage: 1440 ✅/❌ · 1024 ✅/❌ · 820 (tablet) ✅/❌ · 375 (mobile) ✅/❌

**Sold features for this domain:** [from the card, each one in scope / out of scope / SKIPPED + reason]

## Result at a glance
| Area | Verdict |
|---|---|
| Setup (isBanner, hr-b-image, size, placeholder) | |
| Banner rendering — recoms | |
| Banner rendering — search desktop / tablet / mobile | |
| Banner rendering — pages | |
| Placement (incl. 404, sidecart) | |
| Campaign | |

[One short paragraph: what a shopper sees today, and what this QA session sees that a shopper does not.]

## Fixture / environment
[Fixture set, pages, viewports, design/box keys with `lastModified` (re-checked at report time),
banner sizes + positions from `retailMedia_getSettings`, campaign id/status/destination.]

## Code pass (checklist "Setup")
| Item | Design | Result |
[S1–S5 per design; INFO items for dead code / stock comments]

## Findings
### N. ❌/⚠️ [title] — [severity]
`Source: card checklist | card NOTE/BUG | prior report | found independently`
- **Example:** [page URL + viewport + reproducing steps]
- **Expected:** …
- **Actual:** … [measured numbers]
- **Screenshot:** `screenshots/[domain]--rm--[what]-[viewport].png`
- **Cause:** [verified in code: file/rule | unconfirmed — hypothesis]

## Fixed during the run
[only when the audit log / lastModified moved mid-run: who, when, what changed (field diff),
before → after measurements with screenshots; or "None — no design changed during the run"]

## One banner per page (load-order rule)
| Page | Boxes (load order) | Expected box | Box with banner | Verdict |
[one row per page type; ties noted; sidecart and search judged separately]

## Card reconciliation
| Card line | Banner placed (✅/❌/⚠️) | Responsive (✅/❌/⚠️/KNOWN) | Evidence |
[every line of the card's "Banners to check" and "[SETUP]" checklists]

| Card NOTE / BUG | Disposition (CONFIRMED / REFUTED / UNRESOLVED / fixed during run) | Evidence |

## Prior-report dispositions
| Prior finding (report, date) | Disposition (CONFIRMED / REFUTED / UNRESOLVED / regraded) | Evidence (its own repro re-run) |
[or "No prior report — searches run: …"]

## Passes with measurements
[Crop matrix page × viewport (cropW/cropH), whole-tile equality, URL/tracking, 404, positions.]

## Notes — styling (not findings)
| Viewport | Banner radius (img/link/slide) | Category-page tile radius | Border / shadow | Operator question |
[B9, measured against the shop's own category page: only rows where they differ; "None — banner matches the category-page tiles" otherwise]

## NOTE — known template issues
[standing entries, per-site status — mostly N/A for banners]

## Corrections — do not action these
[prior findings refuted, with the evidence; or "None"]

## Manual checks for the operator (NOT verified by this run)
- [ ] ...

## Handoff fix plan
[per FAIL: design key, rule/line, proposed fix (hypothesis until verified), developer skill, verify steps]

## Evidence index (screenshots/)
## Side effects of testing
[carts touched/emptied, nothing submitted, nothing edited in Hello Retail]
```
