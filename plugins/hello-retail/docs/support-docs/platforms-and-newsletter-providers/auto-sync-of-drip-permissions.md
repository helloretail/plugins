---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-drip-permissions/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Auto Sync of Drip permissions"
description: "Set up automatic daily synchronisation of email permissions from Drip to Hello Retail. Learn how to add your API key and optionally filter by tags or custom fields."
tags: "Setup of Triggered Emails: Drip"
---

# Auto Sync of Drip permissions

This guide explains how to automatically synchronise email permissions from your Drip account to Hello Retail.

**Step 1:** First, find or generate an **API token** in your Drip account. Please follow the guide to do so:

Log in to your Drip account here: [https://www.getdrip.com/signin](https://www.getdrip.com/signin) and navigate to: Click the **···** _(right next to your account name)_ > **User Settings**

Inside the **User Settings,** copy the **API Key** at the bottom of the page.

Now save the **API Key** you just copied, so you can enter it into your Hello Retail account later.

**Step 2:** Once you have your Drip **API Key**, navigate to **Data Setup** > **Permissions,** then click the **Set up automatic permission synchronisation** button within your Hello Retail account:

**Step 3:** As the next step, you'll have to:

1. Select Drip in the **Type** drop-down.
2. Paste your Drip **API Key** into the **API Key** field.
3. A list of Drip accounts accessible with that key will be generated. Select the Drip account you would like to synchronise permissions from.
4. If you want to filter which of your email addresses to synchronise as permissions, you can optionally do this by entering tags and/or custom fields. By default, **ALL** email addresses within the selected Drip account are synchronised as permissions.

**Optional Filters**

These filters are case sensitive. Enter tags and custom fields exactly as they are written in your Drip account.

**E.g.** you might have a Tag in Drip called "_first_name_". Then it should be entered as "_first_name_" and not as "_First_Name_". If this is not taken into consideration, the filter will not work properly.

**Filter by Tags**

For the tag filter, an email has to be associated with at least **one** tag to pass the filter.
Tags are entered in the field as a comma separated list (no space between):
tag1,tag2,tag3

**Filter by custom fields**

For the custom fields, an email has to have **all** fields with the correct value to pass the filter.
Custom fields are entered in the field as a comma separated list of key/value pairs (no space between):
field1=value1,field2=value2,field3=value3

Remember to click **Save**.

You are now done, and moving forward your Drip list permissions will automatically be synchronised on a daily basis.
