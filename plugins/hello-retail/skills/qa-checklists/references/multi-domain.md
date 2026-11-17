# Multi-domain runs — search-qa, recom-qa, pages-qa

Read this only when the user gives **more than one URL/domain** — separate TLDs (`example.dk` +
`example.se`) or locale storefronts under one hostname (`example.com/en-be/` +
`example.com/en-at/`). A single-domain run never needs it.

Run a **full, independent QA per domain**, each ending in **its own report file**. Each
locale/domain is usually a separate HR website with its own `website-uuid`, feed, configs or
boxes, and possibly its own designs — never assume the designs are shared.

- **Collect inputs per domain up front.** Each domain needs its own `website-uuid`: search-qa
  discovers that domain's configs via `search_listConfigs` (and each domain may have its own
  trigger selector); recom-qa loads that domain's box inventory via `recoms_list`. Ask for
  anything missing before starting so the run isn't interrupted mid-QA.
- **Run sequentially, not interleaved.** The rendered pass drives a real browser — complete the
  full workflow for domain A, ending with that domain's report (search-qa steps 0–8, recom-qa
  steps 0–9, pages-qa steps 1–5), before starting domain B. Keep per-domain findings and box
  inventories separate; nothing carries over between domains except the design diff (below).
- **Build every domain's artefacts from that domain's own sources — never from a sibling's
  files.** Each domain's config or box inventory comes from its own MCP call
  (`search_listConfigs` / `recoms_list` with that domain's `website-uuid`), and every config or
  design key written into its report, manifest or fix plan is copied from that call's output —
  not from another domain's report, even when the designs are copies of each other. Each
  domain's coverage manifest is extracted fresh from the checklist sources (`../SKILL.md`
  Step 3), never by duplicating another domain's manifest and editing it, and every verdict line
  cites evidence observed on *this* domain. Before saving a report, check that each key in it
  appears in that domain's own MCP output. (Real 2026-10 case, 15-storefront run: one domain's
  mobile key was written into another domain's report, and a "mobile product tab translated —
  PASS" line was carried from the French storefront's manifest into the Spanish one, whose tab
  label was actually empty.)
- **Diff the designs before repeating the code pass.** After loading domain B's design, diff it
  against domain A's — search-qa: the three `search_getDesign` fields (`resultTemplate`,
  `resultStyles`, `initializationCode`); recom-qa: each `recoms_getDesign` design's
  `templateCode`/`templateStyles` against the corresponding design on domain A (match them by
  title/purpose):
  - **Identical** → run the code pass once; repeat each code finding in every affected domain's
    report, and record "design identical to [domain A]" there.
  - **Different** → run the full code pass for that domain's design too (this is the expected
    case).

  pages-qa runs no code pass yet (the `pages_*` design-read tools are new), so it has no
  "identical design → run once" shortcut. For every skill, the **rendered pass is never
  skipped** per domain — placements, locale strings, currency/price formatting, trigger
  selectors, category structures and feed data differ even when templates match, and each
  recom domain has its own box inventory.
- **One report file per domain, one folder per customer.** Each domain gets
  `QA/[customer]/[domain]-[feature]-qa-[YYYY-MM-DD].md` (`[feature]` = `search`, `recom` or
  `pages`); for locale storefronts under one hostname, add the locale slug, e.g.
  `QA/example.com/example.com-en-be-search-qa-[YYYY-MM-DD].md` and
  `QA/example.com/example.com-en-at-search-qa-[YYYY-MM-DD].md` — screenshots for all domains
  share `QA/[customer]/screenshots/`. Every report is **self-contained** (its own findings,
  operator list and, for recom-qa, its own Recom Box Inventory) — a finding shared across
  domains is repeated in each affected report, tagged "shared — also affects [domains]", never
  replaced by a pointer to another report file. Close the run with a chat summary: a one-line
  verdict per domain plus the list of report files.
