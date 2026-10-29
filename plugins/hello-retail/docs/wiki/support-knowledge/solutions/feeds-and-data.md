---
source: public-docs
verified: 2026-10-29
---

# Feeds and data — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [data requirements](../../onboarding/data-requirements.md),
[when changes go live](../../onboarding/when-changes-go-live.md), [diagnostics](../diagnostics.md),
[Shopify feeds](../../platforms/shopify/feeds.md), [solutions index](./solutions.md)

| Symptom | Go to |
| --- | --- |
| "We changed prices and stock, but Hello Retail still shows the old values" | [Re-sync now](#prices-or-stock-changed-but-hello-retail-still-shows-the-old-values) |
| "Updated guides or landing pages don't show in search" | [Content re-sync](#updated-content-pages-do-not-show-in-search) |
| "Category pages never come up in search" | [Category feed](#category-pages-never-come-up-in-search) |
| "New products never appear" / "deleted products stay" | [Create and delete permissions](#new-products-never-appear-or-removed-products-stay) |
| "The feed run failed" / "what does this status mean?" | [Feed history](#the-feed-run-failed-or-is-stuck) |
| "Can we sync faster than every hour?" | [Delta feeds](#can-we-sync-changes-faster-than-a-full-feed-allows) |
| "We want our system to trigger a feed run" | [Queue via API](#we-want-our-own-system-to-trigger-a-feed-run) |
| "Our feed is behind a login or firewall" | [Feed access](#our-feed-is-behind-a-login-or-a-firewall) |
| "The XML feed breaks on `&` or `<`" / "values come in with the wrong type" | [Feed format](#the-xml-feed-breaks-or-values-arrive-with-the-wrong-type) |
| "Our feed calls the field something else" | [Transform](#our-feed-names-a-field-differently-from-hello-retail) |
| "A custom attribute is missing" / "Invalid extraData property name" | [extraData](#a-custom-attribute-is-missing-or-the-run-reports-invalid-extradata-property-name) |
| "We can't filter or sort on a field" / "can't un-index a field" | [Indexed fields](#we-cannot-filter-or-sort-on-a-field) |
| "Every colour of a product shows as a separate result" | [Product grouping](#every-variant-shows-as-a-separate-result-or-variants-are-missing) |
| "Products show no views or wrong popularity" | [Product URL](#products-show-no-views-or-popularity-looks-wrong) |
| "Prices are wrong on the other-currency shop" | [Multi-currency](#the-other-language-or-currency-shop-shows-wrong-prices-or-texts) |
| "Conversions are missing" | [Conversion data](#conversions-are-missing-or-orders-are-not-attributed) |
| "We want to load our order history" | [Historical orders](#we-want-hello-retail-to-learn-from-orders-placed-before-the-script-was-installed) |
| "We need to set up or change the order feed" | [Order feed](#we-need-an-order-feed-set-up-or-changed) |
| "One product shows the wrong data" / "hide one product from recommendations" | [Product Lookup](#one-product-shows-wrong-data-or-must-be-hidden-from-one-feature) |
| "We can't edit a feed Hello Retail set up for us" | [Legacy feeds](#we-cannot-edit-a-feed-that-hello-retail-set-up) |

## Prices or stock changed but Hello Retail still shows the old values

**Likely cause.** The scheduled feed has not run since the change. Scheduled feeds typically run
every 1 to 24 hours, and many shops run twice a day.

**Fix.**

1. Queue a run now: **Configuration → Data Setup → Feeds**, click the green **Put on queue** on the
   feed's row. The button walks through **Awaiting queue → Downloading → Parsing** and returns to
   **Put on queue** when done.
2. Make sure the feed file itself is regenerated at least as often as the schedule — Hello Retail can
   only fetch what the shop has written.
3. For frequent changes (campaign days), consider a shorter schedule, a delta feed, or an extra
   lightweight feed that runs often next to the full one.

**Check with.** `feeds_getLatestRun` for when the last run finished; `productData_get` for the
product's current stored price and stock.

**Source:** [How to Re-Synchronize the Product Feed](https://support.helloretail.com/general-setup/how-to-re-synchronize-the-product-feed/) · [Feeds configuration tool](https://developer.helloretail.com/guides/feeds/feeds_tool/) · [Feeds](https://developer.helloretail.com/guides/feeds/) · [Introduction to feeds](https://support.helloretail.com/general-setup/introduction-to-feeds/)

> **May be outdated:** the re-sync article's path (**Data Setup → Overview → Product data → See
> feeds → Re-synchronize products now**) describes an older screen; the feeds tool articles use
> **Data Setup → Feeds → Put on queue**.

## Updated content pages do not show in search

**Likely cause.** Guides, landing pages or blog posts come from a content feed that has not run since
the content changed — or there is no content feed at all.

**Fix.**

1. **Configuration → Data Setup → Contents**, find the content feed and re-synchronize it.
2. When the run completes, the content is available to Search.
3. No content feed yet: content feeds are not required, but recommended for blog, brand and site
   pages; they use the same structure as the category feed.

**Check with.** `feeds_list` for a content feed; `contentData_getReindexStatus` after the run.

**Source:** [How to Re-Synchronize the Content Feed](https://support.helloretail.com/general-setup/how-to-re-synchronize-the-content-feed/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

> **May be outdated:** the article's button reads "Re-synchronize categories now" for a content feed
> and calls its example a category feed — the screen labels may not match.

## Category pages never come up in search

**Likely cause.** There is no category feed, so Search has no category pages to return.

**Fix.**

1. Have the shop expose a category feed with every active category. Required: `url` (as on the site)
   and `title`; optional: `hierarchy`, `keywords`, `description`, `imgUrl`, `extraData.*`.
2. Brand pages that are distinct from category pages go in their own brand feed with the same
   structure; otherwise include them in the category feed.
3. Send the feed URL to Hello Retail support (contact page:
   [support.helloretail.com/contact](https://support.helloretail.com/contact/)) — customers cannot set
   up category feeds themselves.

**Check with.** `feeds_list` for a category / content feed.

**Source:** [Category data](https://developer.helloretail.com/guides/setup/data_synchronization/category_data/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

> **May be outdated:** the support article calls the category feed "required" for Search; the
> developer article calls it "not a requirement, highly advised".

## New products never appear or removed products stay

**Likely cause.** Every feed may update existing items, but **creating** new items and **deleting**
items that left the feed are separate permissions per feed. A feed with create off never adds
products; with delete off it never removes them.

**Fix.**

1. **Data Setup → Feeds**, open the feed, **Settings** tab.
2. Turn on the create and / or delete toggles as needed (there is no toggle for update — it is always
   on), then **Save**.
3. Queue a run.
4. If the shop runs several product feeds, normally only the main full feed should create and delete;
   a lightweight update feed keeps both off.

**Check with.** `feeds_get` for the feed's configuration; `feeds_listRuns` — the Added and Deleted
counts per run; `productData_search` for the product.

**Source:** [Introduction to feeds](https://support.helloretail.com/general-setup/introduction-to-feeds/) · [Feeds](https://developer.helloretail.com/guides/feeds/) · [Feeds configuration tool](https://developer.helloretail.com/guides/feeds/feeds_tool/)

## The feed run failed or is stuck

**Likely cause.** The run hit a limit or an error, or it is parked by the queue rules.

**Fix.**

1. Open **Feed History** for the feed and click the run. **Feed Run Details** shows a log with the
   processing problems; give its run ID (or the page URL) to support.
2. Read the status: **Cool down** and **Awaiting queue** are normal — a feed gets at most one active
   and one pending ticket, and a feed that ran recently is parked briefly before the next run.
   **Failed** needs the log.
3. Known hard limits: the feed must be reachable by URL, each item must be under 256 KB, and
   download plus processing must finish within 6 hours.
4. After fixing a configuration (mapping, transform), use **Reparse** on an earlier run that
   downloaded successfully — it re-parses the stored payload with the new configuration without
   downloading again.
5. **Interrupt** stops a running or queued run at the next safe checkpoint; a run near the end may
   still finish.
6. A feed restored from the archive has its schedule **paused** — switch it back on in the overview.

**Check with.** `feeds_listRuns` and `feeds_getLatestRun` for status, counts and problems.

**Source:** [Feed History](https://developer.helloretail.com/guides/feeds/feeds_history/) · [Feeds](https://developer.helloretail.com/guides/feeds/) · [Introduction to feeds](https://support.helloretail.com/general-setup/introduction-to-feeds/)

## Can we sync changes faster than a full feed allows

**Likely cause.** The full catalog is too heavy to fetch often.

**Fix.** Implement a delta feed on the existing feed URL:

1. Return a `deltaToken` in every response (any string; a timestamp is practical). In JSON it is a
   root property (`{ "products": [], "deltaToken": "…" }`); in JSONL it is the `X-Delta-Token`
   response header.
2. When Hello Retail calls the feed with `?deltaToken=…`, return only products changed since that
   token.
3. Hello Retail can then fetch deltas about every 10 minutes instead of a full feed hourly. Once
   every 24 hours a delta feed is run in full anyway, to keep the catalogs aligned.

**Source:** [Delta feeds](https://developer.helloretail.com/guides/feeds/delta_feeds/) · [Feeds](https://developer.helloretail.com/guides/feeds/) · [Feed History](https://developer.helloretail.com/guides/feeds/feeds_history/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

## We want our own system to trigger a feed run

**Likely cause.** The shop wants Hello Retail to pick up a change the moment it happens, from a
webhook or event hook.

**Fix.**

1. `POST https://core.helloretail.com/api/websites/{websiteUuid}/productfeedruns?apiKey={apiKey}`
   queues a run of **all active product feeds** on that website.
2. Without parameters it queues a delta run where the feed supports deltas; add `full=true` to force
   a full run.
3. Rate limits: full runs at most once an hour, delta runs every 10 minutes. A request that hits a
   limit or an active run is queued and runs as soon as allowed — it is not rejected.
4. The website UUID and the API key are in the dashboard — see
   [account and privacy](./account-and-privacy.md#where-do-we-find-the-website-uuid-and-the-api-key).

**Check with.** `feeds_listRuns` — the queued run and its run type.

**Source:** [Queue Product Feed Runs Via API](https://support.helloretail.com/general-setup/queue-product-feed-runs-via-api/)

## Our feed is behind a login or a firewall

**Likely cause.** Hello Retail's request is refused by the shop's server.

**Fix.**

1. Choose public access, IP allowlisting, or HTTP Basic Authentication.
2. Basic auth or another header: **Data Setup → Feeds**, open the feed, **Requesting** tab, **Add Basic
   Auth** or **Add header**, **Save**.
3. Extension-built feeds can instead check a random `key` parameter the extension generated; serve
   feeds over HTTPS only.
4. IP allowlisting is arranged through Hello Retail support.

**Check with.** `feeds_getLatestRun` — a download failure in the run log.

**Source:** [Introduction to feeds](https://support.helloretail.com/general-setup/introduction-to-feeds/) · [Feeds configuration tool](https://developer.helloretail.com/guides/feeds/feeds_tool/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

## The XML feed breaks or values arrive with the wrong type

**Likely cause.** XML is converted to JSON internally; the converter cannot always tell text from a
number, and unescaped `&` or `<` in text break parsing.

**Fix.**

1. Short term: wrap free text in CDATA (`<![CDATA[ … ]]>`) so `&` and `<` are read as text.
2. Better: move the feed to JSONL (the preferred format) or JSON. The developer docs treat XML as
   deprecated for new feeds.
3. JSON requests are sent with `Accept: application/json` and expect `Content-Type:
   application/json; charset=utf-8`; JSONL uses `application/jsonl`, with pagination total in
   `X-Total`.

**Source:** [Data formats](https://developer.helloretail.com/guides/feeds/data_formats/) · [Feeds](https://developer.helloretail.com/guides/feeds/) · [Feed History](https://developer.helloretail.com/guides/feeds/feeds_history/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

> **May be outdated:** the support articles list JSON, XML and CSV as equal options, and the
> developer data-synchronisation page adds JSONL and CSV; the developer feeds overview names JSON and
> JSONL, XML "to some degree", and never CSV. Confirm CSV support before promising it.

## Our feed names a field differently from Hello Retail

**Likely cause.** Auto mapping only recognises keys that resemble native field names; a price under
`prices.defaultPrice` or a URL under `productLink` is not picked up as `price` or `url`.

**Fix.** Add a transform to the feed (**Data Setup → Feeds**, edit the feed) that maps the fields:

```javascript
function transform(product:any): TransformationResult {
    return {
        ...product,
        url: product.productLink,
        price: product.prices.defaultPrice,
        oldPrice: product.prices.originalPrice
    };
}
```

Keep the `...product` spread so the default fields still map.

**Check with.** `productData_get` on one product after a reparse; `dataFields_getProductFields` for
which fields now exist.

**Source:** [Parsing feeds using transform](https://developer.helloretail.com/guides/feeds/transform/) · [Auto Mapping](https://developer.helloretail.com/guides/feeds/auto_mapping/)

> **May be outdated:** field names differ between generations of the docs — the older support field
> list uses `previousPrice`, `priceNoTax` and `createdDate`, the developer pages use `oldPrice`,
> `priceExVat` and `created`. Check what the website's fields are actually called with
> `dataFields_getProductFields` before writing a transform.

## A custom attribute is missing or the run reports Invalid extraData property name

**Likely cause.** Fields that are not native are auto-mapped by type — string and boolean to
`extraData`, number to `extraDataNumber`, array to `extraDataList` — and a key that breaks the naming
rule is dropped.

**Fix.**

1. Keys in `extraData`, `extraDataNumber` and `extraDataList` must match `[a-zA-Z_][a-zA-Z0-9_]*`:
   no leading digit, no `-`, `.`, spaces or letters like `æ`. The product is still saved; only the
   key is dropped, and the run reports `Invalid extraData property name: {key}`.
2. Rename offending keys in the transform and `delete` the original key, otherwise the spread maps it
   again and the problem stays.
3. Use `extraDataNumber` for numbers you want as ranges or comparisons, `extraDataList` for string
   arrays.
4. Nested objects at root level are flattened before indexing; pick values out of them explicitly in
   the transform.

**Check with.** `feeds_getLatestRun` for the reported problems; `productData_getFieldValues` for the
values that arrived.

**Source:** [extraData in feeds](https://developer.helloretail.com/guides/feeds/extradata_in_feeds/) · [Auto Mapping](https://developer.helloretail.com/guides/feeds/auto_mapping/)

## We cannot filter or sort on a field

**Likely cause.** The field is not indexed. Some standard fields are always indexed, some can never
be, and custom fields must be ticked.

**Fix.**

1. Dashboard **Product Fields** page: tick the field in **Indexed** and **Save**, then confirm the
   full re-index in the dialog. Products pick up the change only as the re-index runs.
2. A field that cannot be un-ticked is **In use** by a Search (S) or Page design (P) for filtering or
   sorting — remove it there first.
3. Alternatively, a JSON / JSONL feed can declare filterable fields itself in a metadata object
   (`helloRetailMetaData` at the root of JSON, a first line with `"helloRetailMetaDataType":
   "FIELD_METADATA"` in JSONL). The setting is global across feeds of that type, so declare it in one
   feed only.

**Check with.** `dataFields_getProductFields` for indexed state; `productData_getReindexStatus` for the
re-index. Batch field changes, as described in
[when changes go live](../../onboarding/when-changes-go-live.md).

**Source:** [Website's Indexed product fields](https://support.helloretail.com/general-setup/websites-indexed-product-fields/) · [Data formats](https://developer.helloretail.com/guides/feeds/data_formats/)

## Every variant shows as a separate result or variants are missing

**Likely cause.** Product Grouping decides which products count as duplicates. The default groups on
`title` + `imgUrl`: variants with the same title and the same image collapse to one, variants with
their own image all show.

**Fix.**

1. Dashboard **Product Fields** page: select the fields to group on, **Save**. It takes effect almost
   immediately.
2. Group on `title` alone to show only the first of all same-named products; add other fields to group
   more finely.
3. If variants should not be shown at all, send only master products in the feed; if they should be
   searchable, send masters and variants. Empty master products inherit from the default variant;
   variants inherit missing fields from the master.

**Source:** [Website's Product Grouping](https://support.helloretail.com/general-setup/websites-product-grouping/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

## Products show no views or popularity looks wrong

**Likely cause.** Products are identified by URL, and tracking counts views and carts by URL. If the
feed's URL differs from the one shoppers see (redirects, rewrites, a database path instead of the
canonical), tracked behaviour never joins the product.

**Fix.**

1. The feed must carry the final on-site URL — the canonical one.
2. Shops with several URLs per product need a canonical tag pointing at the URL in the feed.
3. Categories and other metadata should match the on-site navigation, not the backend's internal
   structure.

**Check with.** `productData_get` for the stored `url`, compared with the canonical tag on the live
product page.

**Source:** [General Information on Feeds](https://developer.helloretail.com/guides/setup/data_synchronization/) · [Product data](https://developer.helloretail.com/guides/setup/data_synchronization/product_data/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

## The other language or currency shop shows wrong prices or texts

**Likely cause.** One Hello Retail website serves one currency and language; a single feed cannot
carry several.

**Fix.**

1. Set up one Hello Retail website per currency or language.
2. Give each its own feed, using shop variables on the feed URL such as
   `?language=en&currency=eur`.

**Check with.** `website_getInfo` per website; `feeds_get` for each feed URL.

**Source:** [General Information on Feeds](https://developer.helloretail.com/guides/setup/data_synchronization/) · [Setup and Data Synchronization Requirements](https://support.helloretail.com/general-setup/setup-and-data-synchronization-requirements/)

## Conversions are missing or orders are not attributed

**Likely cause.** No conversion tracking on the confirmation page, or it is malformed.

**Fix.**

1. Preferred: the JavaScript SDK conversion call on the receipt page.
2. Alternative: the HTML span in the confirmation template, rendered once per successful order and
   not repeated on reload:

   ```html
   <span class="addwish-conversion" style="display:none;"
         data-ordernumber="20323" data-total="6198.45" data-email="(optional)">
     <span class="addwish-product" data-url="(canonical url)"
           data-productnumber="(product number)" data-quantity="1"></span>
   </span>
   ```

3. `data-total` includes VAT and excludes shipping. Amounts: no currency symbol, dot decimal, no
   thousands separator. Each product needs `data-url` or `data-productnumber`; a per-unit price, if
   sent, is for one item.
4. Platform extensions do this for you — check the extension is active first.

**Check with.** `orders_list` for orders arriving; the API log on the `collect_*` endpoints (see
[diagnostics](../diagnostics.md)).

**Source:** [How to Supply Conversion Data](https://support.helloretail.com/general-setup/how-to-supply-conversion-data/)

## We want Hello Retail to learn from orders placed before the script was installed

**Likely cause.** Conversion tracking only sees orders from the day it went live.

**Fix.**

1. Export an order feed in CSV, JSON or XML. Per order: order number, total (incl. VAT, excl.
   shipping), date and time, the products and the customer's email; currency is recommended.
2. Per product: the product number (or the on-site URL), plus quantity and line total where possible
   — they make popularity and co-purchase data much sharper.
3. Nested (one order with a product list) or flat (one row per item, order total repeated on every
   row) both work; column names are mapped during setup.
4. Use the same order numbers as live conversion tracking, so the same order is not counted twice.

**Check with.** `orders_list` once the feed is loaded.

**Source:** [How to Supply Historical Order Data Through a Feed](https://support.helloretail.com/general-setup/how-to-supply-historical-order-data-through-a-feed/)

## We need an order feed set up or changed

**Likely cause.** Order feeds are not fully self-service in the feeds tool.

**Fix.**

1. The feed returns the last 2 to 3 days of orders by default and accepts `daysBack` (for example
   `?daysBack=90`) for older ones.
2. Required per order: `orderNumber`, `products`, `date`, `total`, `email`; optional `customerId` if the
   shop identifies customers by an id — it must match the id used in tracking. Per product: `url`,
   `productNumber`, `quantity`, `lineTotal`. A purchased variant is sent as the variant.
3. Send the feed URL to Hello Retail support, who set it up.

**Check with.** `feeds_list` for the order feed; `orders_list`.

**Source:** [Order data](https://developer.helloretail.com/guides/setup/data_synchronization/order_data/) · [Feed History](https://developer.helloretail.com/guides/feeds/feeds_history/)

> **May be outdated:** the order field names disagree — the support article lists `id`,
> `orderProducts`, `createdDate`, `price`, `priceNoTax`; the developer article lists `products`,
> `date`, `lineTotal`, and its own example uses `count` instead of `quantity`. The developer pages
> also say order, content and permission feeds are "still under development" in the feeds tool,
> while the support feeds article describes adding any of the four types. Ask support which applies.

## One product shows wrong data or must be hidden from one feature

**Likely cause.** The feed sent a wrong value, the AI-assigned cluster or tags are off, or the product
should not appear in a given feature.

**Fix.**

1. Dashboard **Product Lookup**: search the product by name, SKU, ID or URL and open it.
2. Switch on **Developer Mode** to see raw field names and the exact indexed feed values; the clock
   icon beside a field opens its changelog (previous and new values, and when).
3. Wrong value from the feed → fix it in the feed and re-sync; a missing value → it is missing from
   the feed.
4. Wrong cluster or tags → edit them in the Product Intelligence section; manual edits override the
   automatic ones everywhere until changed back.
5. Hide from one feature → **Product Settings** visibility toggles for Recommendations, Search,
   Pages, Trigger Emails, Newsletter Content, Product Agents and Personalized Banners. Turning off
   Product Agents excludes the product from every agent, overriding agent filters.

**Check with.** `productData_get` for the stored values; `productData_getReindexStatus` if a change
has not shown yet.

**Source:** [Product Lookup](https://support.helloretail.com/general-setup/product-lookup/)

## We cannot edit a feed that Hello Retail set up

**Likely cause.** Feeds created during onboarding before the current feeds tool are legacy, managed
feeds that only Hello Retail staff can edit.

**Fix.** The customer can still queue, archive and restore them and read their run history; for any
configuration change, contact Hello Retail support.

**Check with.** `feeds_list` / `feeds_get`.

**Source:** [Feeds configuration tool](https://developer.helloretail.com/guides/feeds/feeds_tool/)
