---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/remove-old-shopify-scripts/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Remove old Shopify scripts"
description: "Remove legacy Hello Retail Shopify scripts and switch to pixel tracking. Steps cover deleting code in theme.liquid and Checkout Additional scripts."
tags: ""
---

# Remove old Shopify scripts

Hello Retail has moved to pixel-based tracking for carts and conversions.
If you have a previous install, remove the legacy scripts from your store and then follow the new install guide.

* * *

## Removing the Hello Retail script:

Start by logging in to the Shopify admin for your store. If needed, use the login page: [shopify.com/login](https://www.shopify.com/login).

1.  In the Shopify admin, open the left-hand menu and click **Online Store.**

2.  From the submenu, click **Themes.**

3.  On the right-hand side, locate your live theme (for example, **Debut**) and click the **Actions** drop-down.

4.  From the drop-down menu, click **Edit code.**

5.  In the left-hand file tree, open the **Layout** folder and click **theme.liquid.** The code editor will open.

6.  In the editor, locate and remove the following code:

    > **Note:**
    >
    > If you do not find this snippet, your store may use an older integration. Remove any code referencing Hello Retail, Addwish, or awaddgift.

    ```html

    ```

7.  Click **Save** at the top of the editor.

* * *

## Removing the Hello Retail Conversion Script:

1.  While logged in as **Admin**, open the left-hand menu and click **Settings** at the bottom of the screen. The Settings panel opens.
2.  Click **Checkout**.

3.  Scroll to the **Order status page** section and locate the **Additional scripts** input field.

4.  Find and remove the following snippet from the **Additional scripts** field:

    ```html

    ```

    > **Note:**
    >
    > If you do not find a snippet here, your store may use an older integration. Remove any code referencing Hello Retail, Addwish, or awaddgift.

    > **Note:**
    >
    > If the field is grayed out, your store uses Shopify Checkout Extensibility. Additional scripts are no longer executed and can be ignored.

5.  Click **Save** at the top of the page.
