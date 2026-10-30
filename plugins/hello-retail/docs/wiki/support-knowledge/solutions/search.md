---
source: public-docs
verified: 2026-10-29
---

# Search — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Search](../../features/search/search.md), [search relevance and merchandising](../../features/search/search-relevance.md), [when a change reaches visitors](../../onboarding/when-changes-go-live.md), [review and testing](../../onboarding/review-and-testing.md), [Search cheat sheet](../../cheat-sheets/search/general.md), [script not loading](../script-not-loading.md)

| Symptom | Go to |
| --- | --- |
| A search returns no results | [No results](#a-search-term-returns-no-results) |
| A synonym was added but the search still finds nothing | [Synonym not working](#a-synonym-was-added-but-search-still-finds-nothing) |
| AI-Synonyms is on but zero-result searches remain, or AI results need marking | [AI-Synonyms](#ai-synonyms-is-on-but-zero-result-searches-remain) |
| A specific product must be first, or hidden, for one search term | [Pin or hide per term](#pin-or-hide-a-product-for-one-search-term) |
| The Edit fixed products and Edit removed products buttons are gone | [Fixed and removed products](#the-edit-fixed-products-and-edit-removed-products-buttons-are-gone) |
| A brand, category or sale products should rank higher or lower everywhere | [Global boosts](#a-brand-or-category-should-rank-higher-or-lower-in-every-search) |
| Multi-word searches return far too much or far too little | [Phrase settings](#multi-word-searches-return-too-much-or-too-little) |
| Searching a product number returns many products, or not the right one | [Product numbers](#searching-a-product-number-does-not-return-just-that-product) |
| Compound words do not match their parts | [Compound words](#compound-words-do-not-match-their-parts) |
| Out-of-stock products show in search, or should | [Out of stock](#out-of-stock-products-show-up-in-search-or-are-missing) |
| Filler words in a query spoil the results | [Stop words](#filler-words-in-a-query-spoil-the-results) |
| Customers searching for shipping or opening hours get products | [Redirects](#searches-for-shipping-or-opening-hours-show-products-instead-of-the-page) |
| A redirect is configured but search still shows results | [Redirect ignored](#a-redirect-is-configured-but-search-still-shows-results) |
| Personalized Search has no visible effect | [Personalization](#personalized-search-has-no-visible-effect) |
| A field is missing from the filter or sorting list, or they are in the wrong order | [Filters and sorting](#a-field-is-missing-from-the-filters-or-sorting-or-they-are-in-the-wrong-order) |
| One filter needs to render differently in the template | [Style one filter](#one-filter-needs-to-render-differently-in-the-template) |
| Nothing shows before typing, or the no-results view is empty | [Initial content](#nothing-shows-before-the-visitor-types-or-on-zero-results) |
| The mobile overlay does not open from the search field | [Trigger selector](#the-mobile-search-overlay-does-not-open-from-the-search-field) |
| Recent searches never appear in the overlay | [Recent searches](#recent-searches-never-appear-in-the-overlay) |
| Categories, pages or blog posts do not show in search | [Content](#categories-site-pages-or-blog-posts-do-not-show-in-search) |
| Search works for me but not for shoppers, or the panel will not open | [Draft and preview](#search-works-for-me-but-shoppers-do-not-see-it) |
| Search click-through rate or search counts look wrong | [Analytics](#search-click-through-rate-or-search-counts-look-wrong) |
| Search events do not show in Google Analytics | [Google Analytics](#search-events-do-not-show-in-google-analytics) |

## A search term returns no results

**Likely cause.** Search only matches fields marked searchable (by default title, description,
keywords and brand), so a query using different wording, a misspelling the typo tolerance does
not catch, or a value the catalog does not hold returns nothing.

**Fix.**

1. Find the term in **Search → Analytics → Top searches without results**; the table lets you add a
   synonym or a redirect for the term directly.
2. Otherwise add a synonym under **Search → Synonyms → Edit**: the visitor's word in
   **Searching for**, the word your products contain in **Matches products with**.
3. Consider turning on AI-Synonyms (see below) for the long tail.
4. If the term is a supplier, variant or EAN number, the fix is in the feed, not a synonym — see
   [making a field searchable](../../features/search/search-relevance.md).

**Check with.** `search_getTopSearchesWithoutResults` for the zero-result terms,
`search_listSynonyms` for what already exists, `productData_search` to confirm the target word is
in the product data.

**Source:** [Search: Synonyms](https://support.helloretail.com/search/search-synonyms/) · [Search Analytics](https://support.helloretail.com/search/search-analytics/)

## A synonym was added but search still finds nothing

**Likely cause.** The mapping is one-way and the target word must exist in the product data, in
title, description, keywords or brand. A synonym also only reaches visitors after the products are
re-indexed.

**Fix.**

1. Check the direction: the visitor's word goes in **Searching for**, the catalog's word in
   **Matches products with** (for example `hoddy` → `hoodie`).
2. Confirm the target word appears in one of the four searchable fields of the products that should
   match. If it does not, the synonym cannot match anything.
3. Wait for the re-index the save schedules before testing — see
   [when a change reaches visitors](../../onboarding/when-changes-go-live.md).

**Check with.** `search_listSynonyms`, `productData_getReindexStatus` (IDLE means the change is
indexed), `productData_search` for the target word.

**Source:** [Search: Synonyms](https://support.helloretail.com/search/search-synonyms/)

## AI-Synonyms is on but zero-result searches remain

**Likely cause.** AI-Synonyms works through a background queue, so new zero-result terms are
improved later, not at once, and some terms (serial numbers, words with no sensible alternative)
will never get a match. How the AI interprets terms cannot be configured.

**Fix.**

1. The setting is **Use AI-Synonyms** under **Search → Search Engines → Edit search settings**.
2. Add manual synonyms for the terms AI-Synonyms does not solve; it supplements them, it does not
   replace them.
3. To judge it, open the **Total Searches** view in Search Analytics, filter on
   **AI-synonym product** and sort by clicks.
4. If it does more harm than good, set it to **No**: previously added AI synonyms are then ignored.
5. To label AI-matched results, the design can read `suggestedProductStatus` (`NO_SUGGESTED`,
   `MIXED`, `ONLY_SUGGESTED`) and each product's `suggestedResult`. The mobile overlay base
   template has the texts `text_synonym_only_suggested` and `text_synonym_mixed` for this.

**Check with.** `search_getTopSearchesWithoutResults` over time; `search_getDesign` to see whether
the design uses `suggestedProductStatus`.

**Source:** [AI-Synonyms](https://support.helloretail.com/search/ai-synonyms/) · [Search templates](https://developer.helloretail.com/guides/templates/search/) · [Overlay mobile template](https://developer.helloretail.com/guides/templates/overlay/mobile/)

## Pin or hide a product for one search term

**Likely cause.** Ranking is automatic; per-term control needs a Search Word Boost (also called a
query rule).

**Fix.**

1. Go to **Search → Engines**, open the engine, and in the **Search Query Rules** card choose
   **Create Rule**.
2. Add one or more search terms, then use **Pin Product(s)** (drag to set the order),
   **Exclude Product(s)**, or **Boost by Attribute** (product engines only).
3. Save. The rule is live at once for every search configuration on that engine.
4. A pinned product stays pinned when it goes out of stock — review rules when the range changes.

**Check with.** `search_listQueryRules`; `search_getProductEngine` to see which configs the engine
serves (`usedByConfigKeys`).

**Source:** [Search Word Boosts](https://support.helloretail.com/search/search-word-boosts/)

> **May be outdated:** the article says terms are matched exactly as typed and suggests adding
> every variation; the field page [search relevance](../../features/search/search-relevance.md)
> records normalisation (case, whitespace), a trailing `*` prefix match, and at most one rule per
> query per engine. Follow the field page.

## The Edit fixed products and Edit removed products buttons are gone

**Likely cause.** Both were replaced by Search Word Boosts. Existing entries were migrated: fixed
products became pinned products, removed products became excluded products, for product and
content engines alike.

**Fix.**

1. Find the migrated rules under **Search → Engines → (engine) → Query Rules**.
2. Entries whose product or content URL had changed or been deleted were skipped in the migration.
   A backup of the old configuration exists; ask
   [Hello Retail support](https://support.helloretail.com/contact/) if a specific item must be
   recovered.

**Check with.** `search_listQueryRules`, `search_getProductEngineElevates`,
`search_getProductEngineExcludes`.

**Source:** [Fixed and Removed Products in Search (deprecated)](https://support.helloretail.com/search/fixed-and-removed-products-in-search/)

## A brand or category should rank higher or lower in every search

**Likely cause.** This is an engine-wide boost, not a per-term rule.

**Fix.**

1. Open **Search → Search Engines → (engine) → Edit search settings → Boosted Products**.
2. Pick a **Field** (for example `brand`, `hierarchies`, `isOnSale`), a **Value**, and a strength.
   A negative value buries.
3. Keep values at 1–2; higher values degrade relevance.
4. The engine is shared by every search surface on the website, so the change applies to all of
   them — read [search relevance](../../features/search/search-relevance.md) before editing.

**Check with.** `search_getProductEngineBoosts`; `productData_getFieldValues` for the exact
indexed value (a boost on a value that is not in the index does nothing).

**Source:** [Boosts & Personalized Search](https://support.helloretail.com/search/boosts-personalized-search/)

> **May be outdated:** the article says to allow up to five minutes before testing a boost; the
> field page [when a change reaches visitors](../../onboarding/when-changes-go-live.md) records
> engine edits as serving immediately. The article also names the menu **Search Engines** where
> newer articles say **Engines**.

## Multi-word searches return too much or too little

**Likely cause.** The engine's search phrase setting decides how the words in a query must match.

**Fix.**

1. Open **Search → Search Engines → Edit search settings → Search phrase settings**.
2. Choose between, from strictest to broadest: **Match full phrase**, **Match all words — exact
   match**, **Match all words — allow spelling mistakes**, **Match any word — exact match**,
   **Match any word — allow spelling mistakes**.
3. Too many unrelated results: move toward the "all words" options. Too few: move toward "any word"
   or the spelling-tolerant options.

**Check with.** `search_getProductEngine` — the MCP shows the same engine as ordered search steps;
see [search steps](../../features/search/search-relevance.md).

**Source:** [Search: Phrase Settings](https://support.helloretail.com/search/search-phrase-settings/)

## Searching a product number does not return just that product

**Likely cause.** Without the exact-number option a product number is matched like any other text.
Variant numbers that are not in the product data cannot match at all.

**Fix.**

1. Turn on **Stop if exact product number is found** in the phrase settings: an exact match then
   returns only that product.
2. If shoppers search variant or supplier numbers, add them to the product's `keywords` in the feed
   — see [making a field searchable](../../features/search/search-relevance.md).

**Check with.** `search_getProductEngine` (`exactProductNumberSearch`), `productData_get` for the
product's numbers and keywords.

**Source:** [Search: Phrase Settings](https://support.helloretail.com/search/search-phrase-settings/)

## Compound words do not match their parts

**Likely cause.** Compound-word splitting is off.

**Fix.**

1. Enable **Split compound words in search** in the engine's search settings. A compound is then
   also matched on its parts.
2. For single mismatches, a synonym is the narrower fix.

**Check with.** `search_getProductEngine`.

**Source:** [Search: Phrase Settings](https://support.helloretail.com/search/search-phrase-settings/) · [Configuring the Search Engine](https://support.helloretail.com/search/configuring-the-search-engine/)

## Out-of-stock products show up in search or are missing

**Likely cause.** The engine setting **Include products that are out of stock** decides this. A
product pinned by a Search Word Boost is shown whatever its stock.

**Fix.**

1. Set **Include products that are out of stock** in the engine's search settings.
2. Remove out-of-stock products from Search Word Boost pins by hand.
3. If stock looks wrong for one product, check the feed value before the setting.

**Check with.** `search_getProductEngine` (each step's `showOutOfStock`), `productData_get` for the
product's `inStock`.

**Source:** [Configuring the Search Engine](https://support.helloretail.com/search/configuring-the-search-engine/) · [Search Word Boosts](https://support.helloretail.com/search/search-word-boosts/)

## Filler words in a query spoil the results

**Likely cause.** Words that carry no product meaning are matched like any other word.

**Fix.**

1. Add them under **Search → Stop words → Edit**, confirming each with the green **+**.
2. Stop words are website-wide, so add only words that never matter for any product.

**Check with.** `search_listStopWords`.

**Source:** [Search: Stop Words](https://support.helloretail.com/search/search-stop-words/)

## Searches for shipping or opening hours show products instead of the page

**Likely cause.** Product search only matches products; information pages need a redirect (or a
content search engine).

**Fix.**

1. Go to **Search → Redirects → Add new redirect**, and enter a **Title**, the target **URL** and
   the **Search word(s)**.
2. Use `*` for variations: `open*` matches words starting with "open", a leading `*` matches the
   suffix, `*` on both sides matches anywhere in the query.
3. Do not redirect ordinary product queries.

**Check with.** `search_listRedirects`.

**Source:** [Search: Redirects](https://support.helloretail.com/search/search-redirects/)

## A redirect is configured but search still shows results

**Likely cause.** The redirect only fires if the design (or a custom frontend) asks for it and acts
on it. The JavaScript SDK returns no redirects by default, and the template has to navigate when
`redirects` is not empty.

**Fix.**

1. Managed design: confirm the design uses the `redirects` list or the `search_redirects` module —
   see "Add redirects in grid search" in the [Search cheat sheet](../../cheat-sheets/search/general.md).
2. Custom frontend on the JavaScript SDK: request redirects with
   `engine_options.redirects.current_count`; on the REST API, send the `redirects` setting.
3. Keep the redirect's tracking code (`trackingCode`, or `aw_source` in the URL) so the click is
   attributed.

**Check with.** `search_listRedirects`, `search_getDesign`.

**Source:** [Search templates](https://developer.helloretail.com/guides/templates/search/) · [Search JavaScript SDK](https://developer.helloretail.com/sdk/search/javascript_sdk/) · [Search REST API](https://developer.helloretail.com/api/search/)

## Personalized Search has no visible effect

**Likely cause.** Personalized Search is only on the Professional and Enterprise Search plans, and
it needs the visitor's own browsing history to act on.

**Fix.**

1. Open **Search → Search Engines → Edit search settings → User Personalized Settings**.
2. Choose the fields under **Fields** and set their weight with the slider; wait about a minute
   before testing.
3. Test with a browser that has browsed the relevant products; a fresh visitor sees no difference.
4. Fields the plan does not allow cannot be set — see [personalization](../../features/search/search-relevance.md).

**Source:** [Boosts & Personalized Search](https://support.helloretail.com/search/boosts-personalized-search/)

## A field is missing from the filters or sorting, or they are in the wrong order

**Likely cause.** A field only appears in the **Select filters** / **Select sorting** dropdown if it
is not already in the list and it is indexed.

**Fix.**

1. Open the search configuration and scroll to **Filters & Sorting**; toggle **Filters** or
   **Sorting** on and add the field.
2. If it is not offered, index it under **Data Setup → Product Fields** and wait for the re-index.
3. Drag the entries to change the order the template shows them in. The config change is saved as
   a draft and has to be published.
4. A JavaScript SDK integration returns at most 100 filter values per field by default; the SDK
   docs say to contact support to raise it.

**Check with.** `search_getFilters`, `search_getSorting`, `dataFields_getProductFields`,
`productData_getReindexStatus`.

**Source:** [Search: Filters & Sortings](https://support.helloretail.com/search/search-filters-sortings/) · [Search JavaScript SDK](https://developer.helloretail.com/sdk/search/javascript_sdk/)

## One filter needs to render differently in the template

**Likely cause.** By default every filter is rendered the same way: range filters with `asRange`,
`hierarchies` with `asList`, everything else with `asTagList`.

**Fix.**

1. Address the filter by name in the Liquid template, for an `extraData` field:

   ```liquid
   {{ filters["extraData.color"] | asTagList }}
   ```

2. Each filter has `title`, `name` and `options`; each option has `title`, `nestedTitle`, `depth`,
   `count`, `query` and `selected`.
3. The same syntax works in Pages templates.

**Check with.** `search_getDesign`.

**Source:** [Usage of extraData in filters and sorting](https://support.helloretail.com/search/usage-of-extradata-in-the-filters-and-sorting-object/) · [Search templates](https://developer.helloretail.com/guides/templates/search/)

## Nothing shows before the visitor types or on zero results

**Likely cause.** No Initial Content is configured on the search configuration. Initial content is
what fills the empty state and the zero-result state.

**Fix.**

1. Open **Search → Overview → (configuration)**, scroll to **Initial content** and choose
   **Add initial content**.
2. Set **Count**, **Title** and **Subtitle** (leave both blank for no heading) and a **Type** — one
   of the recommendation strategies.
3. Save; the configuration change is a draft until published.
4. A custom frontend on the REST API must send `returnInitialContent` to get it before typing; on
   zero results it is returned anyway.

**Check with.** `search_getInitialContent`.

**Source:** [Search: Initial Content](https://support.helloretail.com/search/search-initial-content/) · [Initial Content Strategies](https://support.helloretail.com/search/search-initial-content-strategies/) · [Search REST API](https://developer.helloretail.com/api/search/)

## The mobile search overlay does not open from the search field

**Likely cause.** The design's `trigger_selector` does not match the shop's search input.

**Fix.**

1. In the design's JavaScript, set `trigger_selector` to the selector of the element that should
   open the overlay. Several selectors (header and footer, for example) are allowed.
2. If it opens behind the shop's fixed header, see "Offset top" in the
   [Search cheat sheet](../../cheat-sheets/search/general.md).

**Check with.** `search_getDesign`; on the storefront, `document.querySelectorAll()` with the
selector must find the input.

**Source:** [Overlay mobile template](https://developer.helloretail.com/guides/templates/overlay/mobile/)

## Recent searches never appear in the overlay

**Likely cause.** A search is only stored as recent after the visitor clicks a product from its
results, or the option is off.

**Fix.**

1. Set `show_recent_searches = true` (and `recent_search_list_limit`) in the design's JavaScript.
2. Test by searching and then clicking a product.

**Check with.** `search_getDesign`.

**Source:** [Overlay mobile template](https://developer.helloretail.com/guides/templates/overlay/mobile/)

## Categories, site pages or blog posts do not show in search

**Likely cause.** Content search needs content data: each item needs a title and a unique URL.
Platform integrations supply categories at most; site pages, blog posts and brands always need a
feed or an upload. The search configuration also needs a content engine for the type.

**Fix.**

1. Supply the content under **Data Setup → Contents**: a recurring XML, CSV or JSON feed, a
   public Google Sheet with at least title and URL columns, or a manual CSV upload.
2. A manual upload replaces all existing content of that type. The CSV uses `;` and the fixed
   column order `title; url; hierarchy; searchable keywords; description`.
3. A category's hierarchy lists the full path including the category itself.
4. For a recurring feed, ask [Hello Retail support](https://support.helloretail.com/contact/) to
   schedule the fetch.

**Check with.** `contentData_getReindexStatus`, `dataFields_getContentFields`, `search_getDesign`
(the template's `content` map).

**Source:** [Supplying Content Data](https://support.helloretail.com/search/supplying-content-data/)

## Search works for me but shoppers do not see it

**Likely cause.** The search configuration is still a draft. While logged in you can preview drafts
through the on-site Hello Retail panel; shoppers only see the live configuration.

**Fix.**

1. Publish in the dashboard: **Search → Overview → (configuration)**, change the state from draft
   to live.
2. If the panel does not appear on the storefront, allow cross-site tracking and third-party
   cookies for the shop while testing, and make sure you are logged in.
3. The panel's **Show** toggle is a preview in your own session — see
   [review and testing](../../onboarding/review-and-testing.md).

**Check with.** `search_listConfigs` for the state of each configuration.

**Source:** [Review Overlay Search](https://support.helloretail.com/general-setup/review-overlay-search/) · [Review Grid & Full Search](https://support.helloretail.com/general-setup/review-grid-full-search/) · [Review List Search](https://support.helloretail.com/general-setup/review-list-search/)

> **May be outdated:** the overlay and grid review articles say clicking **Show** in the side
> panel makes the search live; the list-search article says **Make Live**. The field page
> [review and testing](../../onboarding/review-and-testing.md) records **Show** as a session-local
> preview that changes nothing for shoppers. Publish from the dashboard.

## Search click-through rate or search counts look wrong

**Likely cause.** Search counts group rapid refinements: a query that extends or shortens the
previous one within 10 seconds is the same search. A filter or sort change within 10 seconds is
also the same search; pagination and "load more" never count as a new search.

**Fix.**

1. Explain the counting rule before comparing with another tool's numbers.
2. Check the date range: Search Analytics shows the last 14 days by default.
3. Filter the performance graph on the right search configuration.

**Check with.** `search_getTopSearchesWithoutResults` for the zero-result side.

**Source:** [Calculating Click-through Rate in Search Performance Graphs](https://support.helloretail.com/search/calculating-click-through-rate-in-search-performance-graphs/) · [Search Analytics](https://support.helloretail.com/search/search-analytics/)

## Search events do not show in Google Analytics

**Likely cause.** The documented mapping is the classic event model (category Hello Retail, action
`Search` or `Click`, label the search type). In GA4 search interactions arrive as events with
parameters instead.

**Fix.**

1. Look for GA4 events with parameters rather than category, action and label.
2. For GA's own site-search report, give GA the query parameter your search URL uses.

**Source:** [Tracking Searches in Google Analytics](https://support.helloretail.com/search/tracking-searches-in-google-analytics/)

> **May be outdated:** the Site Search steps (**Admin → View → View Settings**) are for Universal
> Analytics, which has no views in GA4.
