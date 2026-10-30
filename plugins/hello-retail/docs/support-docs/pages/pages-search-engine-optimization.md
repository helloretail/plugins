---
source: support-docs
upstream: https://support.helloretail.com/pages/pages-search-engine-optimization/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Pages & Search Engine Optimization"
description: "Learn how Hello Retail Pages interacts with SEO, including Google crawling, rendering and indexing, plus options for server side rendering and resources."
tags: "General and Setup: Pages"
---

# Pages & Search Engine Optimization

This guide explains how Hello Retail Pages works with SEO. It covers how Google processes JavaScript content, what to expect during crawling, and when to use the Pages API for server-side rendering. It also links to resources on SEO and JavaScript.

* * *

## How Google Crawls the Pages & Content

Google can crawl and index pages that load content with JavaScript. For JavaScript-rendered content, Google adds an extra step to the traditional flow:

1.  Crawling
2.  Rendering
3.  Indexing

Using Pages does not block indexing or SEO. However, the first crawl may process the HTML without JavaScript. Google then renders the page with JavaScript in a later pass, which can delay when JavaScript content appears in the index.

If needed, you can use Hello Retail's Pages API to server-side render category pages. Read more here: [Introduction to Pages API](https://apidocs.helloretail.com/pages/introduction-to-pages-api) and [API Integration](api-integration-json-response.md).

* * *

## Example & Use Case

See how it works on [www.dpj.se](http://www.dpj.se), where Googlebot crawls with JavaScript enabled.

* * *

## 3rd party tools

If you use a 3rd party SEO or link building tool to verify performance, ensure JavaScript and AJAX rendering are enabled.

* * *

## Resources

### Schema

If you want to optimize SEO while using Pages, review [schema.org](https://schema.org/).

[Schema.org](http://Schema.org) is a shared vocabulary for structured data. Use it to add structured data to your pages so search engines can better understand the content and qualify it for rich results.

You can learn what schemas are [here](https://schema.org/docs/schemas.html) and view the full documentation [here](https://schema.org/docs/full.html).

### **More resources available to check out:**

-   Watch Google's JavaScript and SEO playlist [here](https://youtube.com/playlist?list=PLKoqnv2vTMUPOalM1zuWDP9OQl851WMM9).
-   Test how Google renders your page with this [tool](https://search.google.com/test/mobile-friendly).
-   Learn more about JavaScript SEO in [Google Search Central](https://developers.google.com/search/docs/advanced/javascript/javascript-seo-basics).
-   Articles on modern JavaScript crawling and async loading:
    -   [https://developers.google.com/search/blog/2015/10/deprecating-our-ajax-crawling-scheme](https://developers.google.com/search/blog/2015/10/deprecating-our-ajax-crawling-scheme)
    -   [https://www.semrush.com/blog/javascript-seo/#how-to-make-your-website%E2%80%99s-javascript-content-seo-friendly](https://www.semrush.com/blog/javascript-seo/#how-to-make-your-website%E2%80%99s-javascript-content-seo-friendly)
