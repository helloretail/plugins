---
source: index
---

# Solutions — problems and fixes from the support and developer docs

Hello Retail's support site ([support.helloretail.com](https://support.helloretail.com/)) and
developer site ([developer.helloretail.com](https://developer.helloretail.com/)) between them hold
most of the answers support gives by hand. The pages in this folder re-cut those articles by
**symptom**: each entry is a problem as a customer or colleague reports it, the likely cause, the
fix, how to confirm it, and the article it came from.

## How far to trust these pages

Parts of the source docs describe an older dashboard or older behaviour and are being rewritten.
Every page here is therefore a set of **leads, not verdicts**:

1. **Confirm before you answer.** Check the website's live configuration through the
   `hello-retail` MCP, or reproduce on the storefront, before you give a fix to a customer.
2. **Field pages win.** Where a `source: field` page elsewhere in this wiki says something
   different, follow the field page — it records what onboardings found in practice.
3. **The live site wins over this copy.** If the article on support.helloretail.com or
   developer.helloretail.com now says something different from the entry here, follow the article
   and fix the entry.
4. **Mind the flags.** An entry marked **May be outdated** names the reason; say so when you pass
   it on.

## Pages

| Area | Page | Covers |
| --- | --- | --- |
| Script and tracking setup | [tracking-and-script.md](./tracking-and-script.md) | Installing the script, tracking requirements, Tag Manager, Rocket Loader, excluding own traffic, Google Analytics events, cookies and consent |
| Tracking SDK | [tracking-and-sdk.md](./tracking-and-sdk.md) | Cart, conversion, click and view tracking that does not register; identifying customers; server-side tracking; customer bias |
| Feeds and data | [feeds-and-data.md](./feeds-and-data.md) | Product, content, category and order feeds; re-sync; grouping; indexed fields; extraData; transforms and delta feeds |
| Search | [search.md](./search.md) | Missing or wrong results, synonyms, redirects, stop words, boosts, filters and sorting, initial content, analytics |
| Recommendations | [recommendations.md](./recommendations.md) | Empty or wrong boxes, jumping boxes and CLS, load order, filters, prices, fixed products |
| Pages | [pages.md](./pages.md) | Setting up category and brand pages, client-side and API integrations, SEO |
| Triggered emails | [triggered-emails.md](./triggered-emails.md) | Abandoned cart, price drop, back in stock and post-conversion triggers; cart tracking; sending domain and SPF; permissions |
| Newsletter content | [newsletter-content.md](./newsletter-content.md) | Campaign types, auto and rolling campaigns, template ids, UTM tracking |
| Product Agents | [product-agents.md](./product-agents.md) | Klaviyo setup, scheduling, follow-ups, filters, credits and billing |
| Retail Media, Audience, Insights | [retail-media-audience-insights.md](./retail-media-audience-insights.md) | Campaigns and banners, audiences and Facebook, reading Insights |
| Platforms | [platforms.md](./platforms.md) | Per-platform install and data-sync problems |
| Newsletter providers | [newsletter-providers.md](./newsletter-providers.md) | Permission auto-sync and newsletter content per ESP |
| Templates and APIs | [templates-and-api.md](./templates-and-api.md) | Liquid, custom filters, JavaScript modules, API and GraphQL access, MCP setup |
| Account and privacy | [account-and-privacy.md](./account-and-privacy.md) | Login and users, activities log, GDPR, cookies and data deletion questions |

## Where to look first

- **"Nothing shows" / "Hello Retail stopped working"** — not here: start at
  [script-not-loading.md](../script-not-loading.md).
- **"Who changed this?" / "is the call even arriving?"** — [diagnostics.md](../diagnostics.md).
- **"I saved it but shoppers don't see it"** —
  [when changes go live](../../onboarding/when-changes-go-live.md).
- **How a feature is meant to work**, rather than what is broken — the feature pages under
  [features/](../../features/features.md).
- **The full support article** an entry was cut from — the text mirror in
  [support-docs/](../../../support-docs/index.md), at the same path as on support.helloretail.com.

## Keeping these pages right

When a fix here turns out to be wrong or outdated, correct the entry (or delete it) in a pull
request and set the page's `verified` date only after checking the whole page. If the support or
developer article itself is wrong, tell the team that owns it — the support site is the source
these pages are cut from.
