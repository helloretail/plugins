---
source: support-docs
upstream: https://support.helloretail.com/general-setup/about-the-hello-retail-javascript/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "About the Hello Retail JavaScript"
description: "Learn how the Hello Retail JavaScript loads, runs asynchronously, uses CDN delivery and compression, and leverages browser caching to keep features fast."
tags: "General about Hello Retail"
---

# About the Hello Retail JavaScript

Hello Retail adds personalized product recommendations, Search, triggered emails, and newsletter content to your webshop. These features are initialized by adding the Hello Retail JavaScript to your site.

The script loads without blocking page rendering. It injects content efficiently and sends network requests asynchronously, so it does not delay the loading of your existing content.

The Hello Retail JavaScript and all subsequent requests are compressed to reduce transfer size. The script is served via a CDN (content delivery network) to provide low latency and high availability.

Browsers cache the script by URL. When a customer visits multiple sites that use the same Hello Retail script URL, the cached file can often be reused without downloading it again.
