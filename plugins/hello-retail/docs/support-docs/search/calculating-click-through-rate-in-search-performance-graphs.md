---
source: support-docs
upstream: https://support.helloretail.com/search/calculating-click-through-rate-in-search-performance-graphs/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Calculating Click-through Rate in Search Performance Graphs"
description: "Learn how Hello Retail Search calculates click-through rate with 10-second refinement windows and deduplication of query expansions and abbreviations."
tags: "Tips and Tricks: Search"
---

# Calculating Click-through Rate in Search Performance Graphs

Click-through rate (CTR) in Hello Retail Search performance graphs is calculated as the total number of clicks divided by the number of counted searches. This page explains what counts as a search in this context.

To determine what counts as a search, Hello Retail groups rapid query refinements into a single search. If a user extends or abbreviates their previous query within 10 seconds, the system treats it as the same search and does not increment the search count.

The time window for this grouping is 10 seconds, measured from the user's previous query. If a user runs another query more than 10 seconds later, it starts a new search and is counted.

For example, if a user performs the following queries:

_lou_

_loung_

If the second query occurs more than 10 seconds after the first, both "lou" and "loung" are counted as separate searches.

Another example is:

_lou_

_loung_

_lou_

If each query occurs within 10 seconds of the one before it, they are counted as one search because they are refinements of the same intent.

This grouping provides a more accurate view of user behavior by counting distinct searches rather than each keystroke-level refinement. It reduces noise in the data and produces a CTR that better reflects meaningful search interactions.

## Filters, sorting and pagination

- **Filters and sorting:** changing a filter or the sort order runs the same query again. Within 10 seconds of the previous query this is part of the same search. More than 10 seconds later it counts as a new search.
- **Pagination and "load more":** loading further pages of results for the same query is never counted as a new search.
