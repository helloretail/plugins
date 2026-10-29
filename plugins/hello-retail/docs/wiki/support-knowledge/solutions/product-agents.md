---
source: public-docs
verified: 2026-10-29
---

# Product Agents — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Product Agents](../../features/product-agents/product-agents.md), [Klaviyo](../../integrations/klaviyo.md), [diagnostics](../diagnostics.md)

| Symptom | Go to |
| --- | --- |
| The test email never arrives | [Test email](#the-test-email-does-not-arrive) |
| Set Live is greyed out, or enabling an agent is refused | [Set Live](#set-live-is-unavailable-or-enabling-an-agent-is-refused) |
| The agent is live but customers get no emails | [No emails](#an-agent-is-live-but-customers-get-no-emails) |
| Hello Retail shows a message as sent but the customer never got it | [Silently lost](#hello-retail-shows-a-message-as-sent-but-the-customer-never-received-it) |
| Connecting Klaviyo fails with a permission error | [API key](#connecting-klaviyo-fails-with-a-permission-error) |
| Hello Retail did not insert its blocks into the cloned template | [Template blocks](#hello-retail-did-not-add-its-blocks-to-the-cloned-template) |
| Emails stopped after someone edited the template | [Syntax error](#emails-stopped-after-the-template-was-edited) |
| Restyled block shows broken placeholders or no products | [Restyle](#the-restyled-block-shows-broken-placeholders-or-no-products) |
| The shop wants its own copy instead of the AI text | [Own copy](#how-do-i-replace-the-ai-written-text-with-our-own) |
| Keep one customer out of agent emails without unsubscribing them | [Exclude a customer](#how-do-i-stop-agent-emails-to-one-customer-without-unsubscribing-them) |
| Keep a product out of agent emails | [Exclude a product](#how-do-i-keep-a-product-out-of-agent-emails) |
| An agent stopped sending after filters were changed | [Filters](#an-agent-stopped-sending-after-product-filters-were-changed) |
| Messages are delayed, postponed or skipped | [Scheduling](#messages-are-delayed-or-skipped) |
| A follow-up went out or did not | [Follow-ups](#follow-ups-arrive-when-they-should-not-or-stop-early) |
| A price drop did not trigger an email | [Price drop thresholds](#a-price-drop-did-not-trigger-an-email) |
| One agent's events trigger no email in Klaviyo | [Flows and trigger filters](#one-agents-events-trigger-no-email-in-klaviyo) |
| Agents stopped sending and the credit count is at zero | [Credits](#agents-paused-because-credits-ran-out) |
| Credits were used but Klaviyo did not deliver | [Credits and delivery](#credits-were-used-for-emails-klaviyo-did-not-deliver) |
| The Upgrade button is missing | [Upgrade](#the-upgrade-button-is-missing) |
| Analytics differ from Hello Retail's counts, or the chart is empty | [Analytics](#analytics-numbers-look-wrong-or-the-chart-is-empty) |
| Price Drop Potential shows no replenishment reach | [Price Drop Potential](#price-drop-potential-shows-no-purchased-replenishment-reach) |
| The self-service trial cannot be started | [Trial](#the-self-service-trial-cannot-be-started) |
| The webhook endpoint misses or duplicates messages | [Webhook](#the-webhook-endpoint-misses-or-duplicates-messages) |

## The test email does not arrive

**Likely cause.** The test runs through the real Klaviyo flow, so the most common causes are a flow
still in draft, Klaviyo Smart Sending suppressing a recipient who was mailed recently, or a test
address without marketing consent.

**Fix.**

1. Set the agent's flow to **Live** in Klaviyo.
2. Use a test address that is in the permission list or segment and has not been mailed in the
   Smart Sending window; switch Smart Sending off in the flow while testing if needed.
3. Send again from the agent's setup (or **Send test to me** on the Custom Prompt tab). Test sends use
   no credits and never start follow-ups.

**Check with.** `productAgents_getChannels` for the channel's state; `productAgents_getSettings` for
the configured test addresses.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/) · [Message Scheduling and Prioritisation](https://support.helloretail.com/product-agents/message-scheduling/)

## Set Live is unavailable or enabling an agent is refused

**Likely cause.** **Set Live** stays unavailable while the agent's Klaviyo flow is in draft. The feature
page adds that enabling needs at least one active channel with that agent's flow wired up.

**Fix.**

1. Create the agent's flow from **Set up your agents** → **Create Flow** if it does not exist.
2. Set the flow to **Live** in Klaviyo, then press **Set Live** in Hello Retail.

**Check with.** `productAgents_getChannels` and `productAgents_getSettings`.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/)

## An agent is live but customers get no emails

**Likely cause.** Hello Retail sends an event; Klaviyo decides whether an email goes out. The flow
may be in draft, not listening to the Hello Retail event, filtered so the event does not match,
blocked by Smart Sending, or the profile has unsubscribed. On the Hello Retail side, setup gaps
(disconnected channel, missing template fields, template syntax error) and paused credits also stop
sending.

**Fix.**

1. In Klaviyo, check the flow is **Live** and triggered by the Hello Retail event.
2. Remove trigger filters or profile filters that the event or profile does not match (next entry).
3. Check the profile's consent and Smart Sending.
4. In Hello Retail, check the agent is enabled and look at the Messages or Schedule view for skipped
   or delayed messages.

**Check with.** `productAgents_getSettings` (agent on or off, channels) and `productAgents_getChannels`.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/) · [Message Scheduling and Prioritisation](https://support.helloretail.com/product-agents/message-scheduling/)

## Hello Retail shows a message as sent but the customer never received it

**Likely cause.** A profile filter on the Klaviyo flow trigger. Product Agents only checks the list or
segment chosen as permission source; it generates and hands over the event, and Klaviyo then discards
it at the filter. The credit is still used.

**Fix.**

1. Remove the profile filter from the flow trigger.
2. Recreate its conditions as a Klaviyo segment and set that segment as the permission source.
3. If the restriction should apply to some agents only: connect a second Klaviyo channel, give it the
   new segment, and run only those agents on it.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/) · [Using Product Agents with Klaviyo](https://developer.helloretail.com/guides/product_agents/klaviyo-integration/)

## Connecting Klaviyo fails with a permission error

**Likely cause.** The Klaviyo API key lacks scopes. Setup stops and names what is missing.

**Fix.**

1. Create a key with at least read access to Campaigns, Images, Lists, Segments, Metrics and Profiles,
   and full access to Events, Flows and Templates — or a full-access key, which also covers later scope
   changes.
2. Paste it in the Product Agents onboarding and confirm.
3. The person or agency doing setup also needs rights to create flows and edit templates in Klaviyo.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/)

## Hello Retail did not add its blocks to the cloned template

**Likely cause.** The chosen Klaviyo template already contains Hello Retail blocks (it is then used
as-is and not restyled), or it contains the shop's own universal blocks, which stop Hello Retail from
inserting its blocks automatically.

**Fix.**

1. Own universal blocks: **Open in Klaviyo editor** → content panel → **Universal** tab → drag any
   Hello Retail block into the template → **Exit**. Onboarding continues once the template is saved.
2. Existing Hello Retail blocks you want restyled: remove them in Klaviyo and run the template step again.
3. Or pick another template with **Select Another Template**.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/)

## Emails stopped after the template was edited

**Likely cause.** A syntax error in the template. Editing with an AI assistant often brings in curly
quotes, em dashes or invisible characters; Klaviyo then skips the email entirely, without a warning in
the editor.

**Fix.**

1. In Klaviyo's flow analytics, check the skip reason; "syntax error" confirms it.
2. Replace the last-edited section with plain characters only (straight quotes, no invisible
   characters) and save.

**Source:** [Customising Your Email Templates](https://support.helloretail.com/product-agents/customising-email-templates/) · [Message Scheduling and Prioritisation](https://support.helloretail.com/product-agents/message-scheduling/)

## The restyled block shows broken placeholders or no products

**Likely cause.** A template tag inside `{{ … }}` or `{% … %}` was changed or dropped during restyling.
Edits to the universal block apply to every agent email at once.

**Fix.**

1. Test on one email first: click the block → **Unlink and edit independently**, paste the restyled
   HTML, check that images, names and prices still render, and send a real test (**Send test to me**).
2. Compare tag by tag with the original; every `{{ … }}` must still be there.
3. Only then drag the universal block back in, choose **Edit across all instances**, and paste the
   final HTML.
4. If a broken version was already saved and undo is gone, contact Hello Retail support with the agent
   and template name.

**Source:** [Restyle Your Product Agent Emails with an AI Assistant](https://support.helloretail.com/product-agents/restyle-agent-emails-with-ai/)

## How do I replace the AI-written text with our own

**Likely cause.** By default the agents write subject, preview, headline, body and calls to action.

**Fix.**

1. In the Klaviyo template, open the Hello Retail block's HTML and replace the variable with text:
   `event.headline`, `event.body`, `event.callToAction`, `event.otherProductsTitle`,
   `event.otherProductsText`, `event.otherProductsCallToAction`. Delete the whole `{{ … }}`.
2. Or use **Hello Retail – Primary Products** / **Other Products** (no text fields) under a native
   Klaviyo text block. Product values such as `{{ event.primaryProducts.0.title }}` work there too.
3. Subject and preview text are set in the flow's email settings: replace `{{ event.subject }}` and
   `{{ event.previewText }}`.
4. To keep AI text but change its voice, adjust Tone of Voice under Product Agents → Settings, or the
   agent's custom prompt, which can address fields by name (`subject`, `body` and so on).

**Source:** [Customising Your Email Templates](https://support.helloretail.com/product-agents/customising-email-templates/) · [Intro & Getting Started](https://support.helloretail.com/product-agents/intro-getting-started/)

## How do I stop agent emails to one customer without unsubscribing them

**Likely cause.** The permission source decides who can be mailed; a list cannot express exceptions.

**Fix.**

1. In Klaviyo, give the profile a custom property `excludeProductAgents` with the text value `yes`.
2. Use a segment as permission source: your consent condition AND `excludeProductAgents` is not set.
   Switch from a list to that segment if needed.
3. The customer keeps receiving the shop's other marketing. Removing the property re-includes them.

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/)

## How do I keep a product out of agent emails

**Likely cause.** A product should never be recommended, or an agent should stay inside a range.

**Fix.**

1. Turn off the product's **Product Agents** visibility in Product Lookup → Manage Product Visibility.
   This overrides every filter.
2. For rules, add Product Filters on the agent (configuration → **Product Filters** → **Add filter**),
   for example `inStock` matches `true`, or `hierarchies` does not match a category.

**Check with.** `productData_get` for the product's fields when writing a filter.

**Source:** [Product Filters for Product Agents](https://support.helloretail.com/product-agents/product-agent-filters/) · [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/)

## An agent stopped sending after product filters were changed

**Likely cause.** Filter rows are always combined with AND, so each row narrows the pool; if no
product passes all of them, the agent skips. A filter on `$user.bias.*` cannot be evaluated for a
customer with no history, and the agent then sends nothing to that customer — it does not fall back
to `$shop.bias.*`.

**Fix.**

1. Remove filter rows one at a time to find the one that empties the pool.
2. Replace `$user.bias.*` with `$shop.bias.*` where new customers should still get emails.
3. Loosen hierarchy matches with `$hierarchies:trimToLevel:2` or `$hierarchies:removeFromEach:1`.

**Check with.** `productAgents_getSettings` for the agent's filters.

**Source:** [Product Filters for Product Agents](https://support.helloretail.com/product-agents/product-agent-filters/)

## Messages are delayed or skipped

**Likely cause.** Intended scheduling: a hard limit of one Product Agent message per recipient per
day across channels, optional custom limits per channel, and prioritisation when several agents want
the same recipient. Blocked messages move to the next day; messages that become outdated, lose
eligibility or lack consent are skipped.

**Fix.**

1. Check the Messages or Schedule view for the reason.
2. Review custom limits under Settings → Message Limits.
3. No action is needed for normal postponements; skipped messages use no credits.

**Source:** [Message Scheduling and Prioritisation](https://support.helloretail.com/product-agents/message-scheduling/) · [Billing, Credits & Usage](https://support.helloretail.com/product-agents/billing-usage/)

## Follow-ups arrive when they should not or stop early

**Likely cause.** Follow-ups are scheduled after a successful send if **Allow follow-ups** is on for the
agent. A chain ends for good when the customer buys the product, the price recovers, the product is no
longer active, or the message was postponed too often — postponements of the first message count too.

**Fix.**

1. To stop them: Agents → the agent's gear icon → turn off **Allow follow-ups**. Follow-ups already
   queued still go out.
2. To route them separately in Klaviyo, filter on `followUpNumber` (0 is the first send).

**Source:** [Automatic Follow-ups](https://support.helloretail.com/product-agents/product-agents-followups/) · [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/)

## A price drop did not trigger an email

**Likely cause.** Each price-drop agent has a minimum percentage (default 10) and an optional minimum
amount in the shop's currency; when both are set, the drop must clear both. Drops above 89 percent are
outside the trigger range. Threshold changes apply only to future drops.

**Fix.**

1. Open the agent's Settings tab and review **Minimum %** and **Minimum Amount**.
2. Confirm the new price reached Hello Retail.

**Check with.** `productAgents_getSettings` for the thresholds; `productData_get` for the product's
price and old price.

**Source:** [Available Agents and Use Cases](https://support.helloretail.com/product-agents/agents-use-cases/) · [Price Drop Potential Dashboard](https://support.helloretail.com/product-agents/price-drop-potential-dashboard/)

## One agent's events trigger no email in Klaviyo

**Likely cause.** The onboarding creates one flow per agent. If flows were built by hand with Trigger
Filters on `messageType`, an active agent without a matching flow triggers nothing.

**Fix.**

1. Give every active agent a flow whose trigger filter matches its `messageType`:
   `REPLENISHMENT_REMINDER`, `SIMILAR_PRODUCT_RECOMMENDATIONS`, `ACCESSORY_RELATED_PRODUCT_UPSELL`,
   `PRICE_DROP_VIEWED_PRODUCT`, `PRICE_DROP_PURCHASED_REPLENISHMENT`,
   `PRICE_DROP_ALTERNATIVE_PRODUCT`, `PRICE_DROP_COMPLEMENTARY_PRODUCT`.
2. Or let the onboarding create the flow (**Create Flow** per agent).

**Source:** [Setting up Klaviyo](https://support.helloretail.com/product-agents/setting-up-klaviyo/) · [Using Product Agents with Klaviyo](https://developer.helloretail.com/guides/product_agents/klaviyo-integration/)

> **May be outdated:** the developer guide says to build exactly one flow on a metric named
> `helloretail`, and its `messageType` tables (Klaviyo, webhook and ESP guides) lack
> `PRICE_DROP_COMPLEMENTARY_PRODUCT`. The support article and the Klaviyo page describe one flow per
> agent created by the onboarding.

## Agents paused because credits ran out

**Likely cause.** Sending pauses at zero credits when Auto-Overage is off. On the free trial, agents
pause at 500 credits or day 14, whichever comes first.

**Fix.**

1. Paid plan: enable Auto-Overage on the Manage Subscription page (credits per purchase and a cap per
   billing cycle), or buy credits. Sending resumes on its own; scheduled messages are kept.
2. Trial: the Company Owner converts via **Continue with Product Agents** in the banner. Scheduled
   messages go out after conversion and unused trial credits carry over.

**Source:** [Billing, Credits & Usage](https://support.helloretail.com/product-agents/billing-usage/) · [Self-Service Setup: Start Your Free Trial on Shopify](https://support.helloretail.com/product-agents/self-service/)

## Credits were used for emails Klaviyo did not deliver

**Likely cause.** A credit is used when the message is handed over to the channel, not on delivery.
Messages Klaviyo then blocks (Smart Sending, flow filters, bounces) still count.

**Fix.**

1. Expected. Reduce waste by moving flow-level filters into the permission segment (see above).
2. Skipped and test messages are free; the credit ledger shows every movement.

**Source:** [Billing, Credits & Usage](https://support.helloretail.com/product-agents/billing-usage/)

> **May be outdated:** Billing and the Klaviyo developer guide say Smart Sending applies after
> handover; Message Scheduling and the Analytics article say Product Agents accounts for Smart Sending
> before handing over. Confirm which holds before telling a customer credits were spent on
> Smart-Sending blocks.

## The Upgrade button is missing

**Likely cause.** Only the Company Owner sees **Upgrade** (and only the Company Owner can convert a
trial). Downgrades, cancellations and commitments above the plan's maximum are not self-service.

**Fix.**

1. Ask the Company Owner to open Product Agents → Settings → Usage → Manage Subscription → **Upgrade**.
2. For downgrades or cancellations, the customer contacts their account manager or Hello Retail support.

**Source:** [Upgrading Your Subscription](https://support.helloretail.com/product-agents/upgrading-your-subscription/)

## Analytics numbers look wrong or the chart is empty

**Likely cause.** With Klaviyo reporting, message counts are what Klaviyo actually delivered
(bounces and dead addresses drop out), revenue depends on the chosen conversion metric, and the daily
chart only covers ranges up to 60 days. Before any integration reports, every figure is zero.

**Fix.**

1. Use the KPI tiles and agent table for ranges over 60 days.
2. **Configure metric** → pick the Klaviyo metric that records purchases (usually Placed Order; choose
   the current one if several exist).
3. Test, skipped, scheduled and failed messages never count.

**Source:** [Understanding your Product Agent Analytics](https://support.helloretail.com/product-agents/product-agent-analytics/)

## Price Drop Potential shows no Purchased Replenishment reach

**Likely cause.** Replenishment reach is only calculated for products tagged as consumable in the
feed. The dashboard lists the top 50 products and refreshes daily.

**Fix.**

1. Tag replenishable products as consumable in the product feed.
2. Search by name or SKU for products outside the top 50; press **Update** to recalculate now.

**Check with.** `productData_get` for the product's feed fields.

**Source:** [Price Drop Potential Dashboard](https://support.helloretail.com/product-agents/price-drop-potential-dashboard/)

## The self-service trial cannot be started

**Likely cause.** Self sign-up is for Shopify stores only and not for headless storefronts; each
company gets one trial; a domain already in Hello Retail blocks a new account; connecting Shopify
needs the store owner, administrator or App Developer role.

**Fix.**

1. Existing Hello Retail customers on any platform: Product Agents → **Start free trial** in their
   current account.
2. Headless, non-Shopify or domain-already-exists cases: contact Hello Retail.
3. Missing Shopify access: forward the message Hello Retail shows to a colleague with the right role.

**Source:** [Self-Service Setup: Start Your Free Trial on Shopify](https://support.helloretail.com/product-agents/self-service/) · [Intro & Getting Started](https://support.helloretail.com/product-agents/intro-getting-started/)

## The webhook endpoint misses or duplicates messages

**Likely cause.** Webhook delivery is best-effort: one HTTPS POST per message at send time, no retry,
and anything but a `2xx` counts as failed. The same customer or context can produce several events.

**Fix.**

1. Return `2xx` quickly, handle bursts, and queue and retry on the receiving side.
2. Deduplicate on `event.id`.
3. Configure Hello Retail permission feeds so consent is checked before a message is generated;
   otherwise the endpoint must enforce consent.
4. ESP integrations need a Send Message API and a Permission Check API (the latter replaceable by
   permission feeds).

**Source:** [Using Product Agents with Webhooks](https://developer.helloretail.com/guides/product_agents/webhook-integration/) · [Integration Overview](https://developer.helloretail.com/guides/product_agents/integration-overview/) · [ESP Integration Guide](https://developer.helloretail.com/guides/product_agents/esp-integration-guide/)
