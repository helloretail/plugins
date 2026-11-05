---
source: public-docs
verified: 2026-10-29
---

# Newsletter providers — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [newsletter platforms](../../platforms/newsletter-platforms.md), [Newsletter Content](../../features/newsletter-content/newsletter-content.md), [Triggered Emails](../../features/triggered-emails/triggered-emails.md), [Klaviyo](../../integrations/klaviyo.md), [platform installs](./platforms.md)

| Symptom | Go to |
| --- | --- |
| Unsubscribed people still receive triggered emails | [Set up permission sync](#unsubscribed-recipients-still-receive-triggered-emails) |
| The List drop-down stays empty, or the ESP connection fails | [Credentials per ESP](#the-permission-sync-will-not-connect-or-the-list-drop-down-is-empty) |
| Drip or Omnisend syncs every address, not just subscribers | [Sync filters](#drip-or-omnisend-syncs-too-many-addresses) |
| Opt-outs should land in Mailchimp, not in Hello Retail | [Mailchimp unsubscribe form](#mailchimp-unsubscribes-should-go-to-the-mailchimp-form) |
| "Our ESP has no automatic sync" or MailCamp permissions | [Manual export](#mailchimp-or-mailcamp-permissions-must-be-exported-or-set-up-by-hello-retail) |
| "Where is the snippet for our ESP, and where does it go?" | [Snippet per ESP](#where-to-get-the-newsletter-snippet-and-where-to-paste-it) |
| The recommendation block is empty in the email editor | [Editor preview](#the-recommendation-block-is-empty-in-the-email-editor) |
| Duplicate or repeated products across newsletters | [Unique sends](#the-same-products-repeat-or-duplicate-across-newsletters) |
| ActiveCampaign shows the wrong number of products per row | [ActiveCampaign width](#activecampaign-the-wrong-number-of-products-per-row) |
| Apsis One shows the same four products twice | [Apsis One assets](#apsis-one-more-than-four-products-repeat-the-first-four) |
| Apsis module shows no products | [Apsis module](#apsis-the-hello-retail-module-shows-no-products) |
| Rule: the Hello Retail template is missing | [Rule](#rule-the-hello-retail-template-is-not-in-the-journey-builder) |
| MarketingPlatform recommendations are not personal | [MarketingPlatform](#marketingplatform-recommendations-are-not-personalised) |
| Hello Retail needs access to the customer's Mailchimp | [Mailchimp invite](#mailchimp-hello-retail-needs-access-to-the-account) |

## ESP overview

What each provider's article says: permission sync for Triggered Emails, and how Newsletter
Content gets into the email.

| ESP | Permission sync: what to enter | Newsletter Content route | Source |
| --- | --- | --- | --- |
| ActiveCampaign | API URL (in **API domain**, without `https://`) and API key; pick a list | `</> HTML Block` in the campaign editor; snippet sized for 650 px emails | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-active-campaign-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-activecampaign/) |
| APSIS / Apsis One | No sync article | Apsis One: a Hello Retail asset plus the campaign's template ID. Classic Apsis: a module | [Apsis One](https://support.helloretail.com/platforms-and-newsletter-providers/apsis-one-newsletter-content/) · [Apsis](https://support.helloretail.com/platforms-and-newsletter-providers/apsis-auto-campaign-setup/) |
| Brevo | API key, version 3.0; type is listed as **SendinBlue**; pick a list | No article | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-brevo-formerly-sendinblue-permissions/) |
| Bullsender | API key from **User Settings**; pick a list | Text block → **Source** view | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-bullsender-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-the-newsletter-content-to-bullsender/) |
| Campaign Monitor | API key (**Account Settings → API Keys**); pick a list | Video in the generic article | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-campaign-monitor-permissions/) |
| Drip | API key from **User Settings**; pick an account; optional tag and custom-field filters | Text block in the email editor | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-drip-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-drip/) |
| Get a Newsletter | API token (**Contacts → API & Forms → API tokens**) | Video in the generic article | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-get-a-newsletter-permissions/) |
| HeyLoyalty | API key and API secret (**Konto → Kontooplysninger**); pick a list | Block **1 blok** of type **HTML**, paste via **Kilde** | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-heyloyalty-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-heyloyalty/) |
| Klaviyo | API key with read access to **List** and **Profiles**; pick a list | Snippet for platform **Klaviyo** in the template; at most one send a day | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-klaviyo-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-klaviyo/) |
| Mailchimp | API key (**Account → Extras → API Keys**); pick a list. Or a CSV export | Invite Hello Retail as a user; auto-campaign video | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-mailchimp-permissions/) · [invite](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-invite-hello-retail-to-mailchimp/) · [video](https://support.helloretail.com/platforms-and-newsletter-providers/video-guide-auto-campaigns-for-mailchimp/) |
| MailerLite | API key (**Integrations → Developer API**); pick a list | Video in the generic article | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/mailerlite-permission-guide/) |
| MailCamp | XML Path, XML Username and XML Token, sent to Hello Retail | Auto-campaign snippet in the template | [credentials](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-get-mailcamp-api-credentials/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/integrate-newsletter-content-into-mailcamp/) |
| MarketingPlatform | API username and an access token marked trusted by MarketingPlatform; pick a list | Rolling campaign; a grid with an HTML element | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-marketingplatform-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/rolling-campaign-on-marketingplatform/) |
| Omnisend | API key (**Store settings → Integrations & API → API keys**); pick an account; optional filters | Snippet for platform **Omnisend**; one send a day, unique names | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-omnisend-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-omnisend/) |
| Rule | API key | Rule support adds the template (account name, template ID, campaign ID) | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-rule-permissions/) · [content](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-integrate-with-rule/) |
| Ubivox | Account name, XML-RPC username and a generated API password; pick a list | Video in the generic article | [sync](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-ubivox-permissions/) |

The generic article is [How to Integrate Recommendations into your Newsletters](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-integrate-recommendations-into-your-newsletters/).

## Unsubscribed recipients still receive triggered emails

**Likely cause.** Permission auto-sync from the ESP was never set up, points at the wrong list, or
the change has not synced yet: the sync runs once a day.

**Fix.**

1. Create the credentials in the ESP (see the overview table).
2. In Hello Retail, **Data Setup → Permissions → Set up automatic permission synchronisation**.
3. Pick the ESP under **Type**, paste the credentials, choose the **List** (or account), **Save**.
4. A customer on Rule who needs it more often than daily asks Hello Retail support.
5. An ESP without auto-sync needs regular manual exports (next entries).

**Check with.** The Permissions screen in the dashboard; there is no MCP tool for permission sync.

**Source:** [Auto Sync of Klaviyo permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-klaviyo-permissions/) · [Auto Sync of Mailchimp permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-mailchimp-permissions/) · [Auto Sync of Rule Permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-rule-permissions/)

> **May be outdated:** the articles disagree on the dashboard path. Most say **Data Setup →
> Permissions**, the Brevo article says **Triggered Emails → Permissions**, and the MailerLite
> article says **Data Setup → Permission campaigns → Edit**.

## The permission sync will not connect, or the List drop-down is empty

**Likely cause.** The list loads only after the credentials authenticate, so an empty drop-down
means the credentials are wrong or lack a right. Each ESP has its own trap.

**Fix.**

1. **ActiveCampaign**: paste the API URL into **API domain** without `http://` or `https://`.
2. **Klaviyo**: the API key needs read access to **List** and **Profiles**.
3. **Brevo**: choose **SendinBlue** in **Type**, and generate the key as version 3.0.
4. **MarketingPlatform**: after creating the API key and token, the customer asks MarketingPlatform
   support to mark the token as trusted, saying it is for Hello Retail. Untrusted tokens do not work.
5. **Ubivox**: enter the account name (part of the XML-RPC URL), the XML-RPC username and a newly
   generated API password; the list appears after authentication.
6. **Drip and Omnisend**: after the key you pick an **account**, not a list.

**Source:** [Auto Sync of Active Campaign permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-active-campaign-permissions/) · [Auto Sync of Klaviyo permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-klaviyo-permissions/) · [Auto Sync of Brevo permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-brevo-formerly-sendinblue-permissions/) · [Auto sync of MarketingPlatform permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-marketingplatform-permissions/) · [Auto Sync of Ubivox permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-ubivox-permissions/)

> **May be outdated:** the Campaign Monitor article asks for the API key and the Client ID, but its
> form steps use only the API key. The Get a Newsletter article has no list step yet says it syncs
> "the selected list". The Brevo type may have been renamed since.

## Drip or Omnisend syncs too many addresses

**Likely cause.** Drip and Omnisend sync every e-mail address in the selected account unless filters
are set.

**Fix.**

1. Add tag filters: an address passes when it has **at least one** of the tags.
2. Add custom-field filters: an address passes only when **all** fields match.
3. Write them comma-separated with no spaces (`tag1,tag2`, `field1=value1,field2=value2`), with the
   exact case used in the ESP, since the filters are case sensitive.

**Source:** [Auto Sync of Drip permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-drip-permissions/) · [Auto Sync of Omnisend Permissions](https://support.helloretail.com/platforms-and-newsletter-providers/auto-sync-of-omnisend-permissions/)

## Mailchimp: unsubscribes should go to the Mailchimp form

**Likely cause.** The Triggered Emails unsubscribe link points at Hello Retail's own page, so
opt-outs never reach Mailchimp.

**Fix.**

1. Mailchimp: open the list → **Signup forms** → **General forms** → **Unsubscribe form**, copy the
   form URL.
2. Hello Retail: paste it as the unsubscribe URL and append `&EMAIL={{ email }}` so the recipient's
   address is filled in. **Save**.

**Source:** [Redirecting to your Mailchimp Unsubscribe form](https://support.helloretail.com/platforms-and-newsletter-providers/redirecting-to-your-mailchimp-unsubscribe-form/)

> **May be outdated:** the field this article pastes into is the **third-party unsubscribe URL**
> described on [Triggered Emails](../../features/triggered-emails/triggered-emails.md); the
> general-settings article reaches it from General Settings. It also uses Mailchimp's older "Lists" naming.

## Mailchimp or MailCamp: permissions must be exported or set up by Hello Retail

**Likely cause.** Some setups do not use the self-serve auto-sync: a Mailchimp customer may send an
export instead, and MailCamp sync is set up by Hello Retail from the customer's XML API details.

**Fix.**

1. **Mailchimp export**: open the list, **Export List**, then **Export As CSV**, and import it as
   described in [Synchronizing Permissions](https://support.helloretail.com/triggered-emails/synchronizing-permissions/).
   Repeat regularly, or switch to auto-sync.
2. **MailCamp**: **My Account → API Details**, enable the XML API for the user, generate a token,
   **Save**, and send the XML Path, XML Username and XML Token to Hello Retail support.

**Source:** [How to export permissions from Mailchimp](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-export-permissions-from-mailchimp/) · [How to Get MailCamp API Credentials](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-get-mailcamp-api-credentials/)

## Where to get the newsletter snippet and where to paste it

**Likely cause.** The snippet is generated per campaign and per ESP. A snippet copied for another
platform, or pasted into a block that escapes HTML, renders wrong.

**Fix.**

1. Create a Newsletter Content design first.
2. In Hello Retail, **Newsletter Content → Auto campaigns → Edit auto campaign config** (or create
   one): products per row, total products, optional fixed products and recommendation strategy.
3. On the **Code snippet** tab, choose the customer's ESP as newsletter platform and copy the code.
4. Paste it into an HTML-capable block in the ESP's template (see the overview table), save, and
   send a test.

**Check with.** `newsletterContent_listCampaigns` for the campaign; `newsletterContent_previewCampaign`
for what it renders.

**Source:** [How to Add Newsletter Content to Klaviyo](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-klaviyo/) · [How to Add Newsletter Content to Omnisend](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-omnisend/) · [How to Add Newsletter Content to Drip](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-drip/) · [How to Add Newsletter Content to HeyLoyalty](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-heyloyalty/) · [How to Integrate Recommendations into your Newsletters](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-integrate-recommendations-into-your-newsletters/)

> **May be outdated:** the dashboard labels ("Auto campaign config", "Create new auto campaign
> config") come from an older Newsletter Content screen. Current names are on the
> [Newsletter Content](../../features/newsletter-content/newsletter-content.md) page.

## The recommendation block is empty in the email editor

**Likely cause.** Expected. Recommendations are generated per recipient when the email is sent or
opened, so ESP editors show an empty or broken block.

**Fix.**

1. Use the ESP's preview with a real recipient (Apsis One fills example data in **Preview**;
   classic Apsis's **Preview** tab asks for an e-mail address).
2. Otherwise send a test email. MailCamp's preview can show broken images that render fine in a
   test send.

**Check with.** `newsletterContent_previewCampaign` to see what the campaign returns.

**Source:** [How to Add Newsletter Content to Klaviyo](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-klaviyo/) · [How to Add Newsletter Content to HeyLoyalty](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-heyloyalty/) · [Integrate Newsletter Content into MailCamp](https://support.helloretail.com/platforms-and-newsletter-providers/integrate-newsletter-content-into-mailcamp/) · [Apsis One — Newsletter Content](https://support.helloretail.com/platforms-and-newsletter-providers/apsis-one-newsletter-content/)

## The same products repeat or duplicate across newsletters

**Likely cause.** An auto campaign tells sends apart by a key from the ESP. Two sends that share
the key are treated as one campaign.

**Fix.**

1. **Klaviyo**: no more than one newsletter a day; the date is the key.
2. **Omnisend**: one newsletter a day, and a unique campaign or broadcast name each time.
3. **Drip**: a unique campaign name for every newsletter; the name is the key.

**Check with.** `newsletterContent_listCampaigns` for one send per newsletter.

**Source:** [How to Add Newsletter Content to Klaviyo](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-klaviyo/) · [How to Add Newsletter Content to Omnisend](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-omnisend/) · [How to Add Newsletter Content to Drip](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-drip/)

> **May be outdated:** the three articles name a different key (date, date plus name, name).
> Check which one the snippet for the customer's ESP actually uses.

## ActiveCampaign: the wrong number of products per row

**Likely cause.** The snippet is sized for 650 px emails, and the tile width in it sets how many fit
on a row on desktop.

**Fix.** Change the `width` value in the snippet: a higher value gives fewer products per row,
for example `width="300"` gives two.

**Source:** [How to Add Newsletter Content to ActiveCampaign](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-activecampaign/)

## Apsis One: more than four products repeat the first four

**Likely cause.** Each Hello Retail asset in Apsis One holds four products numbered 1 to 4. Reusing
the same asset repeats them.

**Fix.**

1. Create a second asset (for example "Hello Retail 5-8").
2. In each of its four elements, change `productNumber=1` to `5`, `6`, `7`, `8` in both the
   **Image URL** (under **Browse**) and the **Link Settings → URL**.
3. Link it with the same template ID from the Newsletter Content campaign.
4. To show fewer than four, delete an element and resize the rest.

**Source:** [Apsis One — Newsletter Content](https://support.helloretail.com/platforms-and-newsletter-providers/apsis-one-newsletter-content/)

> **May be outdated:** Apsis One asks for a "Hello Retail Templatekey", while the same article tells
> you to copy the campaign's "Template id". They are the same value.

## Apsis: the Hello Retail module shows no products

**Likely cause.** In classic Apsis the module is empty in the editor; it fills only in preview.

**Fix.**

1. Copy the auto-campaign snippet with **Apsis** selected.
2. In Apsis, gear icon → **Modules** → **New module**, paste, name, **Save**, and size it.
3. Drag the module into the newsletter and use the **Preview** tab with a recipient address.

**Source:** [Apsis Auto Campaign Setup](https://support.helloretail.com/platforms-and-newsletter-providers/apsis-auto-campaign-setup/)

## Rule: the Hello Retail template is not in the Journey Builder

**Likely cause.** Rule adds the Hello Retail template to the customer's account by hand; the
customer has not asked Rule yet, or sent incomplete details.

**Fix.**

1. Enable an auto campaign in Hello Retail and copy its template ID and campaign ID.
2. The customer sends Rule support their Rule account name, the template ID and the campaign ID.
3. The template then appears in Rule's Journey Builder.

**Source:** [How to Integrate with Rule](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-integrate-with-rule/)

## MarketingPlatform: recommendations are not personalised

**Likely cause.** Hello Retail knows the visitor by cookie but the newsletter knows them by e-mail.
The two are linked only when the recipient clicks a link that carries their address.

**Fix.**

1. Add `?aw:userEmail=%%emailaddress%%` to other links in the newsletter too, not only the
   recommendation tiles.
2. Use a Rolling campaign, with an **unlock frequency** (days a recipient keeps the same products)
   that matches the send frequency.
3. MarketingPlatform newsletters are 600 px wide: a 290 × 290 tile fits two per row.

**Check with.** `newsletterContent_getCampaignAlgorithm` for the campaign's strategy.

**Source:** [Rolling Campaign on MarketingPlatform](https://support.helloretail.com/platforms-and-newsletter-providers/rolling-campaign-on-marketingplatform/)

## Mailchimp: Hello Retail needs access to the account

**Likely cause.** Hello Retail helps configure Mailchimp from inside the customer's account, which
needs a user.

**Fix.** Avatar → **Account** → **Settings → Users → Invite a User**: invite the Hello Retail
support address given in the article, with **User Type** Manager or Admin.

**Source:** [How to Invite Hello Retail to MailChimp](https://support.helloretail.com/platforms-and-newsletter-providers/how-to-invite-hello-retail-to-mailchimp/) · [Video Guide: Auto Campaigns for MailChimp](https://support.helloretail.com/platforms-and-newsletter-providers/video-guide-auto-campaigns-for-mailchimp/)
