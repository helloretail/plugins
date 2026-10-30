---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/wannafind-hostedshop-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Wannafind / Hostedshop Installation Guide"
description: "Install Hello Retail on Wannafind Hostedshop using the official app. Configure scripts, search results page, product feed, and export order history."
tags: "Setup of Installation: Wannafind / Hostedshop"
---

# Wannafind / Hostedshop Installation Guide

## Activate the Hello Retail module in Wannafind Webshop

Use the official Hello Retail app for Wannafind Hostedshop to install Hello Retail quickly. Follow the steps below to get started.

First, log in to your Wannafind Webshop admin account:

[https://webshop.dandomain.dk](https://webshop-admin.scannet.dk/)

### Install the Hello Retail app

Navigate to Apps, search for **Hello Retail**, and click the Hello Retail app.

Click **Installer app.**

Click **Indstillinger** to configure the app.

Insert your **Hello Retail partner ID** and click **Gem.**

The Hello Retail app is now installed and active. There are a few steps left to complete the setup. The next page from DanDomain summarizes these steps; detailed instructions are provided below.

### Insert script in the header

Copy the code snippet shown by the app to your clipboard.

Insert the code in the site header by navigating to **Webshop -> Design** and clicking **Ret design** on the active design.

Click **Indsæt Javascript**

****

Paste the code snippet under **Sidens header** and click **Gem**.

### Add your product-feed to Hello Retail

Send your product feed URL to Hello Retail support: [support@helloretail.com](mailto:support@helloretail.com)

https://YOUR_WEBSHOP_DOMAIN.mywebshop.io/framework/priceindex/?index=addwish

> **Note:**
>
> Replace YOUR_WEBSHOP_DOMAIN with your actual webshop domain.

## Create a blank page for search results

Create a dedicated page to display Hello Retail Search results.

To create this page in the site tree:

Navigate to **Webshop -> Sider** and click **Opret kategori**.

Give the category a suitable title and set it to hidden. Click **Gem**.

Navigate back to **Sider** and **create a new page** in the newly created category.

Configure the page as shown below. The page must be visible to all users but not listed in any navigation menus. Click **Gem** at the bottom.

The page is now created with the URL http://YOUR_WEBSHOP_DOMAIN/sogeresultater/ — verify that the page exists and is accessible by visiting the URL.

Once verified, send the URL to Hello Retail support: [support@helloretail.com](mailto:support@helloretail.com) along with the name of your shop. You can include this together with the information from the next section in the same email.

## Provide historical order data

To improve recommendation quality, provide a historical order feed for analysis. Follow these steps to export historical orders:

Navigate to **Ordrer -> Alle ordrer** and click **Eksportér**.

Choose **Ordrer**, select **XML** as the format, and click **Næste**.

Select the following fields:

- Ordre - Generelt - **Total**
- Ordre - Ordrelinjer - **Produkt id, Varenummer, Produkt titel, Variant titel, Diverse titel, Antal, Pris**
- Ordre - Kundeoplysninger - **Kunde e-mail**

 ****

Filter by **Period** to include the last **two years**:

- Select the radio button **Efter periode**
- Set the **Start date** to two years back

Click **Næste** when done.

Provide a name, for example **Hello Retail**, and click **Download**.

Send the exported file to [support@helloretail.com](mailto:support@helloretail.com). We will import the data to our system to enhance recommendation performance.

* * *

## Configure Webshop

After installing the app and completing onboarding, configure your webshop. Follow this guide:

[Configure Webshop](configure-webshop.md)
