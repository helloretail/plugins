---
source: field
verified: 2026-11-04
---

# Viskan — Feeds

Feed setup notes for Viskan customers: product, order and content feeds. Read alongside the
`feed-setup` skill, which owns the general V2 feed-creation flow.

---

## Product feeds

There are a couple of different versions of the Viskan product feeds — mainly **v1**, **v2** and
**v3**. Which one a customer is on determines the parameters and the pagination offset.

### v1 parameters

| Parameter | Value |
|---|---|
| Pagination | Starts on page 0. |

### v2 parameters

| Parameter | Value |
|---|---|
| Pagination | Starts on page 0. |

### v3 parameters

| Parameter | Value |
|---|---|
| `countryId` | **Number** (Viskan or customer needs to provide this) |
| `languageId` | **Number** (Viskan or customer needs to provide this) |
| `splitByAttribute1` | **Boolean** (`true` if each color should be displayed as its own product) |
| `includeRelatedArticles` | **Boolean** |
| `includeRootCategories` | **Boolean** (determines if root e.g. "All products" should be included or not) |
| Pagination | Starts on page **1**. |

> **Check the page start per version:** v3 starts on page **1**, v1 and v2 start on page **0**.
> Using the wrong one can cause unintended side effects.

> **v3 on NG hosts:** one NG tenant's v3 feed took `languageCode` (`sv`, `en`, `de`, `nl`) instead
> of `languageId`, and its page size parameter was `size`: `pageSize` was ignored and every page
> held 500 items. Test both on the customer's own URL. Moving a live customer from v1/v2 to v3:
> [ng-migration.md](./ng-migration.md).

---

## Order feed (historical orders)

Hello Retail can fetch a Viskan shop's historical order data straight from Viskan's API, so the
customer doesn't have to export orders themselves.

**Customer side: API credentials.** The customer creates an API client in Viskan Backoffice with
**read access to orders**, following Viskan's guide:
[Create an API client](https://api-docs.viskan.com/get-started/create-api-client.html).

- Backoffice → **Developers → API clients** → **Create API client**. Needs the administrator role.
- Grant only the order read scope. Viskan's API reference lists the exact scope on each Order method.
- The result is a **Client Id** and a **Client Secret**. The secret is shown once; if it is lost,
  the customer regenerates it (the Client Id stays the same). Both go into the order feed URL,
  never into a ticket, card or chat in plain text.

### Feed URL

The order feed points at Hello Retail's Viskan feed helper. Replace each `{{…}}` placeholder
with the customer's value, and drop the optional parameters you don't use:

```text
http://feed-helper.addwish.com/viskan/orders.py?clientId={{client_id}}&clientSecret={{client_secret}}&daysBack=2&language={{lang}}&countryCode={{country_code}}&webStoreNumber={{web_store_number}}
```

### Parameters

| Parameter | Required | What it does |
|---|---|---|
| `clientId` | **Yes** | The Client Id of the customer's Viskan API client. |
| `clientSecret` | **Yes** | The Client Secret of the same API client. |
| `daysBack` | — | How many days of orders to fetch, counted back from today. The reference setup uses `2`. |
| `language` | **Yes** | Technically required. Falls back to `sv` when omitted, so always set it to the shop's language. |
| `countryCode` | No | Only returns orders matching that country code. |
| `webStoreNumber` | No | Only returns orders from that web store. |

> **Multi-store / multi-country customers:** one Viskan tenant can hold several web stores or
> countries. Set `webStoreNumber` and/or `countryCode` so each Hello Retail website only gets its
> own store's orders.

Order feeds have **no MCP tooling**: the order feed is set up by hand in the dashboard.

---

## Content feeds

Content feeds are created **on demand** and need to be requested from Viskan or the customer. There
is no self-serve URL to derive.

Note that content feeds have **no MCP tooling** — anything content-feed-related is manual
work in the dashboard.

---

**Related:**
- Platform install nuance — [Viskan overview](./README.md)
- Add to cart — [add-to-cart.md](./add-to-cart.md)
- Feed setup flow — `${CLAUDE_PLUGIN_ROOT}/skills/feed-setup/SKILL.md`

---

## Timeline
- 2026-08-27: Page created from the Viskan feed notes in Confluence.
- 2026-11-02: Added the order feed: Viskan API client for historical orders, and its parameters.
- 2026-11-04: v3 on NG hosts: `languageCode` and `size`; linked the NG migration page.
