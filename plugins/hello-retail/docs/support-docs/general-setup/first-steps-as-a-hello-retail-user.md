---
source: support-docs
upstream: https://support.helloretail.com/general-setup/first-steps-as-a-hello-retail-user/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "First Steps as a Hello Retail User"
description: "Set up Hello Retail. Create an account, install the JavaScript, provide product and conversion data, and enable search, recommendations and tracking."
tags: "General about Hello Retail"
---

# First Steps as a Hello Retail User

##  Getting Started with Hello Retail

In this guide, you can read and learn about how to get started on the Hello Retail platform and the first steps towards setting some of the main components up and running.

* * *

Once you've found your way to the Hello Retail website, you're only a few steps away from getting dynamic recommendations on your webshop - and much more. We get the best results when we work together, so if you follow the steps below, Hello Retail will have a great foundation to build something excellent for your site, making an impact that you can feel and see.

* * *

## Creating an Account

The very first thing to do is to create a business account [here](https://my.helloretail.com/company/signup.html). After you enter your company details, your Hello Retail user account is created. During onboarding, you will be prompted to add the Hello Retail JavaScript to your webshop, which is the next step below.

* * *

## Inserting the Hello Retail JavaScript

For Hello Retail to work, you must add our JavaScript to your webshop. The steps vary by platform but are straightforward.

We've made specific guides for a range of platforms:

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

If you can't find your platform on this list, please see a general guide [here](installing-the-javascript.md) instead.

> **Note:**
>
> If you use Magento and install the Hello Retail Magento extension, the next three steps (product data, conversion data, and empty page for search) are already completed.

Please also feel free to read more in-depth technical API documentation [here](https://developer.helloretail.com/).

* * *

## Data, Search & Recommendations

### Providing Product Data

Knowledge of the products on your webshop is crucial for Hello Retail to work. There are different ways to provide this data to Hello Retail. A routinely updated product feed is the ideal approach. You may already have one from a price comparison site. If not, most platforms make it easy to export one.

You can read all about setting up data feeds [here](setup-and-data-synchronization-requirements.md).

* * *

### Providing Conversion Data

Hello Retail relies on conversion data to learn what products are bought together and to measure performance. Send order data after checkout, including purchased products, quantities, and totals. You can provide this via a tracking script on the confirmation page or by exporting an order feed from your backend.

You can read all about setting up data feeds [here](setup-and-data-synchronization-requirements.md).

* * *

### Providing an Empty Page for Dynamic Search

To get Dynamic Search, we need an empty page on your shop where we can render the results. Creating an empty page is usually done in a few steps in the backend of your webshop platform. You can name the page anything you like, for example, "_example.com/searchresults_".

If you have an existing search page, we do not recommend using that, since the existing search will be visible shortly before our search loads.

* * *

### Inserting div's for Product Recommendation Placement

You control where Hello Retail places product recommendations by inserting dedicated "div" elements in your webshop HTML. Recommendations will render at the exact positions of these divs on your pages.

You can learn more about how to do it, and what a div actually is [here](how-to-add-product-recommendations-to-your-webshop.md).

* * *

### Development from localhost

If you are a developer, you can work from localhost and load data for the target webshop by adding its UUID parameter. This lets you develop and test locally against the live configuration and data.

To learn more, follow the [link](https://developer.helloretail.com/guides/troubleshooting/#forcing-a-specific-website).

* * *

### Talk to our Sales Team

We want to provide you with a solution you can be happy with - and from which you get results. We do that through a dialog with you so we can determine the design and general setup. Products recommendations are just one of our services - you can see them all [here](https://helloretail.com/).

* * *

### Watch your Revenue Rise

With Hello Retail implemented, customers are presented with relevant products such as related items, recently viewed items, and frequently bought together. This increases engagement and the likelihood of conversion. You can monitor performance in your Hello Retail business user account. The script is also trying to establish what [Google Analytics](google-analytics-events.md) account the webshop is using, and if it finds one, will send labels and events to that account.

* * *

If you have any questions about this guide, then please contact Support or your designated account manager about this.
