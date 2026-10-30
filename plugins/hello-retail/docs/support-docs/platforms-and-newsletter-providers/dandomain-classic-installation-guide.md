---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/dandomain-classic-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "DanDomain Classic installation guide"
description: "Installation guide for Hello Retail on DanDomain Classic, including script setup, product and conversion data, and optional search page configuration."
tags: "Setup of Installation: DanDomain Classic, DanDomain"
---

# DanDomain Classic installation guide

## Installing the Hello Retail JavaScript

> **Note:**
>
> This guide is for DanDomain Classic. If you use the latest DanDomain platform, follow [this guide](dandomain-installation-guide.md).

Log in to the admin part of your DanDomain webshop. Navigate to **Indstillinger** > **Site**. Click the small edit icon _("Rediger")_ next to the webshop where you want to add the JavaScript:

Paste your Hello Retail JavaScript and cart tracking at the bottom of the **Kodefelt (head section)** field:

```html

```

Remember to save your changes.

* * *

## Make your product data available for Hello Retail

Expose product data to Hello Retail:

1. Navigate to **Indstillinger** > **Integration** and choose to add a new user _("Tilføj ny bruger")_:

2. Fill out the details as shown below and click **Gem** _(notat is optional)_:

3. Copy the generated API key before closing the window. It will be hidden once you close it:

4. Send the **API key** to Hello Retail along with your **site ID** and **webshop domain** (e.g. my-webshop.com).

    > **Note:**
    >
    > You can find your site ID under **Indstillinger** > **Site**:

## Make conversion data available to Hello Retail

Navigate to **Design** > **Tekster/Knapper**, then select the page **Bestil step 4 (Ordrebekræftelse)
**

Add the code below to the field called **Kodefelt**:

```html
<span class="addwish-conversion" style="display:none" data-total="[[AdWordsSubTotalInclVAT]]" data-ordernumber="[[OrderID]]" data-email="[[CUSTOMEREMAIL]]"></span>
```

Remember to **Save** your changes.

* * *

## Configure Webshop

After the installation and onboarding flow, configure your webshop. Follow this guide:

[Configure Webshop](configure-webshop.md)

* * *

## Optional: Create a blank search page

You may need a blank search page for the Full Search feature.

1. Navigate to **Design** > **Egne sider** > **Opret side**:

2. Create an "Indholdsside" with a relevant name, e.g. "Søgeresultater":

    Remember to **Save** the page.
3. After saving, scroll to the **Parameter** section to find the page URL:

    Share this URL with Hello Retail by emailing [support@helloretail.com](mailto:support@helloretail.com). The team will finalize the dynamic search setup.

    > **Note:**
    >
    > For user tracking compliance, review the cookie tracking documentation and configure consent accordingly: [Opt-in and out of tracking](../other/opt-in-and-out-of-tracking.md).
