---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/prestashop-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "PrestaShop Installation Guide"
description: "Install and update the Hello Retail PrestaShop module. Includes upload, configuration, feed token setup, blank search page creation, and update steps."
tags: "Setup of Installation: PrestaShop"
---

# PrestaShop Installation Guide

[addwish-1.2.60](https://support.helloretail.com/platforms-and-newsletter-providers/assets/prestashop/addwish-1.2.60.zip)

## Install the Hello Retail PrestaShop Module

This guide shows how to install and configure the Hello Retail module for PrestaShop.

To integrate Hello Retail with your PrestaShop shop, follow the steps below.

The Hello Retail PrestaShop module supports versions 1.7, 8 and 9.

* * *

## Install the Hello Retail business module in PrestaShop

1.  Log in to your PrestaShop admin.
2.  From the Dashboard, go to **Modules**:

3.  In Modules, click **Upload a module**:

4.  Simply drag and drop the .ZIP file into it or browse and select the Hello Retail module ZIP file. You can click [here](https://support.helloretail.com/platforms-and-newsletter-providers/assets/prestashop/addwish-1.2.60.zip) to download the current version 1.2.60. The file is also attached in this guide.

5.  After the module installs, click **Configure** to open the configuration page:

* * *

#### Feeds authorization:

All feeds now require Bearer token authorization. Copy the authorization token from the module configuration and add it as a request header to your feed configurations in Hello Retail (Authorization: Bearer {token}).
If you have a managed feed, contact Hello Retail Support to have the header added.
See "Adding a request header to a feed" in the [feed configuration tool](https://developer.helloretail.com/guides/feeds/feeds_tool/) guide for instructions.

To regenerate the token, click the generate button, then click Save to store the new token.

* * *

## Adding a blank search page

The following section applies only to full Search setups.

### Steps - Create a new blank search page in PrestaShop

1.  If you are using _PrestaShop 1.6.\*:_ From the Dashboard, go to **Preferences**. In the menu, click **CMS.**
2.  In the CMS view, click **Add new CMS page**.

3.  If you are using _PrestaShop 1.7.\*:_ From the Dashboard, under Improve, go to **Design**. In the menu, click **Pages.**
4.  In the Pages view, click **Add new CMS page**:

5.  Create the page. Enter a relevant name in the **Meta title** field. Leave **Page content** empty. The **Friendly URL** field is generated automatically.

    > **Note:**
    >
    > PrestaShop auto-generates the Friendly URL for CMS pages. Leave Page content empty.

6.  Click **Save and preview** to save and preview the page.
7.  Send the URL of the blank search page to [support@helloretail.com](mailto:support@helloretail.com).

* * *

## Updating Hello Retail module - PrestaShop

If you use the Hello Retail module with your PrestaShop platform, keep it updated. Updates include bug fixes and service changes.

Updating the module consists of uninstalling the old version and installing the new one.

### Steps - Update the Hello Retail Module

1.  Log in to your PrestaShop admin.
2.  From the Dashboard, go to **Modules**, then **Modules and Services** to see the list of installed modules.

3.  In the list, locate the Hello Retail module. The module name is **addwish business**.

4.  Click **Configure**, then select **Uninstall** from the drop-down.

The module is now removed. Install the new module ZIP as you would for a fresh install.

You can find a complete guide for doing that [here](prestashop-installation-guide.md).

* * *

## Configure Webshop

After installation and onboarding, make sure your webshop is configured in Hello Retail. Read this guide to complete the configuration:

[Configure Webshop](configure-webshop.md)
