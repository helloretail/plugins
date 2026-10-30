---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/magento-1-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Magento 1 Installation Guide"
description: "Step-by-step guide to install, connect, and update the Hello Retail Magento 1 extension, including Magento Connect and FTP methods, tokens, and caching."
tags: "Setup of Installation: Magento, Magento"
---

# Magento 1 Installation Guide

[addwish-1.0.45.tgz](https://support.helloretail.com/platforms-and-newsletter-providers/assets/magento1/addwish-1.0.45.tgz)

## Install the Hello Retail Business Magento 1 Extension

This guide explains how to install the Hello Retail extension for Magento 1.

We recommend installing via Magento Connect Manager. You can also install manually via FTP if preferred.

> **Note:**
>
> - Back up your store (files and database) before installing or updating the extension.
> - PHP 8 and OpenMage are supported from extension version 1.0.38 and newer.
> - OpenMage 20 requires extension version 1.0.45 or newer.

* * *

## Steps -  Installing the Hello Retail extension via Magento Connect Manager:

1.  Download the Hello Retail extension directly from this link [Hello Retail extension package for Magento](https://support.helloretail.com/platforms-and-newsletter-providers/assets/magento1/addwish-1.0.45.tgz) _(newest version is 1.0.45)_

2.  Log in to your Magento Connect Manager admin account.

3.  In the Admin Panel, go to **System** > **Magento Connect** > **Magento Connect Manager**.

4.  Under **Direct package file upload**, click **Choose file**, select the downloaded package, then click **Upload**.

5.  After the package is uploaded, it appears on the page.

    > **Note:**
    >
    > Clear the maintenance mode checkbox before proceeding to avoid putting the storefront in maintenance mode.

    Click **Proceed**.

6.  A console output appears with status messages. When you see “Cache cleaned successfully,” the installation is complete.
    Refresh the page and click **Return to admin** in the top-right corner.

* * *

## Connecting the extension with your Hello Retail account

1.  In the Magento Admin, a new top menu item named **Hello Retail** appears after installation. Click it to open the configuration view.

2.  Under **Tracking Setup**, choose how cart and conversion tracking runs.
    In most setups, enable **Use Ajax** so tracking loads after page load, which works well with full page caching. In some environments, you may get better performance by disabling AJAX tracking.

3.  Under **Data Push Setup**, enter your Hello Retail Website ID.

    See how to locate your Website ID [here](../general-setup/hello-retail-api.md).

    When configured, the extension notifies Hello Retail on product create, update, and delete. Catalog changes are synchronized quickly.

4.  Under **Feed Access Restriction**, you can view your authorization token.
    All feeds require Bearer token authorization. Copy the token from the configuration and add it to your feed configuration in Hello Retail.
    If you have a managed feed, contact Hello Retail Support for assistance.
    See “Adding a request header to a feed” in the [feed configuration tool](https://developer.helloretail.com/guides/feeds/feeds_tool/) guide for instructions.

    To regenerate the token, click **Generate token**, then click **Save**.

* * *

## Updating Hello Retail extension - Magento 1

If you use the Hello Retail module on Magento 1, keep it updated to receive bug fixes and compatibility improvements as our services evolve.

> **Note:**
>
> The module name is displayed as "addwish business."

Updating the extension is a matter of uninstalling the old version and installing the new version.

As mentioned [here](#install-the-hello-retail-business-magento-1-extension), update the extension using the same method you originally used (Magento Connect or FTP).

There are two ways either through:

-   Magento Connect which is the general Magento extension installation platform or
-   via FTP where you manually place the relevant files in the Magento folders.

You need to perform the update through the same channel as you originally installed it.

### Updating through Magento Connect

The process to update the Hello Retail extension through Magento Connect is to uninstall the extension and then install the updated version.

#### Steps - Update the Hello Retail extension through Magento Connect

1.  Log in to your Magento account.
2.  Go to **System** > **Magento Connect** > **Magento Connect Manager**.

3.  Find the Hello Retail extension in the list (listed as "addwish"). Select **Uninstall** in the dropdown, then click **Commit Changes**.

    After uninstalling, install the updated version using the standard [installation process.](magento-1-installation-guide.md)

### Updating through FTP

If you originally installed the Magento 1 extension through FTP, update it the same way.

#### Steps - Update the Hello Retail extension through FTP

1.  Connect to the Magento 1 server via your FTP client.
    Replace the existing extension files with the updated files from the download. Use the folder structure in the package to locate the corresponding directories on your server.

2.  Clear Magento caches.
    In the Admin Panel, go to **System** > **Cache Management**, click **Flush Magento Cache**, then click **Flush Cache Storage**.

* * *

## Configure Webshop

After installation and onboarding, configure your webshop. Follow this guide:

[Configure Webshop](configure-webshop.md)
