---
source: public-docs
verified: 2026-10-29
---

# Newsletter Content — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Newsletter Content](../../features/newsletter-content/newsletter-content.md), [Newsletter tile base template](../../base-templates/newsletters/newsletter-tile-default.liquid), [Klaviyo](../../integrations/klaviyo.md), [when changes go live](../../onboarding/when-changes-go-live.md)

| Symptom | Go to |
| --- | --- |
| Every recipient sees the same products | [Not personalised](#every-recipient-sees-the-same-products) |
| The ESP is not in the code snippet's provider list | [Not personalised](#every-recipient-sees-the-same-products) |
| The same product appears in several tiles of one email | [Duplicate tiles](#the-same-product-appears-in-several-tiles) |
| Clicking a tile opens a different product than the image showed | [Click mismatch](#clicking-a-tile-opens-a-different-product-than-the-image) |
| Two campaigns in one email show the same products | [Several campaigns](#two-campaigns-in-the-same-email-show-the-same-products) |
| A product must never appear in a newsletter | [Exclude products](#how-do-i-keep-a-product-out-of-a-campaign) |
| Reusing a manual campaign shows the old products | [Manual reuse](#a-reused-manual-campaign-shows-the-old-products) |
| Products do not change when the recipient reopens the email | [Locked tiles](#tiles-do-not-change-when-the-email-is-reopened) |
| An auto campaign shows the same content on every send | [Auto campaign](#an-auto-campaign-shows-the-same-content-on-every-send) |
| Where is the template ID for an auto campaign | [Template ID](#where-do-i-find-the-template-id-for-an-auto-campaign) |
| Fixed products vanished from an auto campaign | [Auto fixed products](#fixed-products-disappeared-from-an-auto-campaign) |
| A rolling campaign repeats last week's products | [Rolling](#a-rolling-campaign-shows-the-same-products-as-the-last-send) |
| Recipients complain recommendations repeat across newsletters | [Repeats](#recommendations-repeat-across-newsletters) |
| All auto campaigns collapse into one Google Analytics campaign | [UTM](#all-auto-campaigns-show-as-one-campaign-in-google-analytics) |
| An auto campaign configuration shows zero opens and clicks | [Analytics](#an-auto-campaign-configuration-shows-no-opens-or-clicks) |
| The tile image is blurry, stretched or the layout is off | [Tile rendering](#the-tile-image-is-blurry-or-the-tile-layout-is-off) |
| A design edit did not reach the newsletter, or changed old emails | [Design edits](#a-design-edit-did-not-reach-the-campaign-or-changed-old-emails) |
| The shop wants to identify recipients by customer ID, not e-mail | [Customer ID](#how-do-i-identify-recipients-by-customer-id-instead-of-e-mail) |

## Every recipient sees the same products

**Likely cause.** The snippet still carries the `EMAIL_ADDRESS` placeholder, or the ESP merge tag is
in only one of the two URLs, so Hello Retail cannot resolve the recipient. Recipients Hello Retail
has no behaviour on get the campaign's default content by design.

**Fix.**

1. In the campaign's **Code snippet** step, pick the newsletter platform to get a provider-ready
   snippet.
2. If the platform is not listed, replace `EMAIL_ADDRESS` with the platform's e-mail merge tag (for
   example `{{EMAIL}}`) — in both the `click` link and the `image` URL of every tile.
3. Paste the snippet into the newsletter template as an HTML block and save the campaign.

**Check with.** `newsletterContent_previewCampaign` once as a known and once as an unknown
recipient. In Newsletter Content → Analytics, a campaign whose opens are almost all "Default content"
points at the merge tag.

**Source:** [Get Started With Newsletter Content](https://support.helloretail.com/newsletter-content/get-started-with-newsletter-content/) · [Understanding Newsletter Content analytics](https://support.helloretail.com/newsletter-content/understanding-newsletter-content-analytics/)

## The same product appears in several tiles

**Likely cause.** Each tile is one product, chosen by its index. Tiles that share an index show the
same product. A campaign set to fewer products than the email has tiles also runs out.

**Fix.**

1. Give every tile its own index (`PRODUCT_NUMBER` in the generated snippet), counting up from the
   first: 0, 1, 2 …
2. Change the index in both places per tile — the link and the image URL.
3. Set the campaign's number of products to at least the number of tiles in the email.

**Source:** [Get Started With Newsletter Content](https://support.helloretail.com/newsletter-content/get-started-with-newsletter-content/) · [Newsletter content (developer guide)](https://developer.helloretail.com/guides/newsletter_content/)

## Clicking a tile opens a different product than the image

**Likely cause.** The parameters on the `serve/tile/click` link and the `serve/tile/image` URL differ.
`template`, `campaign`, `index` and `excludeFromCampaigns` must be identical on both, or the click
resolves to another product than the one drawn.

**Fix.**

1. Compare the two URLs of the tile and make every parameter match.

```html
<a href="https://core.helloretail.com/serve/tile/click?template=TEMPLATE_ID&campaign=CAMPAIGN_ID&index=0&email=MERGE_TAG">
  <img src="https://core.helloretail.com/serve/tile/image?template=TEMPLATE_ID&campaign=CAMPAIGN_ID&index=0&email=MERGE_TAG" width="298" height="350">
</a>
```

**Source:** [Newsletter content (developer guide)](https://developer.helloretail.com/guides/newsletter_content/)

## Two campaigns in the same email show the same products

**Likely cause.** Products are deduplicated within one campaign, not across campaigns placed in the
same email.

**Fix.**

1. Copy each campaign's snippet (open the campaign → **Edit config** or **Code snippet**).
2. Add `excludeFromCampaigns` to every link and image URL, listing the complete IDs of the other
   campaigns, comma-separated. For an auto campaign the complete ID is `{template key}-{campaign id}`.
3. Do the same in every campaign of the email, so each excludes all the others.

**Source:** [Get Started With Newsletter Content](https://support.helloretail.com/newsletter-content/get-started-with-newsletter-content/)

## How do I keep a product out of a campaign

**Likely cause.** A product needs excluding from one campaign or from every campaign.

**Fix.**

1. In the campaign's **Fixed products** step, add it to the exclude list (excluded for all users).
2. Or add `excludeProductNumbers` with a comma-separated list of product numbers to every link and
   image URL of the campaign's snippet.

**Check with.** `newsletterContent_getCampaignAlgorithm` shows the campaign's steps and filters.

**Source:** [Get Started With Newsletter Content](https://support.helloretail.com/newsletter-content/get-started-with-newsletter-content/) · [Create a Manual Campaign](https://support.helloretail.com/newsletter-content/create-a-manual-campaign/)

## A reused manual campaign shows the old products

**Likely cause.** A manual campaign is single-use: its products are fixed for that campaign, so the
same snippet in a new newsletter shows the same products.

**Fix.**

1. Create a new manual campaign for each send — this also keeps per-campaign statistics apart.
2. Or press **Clear products** on the campaign. The next open selects fresh products, but this also
   changes the products in older newsletters that use the same snippet.
3. For a recurring newsletter, use an auto or rolling campaign instead.

**Source:** [Create a Manual Campaign](https://support.helloretail.com/newsletter-content/create-a-manual-campaign/) · [Understanding the Different Campaign Types](https://support.helloretail.com/newsletter-content/understanding-the-different-campaign-types/)

## Tiles do not change when the email is reopened

**Likely cause.** Products are chosen at the first open and then locked for that recipient. This is
also why a product that sells out after the first open still shows.

**Fix.**

1. Expected behaviour. To force new products, clear the locked products on the campaign; the next
   open assigns new ones.

**Source:** [Introduction to Newsletter Content](https://support.helloretail.com/newsletter-content/introduction-to-newsletter-content/)

## An auto campaign shows the same content on every send

**Likely cause.** An auto campaign needs the newsletter platform to pass a unique campaign ID per send;
without it Hello Retail cannot tell sends apart. Not every platform supports this, and some need the
auto campaign's template ID in the integration.

**Fix.**

1. Confirm the platform supports auto campaigns. The articles list Mailchimp, Campaign Monitor,
   Ubivox, Apsis, Bizwizard, Heyloyalty, Klaviyo, Nomiro and SmartFocus (one article adds Rule).
2. Use the snippet generated for that platform in the auto campaign's **Code snippet** step, and paste
   it into the newsletter template the platform reuses.
3. If the platform cannot pass a unique ID, use a rolling campaign instead.
4. Klaviyo and Omnisend allow at most one auto send a day (see the feature page).

**Check with.** `newsletterContent_listCampaigns` — each send of a working auto configuration appears
as its own campaign.

**Source:** [Understanding the Different Campaign Types](https://support.helloretail.com/newsletter-content/understanding-the-different-campaign-types/) · [Set up an Auto Campaign Configuration](https://support.helloretail.com/newsletter-content/set-up-an-auto-campaign-configuration/)

> **May be outdated:** the two articles list different platforms (Rule is in one, not the other), and
> neither lists Omnisend, which the feature page and the Omnisend guide cover. Old names such as
> SmartFocus and Bizwizard suggest the list has not been reviewed in a while.

## Where do I find the template ID for an auto campaign

**Likely cause.** Some platform integrations ask for the auto campaign's template ID.

**Fix.**

1. Emails → Newsletter Content → **Auto campaigns**. The overview lists each auto campaign with its
   Template ID; copy it from there.

**Check with.** `newsletterContent_listCampaigns` for the auto (`TEMPLATE`) campaigns.

**Source:** [Locate Template ID for Auto Campaigns](https://support.helloretail.com/newsletter-content/locate-template-id-for-auto-campaigns/)

## Fixed products disappeared from an auto campaign

**Likely cause.** Fixed products go out with the first send of an auto campaign only and are then
dropped. The feature page adds that saving the campaign again re-arms them for the next send.

**Fix.**

1. Avoid fixed products on auto campaigns; the article advises against them.
2. For a product that must appear in one send, re-save the campaign before that send, or use a manual
   campaign for it.

**Source:** [Set up an Auto Campaign Configuration](https://support.helloretail.com/newsletter-content/set-up-an-auto-campaign-configuration/)

## A rolling campaign shows the same products as the last send

**Likely cause.** A rolling campaign refreshes on its own timer — the unlock frequency in days — not
per send. A newsletter sent before the period ends shows the previous content.

**Fix.**

1. Set the unlock frequency just below the send interval, for example six days for a weekly newsletter.
2. Use separate rolling campaigns for emails with different rhythms (order confirmation, shipping
   notice and so on).

**Source:** [Set up a Rolling campaign](https://support.helloretail.com/newsletter-content/set-up-a-rolling-campaign/) · [Understanding the Different Campaign Types](https://support.helloretail.com/newsletter-content/understanding-the-different-campaign-types/)

## Recommendations repeat across newsletters

**Likely cause.** Hello Retail skips products already shown to the same recipient in other campaigns,
but only within the last month and the ten most recent campaigns. Older or further-back campaigns are
not considered, and a reused manual snippet repeats by design.

**Fix.**

1. Use a new campaign per send (manual) or an auto campaign.
2. Vary the recommendation strategy (for example retargeting versus products on sale) between
   newsletters sent to the same list.

**Source:** [Introduction to Newsletter Content](https://support.helloretail.com/newsletter-content/introduction-to-newsletter-content/) · [Get Started With Newsletter Content](https://support.helloretail.com/newsletter-content/get-started-with-newsletter-content/)

## All auto campaigns show as one campaign in Google Analytics

**Likely cause.** The UTM `campaign` value was overridden on an auto campaign, so every send it creates
carries the same value.

**Fix.**

1. Open the auto campaign's **Code snippet** step → **UTM settings** and remove the override. The
   default is source `helloretail`, medium `email`, campaign = the campaign's own ID.
2. Override `medium` or `campaign` only on manual and rolling campaigns; `source` cannot be changed.

**Source:** [Newsletter Content and Google Analytics (UTM parameters)](https://support.helloretail.com/newsletter-content/newsletter-content-and-google-analytics-utm-parameters/)

## An auto campaign configuration shows no opens or clicks

**Likely cause.** The figures belong to the campaigns each send creates, not to the configuration
(see the feature page). A configuration with no sends listed has never served a tile — usually the
snippet is not in a newsletter yet.

**Fix.**

1. Open Newsletter Content → Analytics and read the individual sends, or their sum.
2. If there are no sends, confirm the snippet is in the newsletter template and the newsletter went out.

**Check with.** `newsletterContent_listCampaigns` for the sends under the configuration.

**Source:** [Understanding Newsletter Content analytics](https://support.helloretail.com/newsletter-content/understanding-newsletter-content-analytics/) · [Set up an Auto Campaign Configuration](https://support.helloretail.com/newsletter-content/set-up-an-auto-campaign-configuration/)

## The tile image is blurry or the tile layout is off

**Likely cause.** The tile HTML is rendered into an image by Hello Retail at twice the design's size,
not by the recipient's email client. Without `width` and `height` on the `<img>`, the email shows it at
double size; browser-style layout assumptions do not hold on a fixed canvas.

**Fix.**

1. Keep the `width` and `height` attributes from the generated snippet on every `<img>`.
2. Set the tile's size in the design, and lay it out for that fixed canvas — absolute positioning is
   fine. The template gets `product`, `width` and `height`.
3. Start from a starter template in Newsletter Content → Designs → **Create a new design**; **Edit
   source** lists the available variables below the editor.

**Source:** [Newsletter content (developer guide)](https://developer.helloretail.com/guides/newsletter_content/) · [Newsletter Content templates](https://developer.helloretail.com/guides/templates/newsletter_content/) · [Create a Newsletter Content design](https://support.helloretail.com/newsletter-content/create-a-newsletter-content-design/)

## A design edit did not reach the campaign or changed old emails

**Likely cause.** A Newsletter Content design has no draft. Per the feature page, an edit reaches
manual and rolling campaigns only when they are saved again, reaches auto campaigns at once, and
re-renders tiles in mail already delivered wherever it applies.

**Fix.**

1. For a design live campaigns use, copy it, edit the copy, and point the campaign at the copy.
2. Re-save manual and rolling campaigns that should pick up the change.

**Source:** [Create a Newsletter Content design](https://support.helloretail.com/newsletter-content/create-a-newsletter-content-design/)

## How do I identify recipients by customer ID instead of e-mail

**Likely cause.** The shop's ESP keys recipients on its own customer ID rather than e-mail.

**Fix.**

1. Set the customer ID on the tracking user with the JavaScript SDK on the shop, so browsing ties to it.
2. In the copied snippet, replace the `email=` parameter with `customerId=` in both the link and the
   image URL, filled with the ESP's customer-ID merge tag.

**Source:** [Get Started With Newsletter Content](https://support.helloretail.com/newsletter-content/get-started-with-newsletter-content/) · [Set a custom id on your customer (SDK)](https://developer.helloretail.com/sdk/tracking/set_custom_id_on_tracking_user/)

> **May be outdated:** the article links the custom-ID SDK example on an old API docs host, and its
> sample URLs use `;` instead of `&` between `template` and `campaign` and drop `https://` — do not copy
> them as they stand.
