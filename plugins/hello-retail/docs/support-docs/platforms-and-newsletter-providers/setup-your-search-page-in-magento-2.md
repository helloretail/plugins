---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/setup-your-search-page-in-magento-2/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Set up your Search Page in Magento 2"
description: "Create a Magento 2 full search results page and enable Hello Retail Search. Configure page layout, content heading, and backend settings for go live."
tags: "Setup of Installation: Magento 2, Magento"
---

# Setup your Search Page in Magento 2

This guide shows how to set up your search in Magento 2 by creating a blank page and configuring the page layout and header.

It also covers how to enable and configure the search in the Hello Retail backend.

* * *

## Create a Blank Page for Magento 2

**The following section is only relevant for setups for a full search.**

Follow these steps to install your search results on a blank page in Magento 2:

1.  Log in to your Magento Admin. In the left-hand menu, go to **Content**.
2.  From **Content**, go to **Elements** > **Pages**.
3.  Click **Add New Page**.

Under the **Page Information** section:

-   Set the **Page Title** to “Search Results”.
-   Set the **URL Key** to “search-results”.
-   In **Store View**, select the store view where search results should be displayed.
-   Set **Status** to **Enabled**.

4.  Copy the **URL Key**. You will need it later for the steps described [here](setup-your-search-page-in-magento-2.md#enabling-the-search-page-in-the-hello-retail-backend).
5.  Click **Save and Continue Edit**.

* * *

## Choose the Page Layout

1.  In the page editor, open the **Design** tab.
2.  In **Page Layout**, select “**1 Column**” from the drop-down menu.

3.  Scroll to **Custom Design** and select the **Theme** and **Layout** used on your site.

### Enter a Heading for the Content (**e.g Search Results**)

1.  In the page editor, open the **Content** tab.
2.  In the **Content Heading** field, enter the main heading for the page, for example **Search Results**.

3.  Click **Save and Continue Edit**.

The Magento 2 page is now ready. Next, enable and configure the search in the Hello Retail backend.

* * *

## Enabling the Search Page in the Hello Retail Backend

1.  Log in to your Hello Retail account. In the left-hand menu, under **On-Site**, click **Search** to expand the menu.
2.  Click **Overview**.
3.  On the Overview page, click **Create New**.

4.  In the creation flow, select your search type: overlay, instant, or full search.
5.  In the **URL for your full search page** field, enter the **URL Key** you created in Magento (from the steps [here](setup-your-search-page-in-magento-2.md)).
6.  Save and activate the configuration. This publishes the search from draft to live, and it will render on the Magento 2 page you created.

* * *

## Configure Webshop

After installing your platform and completing the onboarding flow, make sure your webshop is configured. Read this guide to proceed:

[Configure Webshop](configure-webshop.md)
