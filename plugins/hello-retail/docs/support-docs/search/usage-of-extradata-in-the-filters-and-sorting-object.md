---
source: support-docs
upstream: https://support.helloretail.com/search/usage-of-extradata-in-the-filters-and-sorting-object/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Usage of extraData in the filters and sorting object"
description: "Use extraData to target specific filters and sorting in Hello Retail Search and Pages Liquid templates. Learn available fields and option properties."
tags: ""
---

# Usage of extraData in the filters and sorting object

## Using filters and sorting extraData in liquid

In Search and Pages templates, you can access filters and sorting. When you need to target a specific filter or sort parameter that comes from extraData, use the following syntax:

```javascript
filters["extraData.color"]
sorting["extraData.color"]
```

> **Note:**
>
> The key after extraData refers to a field from your product feed. You can reference any extraData field that exists in the feed.

This lets you render different output based on the specific filter or sorting parameter.

## Here is a list of printable variables within filters and sorting:

-   title — The display title configured for the filter, for example: Color

-   name — The variable name, for example: extraData.color

-   options — An array of options for the filter, for example: ["red", "green", "blue"]

## Under options each index has set of variables

-   title — The option display label

-   nestedTitle — The full hierarchical label when using nested options

-   depth — The hierarchy level as an integer

-   count — The number of results matching the option

All of the above applies only to Search and Pages templates.
