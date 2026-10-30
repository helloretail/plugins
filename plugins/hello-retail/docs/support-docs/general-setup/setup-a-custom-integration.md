---
source: support-docs
upstream: https://support.helloretail.com/general-setup/setup-a-custom-integration/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Set up a custom integration"
description: "Technical guide for developers to build custom integrations with Hello Retail using JavaScript SDK or REST API, covering data feeds and tracking setup"
tags: ""
---

# Setup a custom integration

This guide is for developers who want to build a custom integration or extension with the Hello Retail platform. If you do not want to create a custom integration, consider our managed service or our supported extensions [here](https://support.helloretail.com//support.helloretail.com/).

_**Are you not a developer?**_       Please use our managed service or share this page with your developer.

* * *

There are two ways to create a custom integration with Hello Retail:

-   Using our [JavaScript](https://apidocs.helloretail.com/javascript-sdk-1) [SDK](https://apidocs.helloretail.com/javascript-sdk-1) [found here](https://apidocs.helloretail.com/javascript-sdk-1)
-   Using our [REST API found here](https://apidocs.helloretail.com/recommendations-rest-api).

If you want to render content server-side before serving it to users, use the REST API. If you want to render on the front end, use our SDK.

**However**, before you start coding using the SDK or API mentioned above there are two things you will have to look into first:

1.  How to send data to Hello Retail
2.  How to setup tracking

## 1\. How to send data to Hello Retail

For any Hello Retail product to work properly, we must receive your data first. We recommend sending data through feeds, which you can read about here: **[Guide to data synchronization](setup-and-data-synchronization-requirements.md)**

## 2\. How to setup tracking

Hello Retail products rely on analysis of customer behavior. This analysis is based on data from customer interactions with the shop, so it is crucial that tracking is set up correctly.

We strongly recommend using the script described in the article below. It ensures you receive the latest tracking updates and automatically handles the Hello Retail tracking cookie and transmission to our systems.

**[Guide to set up tracking on the webshop](setup-for-tracking-requirements.md)**
