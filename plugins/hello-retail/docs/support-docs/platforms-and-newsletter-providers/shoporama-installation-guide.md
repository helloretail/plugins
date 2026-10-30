---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/shoporama-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Shoporama Installation Guide"
description: "Install Hello Retail on Shoporama. Add the script, handle cookie consent, share the product feed, create a search page, and set up an API key for tracking."
tags: "Setup of Installation: Shoporama"
---

# Shoporama Installation Guide

## Insert the Hello Retail script

The Hello Retail script connects to your webshop and tracks events required for Hello Retail features.

Place the code at the end of the body tag in the global.html file. Edit it via SFTP or use the Shoporama Theme Editor, if available, to create a new version of global.html that overrides the original while it exists.

You can find the Theme Editor under Settings. Click the three dots on the right, select Themes, then create a new theme containing only global.html.

This approach lets you revert instantly by deleting the override if needed.

Below are two examples:
- A base implementation for themes without cookie consent.
- An example for themes that implement cookie consent.

> **Note:**
>
> Cookie consent handling differs between themes. Use the example as a reference and have a developer validate consent behavior for your theme before deployment.

In both examples, no data is tracked if tracking is disabled for your webshop. Check this under Design -> Tracking -> Enable tracking in your shop.

Example without cookie consent:

```html

<{if $product}>
  <span
    class="addwish-product"
    style="display:none"
    data-price="<{$product->getPrice()|number_format:2:',':'.'}>"
    data-productnumber="<{product->getProductId()}>"
    data-url="<{product->getRemoteUrl()|escape}>"
    data-currency="<{$webshop->getCurrency()}>"
    data-instock="<{$product->getIsInStock()}>">
  </span>
<{/if}>
```

Example with cookie consent implemented:

```html

<{if $product}><span class="addwish-product" style="display:none" data-price="<{$product->getPrice()|number\_format:2:",":"."}>" data-productnumber="<{product->getProductId()}>" data-url="<{product->getRemoteUrl()|escape}>" data-currency="<{$webshop->getCurrency()}>" data-instock="<{$product->getIsInStock()}>"></span><{/if}>
```

* * *

## Share your Product feed with Hello Retail

To let Hello Retail index all products in your webshop, share your product feed URL.

Your default Shoporama product feed is available at: http://YOUR_WEBSHOP_DOMAIN/product-feed.xml

> **Note:**
>
> Replace YOUR_WEBSHOP_DOMAIN with your actual webshop domain.

* * *

## Add a blank search page

The following section is only relevant for setups using Hello Retail Search.

Follow these steps to create a new search results page:

**Step 1:** Log in to [Shoporama admin](https://www.shoporama.dk/admin/da/0/) and navigate to Statiske sider > Opret ny side:

**Step 2:** Choose a name for the blank search page, for example Search results:

Remember to Save.

> **Note:**
>
> In the default theme, new pages are added to navigation automatically. Remove the page from navigation if you do not want it visible.

**Step 3:** After saving, the page appears in the Pages list:

**Step 4:** Send the URL of the created search page to [support@helloretail.com](mailto:support@helloretail.com) so we can complete the setup.

* * *

## How to set up API for Shoporama

Log in to your Shoporama backend: [Shoporama admin](https://www.shoporama.dk/admin/da/0/).

**Step 1:** Open the API settings in your Shoporama backend.

Click the gear icon in the top-right corner as shown:

**** **Step 2:** In the Settings panel, click the three dots on the right and select API from the drop-down menu.

**Step 3**: Add a new API access entry for Hello Retail by clicking Tilføj adgang.

**Step 4**: Enter a recognizable name that indicates this API is for Hello Retail, for example Hello Retail. Click Save.

**Step 5**: Copy the API key and add it in your Hello Retail backend.

* * *

## Configure Webshop

After installing and completing the onboarding flow, configure your webshop settings in Hello Retail. See the guide:

[Configure Webshop](configure-webshop.md)
