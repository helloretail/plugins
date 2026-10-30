---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/abicart-textalk-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Abicart / Textalk Installation Guide"
description: "Guide to integrate Hello Retail with Abicart Textalk, including API key setup, JavaScript installation in the header, and GTM-based conversion tracking."
tags: "Setup of Installation: Abicart / Textalk"
---

# Abicart / Textalk Installation Guide

## Install the Abicart Integration

This guide explains how to install and integrate Hello Retail with Abicart.

Abicart can be integrated with Hello Retail by following the steps below.

* * *

## Share your Product Data via API Access

1. Start by logging in to your Abicart Admin account.
2. In the left menu, go to **Settings**, then click **Apps**.
3. In the **Apps** view, go to **API keys** and click **Edit** inside the box.

4. On the next page, click **Add** to create a new API key.

5. Check **Active**, enter a name such as Hello Retail, add a description such as Hello Retail API access, then click **Add**.

6. After adding, the new API key appears in the API key field. Copy this key.

7. In your Hello Retail account, enter the API key and your shop ID. The shop ID is shown in the top-left corner of your Abicart admin. Click **Verify API access**.

* * *

## Add the Hello Retail JavaScript

Add the Hello Retail JavaScript to enable features on your webshop, such as product recommendations.

The script must be placed in the header of your webshop. The exact code is shown in your Hello Retail account during this step.

> **Note:**
>
> Abicart stores require a custom Hello Retail JavaScript snippet. Contact Hello Retail support to have a store-specific script generated for your setup.

1. To edit the header, in the left menu go to **Store design**, then click **Themes**.
2. In **Themes**, click **Edit** on the active theme.

3. Under **Content**, click **Site header**.
4. Scroll to **Top bar custom content** and choose **Custom HTML** from the drop-down. A **Custom HTML** box appears.
5. Click the "**<>**" icon to edit the source code.

6. Paste the Hello Retail JavaScript into the **Source code** box and click **Ok**.

7. Click the green **Save** button at the top. In your Hello Retail account, click **Check JavaScript installation**. If it reports that the script is not loaded, open your webshop front page, reload it, and run the check again.

* * *

## Conversion Tracking

The last step is to provide Hello Retail with conversion data. This is done via Google Tag Manager. You need a [Google Tag Manager account](https://tagmanager.google.com/).

If you already have an account, follow [this guide](tracking-carts-conversions-on-abicart-textalk-via-google-tag-manager.md) to set up conversion tracking. Confirm the setup by clicking **Conversion tracking installed**.

* * *

## Configure Webshop

After completing platform installation and the onboarding flow, make sure your webshop is configured. Read this guide for details:

[Configure Webshop](configure-webshop.md)
