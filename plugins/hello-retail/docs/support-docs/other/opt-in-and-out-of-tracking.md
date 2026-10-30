---
source: support-docs
upstream: https://support.helloretail.com/other/opt-in-and-out-of-tracking/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Opt-in and -out of Tracking"
description: "Configure Hello Retail to respect consent by disabling tracking until opt in. Use trackingOptOut and setTrackingOptOut, with examples for Cookiebot, Cookie Information, and CookieYes."
tags: "Other: Cookies"
---

# Opt-in and -out of Tracking

Some countries require that you do not track users until they explicitly opt in. In those cases, set trackingOptOut before the Hello Retail script loads. When the user later consents, set trackingOptOut to false to enable tracking again.

When tracking is disabled, Hello Retail solutions still render, but they are not personalized.

### **Opt-out of all cookies**

To opt out of all Hello Retail cookies, set the opt-out parameter before our script loads. The default script snippet looks like this:

```html

```

Modify it like this:

```html

```

Set trackingOptOut to true to disable tracking. Because this is applied before the script loads, the Hello Retail SDK will not set any cookies.

You can find more information about cookie rules and GDPR [here](https://support.helloretail.com/other/gdpr-category/), as well as what [cookies](about-the-hello-retail-cookies.md) Hello Retail uses to provide a personalized shopping experience.

To disable tracking on load, add the following code just before `</head>` in your HTML. This requires a variable that reflects whether the user has consented to marketing cookies. In this example, the variable is named CONSENT_BOOLEAN.

```html

```

#### **Integration with cookie banners**

When the customer gives consent to be tracked, call the following JavaScript method:

```javascript
hrq = window.hrq || [];
hrq.push(["setTrackingOptOut", false]);
```

Hello Retail will then start personalizing the experience for the customer.

Below are examples for common consent tools.

### **Setup with CookieBot**

Add the following lines of code just above `</head>` in your HTML to prevent tracking before consent:

```html

```

Then add the following code just above `</body>` in your HTML:

```html

```

> **Note:**
>
> Use the consent category that matches your Cookiebot configuration. This example uses marketing.

### **Setup with [CookieInformation.com](https://intercom.help/cookie-information/en/articles/5444629-third-party-cookie-blocking#h_6bbe0f18ca)**

Add the following lines of code just above `</head>` in your HTML to prevent tracking before consent:

```html

```

Then add the following code just above `</body>` in your HTML:

```html

```

> **Note:**
>
> Use the consent category that matches your Cookie Information configuration. This example uses cookie_cat_marketing.

### **Setup with CookieYes**

Add the following lines of code just above `</head>` in your HTML to prevent tracking before consent:

```html

```

Then add the following code just above `</body>` in your HTML:

```html

```

> **Note:**
>
> Use the consent category that matches your CookieYes configuration. This example uses advertisement.
