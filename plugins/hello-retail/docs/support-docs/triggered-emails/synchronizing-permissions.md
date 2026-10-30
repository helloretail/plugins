---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/synchronizing-permissions/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Synchronizing Permissions"
description: "Synchronize and upload email marketing permissions to Hello Retail for Triggered Emails. Learn CSV format, import steps, and US opt-out behavior."
tags: ""
---

# Synchronizing Permissions

[sample-permission-list](https://support.helloretail.com/triggered-emails/assets/sample-permission-list.csv)

> **Note:**
>
> US businesses selling to US companies can enable Skip permissions when configuring a Triggered Email. When enabled, Hello Retail bypasses permission checks.

To allow Hello Retail to send emails to customers on your behalf, it's important to synchronize your email marketing permissions.

> **Note:**
>
> Synchronize your permissions regularly to keep them current. Up-to-date permissions improve eligibility and performance for Triggered Emails.

Here's a step-by-step guide on how to synchronize your permissions:

1.  Log in to your newsletter or email marketing provider (for example, Mailchimp) and export a CSV file with all permissioned email addresses.

2.  When the CSV file is ready, go to **Data Setup** > **Permissions** in Hello Retail and click **Choose file**. Select your CSV file from disk.

3.  Wait for the import to complete.

4.  After the import completes, review the status of the synchronized email permissions.

**CSV file format**
The CSV file must contain only valid email addresses, one email per line. No header row is required.

[Here's an example CSV-file](https://support.helloretail.com/triggered-emails/assets/sample-permission-list.csv).
