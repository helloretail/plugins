---
source: support-docs
upstream: https://support.helloretail.com/general-setup/how-to-supply-conversion-data/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to Supply Conversion Data"
description: "Set up Hello Retail conversion tracking via JavaScript or an HTML span. Learn required fields and examples to record orders accurately."
tags: ""
---

# How to Supply Conversion Data

For Hello Retail to generate accurate product recommendations, you must supply conversion data.

This enables Hello Retail to measure performance and attribute when a click on a recommendation or a search result leads to a conversion. In the Hello Retail Admin, you can view this data in clear dashboards and graphs.

There are two ways to provide conversion data: via JavaScript or by inserting an HTML span in your webshop. In most cases, the JavaScript approach is easier to implement and more stable, so it is recommended.

## Conversion data via JavaScript

Use the JavaScript SDK to send conversion events. See the API documentation: [Conversion Tracking](https://developer.helloretail.com/sdk/tracking/conversion_tracking/).

* * *

## Alternative: conversion data via html span

The Hello Retail conversion span is a small snippet you paste into your website’s HTML. Add it to the HTML template of your checkout confirmation page — the page customers see after a successful purchase.

There are two spans you can use. The first provides the minimum required information:

- The order number (required)
- The total amount of the order, including VAT, excluding shipping (required)
- The email address of the customer (optional)

To provide extended information, add a nested span, which gives Hello Retail more product-level details for future recommendations:

- The canonical URL of each product
- The product number or ID of each product
- The quantity of each product in the order (optional)

* * *

## How do I add it to my website?

Paste the conversion span into the HTML template of your checkout confirmation page (the page customers see after completing an order). Render it only after a successful order. Ensure it is output once per order and not repeated on page reloads.

Here’s the code you need to copy and paste:
```html
<span
  class="addwish-conversion"
  style="display:none;"
  data-ordernumber="[The order number. Required]"
  data-total="[Total amount for the order, including VAT, excluding shipping. Required]"
  data-email="[Email address of the customer. Optional]">
</span>
```

To add the additional information you’ll need to add this section too. This is the nested inner span:
```html
<span
  class="addwish-product"
  data-url="[Absolute canonical url of the product. Required*]"
  data-productnumber="[Product number. Required*]"
  data-quantity="[The quantity of products. Optional]">
</span>
```

This nested inner section should be added underneath the first one but before the final closing `</span>` tag.

> **Note:**
>
> Replace all placeholder values in square brackets with actual values and remove the brackets. Use server-side templating to inject dynamic order and product data.

- If you do not want to include an optional attribute, remove the entire line.
- Prices must not include a currency code or symbol. Values are assumed to be in your shop’s default currency. Use a dot as the decimal separator and two decimal places, for example 12.50. Do not use thousands separators (write 12500.50, not 12,500.50).
- For the inner span, if you include product-level price attributes in your implementation, provide the unit price for a single item, even when multiple units are purchased.
- In the extended version, at least one of data-url or data-productnumber must be present for each product.

## Minimal example

Here’s an example including only the minimum required attributes:

```html
<span
  class="addwish-conversion"
  style="display:none;"
  data-ordernumber="20323"
  data-total="6198.45">
</span>
```

## Extended example

Here’s an example including all the available attributes:
```html
<span
  class="addwish-conversion"
  style="display:none;"
  data-ordernumber="20323"
  data-total="6198.45"
  data-email="customer@example.com"
>
  <span
    class="addwish-product"
    data-url="http://example.com/shop/UltraBlender-2000.html"
    data-productnumber="10-800-1234"
    data-quantity="1">
  </span>
  <span
    class="addwish-product"
    data-url="http://example.com/shop/NoFall-Solid.html"
    data-productnumber="8-304-9876"
    data-quantity="2">
  </span>
</span>
```

If you get stuck, contact our support team — we are happy to help.

* * *

## Submitting historical sales data via an order-feed:

Learn more about [how to share historical conversion data with Hello Retail](how-to-supply-historical-order-data-through-a-feed.md).
This helps build popularity data and co-purchase signals to improve recommendations and up-sell opportunities.
