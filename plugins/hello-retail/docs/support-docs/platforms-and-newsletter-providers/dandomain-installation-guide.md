---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/dandomain-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "DanDomain Installation Guide"
description: "Install Hello Retail on DanDomain. Activate the app, add header and footer scripts, send the product feed, optional order data, and a search results page."
tags: "Setup of Installation: DanDomain Classic, DanDomain"
---

# DanDomain Installation Guide

## Activate the Hello Retail module in DanDomain Webshop

This guide explains how to install and configure Hello Retail for SmartWeb or DanDomain.

DanDomain and Hello Retail integrate via the official Hello Retail app, which makes installation quick.

* * *

## Install the Hello Retail App

1.  First, log in to your DanDomain Webshop admin account: [https://webshop.dandomain.dk](https://webshop-admin.scannet.dk/)
2.  In the left-hand menu, go to **Apps**, search for **Hello Retail**, and click the Hello Retail app.

3.  Click **Installer app.**

4.  Click **Indstillinger** to open the app settings. Configure as needed and click **Gem**.

After you click **Gem**, the Hello Retail app is installed. A few more steps need to be completed to finalize the setup.

* * *

## Insert Script in the Header and Footer

1.  In the Hello Retail app settings, copy the code snippet labeled as number 2 for the footer. The Hello Retail partner ID shown in the screenshot is not required.

2.  Insert the two code snippets: use number 1 in the header and number 2 in the footer.
3.  Go to **Webshop** in the left-hand menu and click **Design.**
4.  Click **Ret design** on the active design.

5.  Click on **Indsæt Javascript.
    **

6.  Paste the number 1 code snippet under **Sidens header.**
7.  Paste the number 2 code snippet under **Sidens indhold (bunden)** and click **Gem**.

* * *

## Add your Product Feed to Hello Retail

Send your product feed URL to Hello Retail Support: [support@helloretail.com](mailto:support@helloretail.com)

```none
https://YOUR_WEBSHOP_DOMAIN.mywebshop.io/framework/priceindex/?index=addwish
```

> **Important:**
>
> Replace YOUR_WEBSHOP_DOMAIN with your own webshop domain.

* * *

## Configure Webshop

After installing the app and completing onboarding, make sure your webshop is configured. Follow this guide:

[Configure Webshop](configure-webshop.md)

* * *

## Optional: Provide Historical Order Data

To improve Hello Retail recommendation quality from day one, you can export and share a historical order feed. Follow these steps:

Navigate to **Ordrer -> Alle ordrer** and click **Eksportér**.

Choose **Ordrer**, select **XML** format, and click **Næste**.

Select the following data to include:

-   Ordre - Generelt - **Total**
-   Ordre - Ordrelinjer - **Produkt id, Varenummer, Produkt titel, Variant titel, Diverse titel, Antal, Pris**
-   Ordre - Kundeoplysninger - **Kunde e-mail**

 ********

Filter by **Period** to include the last **two years**:

-   Check the radio button: **Efter periode.**
-   Set the **Start date** to two years back.

Click **Næste** when done.

Provide a name, for example **Hello Retail**, and click **Download**.

Send the exported file to [support@helloretail.com](mailto:support@helloretail.com). Hello Retail will upload the data to your account to accelerate recommendation training.

## Optional: Create a Blank Page for Search Results

**The following section applies only if you use Hello Retail Search with a dedicated results page.**

You’ll need to create a new page for Hello Retail to display search results to users.

Here’s how to create the new page in the site tree:

Navigate to **Webshop -> Sider** and click **Opret kategori**.

Give the category a suitable title and make sure it is hidden. Click **Gem**.

Navigate back to **Sider** and **create a new page** in the newly created category.

Configure the page as shown in the screenshot below. The page should be visible to all users but not listed in any navigation menus. Click **Gem** at the bottom.

The page is now created with the URL http://YOUR_WEBSHOP_DOMAIN/sogeresultater/ — verify that the page exists and is accessible by visiting the URL.

Once verified, send the URL to Hello Retail Support at [support@helloretail.com](mailto:support@helloretail.com) along with your shop name. The next section will also end with you sending information to Hello Retail, so you can include both in the same email.

* * *
