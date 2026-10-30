---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/changing-font-for-triggers/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Changing font for Triggers"
description: "Change fonts in Hello Retail Triggered Emails with Google Fonts. Insert the link tag, set the content_font variable, and configure fallbacks for clients."
tags: ""
---

# Changing font for Triggers

You can use a Google Font in your Triggered Emails. Not all email clients support web fonts. When a client does not support them, the email renders using the fallback font defined in your design.

To set up a font, follow the procedure below:

1\. First, search for a font you like [here](https://fonts.google.com/).

2. Then copy the link tag;

3. Next, navigate to the **Triggered Emails** section on your Dashboard and click on **Designs** in the dropdown menu;

4. Scroll down to the **Base designs** section and choose the base design you want to change the font for.

5. In the **Configuration** section, click **Edit source**.

6. In the **Design source** box, paste the link tag you copied into the `<head>` tag of the base design, and change the "_content\_font_" variable to the font family you added. Include a generic fallback, for example: Roboto, Arial, sans-serif.

7\. Save your changes by clicking **Save changes**.
