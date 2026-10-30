---
source: support-docs
upstream: https://support.helloretail.com/search/search-synonyms/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Search: Synonyms"
description: "Learn how to add and manage synonyms in Hello Retail Search, handle misspellings, and understand indexing, fields, and setup via statistics or menu."
tags: "Tips and Tricks: Search"
---

# Search: Synonyms

In this guide, you can read and learn about what synonyms in search are and how to utilize them.

* * *

## Synonyms

When visitors use Hello Retail search, their query terms are matched against product fields that are marked as _searchable_. You can configure this to some degree, but by default the fields are those shown under the search engine weights/priority here:

Sometimes a query will not match your data because of misspellings or different wording than what you use.

_Synonyms_ can help map these queries to the right results.

Hello Retail Search can handle many misspellings and still return relevant results. However, if you sell _sneakers_ and _hoodies_ and a visitor types _sneaks_ or _hoddy_, the engine might not return relevant results.

Synonyms help the search understand that a query for _hoddy_ should match products containing _hoodies_.

* * *

## How to Create Synonyms

There are two ways to add synonyms: from the search _statistics_ panel or directly from the _menu_.

### Top Searches without results:

Search queries that return no results are listed under this item:

From that list, you can add both Synonyms and Redirects for each search term, as shown in the screenshot above.

### Through menu item:

1.  Start by logging into your Hello Retail account. In the dashboard, open the left-hand menu. Under **On-site**, click **Search** to expand the drop-down.
2.  From the drop-down, click **Synonyms**.
3.  In this view, you can see the list of existing synonyms. If it is empty, click **Edit** to add synonyms.

4.  Enter the query term in the **Searching for** column and the product term it should match in **Matches products with**. The mapping is directional.
    **Example**: enter _hoddy_ in **Searching for** and _hoodie_ in **Matches products with.**
5.  Click **Save** when you are done adding synonyms.

* * *

## General Notes About Synonyms

-   Visitors may use English terms on a non-English site, or vice versa.
-   The target term must exist in your product data for the synonym to work. The data must be present in one or more of these fields: _Title_, _Description_, _Keywords_, or _Brand_.
-   Compound words are supported.
-   After you add a synonym, the system re-indexes products to include the new mapping. It can take some time before the synonym becomes active.
