---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/lightspeed-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Lightspeed Installation Guide"
description: "Install Hello Retail on Lightspeed. Add the SDK, cart and conversion tracking, then connect product, category, and order APIs with Lightspeed credentials."
tags: "Setup of Installation: Lightspeed"
---

# Lightspeed Installation Guide

## Inserting the Hello Retail script + cart tracking

Log in to your Lightspeed Back Office and go to **Settings** > **Web extras**.

Insert the script in the CUSTOM JS section:

The script should be:

```html

```

* * *

## Inserting the Hello Retail conversion tracking

While still in **Settings** > **Web extras**, insert the conversion tracking in the TRACKING section.

The conversion tracking script should be

```html

```

Remember to **save** your changes.

* * *

## Make your data available to Hello Retail

Hello Retail supports API based feeds for products, categories, and orders. To enable these, you need an API key and API secret from Lightspeed.

If you are a new customer, you will be prompted to enter the API credentials in the onboarding flow when creating your webshop:

To get the API credentials, go to **Settings > Store Settings > Developers** in your Lightspeed Dashboard:

Click **New API Key** and give it a clear name, for example, Hello Retail API:

After saving, enable read permissions for **Content**, **Products**, and **Orders**. Click **Enable** and **Save**. Copy the **API Key** and **API Secret**, then paste them into the Hello Retail Dashboard as shown in the first image above.

For the **Language** field, enter the two-letter code that matches your storefront language or locale, for example:

- Dutch -> NL
- French -> FR
- Spanish -> ES
- German -> DE
- English (UK) -> EN
- English (US) -> US

For **Cluster**, EU customers should use **eu1**. US customers should use **us1**.

> **Note:**
>
> API access is not available on Lightspeed entry level plans. Contact your Lightspeed representative to enable API access or upgrade your plan.

* * *

## Configure Webshop

After the installation and onboarding, make sure your webshop is configured. Follow this guide:

[Configure Webshop](configure-webshop.md)
