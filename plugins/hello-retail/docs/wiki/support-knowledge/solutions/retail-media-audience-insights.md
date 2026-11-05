---
source: public-docs
verified: 2026-10-29
---

# Retail Media, Audience and Insights — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Retail Media](../../features/retail-media/retail-media.md), [Audience](../../features/audience/audience.md), [Insights](../../features/insights/insights.md), [Search](../../features/search/search.md), [Product Recommendations](../../features/product-recommendations/product-recommendations.md), [Pages](../../features/pages/pages.md)

| Symptom | Go to |
| --- | --- |
| Promoted products do not appear in a placement | [Not shown](#promoted-products-do-not-appear) |
| Promoted products vanish when the shopper sorts | [Sorting](#promoted-products-disappear-when-the-shopper-sorts) |
| A promoted product overrides our search boosts or fixed products | [Priority](#a-promoted-product-overrides-our-search-boosts-or-fixed-products) |
| A promoted product ignores a recommendation box's filter | [Filters](#a-promoted-product-ignores-a-recommendation-boxs-filter) |
| One campaign wins over another | [CPM](#one-campaign-is-shown-much-more-than-another) |
| A campaign ended earlier than planned | [Campaign end](#a-campaign-ended-earlier-than-planned) |
| CTR looks very low, or impressions look too high | [Impressions](#ctr-is-low-or-impressions-look-too-high) |
| Sold items stay at zero | [Sold items](#sold-items-stay-at-zero) |
| Promoted products need a "Sponsored" badge | [Badge](#how-do-i-badge-promoted-products) |
| Retail Media products in Search initial content | [Initial content](#can-retail-media-show-in-search-initial-content) |
| A banner campaign does not show | [Banner not shown](#a-banner-does-not-show) |
| A banner renders as an empty or wrongly sized tile | [Banner layout](#a-banner-renders-as-an-empty-or-wrongly-sized-tile) |
| A banner shows in the wrong context | [Banner relevancy](#a-banner-shows-in-the-wrong-context) |
| Banner clicks are not tracked in a custom frontend | [Banner tracking](#banner-clicks-are-not-tracked-in-a-custom-frontend) |
| AI banner generation has no tokens left | [Tokens](#ai-banner-generation-has-no-tokens-left) |
| Audience lists customers as "Anonymous" or the e-mail download is short | [Anonymous](#audience-shows-customers-as-anonymous) |
| Audience figures are out of date | [Update](#audience-figures-are-out-of-date) |
| The Facebook audience sync stopped | [Facebook](#the-facebook-audience-sync-stopped) |
| How do I use an audience in Mailchimp | [Mailchimp](#how-do-i-send-an-audience-to-mailchimp) |
| An Insight disappeared, or an actionable Insight can no longer be acted on | [Insights](#an-insight-disappeared-or-can-no-longer-be-acted-on) |

## Promoted products do not appear

**Likely cause.** No positions are selected for that solution and device under Retail Media →
Settings (then campaigns never show there), the campaign is outside its schedule or has hit a goal,
or no product matches. In Search a promoted product is only lifted if it is already in the result
set. API integrations must send the device type so the right placements apply.

**Fix.**

1. Retail Media → Settings: select positions for Search, Recommendations, Pages and Newsletter
   separately for desktop and mobile.
2. Open the campaign: check schedule, goals, the promoted products and attribute conditions, and any
   campaign-specific placements.
3. For Search, test a query that already returns the product organically.
4. For API integrations, add the device type (`deviceType`) to the request.

**Check with.** `retailMedia_getSettings` for positions; `retailMedia_listCampaigns` for state and dates.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## Promoted products disappear when the shopper sorts

**Likely cause.** Expected. When Search or Pages results are sorted on anything other than
popularity, promoted items are removed and not counted.

**Fix.**

1. None needed; explain the behaviour.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## A promoted product overrides our search boosts or fixed products

**Likely cause.** Retail Media campaigns have the highest priority and win over synonyms, boosts,
fixed or removed products, personalisation and matching mode when they conflict.

**Fix.**

1. To keep a campaign out of one solution, disable that placement for the campaign under
   Campaign Specific Placements.
2. Otherwise adjust the campaign's products or conditions.

**Check with.** `search_getProductEngineBoosts` and `search_getProductEngineElevates` to see what the
campaign is competing with.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## A promoted product ignores a recommendation box's filter

**Likely cause.** Retail Media respects only global filters. Filters on individual recommendation
steps are skipped, so a promoted product can differ from one step's source filter.

**Fix.**

1. Put the rule in the box's global filter if promoted products must respect it.

**Check with.** `recoms_getAlgorithm` for where the filter sits.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## One campaign is shown much more than another

**Likely cause.** Among equally relevant campaigns, the CPM value acts as weighted tickets in a draw.
A campaign with ten times the CPM of another is chosen about ten times as often. Relevance is weighed
first.

**Fix.**

1. Adjust the CPM values on the competing campaigns.
2. Use Campaign Specific Placements to give a campaign positions of its own; its products can show
   there even when they lose on relevance or CPM in the global positions.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## A campaign ended earlier than planned

**Likely cause.** A campaign ends at whichever comes first: its end date or its impression or click goal.

**Fix.**

1. Raise or remove the goal, or extend the end date, and reactivate.
2. Add an e-mail address on the campaign to be notified when it ends.

**Check with.** `retailMedia_listCampaigns`.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## CTR is low or impressions look too high

**Likely cause.** An impression is counted when a promoted item is in the response, even off-screen
— four promoted products in a slider are four impressions. Impressions only count when the item was
lifted above its organic position. Partial typing in Search does not count as a search.

**Fix.**

1. Expected; compare campaigns with each other rather than with organic CTR.
2. On mobile sliders, put promoted positions first so they are actually seen.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## Sold items stay at zero

**Likely cause.** A sale is credited only when the same promoted item is bought within seven days of a
campaign click, under the same cookie. Conversion tracking must carry item-level lines with price
and quantity.

**Fix.**

1. Make conversion tracking send every line with product, price and quantity.

**Check with.** `orders_list` — orders should show item lines.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/) · [Conversion tracking (SDK)](https://developer.helloretail.com/sdk/tracking/conversion_tracking/)

## How do I badge promoted products

**Likely cause.** Promoted items carry `retailMediaCampaignId` in the response; organic items do not.

**Fix.**

1. In the product loop of the design, test the field and add a class (or check for a specific campaign ID):

```liquid
<div class="hr-product{% if product.retailMediaCampaignId %} hr-sponsored{% endif %}">
```

2. Style the class in the design's CSS or the shop's own CSS.

**Check with.** `search_getDesign`, `recoms_getDesign` or `pages_getDesign` for the template.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

## Can Retail Media show in Search initial content

**Likely cause.** Not supported according to the article.

**Fix.**

1. Use promoted products in regular Search results, Recommendations or Pages instead.

**Source:** [Retail Media](https://support.helloretail.com/retail-media/retail-media/)

> **May be outdated:** the article answers this with "not yet", so it may have changed.

## A banner does not show

**Likely cause.** The feature's template is not adapted to render `isBanner` items, the size name in the
template does not match a size defined under Retail Media → Settings → Banner Sizes, the campaign
has no image for that size (the URL is empty and the guard skips it), or the campaign is in
**Review**, which only shows to staff logged in to the dashboard.

**Fix.**

1. Adapt every design that should show banners: branch on `product.isBanner` and read the image from
   `product.bannerImages.SIZE_NAME.url`, with `BANNER_SIZE_NAME_PLACEHOLDER` replaced by the real size name.
2. Add the missing size in Settings → Banner Sizes and edit the campaign to include it.
3. Set the campaign state to **Live**.
4. In a custom frontend, send `includeRetailMediaInReview: true` to see Review campaigns while testing.

**Check with.** `retailMedia_listCampaigns` and `retailMedia_getSettings`; `search_getDesign`,
`recoms_getDesign` or `pages_getDesign` for the `isBanner` branch.

**Source:** [Banners](https://support.helloretail.com/retail-media/banners/) · [Integrating Retail Media Banners](https://developer.helloretail.com/guides/templates/retail_media_banners/) · [API Integration for Retail Media Banners](https://developer.helloretail.com/api/retailmedia/banners/)

> **May be outdated:** the Banners article's link for full API integrations points to the template
> guide; the API guide is the second developer link above.

## A banner renders as an empty or wrongly sized tile

**Likely cause.** The banner image is a CSS background on `.hr-b-image`, which needs a height; if any
container between the tile and `.hr-b-image` lacks `height: 100%`, the image collapses. Sizes measured
wrongly give mismatched creatives.

**Fix.**

1. Give every intermediate container `height: 100%` down to `.hr-b-image`; in Swiper sliders the
   guide also unsets the slide height.
2. Measure each listing at 100 percent browser zoom with DevTools on the outermost wrapper, desktop and
   mobile, and register each size under Banner Sizes with a short name without spaces (for example
   `search_desktop`). Newsletter sizes are under Newsletter Content → Designs.

**Source:** [Integrating Retail Media Banners](https://developer.helloretail.com/guides/templates/retail_media_banners/) · [Banners](https://support.helloretail.com/retail-media/banners/)

## A banner shows in the wrong context

**Likely cause.** Each banner has one relevancy source — Products (their clusters), Hierarchies,
Brands or Always — and they are mutually exclusive. Banners compete with promoted products; the
highest-scoring item wins each position.

**Fix.**

1. Switch the banner to Hierarchies or Brands where product clusters are too coarse.
2. To combine two conditions, add a second banner to the campaign.

**Source:** [Banners](https://support.helloretail.com/retail-media/banners/)

## Banner clicks are not tracked in a custom frontend

**Likely cause.** The banner's `url` carries the tracking fragment; a link built from another URL
loses it.

**Fix.**

1. Use `item.url` as the `href`, or call `trackClick` with the banner's `trackingCode` when tracking by hand.

**Source:** [API Integration for Retail Media Banners](https://developer.helloretail.com/api/retailmedia/banners/)

## AI banner generation has no tokens left

**Likely cause.** The subscription includes 250 AI banner generation tokens a month; they reset at the
end of the month.

**Fix.**

1. Upload finished PNG or JPG files with **Manual Upload**, or wait for the reset.

**Source:** [Banners](https://support.helloretail.com/retail-media/banners/)

## Audience shows customers as Anonymous

**Likely cause.** Hello Retail has no synced permission for the address, so it masks it; or it has no
e-mail for the customer at all, because conversion tracking does not send the shopper's e-mail.
"Download emails" contains only permissioned addresses.

**Fix.**

1. Set up automatic permission sync from the newsletter platform, or upload the list regularly.
2. Check that orders carry the customer's e-mail; if not, fix conversion tracking.

**Check with.** `orders_list` — each order should include the customer's e-mail.

**Source:** [Audience: Email Addresses and Permissions](https://support.helloretail.com/audience/audience-email-addresses-and-permissions/) · [Insights for Audience: How to Interpret the Data](https://support.helloretail.com/audience/insights-for-audience-how-to-interpret-the-data/)

## Audience figures are out of date

**Likely cause.** An audience is calculated when created and recalculated on demand.

**Fix.**

1. Press **Update** on the audience. Processing can take a while; an e-mail arrives when it is done.
2. Historical orders from before Hello Retail are only included once they are uploaded.

**Source:** [Insights for Audience: How to Interpret the Data](https://support.helloretail.com/audience/insights-for-audience-how-to-interpret-the-data/) · [How to Use Audience](https://support.helloretail.com/audience/how-to-use-audience/)

## The Facebook audience sync stopped

**Likely cause.** Facebook authorisation expires after two months. Visiting the Audience section of
the dashboard renews it; without that, the sync stops. A reminder e-mail goes out seven days before.

**Fix.**

1. Check the expiry date on the Integrations page.
2. Re-add the integration from the audience's **Facebook** button, log in and grant permission, and
   pick the ad account.
3. The ad account must belong to the Facebook Business Manager, with ads management permission for the user.

**Source:** [Facebook Integration for Audience](https://support.helloretail.com/audience/facebook-integration-for-audience/)

## How do I send an audience to Mailchimp

**Likely cause.** There is no direct push; the audience is exported as a file.

**Fix.**

1. Open the audience → **Customers** → **Download emails** (permissioned addresses only).
2. In Mailchimp, import the CSV with status Subscribed, leave "Update any existing contacts" off, and
   tag it after the audience.
3. Send to the tag; a manual Newsletter Content campaign suits a one-off send.

**Source:** [Audience example: Using Audience with Mailchimp](https://support.helloretail.com/audience/audience-example-using-audience-with-mailchimp/)

## An Insight disappeared or can no longer be acted on

**Likely cause.** Insights are generated every seven days and new ones replace the Open tab. Rating
an Insight or completing its action moves it to the Archive. An actionable Insight completed by another
user can only be rated.

**Fix.**

1. Look in the **Archive** tab; all earlier Insights stay there.
2. Only five Insights show at a time; the sidebar shows the total.

**Source:** [Insights Overview](https://support.helloretail.com/insights/insights-overview/)
