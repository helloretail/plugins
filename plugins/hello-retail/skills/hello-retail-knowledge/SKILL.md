---
name: hello-retail-knowledge
description: Answer any question about Hello Retail from the bundled team wiki — what the platform does, how features work (Search, Recommendations, Pages, Product Agents, Retail Media), platform-specific install nuance (Shopify, Magento, custom), the D&TS onboarding flow, base templates, code cheat-sheets, acronyms and jargon. Trigger for questions like "how does X work in Hello Retail", "what does HR's Y feature do", "how do we onboard a customer", "what does this acronym mean", "which fields does the feed need", "how do swatches work on Magento", "how do I fix X", "why isn't Y tracking / syncing / showing", "what does the support article say about X", or any Hello Retail / HR / D&TS domain question.
---

# Hello Retail Knowledge

Answer Hello Retail questions **wiki-first** from the bundled copy at `${CLAUDE_PLUGIN_ROOT}/docs/wiki/`. Do not invent facts about Hello Retail.

## Lookup procedure

1. Start at `${CLAUDE_PLUGIN_ROOT}/docs/wiki/README.md` — its Quick Index maps every folder, and each folder's index page lists its pages. Every page opens with `source` (public-docs / field / index) and `verified` frontmatter; say so in the answer when a page is `verified: never`.
2. Follow the index to the right page, or grep across `${CLAUDE_PLUGIN_ROOT}/docs/wiki/` for specific terms (SKUs, field names, acronyms, error strings).
3. Read the full page before answering — pages cross-link; follow links when the first page defers to another.
4. **Not in the wiki?** Search the support-site mirror: `${CLAUDE_PLUGIN_ROOT}/docs/support-docs/index.md` lists every published support.helloretail.com article with a one-line summary, by section; grep the index, or the folder for a setting name, field or error text. Each article's frontmatter carries its live `upstream` URL and the `upstream-date` it was synced from.
5. **Always cite the path** in the answer, e.g. `features/product-agents/product-agents.md`, or `support-docs/search/search-synonyms.md` plus its `upstream` URL.

## High-signal entry points

| Question | Read first |
|---|---|
| What is Hello Retail? | `overview/what-helloretail-does.md` |
| What does feature X do? | `features/features.md` |
| How does the AI work? | `features/product-intelligence/product-intelligence.md` |
| How do we onboard a customer? | `onboarding/customer-onboarding-flow.md` |
| Acronym / jargon | `glossary/glossary.md` |
| Platform-specific install nuance | `platforms/platforms.md` |
| Reusable code snippets (feature × platform) | `cheat-sheets/` |
| Where a Search design (Liquid/CSS/JS) comes from — Hello Retail's system supplies it when a new search is created; the wiki keeps no copy | `base-templates/search/README.md` |
| Why does search return these products? Boosts, synonyms, query rules | `features/search/search-relevance.md` |
| Is my change live yet? What needs a re-index? | `onboarding/when-changes-go-live.md` |
| Who changed this config? Why is the integration failing or slow? | `support-knowledge/diagnostics.md` |
| "X is broken / doesn't work / how do I fix Y" — a symptom, not a concept | `support-knowledge/solutions/solutions.md` → the area page |
| "What does the support article say about X?" / a step-by-step dashboard how-to | `../support-docs/index.md` → the article |

(All paths relative to `${CLAUDE_PLUGIN_ROOT}/docs/wiki/`.)

## Rules

- **Solutions pages are leads.** Pages under `support-knowledge/solutions/` are cut from support and developer articles, some of them out of date. When you answer from one, say it is from the docs, repeat any **May be outdated** flag, and prefer a `source: field` page where the two disagree.
- **The support-docs mirror says what the support site says.** It is a generated copy, current as of its `upstream-date`, and some articles describe an older dashboard. Prefer the wiki where both cover a question, say which article you used, and never edit the mirror — fix the article upstream and re-sync.
- **The live site wins.** If the wiki seems to disagree with helloretail.com or support.helloretail.com, say so and prefer the live site; flag the wiki page as possibly stale.
- **Don't fabricate people, customers, or partners.** If someone or something isn't documented in the wiki, say so.
- **Never include customer-identifiable data** (SKUs, prices, per-customer code) in answers destined for shared documents.
- If neither the wiki nor the mirror covers the question, say so plainly — and suggest the asker contribute the answer once found.
- To change content, open a pull request against `plugins/hello-retail/docs/wiki/` in `helloretail/plugins` — the wiki there is the source, not a copy.
