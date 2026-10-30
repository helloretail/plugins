---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-marketingplatform-permissions/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Auto sync of MarketingPlatform permissions"
description: "Set up automatic daily sync of MarketingPlatform permissions in Hello Retail, including API access, trusted token, and list selection steps."
tags: "Setup of Triggered Emails: MarketingPlatform"
---

# Auto sync of MarketingPlatform permissions

Use this guide to configure automatic synchronisation of permissions from your MarketingPlatform account.

1.  Get API access to your MarketingPlatform account. Create an API key and token by logging in to your MarketingPlatform account. After creating the credentials, contact MarketingPlatform support and ask them to mark the API key as a trusted token. Hello Retail can only use tokens that are marked as trusted. You can contact MarketingPlatform support at [support@marketingplatform.com](mailto:support@marketingplatform.com)
    _Remember to tell them it is for Hello Retail, as we require a unique access token._
2.  Once you have API access (API username and access token), navigate to **Data Setup** > **Permissions**, then click the **Set up automatic permission synchronisation** button:

3.  On the setup page, complete the fields:
    1.  In the **Type** drop-down, select MarketingPlatform.
    2.  Paste your API **username** and access **token** in their respective fields.
    3.  The **list** field loads your mailing/contact lists from your MarketingPlatform account. When loaded, select the list you want to synchronise.
    4.  Press **Save**

5.  Setup is complete. Permissions from the selected MarketingPlatform list will be synchronised automatically once per day.
