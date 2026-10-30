---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/scannet-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "ScanNet Installation Guide"
description: "Install Hello Retail on ScanNet Webshop. Enable the app, add the script, send your product and order feeds, and create a search results page."
tags: "Setup of Installation: ScanNet"
---

# ScanNet Installation Guide

## Activate the Hello Retail module in ScanNet Webshop

Hello Retail integrates with ScanNet Webshop via the Hello Retail app. Follow the steps below to install and configure it.

First, log in to your ScanNet Webshop admin account: [https://webshop-admin.scannet.dk/](https://webshop-admin.scannet.dk/).

* * *

### Install the Hello Retail app

Navigate to **Apps**, search for **Hello Retail**, and click the Hello Retail app.

Click **Installer app**.

Click **Indstillinger** to start configuring the app.

The Hello Retail app is now installed and active. Complete the remaining steps below to finish the setup.

On the next page, ScanNet shows a checklist of what to do. The steps below cover the same process in detail.

* * *

### Insert script in the header

Copy the listed code snippet to your clipboard (Ctrl+C on Windows or Cmd+C on macOS):

Insert the code in the header by navigating to **Webshop -> Design** and clicking **Ret design** on the active design.

Click **Indsæt Javascript**.

****

Paste the code snippet under **Sidens header** and click **Gem**.

* * *

### Add your product-feed to Hello Retail

Please send your product feed URL to Hello Retail Support: [support@helloretail.com](mailto:support@helloretail.com)

```none
https://YOUR_WEBSHOP_DOMAIN.mywebshop.io/framework/priceindex/?index=addwish
```

> **Note:**
>
> Replace YOUR_WEBSHOP_DOMAIN with your ScanNet webshop domain.

* * *

## Create a blank page for search results

You need to create a new page so Hello Retail can render search results for users.

Here’s how to create this page in the site tree:

Navigate to **Webshop -> Sider** and click **Opret kategori**.

Give the category a suitable title and make sure it is hidden. Click **Gem**.

Navigate back to **Sider** and **create a new page** in the newly created category.

Configure the page as shown below. The page must be visible to all users but not listed in any navigation menus. Click **Gem** at the bottom.

The page is now created with the URL http://YOUR_WEBSHOP_DOMAIN/sogeresultater/. Verify the page exists by visiting the URL.

Once verified, send the URL to Hello Retail Support: [support@helloretail.com](mailto:support@helloretail.com), along with the name of your shop. The next section also ends with sending information to Hello Retail, so you can include both in the same email.

* * *

## Provide historical order data

To optimize Hello Retail recommendation algorithms, you can provide a historical order feed for analysis. Follow these steps to generate it:

Navigate to **Ordrer -> Alle ordrer** and click **Eksportér**.

Choose **Ordrer** and the format **XML**, then click **Næste**.

Select the following data to share with Hello Retail:

- Ordre - Generelt - **Total**
- Ordre - Ordrelinjer - **Produkt id, Varenummer, Produkt titel, Variant titel, Diverse titel, Antal, Pris**
- Ordre - Kundeoplysninger - **Kunde e-mail**

 ****

Select orders based on **Period**, reflecting the last **two years**:

- Check the radio button: **Efter periode.**
- Change the **Start date** to two years back.

Click **Næste** when done.

As the final step, provide a name, e.g., **Hello Retail**, and click **Download**.

Now, send this historical order feed to [support@helloretail.com](mailto:support@helloretail.com). We will upload the data to your account to accelerate training and improve recommendation relevance.

* * *

## Configure Webshop

After the installation and onboarding flow, make sure your webshop is configured. Read this guide for details:

[Configure Webshop](configure-webshop.md)
