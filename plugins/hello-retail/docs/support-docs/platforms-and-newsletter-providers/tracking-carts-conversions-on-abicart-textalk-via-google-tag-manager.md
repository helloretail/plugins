---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/tracking-carts-conversions-on-abicart-textalk-via-google-tag-manager/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Tracking Carts & Conversions on Abicart / Textalk via Google Tag Manager"
description: "Configure cart and conversion tracking on Abicart Textalk with Google Tag Manager. Define data layer variables, triggers, and Custom HTML tags for Hello Retail."
tags: "Setup of Installation: Abicart / Textalk"
---

# Tracking Carts & Conversions on Abicart / Textalk via Google Tag Manager

This guide explains how to track carts and conversions on the Abicart Textalk platform using Google Tag Manager.

**Step 1:** Ensure the following **User-Defined Variables** exist in GTM. Create each as a Data Layer Variable with the following "Name" and "Data Layer Variable Name":

1.  items
2.  value
3.  transaction\_id
4.  orderItem

**Step 2:** Create the following **Triggers** in GTM as Custom Event triggers with the exact "Event name":

1.  tws-article-added
2.  tws-purchase

**Step 3:** Add two **Tags** with "Tag type" set to "Custom HTML":

1.  Conversion tracking tag that uses the "tws-purchase" **Trigger** as the "Firing Triggers":

    **For Google Analytics 4**
    ```html

    ```

2.  Cart tracking tag that uses the "tws-article-added" **Trigger** as the "Firing Triggers":

    ```html

    ```

**Step 4:** Submit and publish your GTM container to make the changes live.
