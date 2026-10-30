---
source: support-docs
upstream: https://support.helloretail.com/product-agents/billing-usage/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Billing, Credits & Usage"
description: "Understand how Product Agents credits work, how usage is calculated, and how to manage your subscription."
tags: "Product Agents, Billing"
---

# Billing, Credits & Usage

Product Agents use a credit based model.
This article explains how credits are consumed, what happens when you reach your limit, and how to manage your subscription.

The goal is to make usage predictable and avoid surprises.

---

## How Product Agents usage works

Product Agents consume credits when a message is **successfully handed over to your configured channel**, such as Klaviyo.

In simple terms:

- One message sent to the channel equals one credit
- Credits are shared across all Product Agents
- Credits are consumed at the point of handover, not at final delivery

Product Agents are responsible for deciding **when** and **what** to send.
Your email service provider is responsible for deciding **whether** the message is ultimately delivered to the customer.

### Billing cycles and credit allocation

Your credits are tied to your subscription cycle, which can be monthly, quarterly, or annual depending on your plan.

- You receive your full credit allocation at the start of each cycle
- Any unused credits at the end of a cycle carry over and are added on top of your next cycle's allocation

If you're converting from a [free trial](self-service.md), your unused trial credits carry over into your paid plan.

---

## What counts as usage

Usage is counted when:

- A Product Agent message is sent to the configured channel (for example, Klaviyo)
- The message passes Product Agent eligibility and scheduling checks
- The message is handed over to the channel for delivery

Credits are consumed when a message is successfully handed over to the sending channel.

---

## What does not count as usage

The following do **not** consume credits:

- Messages that are skipped before being sent to the channel
- Messages that are never scheduled
- Messages blocked by Product Agents before channel delivery

Messages handed over to the sending channel consume credits even if the channel later blocks delivery.

---

## Test sends vs live usage

**Test sends are free.** No credits are consumed when you send a test message.

Test sends are available from two places in the product:

- **Tone of Voice settings** — send a test to see how your tone and language settings affect the generated output
- **The agent popup, next to custom prompts** — send a test for a specific agent based on its current configuration, including unsaved changes

When sending a test, you select a recipient from a list of test email addresses defined in your Product Agent settings. No customers are contacted.

Test messages are clearly marked as test messages in the message overview.

When an agent is **live**:

- Messages can be sent to real customers
- Credits are consumed when messages are handed over to the channel

---

## Shared credits across agents

Credits are shared across all Product Agents.

This means:

- You do not need to assign credits per agent
- You can enable multiple agents without managing separate limits
- Usage automatically adjusts based on which agents send messages

If multiple agents compete for the same customer, only one message is sent, which also helps control usage.

---

## Klaviyo smart sending and usage

If you use Klaviyo, smart sending rules apply **after** the message is sent to Klaviyo.

This means:

- A message may be blocked by Klaviyo smart sending
- The message will not reach the customer's inbox
- The credit is still consumed because the message was handed over to Klaviyo

This behavior is expected and ensures consistent usage calculation across channels.

---

## What happens when you reach your limit

If you reach your available credit limit:

- Sending pauses when credits reach zero and Auto-Overage is disabled
- No additional credits are consumed
- Scheduled messages may remain scheduled but will only send once credits are available again

Sending resumes automatically when:

- A new billing cycle begins and credits are refreshed
- You purchase additional credits
- Auto-Overage purchases additional credits on your behalf

---

## Managing your subscription

You can view and manage your credit setup from the **Manage Subscription** page. The page becomes available once you're on a paid plan.

### Credit overview

The credit overview shows your current credit status, including:

- **Committed credits** — the number of credits included in your billing cycle
- **Available credits** — the credits remaining for the current period
- **Billing cycle remaining** — how much time is left in the current cycle
- **Overage credits used** — any additional credits purchased via Auto-Overage

### Auto-Overage

Auto-Overage allows sending to continue automatically when your committed credits run out.

Auto-Overage is available once you're on a paid plan. It is not available during the free trial.

When enabled, you can configure:

- **Credits per purchase** — how many credits are added each time Auto-Overage activates
- **Maximum credits per billing cycle** — a cap on the total overage credits that can be purchased in a single cycle

The Manage Subscription page shows the cost per overage purchase and your maximum potential spend based on your configuration, so you can review the impact before enabling it.

When the overage limit is reached, sending pauses until credits are replenished or the billing cycle resets.

### Payment method

The Manage Subscription page allows you to update the credit card used for:

- Subscription charges
- Auto-Overage purchases

### Update your commitment

Company Owners can increase their committed credits directly from the Manage Subscription page. See [Upgrading Your Subscription](upgrading-your-subscription.md) for the full flow, limits, and what happens after you accept the new agreement. For downgrades, cancellations, or commitments above the self-service limit, contact your account manager. If you don't have an assigned account manager, contact [Hello Retail support](https://helloretail.com/contact/).

---

## Credit ledger

The credit ledger provides a full history of credit activity on your account.

Each entry includes:

- **Date** — when the event occurred
- **Description** — the type of event (purchase, adjustment, or billing event)
- **Credit amount** — how many credits were added or consumed

Use the ledger to audit usage, verify purchases, and reconcile billing.

---

## Credit usage notifications

You will receive email notifications to help you stay ahead of your credit limit.

Notifications are sent when you:

- Reach **80%** of your credit limit
- Reach **90%** of your credit limit
- Reach your **credit limit**
- Change your **Auto-Overage settings**

Notifications are sent to the subscription owner and any billing emails configured for your subscription.

During the free trial, these notifications are not sent. A banner in Hello Retail shows how many days and credits you have left instead.

These alerts give you time to purchase additional credits or adjust your Auto-Overage configuration before sending is interrupted.

---

## Monitoring your usage

You can monitor Product Agents usage directly in Hello Retail from the **Usage Overview**.

From there you can:

- See how many credits you have used in the current billing cycle
- View your historic usage over time
- Track current usage levels
- Anticipate when limits may be reached

Checking usage regularly helps avoid unexpected pauses in sending.

---

## Common questions

### Do skipped messages consume credits?

No. Messages that are skipped before being sent to the channel do not consume credits.

### Do delayed messages consume credits?

Only when a delayed message is eventually sent to the channel does it consume a credit.

### Are credits tied to a specific agent?

No. Credits are shared across all Product Agents.

### What happens to scheduled messages when credits run out?

Scheduled messages remain scheduled but will not be sent until credits are available again. They are not lost.

### Can I prevent sending from pausing when credits run out?

Yes. Enable Auto-Overage on the Manage Subscription page to automatically purchase additional credits when your committed credits are exhausted.

## Summary

Product Agents usage is calculated at the point where messages are handed over to your channel:

- You pay for messages handed over to the channel
- Testing is free
- Built-in prioritisation helps control volume
- Credits are shared across all agents
- Auto-Overage keeps sending running when committed credits run out
- Notifications alert you before you reach your limit

This allows you to scale automation while keeping costs predictable.
