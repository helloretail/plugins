---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/general-guide-for-hello-retail-integration-with-third-party-platforms/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "General Guide for Hello Retail Integration with Third-Party Platforms"
description: "Integrate Hello Retail with third-party platforms and SPAs. Learn API options, script setup, tracking, and reload handling for recommendations and search."
tags: ""
---

# General Guide for Hello Retail Integration with Third-Party Platforms

> **Note:**
>
> Hello Retail is not limited to the platforms with a native integration. The full, up-to-date guide for integrating any other platform, covering tracking, data synchronisation, and markup, is in our developer documentation: [Hello Retail Integration Guide](https://developer.helloretail.com/guides/setup/).

This guide explains how to integrate Hello Retail in headless and SPA setups with third-party platforms like Shopify and Norce.

Most platforms expose a storefront or checkout API to fetch product details for the current user context (language, currency, pricing).

If you use such a system, Hello Retail APIs can return the product IDs for a recommendation box or a search result. You then resolve full product data via your platform API and render your templates.

In addition to product integration, include the Hello Retail script and implement tracking.

To do this, follow this [guide](../general-setup/setup-for-tracking-requirements.md) and pay special attention to the section on SPAs (Single Page Applications) and calling the SDK reload method after route changes.

There are some options for integrating our elements on the webshops, and each of them has both advantages and disadvantages:

\- **API JSON**: This approach allows you to use our API to get the list of products to display for a given recommendation box or search query. The API response is a JSON array that includes product identifiers.

Use your platform's storefront or checkout API to fetch product data in the correct currency and language, then render HTML with your existing templates into the DOM (Document Object Model).

With this approach, you control most of the data handling, which gives you more control over output and behavior.

This approach is preferable since it lets you keep the logic and templates created for your existing elements and reuse them for our recommendations.

You can find more information about our API documentation [here](https://developer.helloretail.com/sdk/).

> **Note:**
>
> The API JSON approach has limitations for Newsletter Content and Triggered Emails. Email content must be pre-rendered and cannot fetch product data from your shop frontend. Plan a separate method for email content.

\- **API template**: This approach uses our API to get the list of products you need to display for a particular product box or a search query. The difference from the previous example is that you get a complete template back in the API response, ready to insert directly into the DOM.

The drawback is that the logic for showing prices, currencies, and languages must be embedded in that template, which can increase payload size, loading time, and template complexity.

It shifts some work from your end to ours. However, you lose some control, even if we aim to help you with design updates as quickly as we can.

\- **Selector-based auto insert**: This approach allows you only to add a `<div>` tag when and where you need our script to load the associated element. More information about the `<div>` tag you can find [here](../general-setup/how-to-add-product-recommendations-to-your-webshop.md).

This approach can be deemed a way of automatic fetching and inserting for the ''API template'' option.
