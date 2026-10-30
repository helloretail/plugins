---
source: support-docs
upstream: https://support.helloretail.com/newsletter-content/newsletter-content-and-google-analytics-utm-parameters/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Newsletter Content and Google Analytics (UTM parameters)"
description: "Configure UTM parameters for Hello Retail Newsletter Content campaigns. Learn default source, medium, and campaign values and how to safely override them."
tags: "Google Analytics"
---

# Newsletter Content and Google Analytics (UTM parameters)

This guide explains how Hello Retail sets UTM parameters for Newsletter Content campaigns.

By default, Hello Retail adds UTM parameters to your Newsletter Content campaigns, whether you are using Manual, Rolling, or Auto campaigns.

* * *

## UTM Attributes

Newsletter Content campaigns apply the following UTM parameters to links:

| Parameter | Value |
| :--- | :--- |
| `source` | `helloretail` |
| `medium` | `email` |
| `campaign` | _"the actual id of the individual campaign"_ |

You can optionally override the `medium` and `campaign` parameters at the campaign level. The `source` parameter is fixed.

> **Note:**
>
> Do not override UTM parameters for Auto campaigns. Using a fixed campaign value makes all future auto-created campaigns share the same campaign identifier, which prevents distinguishing campaigns.

* * *

## Overwrite UTM Parameter

If needed, you can overwrite UTM parameters in the final step _(Code snippet)_ of the campaign creation process:

- Click the "UTM settings" button where you can overwrite the `medium` and `campaign` parameters:

- Remember to click the "Save" button to apply your changes.
