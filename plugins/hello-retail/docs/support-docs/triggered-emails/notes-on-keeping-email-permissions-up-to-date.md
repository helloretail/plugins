---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/notes-on-keeping-email-permissions-up-to-date/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Notes on keeping email permissions up-to-date"
description: "Keep email permissions current for Hello Retail Triggered Emails. Learn sync options, unsubscribe handling, and manual uploads to comply with consent rules."
tags: ""
---

# Notes on keeping email permissions up-to-date

Triggered emails such as post-purchase, cart abandonment, and price-drop messages can be valuable—but you must follow consent rules. As covered [here](../other/about-email-permission-consent.md), you may only send promotional emails to customers who have given explicit consent.

Hello Retail does not manage consent for you. Even though Triggered Emails are sent via Hello Retail, you must keep the email permissions stored in Hello Retail up to date. If the list is outdated, an automated email may be sent to a customer who has withdrawn consent. Ensure the permissions in Hello Retail always reflect each customer's current consent status.

### Auto synchronisation of email permissions

Your email service provider (ESP) typically stores consent for newsletters and marketing. Many ESPs support automatic synchronisation of email permissions to Hello Retail. We recommend enabling this synchronisation to keep your permission list current. You can see guides on how to set up permission synchronisation on an extensive list of platforms [here](https://support.helloretail.com/platforms-and-newsletter-providers/setup-of-triggered-emails-category/).

> **Note:**
>
> Synchronisation flows from your newsletter provider to Hello Retail only, not the other way. If a customer clicks unsubscribe in a promotional email sent via Hello Retail, that status is not sent back to your provider. Hello Retail keeps an internal list under Triggered Emails -> Settings -> Unsubscribed email addresses. You can download this list and use it to update your provider.

A better way to keep the list of unsubscribed customers updated is to redirect the unsubscribe link to your newsletter platform's unsubscribe form. That way, your provider's permission list is automatically updated, and Hello Retail will reflect those changes when the list is synchronised. You can configure the redirect under **Triggered Emails -> Settings -> Custom unsubscribe redirect.** We have an example of how to set it up with Mailchimp [here](../platforms-and-newsletter-providers/redirecting-to-your-mailchimp-unsubscribe-form.md).

### Manual upload of permission list

If you are not using the newsletter platforms listed [here](https://support.helloretail.com/platforms-and-newsletter-providers/setup-of-triggered-emails-category/), where you can synchronise the permission list automatically, you can upload a list manually. We have a guide on how to do that [here](synchronizing-permissions.md). If you do this, you are responsible for updating the list regularly to keep it current. Otherwise, you risk sending emails to customers who have withdrawn their permission since the last update.

**To be clear, the following scenario can happen:**

- A customer has given you permission, and you upload a list containing that customer to Hello Retail.
- The customer then withdraws the permission, but an updated list has not been uploaded to Hello Retail.
- Hello Retail will not be aware that the customer should not receive promotional emails.
- If the customer receives a promotional email, it will violate the current regulations, and you risk a fine.

If you upload permission lists manually, set a schedule or automatic reminder to upload an updated list regularly. We recommend using automatic permission synchronisation if possible.
