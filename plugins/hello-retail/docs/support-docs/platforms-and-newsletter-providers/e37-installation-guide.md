---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/e37-installation-guide/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "E37 Installation Guide"
description: "Install Hello Retail on E37. Add JavaScript and cart tracking, share your product feed, add conversion tracking, and create a search results page."
tags: "Setup of Installation: E37"
---

# E37 Installation Guide

## Install the Hello Retail JavaScript and Cart Tracking

To enable Hello Retail on your E37 webshop, add the Hello Retail JavaScript and enable client-side scripts. The snippet initializes Hello Retail and tracks cart data using the E37 TC.Cart object.

1.  Log in to your [E37 admin panel](http://admin.e37.se/)
2.  Navigate to **Kontrollpanelen** > **Webbplats** > **Allmänt** > **Script**:
    1.  Tick the box **Aktivera JavaScript-objekt på klienten** and copy/paste your Hello Retail JavaScript into the **Script för spårning** field:

        ```html

        ```

Remember to **Save** your changes.

* * *

## Share your Product feed with Hello Retail

Share your product feed URL so Hello Retail can index your full catalog.

1.  Log in to your [E37 admin panel](http://admin.e37.se/)
2.  Navigate to **E-HANDEL** > **Exportfiler**:

3.  Next to the **Keybroker Product Feed**, click **Visa fil** to open the feed URL:

4.  Send the product feed URL to [support@helloretail.com](mailto:support@helloretail.com).

* * *

## Install the Hello Retail conversion span

To track conversions and sales performance and to improve on-site recommendations, add the Hello Retail conversion span.

1.  Log in to your [E37 admin panel](http://admin.e37.se/)
2.  Navigate to **Kontrollpanelen** > **Webbplats** > **Allmänt** > **Script**:

3.  In the field **Script för omvandlingsspårning i kassan**, paste the following code:

    ```html

    ```

Remember to **Save** your changes.

* * *

## Create a blank page for search results

Create a new page where Hello Retail can render search results.

1.  Log in to your [E37 admin panel](http://admin.e37.se/)
2.  Navigate to **WEBBPLATS** > **Sidor**:

3.  Choose **Add new page** _("Ny sida")_:

4.  Provide a name for this new page, for example **Search results**:

    Remember to **Save** _("Spara")_
5.  After the page is created, click it in the page list to **Edit**:

6.  When editing the page, set **Status** to **Dold** to hide it:

    Remember to **Save** _("Spara")_ your changes
7.  Send the URL of this new page to [support@helloretail.com](mailto:support@helloretail.com) so Hello Retail can finalize the dynamic search setup.

* * *

## Configure Webshop

After the installation setup of your platform and the onboarding flow, make sure to have your webshop configured. Read this guide here on how to do so:

[Configure Webshop](configure-webshop.md)
