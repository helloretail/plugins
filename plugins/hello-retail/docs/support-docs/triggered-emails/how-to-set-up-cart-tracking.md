---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/how-to-set-up-cart-tracking/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to set up cart tracking"
description: "Enable Hello Retail to track cart contents for Abandoned Cart emails. Learn prerequisites and implement tracking via JavaScript or HTML spans."
tags: ""
---

# How to set up cart tracking

## Allow Hello Retail to track cart content

First, enable Hello Retail to track cart contents. This data is required to send personalized abandoned cart notifications as part of Triggered Emails. The emails can include the product image, title, price, and, if provided, a direct link back to the shopper’s cart.

Hello Retail must be correctly installed on your website before you set up abandoned cart notifications.

Correctly installed means you have:

1. added the Hello Retail JavaScript and verified that it runs. Find a guide [here](../general-setup/installing-the-javascript.md).
2. supplied product data by sharing your product feed URL or adding the Hello Retail product span. Find a guide [here](../general-setup/setup-and-data-synchronization-requirements.md).
3. provided conversion data by adding the Hello Retail conversion span. Find a guide [here](../general-setup/how-to-supply-conversion-data.md).

## How can I do this?

### a) JavaScript method

Find more information about cart tracking in the JavaScript SDK here: [https://developer.helloretail.com/sdk/tracking/cart\_tracking/](https://developer.helloretail.com/sdk/tracking/cart_tracking/)

### b) HTML-span

You can also add a span in the HTML of your storefront pages. The span allows Hello Retail to collect cart data every time a user views a page where the span is present. Place spans inside the body of your HTML (between `<body>` and `</body>`).

This is how the span looks, using product URLs as references to the products in the cart:

```html
<span class="addwish-cart" style="display:none" data-url="http://example.com/cart/id/789" data-total="150.50" data-email="customer@example.com">
  <span class="addwish-product" data-url="http://example.com/product/456.html">
  </span>
  <span class="addwish-product" data-url="http://example.com/product/2234.html">
  </span>
</span>
```

This is how the span looks, using product numbers as references to the products in the cart:

```html
<span class="addwish-cart" style="display:none" data-url="http://example.com/cart/id/789" data-total="150.50" data-email="customer@example.com">
  <span class="addwish-product" data-productnumber="p-456-2">
  </span>
  <span class="addwish-product" data-productnumber="p-2234">
  </span>
</span>
```

The first and last span tags are the root span. The spans inside are product spans.

- The data-url attribute in the root span is optional. If you have a URL that links directly back to the cart, include it to let users return to their cart from the email.
- The data-total attribute in the root span is required. Set it to the total value of the visitor's cart.

> **Note:**
>
> Format the total cart value using a dot as the decimal separator, for example 150.50.

- The data-email attribute in the root span is useful for abandoned cart emails. Use it to associate a known email with the cart, for example when the user is logged in.
- Inside the root span, include one product span for each product in the cart. If the cart is empty, include only the root span.
- In each product span, reference products by either URL or product number. If using the product URL, the data-url attribute must contain the canonical product URL. If using the product number, set data-productnumber to the product’s identifier.
