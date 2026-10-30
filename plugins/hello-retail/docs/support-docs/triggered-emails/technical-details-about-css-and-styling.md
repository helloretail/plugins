---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/technical-details-about-css-and-styling/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Technical details about CSS and styling"
description: "Guide to CSS in Hello Retail Triggered Emails, covering inlining from style blocks, media query handling, and using the important flag for responsiveness."
tags: ""
---

# Technical details about CSS and styling

> **Note:**
>
> - When Hello Retail sends the email, styles declared in a `<style>` block are automatically inlined into the HTML.
> - `@media` queries are not inlined. They remain in the `<style>` block. Within each `@media` rule, add `!important` to every declaration to override inlined styles in supported email clients.
