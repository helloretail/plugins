---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/tracking-triggered-emails-in-google-analytics/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Tracking Triggered Emails in Google Analytics"
description: "Track Hello Retail Triggered Emails in Google Analytics with automatic UTM parameters. See sources, campaigns, and performance for each trigger."
tags: ""
---

# Tracking Triggered Emails in Google Analytics

Hello Retail automatically appends Google Analytics UTM parameters to links in Triggered Emails. This lets you attribute traffic and analyze sources and campaign performance in GA.

If you want to know how to view Hello Retail data in Google Analytics, then click [here](../general-setup/google-analytics-events.md).

All outbound links from Triggered Emails are appended with UTM parameters. Here's an overview of the parameters used:

| Trigger type | Source | Medium | Campaign |
| :--- | :--- | :--- | :--- |
| Abandoned cart | `helloretail` | `triggered-email` | `abandoned-cart-1`,<br>`abandoned-cart-2`,<br>`abandoned-cart-3` |
| Price drop | `helloretail` | `triggered-email` | `price-drop-1` |
| Post-conversion | `helloretail` | `triggered-email` | `post-conversion-1`,<br>`post-conversion-2`,<br>`post-conversion-3` |
