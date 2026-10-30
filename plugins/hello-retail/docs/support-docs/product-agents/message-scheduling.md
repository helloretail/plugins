---
source: support-docs
upstream: https://support.helloretail.com/product-agents/message-scheduling/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Message Scheduling and Prioritisation"
description: "Learn how Product Agents decide when to send, delay, or skip messages."
tags: "Product Agents, Scheduling"
---

# Message Scheduling and Prioritisation

Product Agents do not send emails immediately for every trigger.
Instead, they continuously evaluate **eligibility, timing, relevance, and safety rules** before scheduling or sending a message.

This article explains:

- How Product Agents decide **if** a message should exist
- How they decide **when** it should be sent
- Why messages can be **delayed, replaced, or skipped**
- What happens when a message is handed over to a channel

## How message scheduling works

When a trigger occurs, such as a purchase, a product view, or a price drop, Product Agents do not send an email straight away.

Instead, each trigger goes through a structured decision process:

1. Evaluates whether a message makes sense
2. Determines the best time to send it
3. Checks whether another message is already scheduled
4. Schedules, delays, or skips the message accordingly

This allows Product Agents to send fewer, more relevant emails instead of reacting blindly to every signal.

---

## Why messages are sometimes delayed

Delays are intentional and expected behavior.

Messages may be delayed because:

- A later time is determined to be more relevant
- Another Product Agent message already occupies the preferred time window
- Global frequency limits would otherwise be exceeded

Delaying messages helps prevent customers from receiving multiple emails too close together.

---

## Message Limits

Product Agents include built-in rules that control how often a single recipient
can receive messages. These rules protect your customers from being
over-contacted and help maintain a healthy sender reputation.

There are two layers of control: a fixed system rule and optional custom limits
you configure per channel.

### Fixed system limit (always enforced)

A hard limit of **1 message per recipient per day** is always enforced across
all channels. This cannot be disabled or overridden.

### Custom limits (optional)

You can add additional limits per channel to further restrict how many messages
a recipient can receive within a given time window.

Each custom limit requires:

- **Channel** — which channel the limit applies to
- **Message limit** — the maximum number of messages allowed within the period
- **Period (days)** — the rolling time window in days

Example: Setting a limit of 3 messages over 30 days means a recipient who has
already received 3 Product Agent emails via Klaviyo in the past 30 days will
not receive another until the window clears.

To add a custom limit, go to **Settings → Message Limits → + Add limit**.

### What happens when a limit is reached?

If a message is blocked by a frequency rule, it reschedules automatically for
the next day rather than being dropped. The system tries again each day until
a slot is available or the message is no longer relevant.

---

## Message prioritisation

It is possible for multiple Product Agents to want to message the same customer around the same time.

When this happens:

- Messages are compared based on relevance and priority
- Only one message can occupy a given time window
- Lower-priority messages are postponed or skipped

This prioritisation happens automatically and does not require manual setup.

---

## Why not every trigger becomes an email

Not every trigger results in a message.

Common reasons include:

- The customer or product is no longer eligible
- Frequency, consent, or safety rules prevent sending
- The message becomes outdated before send time

This filtering is intentional and prevents Product Agent emails from feeling spammy or repetitive.

---

## Consent and email availability

Product Agents respect your existing email setup and consent rules.

A message will not be sent if:

- The customer does not have an email address
- The customer has not given the required consent
- The selected channel does not allow sending

These checks happen automatically and cannot be overridden by Product Agents.

---

## Klaviyo smart sending

If you use Klaviyo, smart sending rules also apply. Product Agents takes smart sending into account before handing over a message, so messages are only sent to Klaviyo when they are expected to pass.

Smart sending settings are controlled in Klaviyo, not in Product Agents.

If a message does not arrive during testing, smart sending is one of the most common reasons.

---

## Channel handover

When a message reaches its scheduled send time, Product Agents hand it off to the connected channel for delivery. If follow-ups are enabled for that message type, the system automatically schedules the next follow-up after a successful send.

See [Automatic Follow-ups](product-agents-followups.md) for details on timing and how to turn this on or off.

---

## Incomplete or blocked setup

Messages may also fail to send if setup is incomplete.

Common setup-related reasons include:

- The email channel is disconnected
- The Klaviyo flow or email is not live
- Required template fields are missing
- The template's code contains a syntax error, often introduced while manually editing it. See [customising your email templates](customising-email-templates.md) for how to spot and fix this.

In these cases, Product Agents will not send messages until the issue is resolved.

---

## What to do if you are unsure

If you are unsure why a message was delayed or not sent:

- Check the **Messages** or **Schedule** view in the dashboard
- Verify consent and smart sending settings in Klaviyo
- Confirm that the relevant agent is enabled

In most cases, the behavior is expected and designed to protect relevance and deliverability.

---

## Next step

If you want to understand how usage is calculated and how billing works, continue with:

[Billing & Usage](billing-usage.md)
