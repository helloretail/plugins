---
source: support-docs
upstream: https://support.helloretail.com/pages/how-to-set-up-pages-for-dandomain-classic/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to Set Up Pages for DanDomain Classic"
description: "Set up Hello Retail Pages on DanDomain Classic. Install the JavaScript, enable raw JSON, and place the Pages container in the product list template."
tags: "General and Setup: Pages"
---

# How to Set Up Pages for DanDomain Classic

This guide explains how to set up Pages with the DanDomain Classic platform.

For an in-depth introduction to Pages read this guide [here](introduction-to-pages.md).

For the Pages API documentation check [here](https://apidocs.helloretail.com/pages/introduction-to-pages-api).

There are three integration methods for setting up Pages:

-   [Client-Side Integration](client-side-integration.md)
-   [API Integration (HTML Response)](api-integration-html-response.md)
-   [API Integration (JSON Response)](api-integration-json-response.md)

Each method has its own guide.

* * *

## Set up of Pages for DanDomain Classic

Follow these steps to set up Pages in DanDomain Classic.

> **Note:**
>
> The DanDomain Advanced Designer app must be installed before you continue. Pages requires access to the design templates provided by this app.

Installing the Hello Retail JavaScript with support for Pages

1.  Navigate to "Indstillinger -> Site" in your DanDomain Classic admin panel.
2.  Locate the webshop where you want to add the JavaScript and click the small edit icon

3.  Add the following JavaScript snippet. It should replace any previous Hello Retail JavaScript snippet you have installed:

```html

```

For _REPLACE_WITH_ID_OF_THE_PAGES_DIV_ replace it with the ID of the Pages container, which you can find under your Pages configuration.

4.  Click "Gem".

Now allow the script to use category IDs and detect the current site.

1.  Go to "Shopindstillinger -> Layout".
2.  Enable "Tillad Rss / rå XML visning".

To set the placement of the HTML snippet, and thereby the content of the category or brand page, follow the steps below:

1.  Navigate to "Design" and select "Egne sider".
2.  Click on the ProductList

3.  After clicking on the ProductList, locate the "Kilde" button within the text editor.

Below is an example of a file with the Pages snippet inserted. You can find the div you need to insert under your Pages configuration.

The design file on your end might look a bit different, depending on which customizations you have made to it.

Remember to save, and you are now done.
