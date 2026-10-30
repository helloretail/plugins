---
source: support-docs
upstream: https://support.helloretail.com/product-agents/self-service/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Self-Service Setup: Start Your Free Trial on Shopify"
description: "Start a free Product Agents trial on Shopify, set up your store and Klaviyo in under an hour, and convert to a paid plan when you are ready."
tags: "Product Agents, Shopify, Billing"
---

# Self-Service Setup: Start Your Free Trial on Shopify

<!-- Slug referenced by in-app links and HubSpot emails. Do not rename. -->

# Self-Service Setup: Start Your Free Trial on Shopify

With the Product Agents free trial, you can set up Hello Retail on your Shopify store, connect Klaviyo and let your agents send real emails to your shoppers, without talking to sales first.

This article walks you through the whole trial in order: signing up, setting up your store, what happens during and after the trial, and how to convert to a paid plan. Where a step has its own guide, you'll find a link to it.

---

## What's included in the trial

- **14 days** of Product Agents
- **500 credits** to send emails to your shoppers
- **No card required** to start
- **One trial per company.** If you come back after your trial has ended, you pick a plan instead of starting a new trial

Your 14 days start as soon as your company is set up in Hello Retail. The trial ends when you reach day 14 or use all 500 credits, whichever comes first.

---

## Before you start

Make sure you have the following in place:

- **A Shopify store.** Signing up for the trial on your own is available for Shopify stores only
- **Access to your Shopify admin.** You must be the store owner, or have either the administrator or App Developer role for the Shopify organization
- **A Klaviyo account** with an API key, and permission to create flows and edit templates
- **A Klaviyo list or segment** that holds the shoppers who have given marketing consent. Product Agents only email shoppers in this list or segment

> **Headless or custom storefronts:**
>
>
> The self-service trial does not support headless or custom storefronts, because the tracking setup relies on your Shopify theme. If your store is headless, [contact us](https://helloretail.com/contact/) and we'll help you with the setup.

> **Selling in several markets?:**
>
>
> If you sell in several markets or languages, set up your most important market first. You can add the other markets afterwards.

---

## Sign up

1. **Create your account.** Sign up with Google, or with your email address and a password, and accept the terms
2. **Verify your email.** If you signed up with email, Hello Retail sends you a link. Open it to continue. If the email doesn't arrive, click **Resend email**
3. **Verify your phone number.** Enter your phone number and click **Send verification code**, then enter the code you receive by text message. The number is only used to confirm it's you
4. **Create your company.** Enter your company name and click **Create company**. Use the name your shoppers know you by, because it's shown to them in emails

Your trial is now running, and the welcome page shows what you'll do next. Click **Set up my first website**, enter your store's website address and click **Create webshop**.

> **Your store's domain is already in Hello Retail:**
>
>
> If you see a message that a website with this domain already exists, your store is already connected to a Hello Retail account. [Contact us](https://helloretail.com/contact/) and we'll help you get access.

---

## Set up in under an hour

Hello Retail guides you through each step in the product. Here is what to expect.

### 1. Connect Shopify (about 15 minutes)

Create a custom app in your Shopify Dev Dashboard and paste its Client ID and Secret into Hello Retail. Follow [Creating API credentials for Hello Retail](../platforms-and-newsletter-providers/shopify-installation-guide.md#creating-api-credentials-for-hello-retail).

If you don't have the right access in Shopify, Hello Retail gives you a message you can forward to a colleague who does.

### 2. Product sync (automatic)

Once your store is connected, Hello Retail syncs your products in the background. You can carry on with the next step while it finishes.

### 3. Install tracking (about 20 minutes)

Tracking lets Product Agents see which products your shoppers view, add to cart and buy. There are two parts:

- **Browse tracking:** two snippets you paste into your theme's `theme.liquid` file
- **Order and cart data:** a custom pixel you add under **Customer events** in your Shopify admin

Hello Retail shows you both snippets with your website ID already filled in, so copy them from the onboarding. For step-by-step instructions with images, see [Inserting the helloretail.js script](../platforms-and-newsletter-providers/shopify-installation-guide.md#inserting-the-helloretailjs-script) and [Inserting the Hello Retail tracking pixel](../platforms-and-newsletter-providers/shopify-installation-guide.md#inserting-the-hello-retail-tracking-pixel).

### 4. Connect Klaviyo and activate agents (about 15 minutes)

When your store is set up, click **Set up Product Agents** to connect Klaviyo. Hello Retail sets up your email template and a Klaviyo flow for each agent, and you choose which agents to set live. Follow [Setting up Klaviyo](setting-up-klaviyo.md).

If you'd rather have an agency or partner do this part, choose **Partner** at the start of the Product Agents onboarding and request a partner from the list.

---

## During your trial

A banner at the top of Hello Retail shows how many days and credits you have left.

- **Credits:** each email handed over to Klaviyo uses one credit. Test sends are free. See [Billing, Credits & Usage](billing-usage.md) for how credits work
- **Running out of credits:** if you use all 500 credits before day 14, your agents pause sending until you pick a plan
- **Credit notifications:** the credit usage emails described in [Billing, Credits & Usage](billing-usage.md#credit-usage-notifications) are not sent during the trial. Use the banner and the **Usage** tab to keep track instead
- **Auto-Overage and Manage Subscription:** these become available once you're on a paid plan

---

## When your trial ends

After day 14, your trial shows as ended and your agents stop sending. Hello Retail opens the option to pick a plan, and you can also open it from the banner at any time.

Messages that were already scheduled when the trial ended are kept, and you can still see them in Product Agents. They go out once you convert, so nothing is lost. Your setup is kept too, so you don't need to connect Shopify or Klaviyo again.

---

## Converting to a paid plan

You can convert at any time during the trial, or after it has ended. The person who signed up for the trial is the **Company Owner**, and only the Company Owner can pick a plan. Other users see a message asking them to contact the account owner.

To convert, click **Continue with Product Agents** in the banner. The flow has these steps:

1. **Your trial:** a summary of what your agents did during the trial
2. **Plan:** choose how many credits you need and your billing cycle
3. **Company details:** your VAT number, address and billing email, which appear on your invoices
4. **Payment:** enter your card details on a secure payment page
5. **Review agreement:** read your agreement and click **Accept agreement**

For plans and prices, see the [Product Agents pricing page](https://helloretail.com/en/product-agents/).

Good to know:

- Plans have a **three-month minimum term**
- Your card is charged when the invoice is issued, which happens the same day you accept the agreement
- Any unused trial credits carry over into your paid plan
- Prices exclude VAT. VAT may apply depending on your location and VAT registration.

Once you're on a paid plan, you can increase your commitment yourself. See [Upgrading Your Subscription](upgrading-your-subscription.md).

---

## Cancelling

To cancel or downgrade, contact your account manager, or [Hello Retail support](https://helloretail.com/contact/) if you don't have one. Cancellations follow the binding period in your agreement.

---

## Already a Hello Retail customer?

If your company already uses Hello Retail, you don't need to sign up again. Start the trial from your existing account. This works whichever shop platform you use:

1. Open **Product Agents** in Hello Retail
2. Click **Start free trial**
3. Click **Start trial** to confirm. Your 14 days start as soon as you confirm
4. Click **Get started** to connect Klaviyo and set up your agents. See [Setting up Klaviyo](setting-up-klaviyo.md)

Your company, website and tracking are already in place, so you go straight to the Klaviyo setup. The trial includes the same 500 credits, and the same rule of one trial per company applies.

---

## Common questions

### My store isn't on Shopify. Can I still try Product Agents?

Signing up on your own is for Shopify stores only. If you're already a Hello Retail customer, you can start a trial from your existing account, whichever platform you use. See [Already a Hello Retail customer?](#already-a-hello-retail-customer). Product Agents supports [many other platforms](intro-getting-started.md#currently-supported-shop-platforms), so if you're new to Hello Retail, [contact us](https://helloretail.com/contact/) to get started.

### My storefront is headless. Can I use the trial?

No. Headless and custom storefronts can't complete the tracking setup in the self-service trial. [Contact us](https://helloretail.com/contact/) to discuss your setup.

### Can I start a second trial?

No. Each company can have one trial. If your trial has ended, you can still pick a plan at any time and your setup is kept.

### I sell in several markets. What should I set up first?

Set up your most important market first. You can add the other markets afterwards. If you use one Hello Retail website per market, each market has its own website ID. See [Inserting the helloretail.js script](../platforms-and-newsletter-providers/shopify-installation-guide.md#inserting-the-helloretailjs-script).

### I don't have admin access to Shopify. What can I do?

When you're missing access, Hello Retail gives you a message you can forward to a colleague who has it. They need to be the store owner, or have the administrator or App Developer role for the Shopify organization.

### I ran out of credits before day 14. What now?

Your agents pause sending until you convert. Scheduled messages are kept and go out once you've picked a plan. To convert, click **Continue with Product Agents** in the banner.

---

## Related articles

- [Intro & Getting Started](intro-getting-started.md)
- [Shopify Installation Guide](../platforms-and-newsletter-providers/shopify-installation-guide.md)
- [Setting up Klaviyo](setting-up-klaviyo.md)
- [Billing, Credits & Usage](billing-usage.md)
- [Upgrading Your Subscription](upgrading-your-subscription.md)
