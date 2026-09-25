# Hello Retail MCP — read the live design, push a REVIEW draft

The `hello-retail` MCP server (`https://core.helloretail.com/mcp`) exposes the customer's **live** Search configuration, so you read the current design and push edits back as a **draft** instead of relying on copy-paste. It is **Search-only** — there is no recom equivalent.

This is the **only** flow this skill uses. It needs a `website-uuid` — given by the operator, or derived from a given `company-id` via `website_listForCompany` + a domain match (SKILL.md Step 1b). One of the two IDs is a **mandatory input**: the MCP has no domain lookup (`website_getInfo` takes a UUID, `website_listForCompany` a numeric company ID), and domain-only resolution is not used for now. The `search-key` is used when given and otherwise **resolved from `search_listConfigs` or created with `search_createConfig`** (see *Create path*). One uuid is one HR website, so once resolved there is nothing further to pick.

## Tools (all keyed by `websiteUuid`)

| Tool | Use |
|---|---|
| `website_getInfo(websiteUuid)` | Language + currency — confirm locale / price-format expectations instead of guessing from `<html lang>`. |
| `search_listConfigs(websiteUuid)` | List the website's search configs. Each has a stable `key`, a `type` (Full / Instant / Overlay / Other), a `state` (LIVE / REVIEW), and a `draft` flag. Match the config `type` to the variant you're editing; confirm the pick with the operator. |
| `search_createConfig(websiteUuid, target, desktopDesign)` | Create a search config **with HR's best-practice design attached** — `DESKTOP` (with `desktopDesign` `OVERLAY` or `EMBEDDED`; embedded when omitted), `MOBILE`, `BOTH` (two configs; `desktopDesign` picks the desktop one), `NONE` (bare, API-only — never for this skill). Lands as a draft (INTERNAL_REVIEW for supervisors, REVIEW otherwise); cannot publish. Only when no `search-key` was given **and** no config of the requested type exists — see *Create path*. |
| `search_renameConfig(websiteUuid, key, name)` | Rename a config (the dashboard label; the `key` never changes). Used once per config **this build created**, to give it its variant name — see *Create path* step 3. Never on an existing config: on a LIVE config it forks a draft. |
| `search_getDesign(websiteUuid, key)` | Read the current design fields for the named config **regardless of state** (LIVE / REVIEW / internal review / archived) — **don't gate the read on state, just read it.** Read before editing so you modify the customer's real design in place. The payload is large (tens of KB) and **spills to a file — never ingest it whole** (see Preconditions section 3). |
| `search_updateDesign(websiteUuid, key, …)` | Write design fields. Edits the existing draft, or forks a fresh draft from LIVE. Partial — omitted fields are left unchanged. **Always leaves the config in REVIEW; it cannot publish.** |
| `search_getFilters` / `search_updateFilters` | Filters config (Step 13b). Full replacement — read first. See `references/search-data-config.md`. |
| `search_getSorting` / `search_updateSorting` | Sort options (Step 13b). Full replacement — read first. |
| `search_getLinkContent` / `search_updateLinkContent` | Content feed / link content (Step 13c). Full replacement; omit `engineId` to auto-create the default engine. |
| `search_getInitialContent` / `search_updateInitialContent` | Initial content count/title (Step 13d); keep `productSources` when only resizing. |
| `search_listSynonyms` / `search_listStopWords` | Read-only context; this skill doesn't edit them. |

## Field mapping — MCP fields to this skill's three files

| MCP field | This skill's file | Notes |
|---|---|---|
| `resultTemplate` | `search.liquid` | HTML/Liquid results. Holds the product loop whose non-banner default tile the tile skill's body replaces (no placeholder marks the spot: the slot is the `{% else %}` branch of the banner check, and `scripts/splice-tile.mjs` finds it) + the shell. |
| `resultStyles` | `search.css` | Write no tile CSS (there is no CSS slot); only the TILE FILL rule (and header-match overrides, if opted in) is appended. |
| `initializationCode` | `search.js` | `trigger_selector` + add-to-cart wiring. |
| `inputTemplate` | **not produced by this skill** | We wire a `trigger_selector` to the customer's own input. Leave `inputTemplate` out of the update unless the operator explicitly asks for it. |

## The flow, end to end

1. Get `website-uuid` (SKILL.md Step 1b — given, or `company-id` → `website_listForCompany` + domain match; asked in the first round when neither is given; sanity-check with `website_getInfo`). `search_listConfigs(website-uuid)`: use the given `search-key`; else an existing config of the requested type (confirm with the operator); else create one (*Create path* below). `website_getInfo(website-uuid)` for locale/currency.
2. `search_getDesign(website-uuid, search-key)` reads the **current** design; this is your modify-in-place base.
3. Survey the `category-url`, get the tile body from `tile-extractor`, and generate the shell edits to `resultTemplate` / `resultStyles` / `initializationCode`.
4. **Show the changes for approval** — a clear diff of what changed in each field (html / css / js) vs. the design read in step 2; full modified files available on request. **Wait for the operator's explicit approval.**
5. On approval, `search_updateDesign(website-uuid, search-key, …)` with only the changed fields, creating a REVIEW draft.
6. Tell the operator the draft is in **REVIEW** and they must publish it in the dashboard — the MCP can't, and neither can you.

## Create path — when no `search-key` exists

A fresh onboarding often arrives as a `website-uuid` alone — the customer has no search yet. Don't ask for a key; resolve it:

1. `search_listConfigs(website-uuid)`. Configs for the device in scope already exist → list them (key, `type`, `state`, last modified) and ask in round 1: use one of these, or create new? A chosen desktop config's name also settles embedded vs overlay (`references/shell-structure.md` → *Variant detection*) — its `type` does not. **Never create a duplicate silently.**
2. Nothing matches → announce it in one line ("no desktop search config exists — creating a desktop overlay draft") and call `search_createConfig(website-uuid, target, desktopDesign)`:

   | Scope | `target` | `desktopDesign` | Result |
   |---|---|---|---|
   | desktop overlay | `DESKTOP` | `OVERLAY` | one config, HR's best-practice desktop overlay design attached — the overlay base |
   | desktop embedded | `DESKTOP` | `EMBEDDED` | one config, HR's best-practice embedded design attached — the embedded base |
   | mobile | `MOBILE` | omit | one config, mobile design attached — the mobile base |
   | desktop + mobile | `BOTH` | `OVERLAY` / `EMBEDDED` | two configs — desktop and mobile are separate per-device configs that coexist at runtime |
   | — | `NONE` | omit | bare config, no design — for API-only frontends; **never for this skill** |

   **Always pass `desktopDesign` on a desktop target** — omitted, the tool attaches the embedded design, and an overlay build would start from the wrong base. The wiki keeps no copy of any of these designs: the attached design is the base for every variant. The new config lands as a **draft** (INTERNAL_REVIEW for supervisor accounts, REVIEW for other users); the tool cannot publish. Re-run `search_listConfigs` to read the new `key`, `type` and `state` — that key is the `search-key` for every later call, and all three go in the report's *Config* block.
3. **Name what you created.** The tool's default names ("Overlay search desktop", "Embedded overlay", "Overlay search mobile") are not the team's, and every config's `type` is "Overlay search" — which the on-site widget prints in front of the name, so a name that repeats it reads "Overlay search - Overlay Search - Desktop". Rename each created config with `search_renameConfig(website-uuid, key, name)` right after the create:

   | Variant | Name | Widget shows |
   |---|---|---|
   | `desktop-overlay` | `Desktop` | Overlay search - Desktop |
   | `desktop-embedded` | `Embedded Desktop` | Overlay search - Embedded Desktop |
   | `mobile-overlay` | `Mobile` | Overlay search - Mobile |

   On `BOTH` the create call returns two configs; tell them apart by the default name it returned. The new name goes in the report's *Config* block, and it is what `references/shell-structure.md` → *Variant detection* reads on every later build. Rename only configs created in this build, never an existing one — a rename on a LIVE config forks a draft of it (verified 2026-09-25 on an internal test website: the rename applies at once to an INTERNAL_REVIEW config and returns the new name).
4. One create per build. A create error → report it once and stop; don't retry in a loop, don't fall back to "create it in the dashboard".

Verified 2026-09-25 on an internal PrestaShop test website: one config per variant created this way (`MOBILE`; `DESKTOP` + `OVERLAY`; `DESKTOP` + `EMBEDDED`), `trigger_selector` pointed at the theme's input, and each opened on the storefront with results.

**Never** create when a `search-key` was supplied, when the operator chose an existing config, or before core-intake Q0 + Q1 (scope, and embedded or overlay on desktop) are answered — the call takes both, which is why they are asked together in round 1. Q2's `availableFields` menu (`search_getFilters` / `search_getSorting`) needs the key, so it is read **after** this step.

## Preconditions — get these right, or the flow stalls

Skip them and you either thrash on an oversized result or loop on a failed call — the **"keeps thinking" / never-returns** failure.

1. **Reading: just read the named config — do NOT gate on state.** Call `search_getDesign(website-uuid, search-key)` for whatever config the operator named, **regardless of its state** (LIVE, REVIEW, internal review, archived). Do not branch on `state`/`draft` to decide *whether* to read, and never refuse to read a non-LIVE config. The only safety net is error handling, not a state filter: if the call returns an outright error (or the config has no stored design), **say so once and stop** — the wiki keeps no copy of any Search design, so there is no base to build from until the read works; never silently retry the same call in a loop.

2. **Updating: push only after explicit operator approval of the diff.** If a push errors, report it once and stop — don't loop. `search_updateDesign` always leaves the config in REVIEW and cannot publish.

3. **`search_getDesign` returns a large payload — never read it whole.** A real design (`resultTemplate` + `initializationCode` + `resultStyles`) runs tens of KB and **will exceed the tool-result limit and spill to a file** (`Error: result (… characters) exceeds maximum allowed tokens. Output saved to <file>`). Do not try to hold or diff the whole design inline — that is the stall. Instead:
   - **Work on disk.** Extract the three fields to files in the session scratch folder — `jq -r .resultTemplate <spilled> > resultTemplate.liquid`, `jq -r .resultStyles <spilled> > resultStyles.css`, `jq -r .initializationCode <spilled> > initializationCode.js` — and keep an untouched copy of each for the diff. These files are the base: there is no wiki copy of any Search design.
   - **Edit only the regions this skill owns, with tools that leave the rest byte-identical:** `scripts/splice-tile.mjs` for the tile slot and the hooks; targeted `sed` / `python` replacements (or a subagent) for the `trigger_selector` / `placement_selector` lines, the cart function and its `fix_links` call-sites, the branding and `{# text … #}` tokens, the reset block and the appended CSS. Never regenerate a field from memory or from a template held in context.
   - **Diff each file against its untouched copy** — that diff is what the operator approves (Step 16) — and push the files' contents as the field values. The whole design never needs to be in context: read the diff, not the file.

## Read path (modify-in-place)

Call `search_getDesign` for the named config **regardless of its state** (section 1), and process the spilled result out-of-context (section 3). You're editing the customer's real design, not regenerating it; the wiki's overlay files are only ever a source when a created config needs the overlay. `references/shell-structure.md` has the slot structure and the banner branch.

## Write path (push a draft) — approval is mandatory

Never call `search_updateDesign` until you've **shown the changes and the operator has explicitly approved.** Then push only the fields you changed (`resultTemplate`, `resultStyles`, `initializationCode`); omit `inputTemplate`. It creates/updates a REVIEW draft and cannot publish.

## Governance

`search_updateDesign` writes to a live customer configuration. Never auto-push — always get the operator's explicit go-ahead on the diff in the conversation first.
