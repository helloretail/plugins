---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/how-to-reactivate-customers-who-havent-bought-in-a-while/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to reactivate customers who haven't bought in a while"
description: "Set up a post-conversion Triggered Email in Hello Retail to re-engage lapsed customers after 90-180 days with relevant products and correct algorithms."
tags: ""
---

# How to reactivate customers who haven't bought in a while

A good way to reactivate inactive customers is to send an email with relevant products if a customer hasn't purchased at your webshop for the last 90 days.

You can do this in Hello Retail using Triggered Emails. Follow these steps:

1. Start by creating a Triggered Email design for post-conversion. If you haven't done this before, follow this [guide](post-conversion-design-triggered-emails.md). Go to the next step once you have created the design.
2. Click on "Triggered Emails" in the menu and choose "Post-conversion".
3. Click "Create new trigger".
4. Enable the trigger.
5. Set "Send after" to the delay after the customer's last order. Avoid sending too soon; we recommend 90 to 180 days.
6. Choose a suitable title.
7. Ensure that "Send the post-conversion email even if the customer has placed another order in the meantime" is set to off. The email should only be sent if no new order was placed during the delay.
8. Choose a design and click "Next".

If you sell products that customers buy on a recurring basis such as consumer goods like coffee, shampoo, or pens, then use the following steps:

1. Delete the default steps in the algorithm.
2. In the drop-down "Add another step", choose the algorithm "Recently bought" and click "Save".

Otherwise choose the following steps:

1. Remove the step "Bought together".
2. Click "Save".

Ensure that the email trigger is enabled.

You have now added a post-conversion Triggered Email that will be sent to customers who haven't purchased at your website in a while. This campaign targets lapsed buyers.
