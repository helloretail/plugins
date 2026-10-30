---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-active-campaign-permissions/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Auto sync of ActiveCampaign permissions"
description: "Configure automatic synchronisation of subscriber permissions from ActiveCampaign to Hello Retail using your API URL, API key, and selected list."
tags: "Setup of Triggered Emails: ActiveCampaign"
---

# Auto Sync of Active Campaign permissions

This guide explains how to automatically synchronise subscriber permissions from your ActiveCampaign account to Hello Retail.

**Step 1:** Generate or locate your API key in your ActiveCampaign account.

Log in to your ActiveCampaign account and go to: **Settings** > **Developer** > **API Access.**

Save your **API URL** and **API Key**. You will enter them in your Hello Retail account later.

_For a text guide on finding your API URL and API Key, see:_ [https://help.activecampaign.com/hc/en-us/articles/207317590-Getting-started-with-the-API](https://help.activecampaign.com/hc/en-us/articles/207317590-Getting-started-with-the-API)

**Step 2:** In Hello Retail, go to **Data Setup** > **Permissions**, then click **Set up automatic permission synchronisation**.

**Step 3:** Configure the connection:

1. Select ActiveCampaign in the **Type** drop-down.
2. Paste your ActiveCampaign **API-Key** value into the **API-Key** field, and paste your **API URL** into the **API domain** field without _http://_ or _https://_.
3. Select the list from your ActiveCampaign account that you want to sync in the **List** drop-down:

    Remember to click **Save**.

**Step 4:** The setup is complete. Hello Retail will synchronise permissions from the selected ActiveCampaign list on a daily basis.
