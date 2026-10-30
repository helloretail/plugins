---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/centra-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Centra installation guide"
description: "Integrate Hello Retail with Centra. Learn required APIs, script insertion, implementation options, and tracking setup for recommendations, search, pages."
tags: "Article"
---

# Centra installation guide

Hello Retail can be integrated with the Centra ecommerce platform in a few different ways.

The basic question is whether you want full control by utilizing our API, or prefer a more fully managed solution.

Since Centra targets advanced merchants, we generally recommend taking as much control as possible and using our API. If in doubt, talk to your Hello Retail contact about the best approach for you.

Regardless of how we integrate, the following two headlines sum up the basic steps that need to be completed:

* * *

#### Synchronisation of orders, products, categories and content:

For Hello Retail to serve relevant content, we need data from your shop. Synchronization uses the Centra Checkout API for products, categories and content, and the Centra Order API for orders.

Hello Retail will need API credentials with read permissions and some additional information:

Centra Checkout API

- API token with read permission for products, pricelists and categories.
- URL or endpoint where the Checkout API for your store is available.

Centra Order API

- API token with read permission for orders and products.
- URL or endpoint where the Order API for your store is available.

General:

- Language ISO code for your store.
- Market ID for your store.

To set up an API in Centra, log in to your Centra admin and go to Store settings. Add plugins to your store from the available plugins list. Order API and Checkout API are in this list. After adding the API plugins, open their settings and configure the API key, permissions and restrictions.
Use a strong, randomly generated API key.
If you are unsure how to provide this, contact Centra support.

* * *

#### Insertion of the helloretail.js script:

To establish a connection between your shop and our system, include the helloretail.js script. The script must be present on all pages of your webshop except the order submit page. It must be present on the order confirmation page.

You can integrate the script by either inserting it at the bottom of the header or by using a tag manager such as Google Tag Manager:

```html

```
#### Different implementations of Hello Retail solutions on your shop:

When implementing our solutions on your Centra shop, choose one of the following approaches. You are selecting between ease of installation and control.

General info about Recommendations: [https://developer.helloretail.com/sdk/recoms/](https://developer.helloretail.com/sdk/recoms/)
General info about Search: [https://developer.helloretail.com/sdk/search/](https://developer.helloretail.com/sdk/search/)
General info about Pages: [https://developer.helloretail.com/sdk/pages/](https://developer.helloretail.com/sdk/pages/)

- API JSON: Use our API to fetch a list of products for a given recommendation box or search query. The response is JSON objects representing products. You render these with your own templates and logic and insert them into the DOM.
  This approach lets you combine our API response with session or user-specific data from the Centra Checkout API, such as translations, VAT based on geolocation and pricelists.
  It also supports a backend-driven integration for optimal frontend performance.
  Read these guides for this approach:
  - [https://developer.helloretail.com/api/recoms/](https://developer.helloretail.com/api/recoms/)
  - [https://developer.helloretail.com/api/search/](https://developer.helloretail.com/api/search/)
  - [https://developer.helloretail.com/api/pages/](https://developer.helloretail.com/api/pages/)

  If you prefer not to use the REST API in your backend, you can also use the SDK in the frontend:
  - [https://developer.helloretail.com/sdk/recoms/javascript_sdk/](https://developer.helloretail.com/sdk/recoms/javascript_sdk/)
  - [https://developer.helloretail.com/sdk/search/javascript_sdk/](https://developer.helloretail.com/sdk/search/javascript_sdk/)
  - [https://developer.helloretail.com/sdk/pages/javascript_sdk/](https://developer.helloretail.com/sdk/pages/javascript_sdk/)

- API template: Use our API to fetch pre-generated templates ready to insert into your DOM. This reduces control and can make session or user-specific handling harder (see API JSON notes above). Templates are configured in Hello Retail, so design changes require updates in our configuration. Read these guides for this approach:
  - [https://developer.helloretail.com/sdk/recoms/javascript_sdk/](https://developer.helloretail.com/sdk/recoms/javascript_sdk/)
  - [https://developer.helloretail.com/sdk/search/javascript_sdk/](https://developer.helloretail.com/sdk/search/javascript_sdk/)
  - [https://developer.helloretail.com/sdk/pages/javascript_sdk/](https://developer.helloretail.com/sdk/pages/javascript_sdk/)

- Auto-insert and placeholders: Do not call our API directly. Insert div elements in your DOM to indicate where Hello Retail elements should be injected. The helloretail.js script will handle API calls and inject results. This requires minimal effort but has the same limitations as the API template approach.
  Read more here:
  - [How to add product recommendation to your webshop](../general-setup/how-to-add-product-recommendations-to-your-webshop.md)
  For the Hello Retail Pages feature, use this guide:
  - [https://developer.helloretail.com/sdk/pages/spa_example/](https://developer.helloretail.com/sdk/pages/spa_example/)

Generally, we recommend the API JSON approach to retain maximum control and flexibility.

* * *

#### **Tracking of important events:**

We need to track placed orders, cart contents, page views and clicks. These events are required for Hello Retail to understand your shop and deliver relevant results.

Hello Retail supports both server-side and frontend tracking. If you use the JSON API approach above, we recommend server-side tracking. If you use the fully managed Auto-insert approach, frontend tracking is likely the best fit:

- Server-side tracking: Follow the instructions in our server-side tracking guide for detailed implementation steps and a full description of the approach:
  [https://developer.helloretail.com/guides/tracking/server_side_tracking/](https://developer.helloretail.com/guides/tracking/server_side_tracking/)
- Frontend tracking: Follow the instructions in our general tracking guide for detailed implementation steps: [link](../general-setup/setup-for-tracking-requirements.md)
  For view and click tracking, the script can handle these automatically. We recommend manual implementation for SPAs.
  Guide for manual view tracking:
  [https://developer.helloretail.com/sdk/tracking/view_tracking/](https://developer.helloretail.com/sdk/tracking/view_tracking/)
  Guide for manual click tracking:
  [https://developer.helloretail.com/sdk/tracking/click_tracking/](https://developer.helloretail.com/sdk/tracking/click_tracking/)

If you are working with a Single Page Application (SPA), call the .reload() function of helloretail.js when essential content changes if you rely on automatic view and click tracking. We recommend handling view and click events manually in SPAs to avoid the overhead of .reload().
Read more about page tracking and SPAs here:
[https://developer.helloretail.com/guides/spa/page_tracking_for_spa/](https://developer.helloretail.com/guides/spa/page_tracking_for_spa/)

> **Note:**
>
> Hello Retail Search does not provide translation or currency conversion. If queries or filters use languages or currencies not present in the indexed data, results may be incomplete. Use the API to build search and handle language or currency in your frontend.
