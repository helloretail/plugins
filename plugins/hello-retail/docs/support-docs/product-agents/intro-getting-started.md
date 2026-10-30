---
source: support-docs
upstream: https://support.helloretail.com/product-agents/intro-getting-started/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Intro & Getting Started"
description: "Learn what Product Agents are, what problems they solve, and when they are a good fit."
tags: "Product Agents"
---

# Intro & Getting Started

Product Agents help you automatically send relevant emails to your customers based on **product-level behavior**, not generic marketing rules.

Instead of manually building and maintaining complex flows, Product Agents continuously evaluate your product and order data to decide **who to contact, when, and with which product context**.

This article explains what Product Agents are, when they are a good fit, and what it takes to get started.

## What are Product Agents?

Product Agents are always-on agents that trigger personalized emails based on how customers interact with your products.

They look at signals such as:

- Products being purchased
- Products being viewed
- Products dropping in price

Based on these signals, Product Agents automatically determine:

- Which customers should receive an email
- When the email should be sent
- Which product or products to include
- What type of message is most relevant

All emails are sent through your existing email setup, such as Klaviyo, and respect your consent rules, frequency limits, and templates.

Product Agents are designed to work alongside your existing email marketing setup, not replace it.

## What problems do Product Agents solve?

Most email marketing tools rely on generic flows that treat all products the same.

This often leads to challenges such as:

- Reorder reminders sent too early or too late
- Price drop emails reaching customers without real intent
- Upsell emails that feel disconnected from the original purchase
- Increasingly complex flows that are hard to maintain as your catalog grows

Product Agents solve this by using **product intelligence** to make decisions at the individual product level.

As a result:

- Replenishment reminders are timed around real purchase behavior
- Price drop emails are sent only when there is clear buying intent
- Recommendations are tied to what the customer actually viewed or bought
- Messages are automatically skipped if they no longer make sense

This allows you to scale personalization without increasing operational complexity.

<!-- Spot: Agents Onboarding Animation from Hello Retail -->
<div id="ttspot122864343"></div>

## How Product Agents differ from Triggered Emails and Newsletter Content

### Compared to Triggered Emails

Traditional triggered emails rely on fixed rules, for example:

- “Send 30 days after purchase”
- “Send to everyone who viewed a product”

Product Agents go further by:

- Adapting timing based on the specific product
- Evaluating multiple possible messages at the same time
- Prioritizing which message is most relevant
- Skipping or postponing messages when customer behavior changes

This means you do not need to build and maintain separate flows for each product type or scenario.

### Compared to Newsletter Content

Newsletter campaigns are typically:

- Manually created
- Sent to large audiences
- Optimized for broad reach and announcements

Product Agents are:

- Automated
- Sent one-to-one
- Triggered by individual customer behavior

Many stores use both approaches together:

- Newsletters for promotions, launches, and announcements
- Product Agents for timely, product-specific follow-ups

## When Product Agents are a good fit

Product Agents work best if you:

- Sell products with repeat purchase or consideration cycles
- Have a broad or frequently changing catalog
- Want to increase retention revenue without building complex flows
- Already use an email service provider such as Klaviyo

They are especially effective for:

- Replenishment products
- Consideration-heavy products where timing matters
- Stores that want more automation without more manual work

## When Product Agents may not be the right fit

Product Agents may not be ideal if:

- You do not send promotional emails at all today
- Your catalog changes very rarely
- You rely only on manual, one-off campaigns
- Product and order data is not available

If you are unsure, you can still send test messages from within the product to evaluate the output safely before going live.

## Requirements before you start

To use Product Agents, you need the following in place.

### Technical requirements

- A supported shop platform connected to Hello Retail
- Product and order data available in Hello Retail
- The general Hello Retail Script running in your shop
- An email service provider, such as Klaviyo or a solid Webhook setup

### Currently Supported Shop Platforms

> **Free trial on Shopify:**
>
>
> Signing up for a free trial on your own is available for Shopify stores only. See [Self-Service Setup: Start Your Free Trial on Shopify](self-service.md). If you're already a Hello Retail customer, you can start a trial from Product Agents in Hello Retail on any of the platforms below. New customers on other platforms can [contact us](https://helloretail.com/contact/) to get started.

- [Magento 1](../platforms-and-newsletter-providers/magento-1-installation-guide.md)
- [Magento 2](../platforms-and-newsletter-providers/magento-2-installation-guide.md)
- [WooCommerce](../platforms-and-newsletter-providers/woocommerce-installation-guide.md)
- [Prestashop](../platforms-and-newsletter-providers/prestashop-installation-guide.md)
- [Smartweb / Wannafind / Hostedshop / Scannet](../platforms-and-newsletter-providers/smartweb-installation-guide.md)
- [DanDomain Classic](../platforms-and-newsletter-providers/dandomain-classic-installation-guide.md)
- [Shopify](../platforms-and-newsletter-providers/shopify-installation-guide.md)
- [Norce (Previously Jetshop)](../platforms-and-newsletter-providers/norce-installation-guide.md)
- [Jetshop Flight (SPA)](../platforms-and-newsletter-providers/norce-installation-guide.md)
- [Shoporama](../platforms-and-newsletter-providers/shoporama-installation-guide.md)
- [Starweb](../platforms-and-newsletter-providers/starweb-installation-guide.md)
- [Golden Planet / OpenBizBox](../platforms-and-newsletter-providers/golden-planet-openbizbox-installation-guide.md)
- [Shopware 6](../platforms-and-newsletter-providers/shopware-installation-guide.md)
- [Miva](../platforms-and-newsletter-providers/miva-merchant-installation-guide.md)
- Litium
- [Centra](../platforms-and-newsletter-providers/centra-installation-guide.md)
- [Lightspeed](../platforms-and-newsletter-providers/lightspeed-installation-guide.md)
- [Textalk (Abicart)](../platforms-and-newsletter-providers/abicart-textalk-installation-guide.md)

### Access requirements

- Access to your Klaviyo account
- Permission to create flows and edit templates
- An API key with the required permissions

## High-level onboarding flow

Getting started with Product Agents follows a clear sequence:

1. Connect your store
2. Install tracking
3. Connect your email channel, typically Klaviyo
4. Set up your flows and email template
5. Send a test message to verify setup
6. Activate one or more Product Agents

You can do the email setup yourself or with a partner. See [Self-service vs partner-assisted onboarding](#self-service-vs-partner-assisted-onboarding) below.

Once these steps are completed, Product Agents begin scheduling messages automatically.

Starting a free trial on Shopify? Follow [Self-Service Setup: Start Your Free Trial on Shopify](self-service.md), which walks you through every step in order.

## Self-service vs partner-assisted onboarding

### Self-service onboarding

Self-service onboarding is best if you:

- Manage Klaviyo yourself
- Are comfortable setting up flows and templates
- Want to get started quickly

The product guides you step by step through the setup process.

### Partner-assisted onboarding

Partner-assisted onboarding is best if you:

- Work with an agency or partner
- Prefer help with templates and setup
- Want a guided implementation

You can add a partner when you connect Klaviyo. At the start of the Product Agents onboarding, choose **Partner** and request a partner from the list.

## What “done” looks like

You are fully set up when:

- Your email channel is connected
- At least one Product Agent is enabled
- Test emails are delivered successfully
- You can see upcoming scheduled messages in the dashboard

At this point, Product Agents run automatically in the background and adapt as customer behavior changes.

## Referencing output fields in custom prompts

For each of the agents you are able to add a custom prompt. When writing a custom prompt, you can reference specific parts of the generated message by using their field names. This allows you to give precise instructions for individual sections of the email, for example adjusting, length, or wording of the subject line without affecting the body, or changing how recommended products are introduced.

Available output fields:

- `subject` – The email subject line
- `previewText` – The preview text shown in the inbox
- `headline` – The main headline inside the email body
- `body` – The main email content
- `callToAction` – Primary call-to-action text for the main product
- `otherProductsTitle` – Title for the recommended products section
- `otherProductsText` – Introductory text for the recommended products section
- `otherProductsCallToAction` – Call-to-action text for recommended products

## Activity Log

The Activity Log records all configuration changes made to your Product Agents setup, including who made the change, when it was made, and what the previous and new values were.

The log is read-only and cannot be edited or deleted. Use it to audit configuration history or understand how your setup has changed over time.

You can find the Activity Log under **Configuration → Activities** in the main menu. For a full overview of the Activities Log across Hello Retail, see [Activities Log](../general-setup/activities-log.md).

## Next step

Once you are familiar with the concept, the next step is to set up Product Agents with Klaviyo.

Continue with:
[Setting up Klaviyo](setting-up-klaviyo.md)
