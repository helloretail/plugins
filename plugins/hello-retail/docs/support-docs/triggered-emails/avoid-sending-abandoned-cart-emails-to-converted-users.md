---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/avoid-sending-abandoned-cart-emails-to-converted-users/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Avoid sending abandoned cart emails to converted users"
description: "Prevent abandoned cart emails to customers who convert. Learn how Hello Retail clears carts on conversion and how to handle PSP redirects using setCart."
tags: ""
---

# Avoid sending abandoned cart emails to converted users

The Abandoned Cart trigger in Triggered Emails relies entirely on tracking visitor events during their visit _(session)_ on a webshop. For Abandoned Cart to work, tracking of [carts](how-to-set-up-cart-tracking.md) and all [conversions](../general-setup/how-to-supply-conversion-data.md) is essential.

As part of [cart tracking](how-to-set-up-cart-tracking.md), all visitor carts are tracked automatically. When a conversion is tracked, Hello Retail clears and resets the visitor's tracked cart. Because of this, you must track every order/conversion in your webshop, regardless of which payment option the shopper selects during checkout. Implement [conversion tracking](../general-setup/how-to-supply-conversion-data.md) on all receipt or thank-you pages (credit card, MobilePay, Klarna, ViaBill, PayPal, etc.).

If not all conversions are tracked, you risk sending abandoned cart emails to users who have completed an order, because Hello Retail will not know about the conversion.

Some alternative payment providers show the receipt on their own domain, which can make conversion tracking difficult.

We strongly recommend tracking every order/conversion. If that is not possible, you can use an alternative method. Be aware that this method can reduce the number of abandoned cart emails sent.

If you can't ensure [conversion tracking](../general-setup/how-to-supply-conversion-data.md) runs on all orders/conversions, implement a tracking hook at the last possible step of your checkout flow, before redirecting the user to the third-party payment provider where you cannot track the conversion. This ensures a [tracked cart](how-to-set-up-cart-tracking.md) is cleared before the redirect.

This is done by calling the Hello Retail tracking JavaScript SDK method called "setCart" and setting the cart to be empty. You can [learn more about this JavaScript SDK method here](https://developer.helloretail.com/sdk/tracking/cart_tracking/).
