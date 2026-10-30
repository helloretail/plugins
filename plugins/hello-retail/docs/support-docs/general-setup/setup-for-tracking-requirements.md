---
source: support-docs
upstream: https://support.helloretail.com/general-setup/setup-for-tracking-requirements/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Setup for Tracking Requirements"
description: "Technical setup guide to implement Hello Retail tracking on unsupported platforms, including script placement, SPA reload, cart and conversion tracking."
tags: ""
---

# Setup for Tracking Requirements

This guide is part of a general setup guide for unsupported platforms. Find the main page for the full general guide [here](manual-setup.md).

* * *

### **General tracking:**

The Hello Retail JavaScript must be present on all webshop pages. Insert the script in the head element for optimal load speed. If you are building an extension, ensure the extension adds this script globally.

```html

```

### **Single Page Applications:**

For Single Page Applications (SPA), call the script reload method whenever the route changes or other significant page content updates. Call it after the new content is available in the DOM.

```
hrq = window.hrq || [];
hrq.push("reload");
```

* * *

### **Conversion and cart tracking:**

The Hello Retail script handles most tracking automatically, but conversion and cart tracking require explicit implementation. You can either:
- Insert data spans in the DOM, or
- Use the JavaScript SDK

We recommend using the JavaScript SDK.

If you use the SDK, ensure the Hello Retail script has initialized before calling any API methods. See event binding guidance: [https://developer.helloretail.com/sdk/tracking/event_binding/](https://developer.helloretail.com/sdk/tracking/event_binding/). The conversion tracking page includes a working example.

**Conversion tracking specifics:**
Register conversions when an order is completed, typically on the order receipt or confirmation page.

- JS SDK: [https://developer.helloretail.com/sdk/tracking/conversion_tracking/](https://developer.helloretail.com/sdk/tracking/conversion_tracking/)

* * *

### **Cart tracking specifics:**

Track the cart whenever it changes, regardless of the page. Trigger updates on add to cart, remove from cart, and quantity changes. For simplicity, you may also update the cart on every page load.

If a variant product is added, the ProductData sent for the cart must reference that specific variant.

- JS SDK: [https://developer.helloretail.com/sdk/tracking/cart_tracking/](https://developer.helloretail.com/sdk/tracking/cart_tracking/)

* * *

### **Cart restore:**

The cart span supports a cart-url attribute, and the SDK accepts a url key in the data object. Use this to generate a unique restore URL for abandoned cart emails.

A common approach is to provide a cart restore endpoint in your extension that accepts product and quantity pairs, for example: [https://domain.com/cart/restore?x:y,x:y](https://domain.com/cart/restore?x:y,x:y), where x is the product id and y is the quantity. Depending on your platform, you may need to include variant or option ids as well.

You can implement any restore format as long as the URL and parameters allow the cart to be rebuilt reliably.

## Unsupported platforms:

### Guides

- [Tracking requirements](setup-for-tracking-requirements.md)
- [Markup insertion requirements](setup-markup-insertion-requirements.md)
- [Data synchronization requirements](setup-and-data-synchronization-requirements.md)

### Main page

- [Main page](manual-setup.md)
