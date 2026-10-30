---
source: support-docs
upstream: https://support.helloretail.com/general-setup/how-to-supply-historical-order-data-through-a-feed/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to Supply Historical Order Data Through a Feed"
description: "Provide historical order data to Hello Retail via an order feed in CSV, JSON, or XML. Learn required fields, structure, and formatting for import."
tags: ""
---

# How to Supply Historical Order Data Through a Feed

The data in the [Hello Retail conversion span](how-to-supply-conversion-data.md) is captured when the Hello Retail script loads and the span is available on the page. If you want Hello Retail to use historical co-purchase data from before the script was installed, provide an order feed in CSV (.csv), JSON (.json), or XML (.xml) format.

## What to include for each order

- The order number (required)
- The total order value, including VAT and excluding shipping (required)
- The date and time of the purchase (required)
- A list of the products in the order (required)
- The customer's email address (required)
- The currency of the order (recommended)

## What to include for each product in the order

- The product number (SKU), required. If you cannot supply product numbers, use the product URL as it appears on your site
- The quantity bought (recommended)
- The line total: the amount paid for that quantity of the product, including VAT (recommended)

Quantity and line total are the two fields that lift a feed from usable to useful. With them, Hello Retail knows how much of each product sold and what it sold for, so popularity, co-purchase, and up-sell data all get sharper. Send them whenever your system can export them. The same fields are sent by live conversion tracking, so a feed that includes them lines up with the data collected from that point on.

If your system cannot export quantity or line total, a feed with only the required fields still works. See the minimum example at the end of this article.

## Structure

You can submit either:

- A nested structure where each order is one entity containing all order fields and a list of products, or
- A flat list where the order number is repeated once per purchased item. In this case, set the order total on every row to the total order value, not the line total.

Your tag or column names do not have to match the ones below. Tell us what each field is called in your export and we map it during setup.

## Formatting numbers

- Leave out currency codes and symbols in the amount fields. Supply the currency in its own field
- Use a dot as the decimal separator, for example 469.81
- Do not use thousands separators. Write 12500.50, not 12,500.50

## Recommended example

This is the structure to aim for. It includes quantity and line total for every product.

```xml
<orders>
  <order>
    <order_number>87345</order_number>
    <currency>DKK</currency>
    <total>997.17</total>
    <date>2026-08-21 08:27:53</date>
    <products>
      <item>
        <product_number>5732365453466</product_number>
        <product_url>https://example.com/shop/ultrablender-2000</product_url>
        <quantity>2</quantity>
        <line_total>469.81</line_total>
      </item>
      <item>
        <product_number>4773452312447</product_number>
        <product_url>https://example.com/shop/nofall-solid</product_url>
        <quantity>1</quantity>
        <line_total>527.36</line_total>
      </item>
    </products>
    <email>customer@example.com</email>
  </order>
</orders>
```

> **💡 Tips & Tricks**
>
> Use the same order numbers in the feed as the ones your live conversion tracking sends. Hello Retail needs them to match to recognise an order it already has, so the same purchase is not counted twice.

## Minimum example

Use this only if your system cannot export quantity or line total. Hello Retail can still learn which products were bought together, but not how many of each sold or what they sold for.

```xml
<orders>
  <order>
    <order_number>87345</order_number>
    <total>997.17</total>
    <date>2026-08-21 08:27:53</date>
    <products>
      <product_number>5732365453466</product_number>
      <product_number>4773452312447</product_number>
    </products>
    <email>customer@example.com</email>
  </order>
</orders>
```

If you get stuck, contact our support team, we are happy to help.
