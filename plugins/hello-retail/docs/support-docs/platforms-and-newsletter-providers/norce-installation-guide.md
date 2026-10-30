---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/norce-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Norce Installation Guide"
description: "Install Hello Retail on your Norce webshop. Add the JavaScript, enable cart and conversion tracking, and create a search results page for full Search."
tags: "Setup of Installation: Norce"
---

# Norce Installation Guide

## Install the Hello Retail JavaScript

To activate Hello Retail on your Norce webshop, add the Hello Retail JavaScript to all pages. Follow the steps below.

**Step 1:** Log in to your Norce admin panel.

**Step 2:** Navigate to **Inställningar** > **Scripthantering** and click Edit on "All pages".

**Step 3:** Tick the box **Inkludera skript för bodytaggen** and paste your Hello Retail JavaScript and the cart tracking snippet into the **Script i bodytaggen** field:

```html

```

Remember to **Save** your changes.

* * *

## Install the conversion tracking script

To generate accurate product recommendations, Hello Retail needs conversion data.

This also enables statistics and analytics on how personalization performs on your webshop.

While still in the **Scripthantering** section, follow the same steps as above, but select the **order confirmation** page and add the following script to the body section:

```html
<!-- Hello Retail conversion tracking -->

<!-- End Hello Retail conversion tracking -->
```

Remember to **Save** your changes.

* * *

## Create a blank page for search results

> **Note:**
>
> This section applies to the legacy Responsive Base platform only. For Jetshop Flight, contact Hello Retail Support. It is required only for full Search setups.

**Step 1:** Log in to your Norce admin panel.

**Step 2:** Navigate to **Sidor** > **Lista sidor**:

**Step 3:** Choose **Add new page** ("Skapa ny sida"):

**Step 4:** Provide a name for the new page, for example **Search results** or **Sökresultat**.
Also set a headline ("Huvudrubrik") and a title. To save the page, add temporary content ("Innehåll"). This content is replaced by Hello Retail Search when results are rendered. For example, use "Laddar sökresultat..." or a single dot.

**Step 5:** Click the link icon to show the page URL and copy it.

**Step 6:** Remember to **Save** ("Spara").

**Step 7:** Share this new page URL with Hello Retail so we can finalize the setup of dynamic Search.

* * *

## Configure Webshop

After the platform installation and onboarding, configure your webshop. Read this guide to complete the setup:

[Configure Webshop](configure-webshop.md)
