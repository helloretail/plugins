---
source: support-docs
upstream: https://support.helloretail.com/general-setup/installing-the-javascript/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Installing the JavaScript"
description: "Install the Hello Retail JavaScript on your webshop. Learn where to find the tracking script, place it in the head, or deploy via extensions or GTM."
tags: "Article"
---

# Installing the JavaScript

After you sign up with Hello Retail, install the Hello Retail JavaScript on your webshop. This enables _Recommendations_, _Pages_, _Search_ and other content, and collects necessary data about your products and visitors.

There are two ways to do this.

1.  Using a webshop extension. See the platform-specific guides below.
2.  Manually installing the Hello Retail JavaScript or using Google Tag Manager. [Find a specific guide on how to add script through GTM here](how-to-set-up-google-tag-manager.md).

* * *

## Using a webshop extension

If you use one of the e-commerce platforms listed below, click the platform name to open the installation guide:

-   [Magento](../platforms-and-newsletter-providers/magento-1-installation-guide.md)
-   [Magento 2](../platforms-and-newsletter-providers/magento-2-installation-guide.md)
-   [Shopify](../platforms-and-newsletter-providers/shopify-installation-guide.md)
-   [WooCommerce](../platforms-and-newsletter-providers/woocommerce-installation-guide.md)
-   [SmartWeb](../platforms-and-newsletter-providers/smartweb-installation-guide.md)
-   [DanDomain](../platforms-and-newsletter-providers/dandomain-installation-guide.md)
-   [Prestashop](../platforms-and-newsletter-providers/prestashop-installation-guide.md)
-   [Golden Planet / OpenBizBox](../platforms-and-newsletter-providers/golden-planet-openbizbox-installation-guide.md)
-   [ScanNet Webshop](../platforms-and-newsletter-providers/scannet-installation-guide.md)
-   [Wannafind Webshop / Hostedshop](../platforms-and-newsletter-providers/wannafind-hostedshop-installation-guide.md)
-   [Starweb](../platforms-and-newsletter-providers/starweb-installation-guide.md)
-   [Shoporama](../platforms-and-newsletter-providers/shoporama-installation-guide.md)
-   [E37](../platforms-and-newsletter-providers/e37-installation-guide.md)
-   [Norce](../platforms-and-newsletter-providers/norce-installation-guide.md)
-   [Lightspeed](../platforms-and-newsletter-providers/lightspeed-installation-guide.md)
-   [Nordisk E-Handel](../platforms-and-newsletter-providers/nordisk-e-handel-installation-guide.md)
-   [Centra](../platforms-and-newsletter-providers/centra-installation-guide.md)

If your webshop platform is not listed, you can install the Hello Retail JavaScript manually by following the steps below.

* * *

## Manually installing the Hello Retail JavaScript
Note, that you can insert the script either *with* or *without* a specific website-UUID included.

If you copy the codesnippet from the Dashboard, as mentioned in the section below, it will *include* a UUID for that specific website. This ensures, that the configuration for that particular website is also the one Hello Retail is calling, when the script is loading, no matter where the script may be inserted.
Example: A snippet with UUID for the website https://www.someshop.dk will show the Recommendations and Search for *that* website, even though the snippet may be inserted on https://www.someshop.com and https://www.someshop.de
This is practical for when you need to manually *force* the script to serve a particular configuration when it loads.

As an alternative to this, you can insert the script *without* a website-UUID. In this scenario the script itself figures out what domain it is placed on, and will pull up the appropriate configuration, if one exists.
Example: A snippet with no UUID is inserted both on https://www.someshop.com and https://www.someshop.de. If a configuration for these 2 websites exist in Hello Retail, the script will make sure that the correct one is shown, based on the location of the script itself. This is practical when you may have multiple domains/languages, but only have one central place to edit the frontend for these languages.

### **Where can I find the JavaScript?**

Log in to the [Dashboard](https://my.helloretail.com/company/signin.html) for your account and navigate to Settings -> Tracking Script as shown below.

For a snippet without a specific website-UUID included, you can simply copy this snippet:
```html

```

### **Where should I paste the JavaScript?**

Place the JavaScript snippet inside the `<head>` tag in your webshop’s HTML template to load it as early as possible, using the *async* attribute. Templates vary, but insert the script in a global section to ensure that it is present on _all_ pages of your webshop, as opposed to only the checkout or front page.

* * *

### **What is JavaScript?**

JavaScript is code that runs in the browser to perform actions on a web page. You do not need to write or modify our snippet; copy and paste it into your site.

### **What Does the Hello Retail JavaScript Do?**

The Hello Retail JavaScript collects information about your products and visitors and sends it to Hello Retail. We process this data to generate relevant content such as product recommendations. The script then loads this content back into your webshop automatically according to your configuration. All of this happens asynchronously within milliseconds.

You can [read more about the Hello Retail JavaScript here](about-the-hello-retail-javascript.md).

* * *

If you have any questions about this guide, please contact Support or your designated account manager.
