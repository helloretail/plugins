---
source: public-docs
verified: 2026-10-29
---

# Templates, APIs and the MCP — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Liquid cheat sheet](../../cheat-sheets/liquid/general.md), [cheat sheets](../../cheat-sheets/README.md), [search templates](../../onboarding/search-templates.md), [implementation methods](../../onboarding/implementation-methods.md), [when changes go live](../../onboarding/when-changes-go-live.md), [diagnostics — audit log and API log](../diagnostics.md), [search relevance](../../features/search/search-relevance.md), [Product Intelligence](../../features/product-intelligence/product-intelligence.md), [tracking and SDK](./tracking-and-sdk.md)

| Symptom | Go to |
| --- | --- |
| "Titles show `&gt;` or `&amp;` in the recom box" | [HTML entities show up in product text](#html-entities-show-up-in-product-text) |
| "Prices have the wrong separators or decimals" | [Prices or currency symbols are formatted wrong](#prices-or-currency-symbols-are-formatted-wrong) |
| "A product field is empty in the template" | [A product field is empty in a template](#a-product-field-is-empty-in-a-template) |
| "Make this setting editable in the dashboard editor" | [Exposing template settings in the dashboard editor](#exposing-template-settings-in-the-dashboard-editor) |
| "Clicks from our custom Search or Pages template aren't tracked" | [Click tracking lost in a custom Search or Pages template](#click-tracking-lost-in-a-custom-search-or-pages-template) |
| "Filters or sorting in the template don't react" | [Filters or sorting in a Search or Pages template do not react](#filters-or-sorting-in-a-search-or-pages-template-do-not-react) |
| "Search state is lost on reload or Back" | [Search or Pages state is lost on reload or Back](#search-or-pages-state-is-lost-on-reload-or-back) |
| "A module example from the docs throws an error" | [An example copied from the developer docs throws an error](#an-example-copied-from-the-developer-docs-throws-an-error) |
| "Our external stylesheet stays after a reload" | [Loading an external stylesheet from a template](#loading-an-external-stylesheet-from-a-template) |
| "The API returns 401 or Unauthorized" | [API or GraphQL request is refused](#api-or-graphql-request-is-refused) |
| "Which GraphQL URL do I call?" or "Product Intelligence returns nothing" | [GraphQL returns nothing or the wrong schema](#graphql-returns-nothing-or-the-wrong-schema) |
| "A product update through the API didn't stick" | [Product data API cannot find the product or ignores an update](#product-data-api-cannot-find-the-product-or-ignores-an-update) |
| "We queued a feed run and it didn't run" | [A feed run queued through the API does not start](#a-feed-run-queued-through-the-api-does-not-start) |
| "409 Version Conflict" from the Pages API | [Pages configuration API returns 409 or the change is not visible](#pages-configuration-api-returns-409-or-the-change-is-not-visible) |
| "Invalid field name" or "Invalid boost value" on search personalization | [Search personalization mutation is rejected](#search-personalization-mutation-is-rejected) |
| "The Hello Retail MCP won't connect" or "401 from a tool" | [The MCP server will not connect or returns 401](#the-mcp-server-will-not-connect-or-returns-401) |
| "I changed it through the MCP but the shop didn't change" | [A change made through the MCP is not visible on the shop](#a-change-made-through-the-mcp-is-not-visible-on-the-shop) |

## HTML entities show up in product text

**Likely cause.** Products in Recommendations, Triggered Emails, Newsletter Content, Initial
Content and zero-result Search content are "safe strings": their text is HTML-escaped, so a title
containing `>` renders as `&gt;` where the template expects raw text. Search and Pages products are
not escaped.

**Fix.**

1. Use `rawHtml` to get the unescaped value: `{{ product.title | rawHtml }}`.
2. In Search and Pages templates, where text is raw, use `escape` wherever escaping is needed.

**Source:** [Managed templates — The Product Object](https://developer.helloretail.com/guides/templates/) · [Custom Liquid filters](https://developer.helloretail.com/guides/templates/custom_liquid_filters/)

## Prices or currency symbols are formatted wrong

**Likely cause.** `price` without an argument uses the price format configured on the website, so
a wrong website setting shows up in every template. `currencySymbol` knows only a fixed list of
currencies.

**Fix.**

1. Pass a format to `price`: three characters — thousands separator, decimal separator, decimal
   rule. The rule is `-` (",00" becomes ",-"), `#` (drop zero decimals and the separator) or `0`
   (keep them): `{{ product.price | price: ".,-" }}`.
2. `priceWithCurrency: "DKK"` adds the symbol; a second argument orders it, `#` for the price and
   `$` for the symbol: `priceWithCurrency: "USD", "# $"`.
3. `num: 2, ',', '.'` rounds and formats any number; `''` as the third argument drops the
   thousands separator.
4. `currencySymbol` supports AUD, BGN, CAD, CHF, CNY, CZK, DKK, EUR, GBP, HRK, HUF, ISK, JPY, KRW,
   LTL, NOK, PLN, RON, RUB, SEK, THB, UAH, USD and ZAR only.
5. Inside an HTML attribute, quote filter arguments with single quotes — see the
   [Liquid cheat sheet](../../cheat-sheets/liquid/general.md).

**Source:** [Custom Liquid filters](https://developer.helloretail.com/guides/templates/custom_liquid_filters/)

> **May be outdated:** the filter page shows `currencySymbol` returning `kr` for DKK but
> `priceWithCurrency: "DKK"` printing `kr.` — check the live output before promising either.

## A product field is empty in a template

**Likely cause.** In a Search or Pages template, the search instance only returns the fields
listed in `product_fields`; a field used in the Liquid but not requested is empty. Custom feed
fields also have to be read from the right dictionary.

**Fix.**

1. Add the field to the search instance's `product_fields`, or leave the list unset to get every
   field.
2. Read custom fields by type: `product.extraData.<name>` (string), `product.extraDataNumber.<name>`
   (number), `product.extraDataList.<name>` (list of strings).
3. Confirm the field exists on the product at all.

**Check with.** `productData_get` for one product, and `dataFields_getProductFields` for the field
list.

**Source:** [JavaScript modules — search_instance](https://developer.helloretail.com/guides/templates/javascript_modules/) · [Managed templates — The Product Object](https://developer.helloretail.com/guides/templates/)

## Exposing template settings in the dashboard editor

**Likely cause.** Not a fault — a customer wants to change a colour, text or toggle without
editing code. The dashboard shows an editor only for variables declared with Hello Retail's custom
assign tags.

**Fix.**

1. In Liquid (and in the Liquid-rendered CSS of Search and Pages), declare the variable with
   `{# <type> <name> = <value> #}`, for example `{# color mycolor = "#ff0000" #}`.
2. Types: `color`, `text`, `multiline`, `number`, `choice` (`{# choice ("top", "left") filter_position = "top" #}`),
   `boolean`, and `font` (Newsletter Content only).
3. Group fields with `{# section The Section Title #}`.
4. In Search and Pages JavaScript, put the type in a comment before an ordinary assignment:
   `/* boolean */ var paginated = false;`, and sections as `/* section General */`.
5. The CSS of Search and Pages has no context variables — only these assign tags.

**Check with.** `search_getDesign` or `pages_getDesign` to read the current template.

**Source:** [Managed templates — Custom assign tags](https://developer.helloretail.com/guides/templates/)

## Click tracking lost in a custom Search or Pages template

**Likely cause.** Product URLs from the Hello Retail APIs carry a tracking fragment. A custom
template that rewrites the links, or renders new results without re-processing them, loses the
click tracking.

**Fix.**

1. After every render, run `ui_utility_vanilla.fix_links(container, prefix)`: it removes the
   fragment from the visible link and adds a click handler that tracks the click before following
   it.
2. Prefixes: `ps` Search, `pb` Recommendations, `pa` Pages, `nc` Newsletter Content, `te`
   Triggered Emails.
3. Call it again after each "load more" render. Platform add-to-cart and rating bindings hook in
   after the same calls — see [add-to-cart.md](../../platforms/add-to-cart.md).

**Source:** [JavaScript modules — ui_utility_vanilla](https://developer.helloretail.com/guides/templates/javascript_modules/)

## Filters or sorting in a Search or Pages template do not react

**Likely cause.** `register_filter` was not called on the filter markup, or the markup does not
come from the Liquid filter helpers it expects. A second cause: setting the search term resets the
filters and sorting.

**Fix.**

1. For each filter element generated by the Liquid filter helpers, call
   `ui_utility_vanilla.register_filter(filter, callback, searcher)`. The optional fourth argument
   takes `rangeSliderDecimals` for range sliders.
2. Changing `filters` or `sorting` on the search instance resets pagination to offset zero.
   Changing `search_term` also **removes** applied filters and sorting.
3. `initial_render(callback)` fetches filters (with `return_filters: true`) and initial content;
   `yield_template(callback)` fetches the next page.
4. To test a draft search config from JavaScript, pass its version `id` to
   `search_instance.create`.

**Check with.** `search_getFilters` and `search_getSorting` for what the config exposes.

**Source:** [JavaScript modules — ui_utility_vanilla and search_instance](https://developer.helloretail.com/guides/templates/javascript_modules/)

## Search or Pages state is lost on reload or Back

**Likely cause.** State is kept in a storage module that writes with `replaceState` (the default),
so Back skips the change, or Search and Pages share a namespace and overwrite each other.

**Fix.**

1. Use `querystring_storage` (query string), `hash_storage` (URL fragment) or `local_storage`
   (`window.localStorage`), each created with its own namespace:
   `querystring_storage.create("hr-search", { use_pretty_json: true })`.
2. Give Search and Pages different namespaces when both run on one site.
3. `querystring_storage.put(key, value, true)` writes with `pushState`, so Back returns to the
   previous state; the default `false` uses `replaceState`.
4. `use_pretty_json: true` gives a short, readable query string; `false` uses
   `encodeURIComponent`.

**Source:** [JavaScript modules](https://developer.helloretail.com/guides/templates/javascript_modules/)

## An example copied from the developer docs throws an error

**Likely cause.** Several examples on the developer site contain mistakes. Copied as they are,
they throw a `ReferenceError` or `SyntaxError`, or do nothing.

**Fix.**

1. `hash_storage` and `local_storage` examples call `querystring_storage.create` — call the module
   you imported (`hash_storage.create`, `local_storage.create`).
2. The `ui_overlay_vanilla` example calls `overlay.show()`; the documented method is
   `overlay.open()`.
3. The quick-start `loadRecom` example lacks the comma between the requests array and the callback.
4. The product data API examples are missing commas after `hierarchies` and contain a stray quote
   in the `PATCH` body.
5. The queue-feed examples write `{$feedConfigId}`; in a template literal it is `${feedConfigId}`.
6. The server-side click example passes an object to `sendBeacon` without `JSON.stringify` — see
   [tracking-and-sdk.md](./tracking-and-sdk.md#server-side-tracking-and-lost-clicks).

**Source:** [JavaScript modules](https://developer.helloretail.com/guides/templates/javascript_modules/) · [Quick start guide](https://developer.helloretail.com/guides/quick-start/) · [Managing product data](https://developer.helloretail.com/api/data/) · [Queuing product feed runs](https://developer.helloretail.com/api/data/queue_product_feeds/)

> **May be outdated:** these are errors in the docs as extracted; the live pages may since have
> been corrected.

## Loading an external stylesheet from a template

**Likely cause.** A stylesheet injected by hand stays on the page when the script reloads, for
example on a single-page-app route change.

**Fix.**

1. Load it through the module so Hello Retail tracks it:

    ```javascript
    import "style_loader";
    style_loader.load("https://example-shop.com/styles/style.css");
    ```

2. Stylesheets loaded this way are unloaded automatically when `helloretail.js` reloads.

**Source:** [JavaScript modules — style_loader](https://developer.helloretail.com/guides/templates/javascript_modules/)

## API or GraphQL request is refused

**Likely cause.** No API key, the key in the wrong place, or a request for a website the key's
account cannot access.

**Fix.**

1. Create an API key in My Hello Retail (the API keys section; **Create** generates one).
2. Product data, feed runs, Pages configuration and GraphQL take it as the `apiKey` query
   parameter: `https://core.helloretail.com/graphql?apiKey={api key}`.
3. Customer bias by `email` or `customerId` takes it as `Authorization: Bearer {api key}`.
4. The Product Intelligence GraphQL endpoint also accepts a logged-in My Hello Retail browser
   session, which is meant for testing.
5. Requests only return data for websites the account has access to.
6. Ready-made requests for every API are in the Postman collection linked from the developer site.

**Source:** [Accessing and authenticating GraphQL API](https://developer.helloretail.com/api/graphQL/authentication/) · [Customer bias using the REST API](https://developer.helloretail.com/api/customer_bias/) · [Managing product data](https://developer.helloretail.com/api/data/) · [Postman collections](https://developer.helloretail.com/guides/postman_collections/)

> **May be outdated:** the developer docs link the API-key instructions to older
> `support.helloretail.com/t/…` article addresses; the current article is
> [Hello Retail API](https://support.helloretail.com/general-setup/hello-retail-api/).

## GraphQL returns nothing or the wrong schema

**Likely cause.** Each GraphQL API has its own URL, and Product Intelligence returns an empty
response — not an error — when it has too little data for a product.

**Fix.**

1. Use the URL for the API in question:
    - Product Intelligence (`productInsight`, `topProducts`): `https://core.helloretail.com/pi/graphql`
      — opening it in a browser gives a GraphiQL tester with the schema.
    - Search personalization: `https://core.helloretail.com/graphql`.
    - Activities log (the `auditLogs` query): the docs link its schema to
      `https://my.helloretail.com/graphql`.
2. Product Intelligence analyses a product only once it exists in Hello Retail with a description
   and a valid image, and only after a delay.
3. `topProducts` returns an empty list when nothing matches; `limit` defaults to 10, maximum 100.
   A dimension without its required arguments returns a validation error naming them.
4. "Purchase next" is not in the Product Intelligence API: use unmanaged Recommendations
   (`/serve/recoms`) with a `BOUGHT_NEXT` source.
5. The activities log query pages with `first` and `after` (the `endCursor`).

**Check with.** `auditLog_getEntries` for the activities log without GraphQL.

**Source:** [Product Intelligence API](https://developer.helloretail.com/api/graphQL/product-intelligence/) · [Top products](https://developer.helloretail.com/api/graphQL/product-intelligence/top-products/) · [Activities log GraphQL API](https://developer.helloretail.com/api/graphQL/activities-log/) · [Accessing and authenticating GraphQL API](https://developer.helloretail.com/api/graphQL/authentication/)

> **May be outdated:** the Product Intelligence API is a free beta; fields can be renamed, added or
> removed.

## Product data API cannot find the product or ignores an update

**Likely cause.** The product API identifies a product by its **URL**, URL-encoded in the `id`
parameter — a product number or an unencoded URL finds nothing. The API is meant for fast updates
on top of a product feed, not instead of one.

**Fix.**

1. `GET`, `PATCH` and `DELETE` on
   `https://core.helloretail.com/api/websites/{website uuid}/products?id={encoded product url}&apiKey={api key}`;
   `POST` (create) takes no `id` parameter.
2. The body is `{ "data": { "id": "<product url>", "type": "products", "attributes": { … } } }`.
3. `PATCH` changes only the attributes sent; send `null` to remove one.
4. Keep the product feed running; on platforms where background jobs are hard, delta feeds are the
   documented alternative for fast updates.

**Check with.** `productData_get` before and after the call.

**Source:** [Managing product data](https://developer.helloretail.com/api/data/)

## A feed run queued through the API does not start

**Likely cause.** Feed runs are rate-limited, so a queued run waits until the limit allows it. A
feed that supports delta tokens gets the run type the system would pick next, which may be a delta
run when a full one was wanted.

**Fix.**

1. Queue one feed: `POST https://core.helloretail.com/api/websites/{website uuid}/productfeedruns/{feed config id}?apiKey={api key}`.
2. Add `&full=true` to force a full run on a delta-capable feed. Feeds without delta support
   always run in full.
3. Prefer queuing feeds individually; the docs discourage queuing all feeds at once
   (`/productfeedruns` without an id).
4. Read `blockedUntil` and `runType` in the response to see when, and how, it will run.
5. The support article gives the limits: one full run per hour; delta runs every ten minutes.

**Check with.** `feeds_list` for the feed config ids, `feeds_getLatestRun` and `feeds_listRuns`
for whether the run happened.

**Source:** [Queuing product feed runs](https://developer.helloretail.com/api/data/queue_product_feeds/) · [Queue product feed runs via API](https://support.helloretail.com/general-setup/queue-product-feed-runs-via-api/)

> **May be outdated:** the support article says calling `/productfeedruns` queues all active feeds
> and presents that as the normal call; the developer docs strongly prefer queuing specific feeds.

## Pages configuration API returns 409 or the change is not visible

**Likely cause.** Every change creates a new version, and only the latest version can be updated —
`PATCH` on an older version id returns **409 Version Conflict**. A change is visible only on a page
in `LIVE` state.

**Fix.**

1. Fetch the latest version:
   `GET https://core.helloretail.com/api/companies/{company id}/websites/{website uuid}/pages/latest/{page key}?apiKey={api key}`.
2. `PATCH .../pages/{version id}` with the `data.id` from that response; on 409, fetch again and
   retry.
3. List fields such as `personalized_boosts` and `product_boosts` are replaced whole — send the
   full list.
4. The documented examples send `state: "LIVE"` with every change, which publishes it. Whether a
   `PATCH` without `state` keeps a live page live is not documented — read the page back after.
5. The company id is under the profile icon → **Company Profile** in My Hello Retail.

**Check with.** `pages_getConfig` and `pages_getConfigProductFilters` for what is configured;
`auditLog_getEntries` for who changed it.

**Source:** [Configuring Pages](https://developer.helloretail.com/api/configuration/pages/) · [MCP — Getting started](https://developer.helloretail.com/mcp/)

## Search personalization mutation is rejected

**Likely cause.** The field is not in `allowedFields`, the boost is outside the allowed range, the
`algorithmId` is wrong, or the API key is missing (`Unauthorized`).

**Fix.**

1. Call `updateSearchAlgorithmPersonalization` on `https://core.helloretail.com/graphql?apiKey={api key}`
   with `algorithmId` and the full list of `personalizedFields` (`field`, `boostValue`).
2. Use only fields in `allowedFields` — `availableFields` lists everything that exists, including
   fields the website cannot use.
3. `boostValue` is an integer; the docs give 1 to 10 and suggest starting at 1 to 3.
4. An empty list removes all personalization.
5. No read query is documented — the docs suggest re-sending the existing values, which writes.
   Read the configuration through the MCP instead.

**Check with.** `search_listConfigs` and `search_getProductEngine` for the engine behind the
config.

**Source:** [Configuring search engine personalized boosts](https://developer.helloretail.com/api/configuration/search/)

> **May be outdated:** the API page gives a range of 1 to 10 with 0 as "no boost";
> [search-relevance.md](../../features/search/search-relevance.md) gives 0 to 10, and explains that
> `allowedFields` follows the subscription.

## The MCP server will not connect or returns 401

**Likely cause.** The server URL is wrong, sign-in never completed, or the OAuth token has expired
— a 401 from a tool means an expired token.

**Fix.**

1. The server URL is `https://core.helloretail.com/mcp`; sign-in is OAuth and opens on first use.
2. Claude Code: `claude mcp add --transport http hello-retail https://core.helloretail.com/mcp`.
3. Codex CLI: `codex mcp add hello-retail --url https://core.helloretail.com/mcp`, then
   `codex mcp login hello-retail`; `codex mcp list` shows what is registered.
4. Claude (Cowork): **Settings → Connectors → Add custom connector**.
5. ChatGPT: **Plugins → Add → Add custom MCP server**. If that option is missing, the workspace
   admin has not allowed custom MCP servers.
6. On a 401, run the tool again to re-open the sign-in.

**Check with.** `website_getInfo` — a successful call proves the connection.

**Source:** [MCP — Installation and setup](https://developer.helloretail.com/mcp/setup/)

## A change made through the MCP is not visible on the shop

**Likely cause.** No MCP tool publishes. Changes to Search configs, Recommendations boxes and
designs, and Pages and page designs land as drafts; synonym and field-indexing changes wait for a
re-index.

**Fix.**

1. Publish the draft in My Hello Retail.
2. Exceptions that are live on save: search engines and their query rules (for every config on
   that engine; boosts can take up to five minutes to clear the cache) and Newsletter Content
   designs and campaigns.
3. Synonyms and field indexing reach shoppers after the next re-index, scheduled a few minutes
   out.
4. A feed created through the MCP starts inactive.
5. Every tool needs a website UUID; `website_listForCompany` takes the company id from **Company
   Profile**.

**Check with.** `productData_getReindexStatus`, `auditLog_getEntries`, and the read tool for the
object changed. The full rules are in [when-changes-go-live.md](../../onboarding/when-changes-go-live.md).

**Source:** [MCP — Getting started](https://developer.helloretail.com/mcp/)
