---
source: support-docs
upstream: https://support.helloretail.com/newsletter-content/understanding-the-different-campaign-types/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Understanding the Different Campaign Types"
description: "Overview of Hello Retail newsletter campaign types: Auto, Rolling, and Manual. Learn how they work, platform support, and when to use each."
tags: "Newsletter Content - Getting Started"
---

# Understanding the Different Campaign Types

Hello Retail offers three types of newsletter campaigns. Each type provides a different level of automation and control. Choose the type that matches how much you want to manage content updates yourself. Availability depends on your newsletter platform.

1.  **Auto campaign:** a fully automated setup. After configuration, each newsletter send refreshes personalized content based on the latest browsing data.
2.  **Rolling campaign:** similar to Auto, but content is refreshed on a time-based schedule that you define, independent of individual newsletter sends. Also suitable for automated transactional emails.
3.  **Manual campaign:** a single-use instance of personalized content. Create a new manual campaign for each newsletter send.

You can create multiple campaigns of the same or different types.

* * *

### **Auto Campaign**

Auto campaign is a fully automated solution. Configure it once and it will refresh personalized content every time you send a new newsletter.

Auto campaign requires your newsletter platform to pass a unique campaign ID for each send. Hello Retail uses this ID to detect a new send, regenerate the content, and ensure it reflects the most recent customer browsing behavior. If your platform cannot provide a unique campaign ID per send, Auto campaign will not function correctly.

Currently supported platforms:

-   MailChimp
-   Campaign Monitor
-   Ubivox
-   Apsis
-   Bizwizard
-   Heyloyalty
-   Klaviyo
-   Nomiro
-   SmartFocus
-   Rule

Here's a guide on how to [set up your first Auto campaign configuration](set-up-an-auto-campaign-configuration.md).

* * *

### **Rolling Campaign**

Rolling campaign is similar to Auto campaign. You configure it once, and it refreshes personalized content automatically. Instead of relying on a unique campaign ID from your newsletter platform, you define a renewal period in Hello Retail. After that period elapses, content is refreshed.

For example, if you send newsletters weekly, set the renewal period to six days to ensure fresh content for each send. If you send another newsletter before the renewal period ends, recipients will see the same content as the previous send. Configure the renewal period to match your send schedule.

Because Rolling campaigns use a time trigger in Hello Retail, they are well suited for automated transactional emails such as order confirmations, shipping notifications, and password reset emails. Set the renewal period to match the expected frequency for each email type.

You can create multiple Rolling campaigns if you need different renewal periods for different emails.

Here's a guide on how to [set up your first Rolling campaign](set-up-a-rolling-campaign.md).

* * *

### **Manual Campaign**

Manual campaign is a one-time campaign designed for single use. The personalized content is fixed for that campaign and is not refreshed. Create a new manual campaign for each newsletter send.

Here's a guide on how to [create your first manual campaign](create-a-manual-campaign.md).
