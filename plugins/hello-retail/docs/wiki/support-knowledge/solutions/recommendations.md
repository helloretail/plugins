---
source: public-docs
verified: 2026-10-29
---

# Recommendations — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Product Recommendations](../../features/product-recommendations/product-recommendations.md), [when a change reaches visitors](../../onboarding/when-changes-go-live.md), [review and testing](../../onboarding/review-and-testing.md), [recom layout troubleshooting](../../cheat-sheets/recoms/layout-troubleshooting.md), [script not loading](../script-not-loading.md)

| Symptom | Go to |
| --- | --- |
| The box does not appear on the page | [Box missing](#a-recommendation-box-does-not-appear-on-the-page) |
| The box shows for me but not for shoppers, or design changes do not show | [Draft and publish](#the-box-shows-for-me-but-not-for-shoppers) |
| The Hello Retail panel does not open on the storefront | [Panel missing](#the-hello-retail-panel-does-not-open-on-the-storefront) |
| The box jumps or pushes content down while loading | [Jumping box](#the-box-jumps-or-pushes-the-page-down-while-loading) |
| Two boxes on one page show different products than expected, or one is short | [Several boxes](#several-boxes-on-one-page-share-or-compete-for-products) |
| The box shows the wrong products | [Wrong products](#the-box-shows-the-wrong-products) |
| The box is short or empty after adding filters | [Over-filtered](#the-box-is-short-or-empty-after-adding-filters) |
| Only show products under a price, or cheaper than the viewed one | [Price filters](#only-show-products-in-a-price-range) |
| Keep to the same brand or category, or exclude one | [Brand and category filters](#keep-recommendations-to-the-same-brand-or-category-or-exclude-one) |
| A specific product must be in the box | [Fixed products](#a-specific-product-must-always-be-in-a-box) |
| Always pair two products, or never pair them | [Pinned and blacklisted](#always-or-never-recommend-a-product-next-to-another) |
| A product must never be recommended | [Exclude a product](#a-product-must-never-be-recommended) |
| A product is in the wrong category or has wrong data | [Product data](#a-product-has-the-wrong-category-or-data-in-recommendations) |
| The product-page box ignores the viewed product | [Page context](#the-product-page-box-ignores-the-product-being-viewed) |
| The recently-viewed box is empty | [Retargeted box empty](#the-recently-viewed-or-cart-box-is-empty) |
| The upsell box does not open on add to cart | [Upsell](#the-upsell-box-does-not-open-on-add-to-cart) |
| Change a box's headline, or reuse one design with different headlines | [Headlines](#change-a-box-headline-or-reuse-a-design-with-different-headlines) |
| The box's CSS breaks other parts of the page | [CSS leaks](#the-box-css-changes-other-parts-of-the-page) |
| Move a box to another place on the page | [Placement](#move-a-box-to-another-place-on-the-page) |
| Prices or the buy button in the box behave differently from the shop | [Prices and buy button](#prices-or-the-buy-button-in-the-box-differ-from-the-shop) |
| Show recommendations in a Sleeknote popup | [Sleeknote](#show-recommendations-in-a-sleeknote-popup) |

## A recommendation box does not appear on the page

**Likely cause.** In order of likelihood: the box is still a draft; the placement `<div>` for the box
is not on the page (or the placement selector matches nothing); the box's **Show** setting
excludes the device; the page type has a built-in condition. Before any of this, rule out the
script itself — see [script not loading](../script-not-loading.md).

**Fix.**

1. Check the box's state and publish it if it is a draft.
2. Open **Recommendations → Overview → (box) → Placement settings**, copy the box's div and make
   sure it is in the page's HTML where the box should render; a custom selector must match an
   element on that page.
3. Check **General → Show**: only mobile, only desktop, or both.
4. Category pages that list fewer than 10 products do not render recommendations.
5. Cart boxes need at least one product in the cart.

**Check with.** `recoms_list` (state), `recoms_getPlacement` (selector), `recoms_getGeneralSettings`
(`responsiveMode` is the Show setting).

**Source:** [How to Add Product Recommendations to your Webshop](https://support.helloretail.com/general-setup/how-to-add-product-recommendations-to-your-webshop/) · [Getting Started with Product Recommendations](https://support.helloretail.com/product-recommendations/getting-started-with-product-recommendations/) · [Review Category Page Recommendations](https://support.helloretail.com/general-setup/review-category-page-recommendations/) · [Review Cart Page Recommendations](https://support.helloretail.com/general-setup/review-cart-page-recommendations/)

## The box shows for me but not for shoppers

**Likely cause.** Edits to a box, and to a design, are saved as drafts. While logged in to Hello
Retail you see drafts on the storefront; shoppers see only what is published. A design change puts
pending changes on every box that uses the design.

**Fix.**

1. Publish the box: **Recommendations → Overview → (box) → Save and publish**.
2. After a design edit, publish the pending change on each box using it — the design view lists
   those boxes and can publish them.
3. Test as a shopper in a private window.

**Check with.** `recoms_list` for the state of each box.

**Source:** [Getting Started with Product Recommendations](https://support.helloretail.com/product-recommendations/getting-started-with-product-recommendations/) · [Review Product Page Recommendations](https://support.helloretail.com/general-setup/review-product-page-recommendations/)

> **May be outdated:** the review articles disagree on the panel's publish button — **Make Live**
> in most, **Publish** / **Unpublish** in the product-page article. The field page
> [review and testing](../../onboarding/review-and-testing.md) treats the panel's **Show** toggle
> as a session-local preview; publish from the dashboard.

## The Hello Retail panel does not open on the storefront

**Likely cause.** The browser blocks cross-site tracking or third-party cookies, or you are not
logged in to Hello Retail in that browser.

**Fix.**

1. Log in to Hello Retail, then open the shop in the same browser.
2. Allow cross-site tracking and third-party cookies for the shop, or turn off tracking
   prevention, while testing.
3. The panel icon sits bottom-left; its product-box list shows the boxes found on that page.

**Source:** [Review Frontpage Recommendations](https://support.helloretail.com/general-setup/review-frontpage-recommendations/) · [Review 404 Page Recommendations](https://support.helloretail.com/general-setup/review-404-page-recommendations/)

## The box jumps or pushes the page down while loading

**Likely cause.** Recommendations are injected after the page has rendered, so the content below
moves down by the box's height (layout shift, CLS).

**Fix.**

1. Reserve the space on the shop's own container div, before Hello Retail renders. The quick
   version is an inline style:

   ```html
   <div class="hr-frontpage-box-1" style="min-height: 300px; width:100%; background: transparent; visibility: visible;"></div>
   ```

2. Better: measure the rendered height per breakpoint and set a `min-height` per media query on a
   class added to each box div.
3. The fix assumes the box renders into the recommended div container the shop places itself.
4. For layout problems after the box has loaded (gutters, slider height), see
   [recom layout troubleshooting](../../cheat-sheets/recoms/layout-troubleshooting.md).

**Check with.** DevTools device emulation: measure the rendered box at each breakpoint.

**Source:** [How to fix jumping recommendations](https://support.helloretail.com/product-recommendations/how-to-fix-jumping-recommendations/) · [Improve CLS score](https://support.helloretail.com/product-recommendations/improve-cls-score/)

## Several boxes on one page share or compete for products

**Likely cause.** Boxes on one page never repeat a product; the box with the lowest load order picks
first and later boxes skip what it took. Boxes with the same load order pick in random order, so
their contents change from visit to visit.

**Fix.**

1. Open each box on the page: **General → Load order**, 1 (first) to 10 (last).
2. Give every box on a page its own value; put the retargeted box first — see
   [load order](../../features/product-recommendations/product-recommendations.md).
3. A second box cannot show the same products as the first. Solve a repeated row in the theme
   instead.

**Check with.** Each box's load order (`priority` in the MCP) via `recoms_getGeneralSettings`.

**Source:** [How to Set Up Load Order](https://support.helloretail.com/product-recommendations/how-to-setup-load-order/) · [Recommendations SDK](https://developer.helloretail.com/sdk/recoms/)

> **May be outdated:** the article also says that boxes sharing one placement element are inserted
> in load-order sequence (lower renders higher). The field page
> [Product Recommendations](../../features/product-recommendations/product-recommendations.md)
> describes load order as product allocation only, not position. Do not rely on load order to
> position boxes.

## The box shows the wrong products

**Likely cause.** The box is doing what its strategy says; the strategy is not what the customer
assumes. The box title says nothing about the strategy.

**Fix.**

1. Read the strategy steps and their order; compare with what each step selects (for example Top
   products ranks sales relative to views; Most bought ranks purchases with time decay; Most viewed
   ranks views).
2. Then check global and per-step filters, fixed and pinned products.
3. Change the strategy under **Recommendation Strategy → Customize**, then **Save and publish**.
4. Work through [when a box shows the wrong products](../../features/product-recommendations/product-recommendations.md).

**Check with.** `recoms_getAlgorithm`.

**Source:** [Recommendation Strategies](https://support.helloretail.com/product-recommendations/recommendation-strategies/) · [Customizable Recommendation Strategy Steps](https://support.helloretail.com/product-recommendations/customizable-recommendation-strategy-steps/)

## The box is short or empty after adding filters

**Likely cause.** Every filter narrows the pool the strategy can pick from; enough of them exhaust
it. Filters are also applied after pinned products are inserted, so a filter can remove a pin.

**Fix.**

1. Remove filters one at a time until the box fills.
2. Use a global filter for the rule that must hold for every product, and a source filter on a
   single step for the narrower rule, with **Max products** on that step.
3. Add a fallback step (for example Top products) below the narrow one.

**Check with.** `recoms_getAlgorithm` (global filters, steps, per-step limits).

**Source:** [Product Recommendations — Filters](https://support.helloretail.com/general-setup/product-recommendations-filters/) · [Pinned Products](https://support.helloretail.com/general-setup/pinned-products/)

## Only show products in a price range

**Likely cause.** No price filter is set on the box. Price filters are per box; there is no
account-wide setting.

**Fix.**

1. Open the box, expand **Recommendation strategy** and click **Add filter**; choose **price** and
   an operator (matches, does not match, greater than, less than).
2. For a value use a number, or a dynamic value: `$price` (the viewed product's price),
   `$user.avgPrice` (the visitor's average), or `$price|freeShipping:500,200` for cart boxes —
   the free-shipping threshold, and how far above the remaining amount a product may go.
3. Save and publish.

**Check with.** `recoms_getAlgorithm`.

**Source:** [Manage the Price of Recommended Products](https://support.helloretail.com/general-setup/manage-the-price-of-recommended-products/) · [How To Edit Global Price Filters For Recommendations](https://support.helloretail.com/product-recommendations/how-to-edit-global-price-filters-for-recommendations/)

## Keep recommendations to the same brand or category or exclude one

**Likely cause.** Strategies pick on behaviour across the catalog; constraints need filters.

**Fix.**

1. Open the box, **Recommendation Strategy → Add filter**.
2. Same brand as the viewed product: field **brand**, operator **match**, the viewed product's
   brand. Exclude a brand: **does not match**.
3. Categories use **hierarchies** with **matches any of** or **matches none of**.
4. Add one filter per brand or hierarchy, then **Save and publish**.

**Check with.** `recoms_getAlgorithm`; `productData_getFieldValues` for the exact brand and
hierarchy values.

**Source:** [How To Add/Remove Global Brand Filters](https://support.helloretail.com/product-recommendations/how-to-addremove-global-brand-filters-for-recommendations/) · [How To Add/Remove Global Hierarchies Filters](https://support.helloretail.com/product-recommendations/how-to-addremove-global-hierarchies-filters-for-recommendations/) · [Product Recommendations — Filters](https://support.helloretail.com/general-setup/product-recommendations-filters/)

## A specific product must always be in a box

**Likely cause.** Algorithms choose products from behaviour; forcing one in needs a fixed product
or a **Manual product selection** step.

**Fix.**

1. On the storefront, open the product, open the Hello Retail panel and copy the URL from
   **Page Details**.
2. Go to the page with the box, open **Product Boxes** in the panel, choose the box, then
   **Edit fixed products → Add fixed product**, paste the URL and **Save**.
3. Alternatively add a **Manual product selection** step at the top of the strategy.

**Check with.** `recoms_getAlgorithm`.

**Source:** [How to Add Fixed Products in Product Recommendations](https://support.helloretail.com/product-recommendations/how-to-add-fixed-products-in-product-recommendations/) · [Recommendation Strategies](https://support.helloretail.com/product-recommendations/recommendation-strategies/)

> **May be outdated:** the article links to the Search fixed-products article, which is
> deprecated — Search fixed products were replaced by Search Word Boosts. Confirm the panel still
> offers **Edit fixed products** for boxes before sending these steps.

## Always or never recommend a product next to another

**Likely cause.** Alternatives and Bought together are computed; per-product overrides change them.

**Fix.**

1. Go to **Products**, open the product, then the **Settings** tab.
2. Under **Algorithm Overrides: Alternatives** or **Algorithm Overrides: Bought Together**, search
   and add products to pin them (they come first, in the order set), or add them to
   **Blacklisted products**.
3. Pins only affect Alternatives and Bought together steps.
4. A pin can still be removed by a box filter (for example in-stock), because filters run after pins.
5. A blacklisted product still showing: reload the page, and check it was saved to the right
   section.

**Check with.** `recoms_getAlgorithm` to confirm the box uses Alternatives or Bought together.

**Source:** [Pinned Products](https://support.helloretail.com/general-setup/pinned-products/) · [Product Lookup](https://support.helloretail.com/general-setup/product-lookup/)

## A product must never be recommended

**Likely cause.** Utility items (gift cards, return labels, gift wrap, shipping labels) are in the
feed like any product.

**Fix.**

1. Per product: **Products → (product) → Product Settings**, switch off visibility for
   Recommendations (and any other service) and save. Search visibility is separate.
2. Per box: on a strategy step, enable **Exclude products** so products that step finds are kept
   out of all later steps.

**Check with.** `productData_get` for the product.

**Source:** [Product Lookup](https://support.helloretail.com/general-setup/product-lookup/) · [Customizable Recommendation Strategy Steps](https://support.helloretail.com/product-recommendations/customizable-recommendation-strategy-steps/)

## A product has the wrong category or data in recommendations

**Likely cause.** The feed value is wrong, or the AI-assigned cluster or tags are wrong.

**Fix.**

1. Open the product in **Products** and switch on **Developer Mode** to see the raw indexed values;
   the clock icon next to a field shows its change history.
2. Feed value wrong: fix it in the feed.
3. Cluster or tags wrong: edit them in the **Product Intelligence** section. A manual change
   overrides the automatic one across all services until changed again.

**Check with.** `productData_get`; `feeds_getLatestRun` to see when the feed last updated.

**Source:** [Product Lookup](https://support.helloretail.com/general-setup/product-lookup/)

## The product-page box ignores the product being viewed

**Likely cause.** Product-based steps (Alternatives, Bought together, Related) find the viewed
product by the page URL. If the page URL does not match the product URL in the catalog, or a filter
needs a value that is not in the URL, the box has no context.

**Fix.**

1. Add a crawl config on the box: **Recommendations → (box) → Context for recommendation
   algorithm**. One rule per line:

   ```text
   brand: $("[itemprop=brand]").text()
   extraData.color: $("#product-info").data("color")
   hierarchies: [$(".breadcrumb a")]
   ```

2. The fields `url`, `urls` and `productNumbers` tell product-based steps which product the box is
   about; extract one of them when the page URL does not match the catalog URL.
3. Wrap a breadcrumb in `[...]` so it is one hierarchy with several levels; a flat list is
   discarded.
4. Reference extracted values in filters as `$input.<field>`, for example `brand` equals
   `$input.brand`.
5. A rule that matches nothing yields no value without an error, so test each selector in DevTools.

**Check with.** `recoms_getContextCrawlConfig`; `productData_get` with the page URL.

**Source:** [Extracting context for managed recommendations](https://developer.helloretail.com/guides/extracting_context_for_recommendations/)

## The recently-viewed or cart box is empty

**Likely cause.** Retargeted products come from the visitor's own view history (by cookie), so a
first-time visitor has none. Current cart contents only counts a cart updated within the last 20
minutes.

**Fix.**

1. Test after viewing a few products in the same browser.
2. Add a fallback step (for example Top products) after the retargeted step.
3. Give the retargeted box load order 1 so other boxes do not take its products first.
4. A custom frontend calling the API must send the visitor's tracking user id for these steps.

**Check with.** `recoms_getAlgorithm`.

**Source:** [Recommendation Strategies](https://support.helloretail.com/product-recommendations/recommendation-strategies/) · [Recommendations REST API](https://developer.helloretail.com/api/recoms/)

## The upsell box does not open on add to cart

**Likely cause.** Upsell boxes load on the add-to-cart click, which Hello Retail detects by watching
the button given in the box's **Buy Button** field. A wrong or missing selector means nothing
fires.

**Fix.**

1. Open the upsell box, **Design → Buy Button**, and enter the ID of the shop's add-to-cart button
   prefixed with `#`.
2. Preview and publish from the panel only while the upsell is open on the page; the controls are
   only available then.

**Check with.** On the storefront, `document.querySelector()` with the value must return the button.

**Source:** [Upsell recommendations](https://support.helloretail.com/product-recommendations/upsell-recommendations/) · [Review Upsell Recommendations](https://support.helloretail.com/general-setup/review-upsell-recommendations/)

## Change a box headline or reuse a design with different headlines

**Likely cause.** The headline is a design input, set per box.

**Fix.**

1. Open the box, **Design**, change the headline and labels, then save and publish.
2. In a design, `{% input headline %}` creates a per-box field. For an optional field use block
   mode, which renders nothing when the box leaves it empty:

   ```liquid
   {% input subheadline %}<h2>{{ subheadline }}</h2>{% endinput %}
   ```

**Check with.** `recoms_getDesign`.

**Source:** [How to Edit Titles on Product Recommendations](https://support.helloretail.com/product-recommendations/how-to-edit-titles-on-product-recommendations/) · [Getting Started with Product Recommendations](https://support.helloretail.com/product-recommendations/getting-started-with-product-recommendations/) · [Recommendation templates](https://developer.helloretail.com/guides/templates/recommendations/)

## The box CSS changes other parts of the page

**Likely cause.** The design's CSS is injected into the page with the rendered box; unscoped rules
apply to the whole page.

**Fix.**

1. Prefix every rule with the box container's selector.
2. The design is shared by every box using it, so check the other pages those boxes are on.

**Check with.** `recoms_getDesign`.

**Source:** [Getting Started with Product Recommendations](https://support.helloretail.com/product-recommendations/getting-started-with-product-recommendations/)

## Move a box to another place on the page

**Likely cause.** The box renders where its div is, or where its custom placement selector points.

**Fix.**

1. With the default selector, move the box's div in the shop's template.
2. If **Placement settings** shows a custom selector, change it, or toggle **Switch to the default
   selector** and place the box's code snippet in the template. Save.

**Check with.** `recoms_getPlacement`.

**Source:** [How to edit a Product Recommendation box](https://support.helloretail.com/product-recommendations/how-to-edit-a-product-recommendation-box/) · [How to Add Product Recommendations to your Webshop](https://support.helloretail.com/general-setup/how-to-add-product-recommendations-to-your-webshop/)

## Prices or the buy button in the box differ from the shop

**Likely cause.** Displayed price, currency and VAT come from the feed and the website's price
format, not from the box. The buy button is the design's.

**Fix.**

1. Compare the product's price fields in Hello Retail with the shop; fix differences in the feed.
2. The design can use `priceFormat`, the website's configured price format.
3. For products with variants the buy button should send the shopper to the main product page —
   see [add to cart](../../platforms/add-to-cart.md).

**Check with.** `productData_get`; `recoms_getDesign`.

**Source:** [Review Cart Page Recommendations](https://support.helloretail.com/general-setup/review-cart-page-recommendations/) · [Recommendation templates](https://developer.helloretail.com/guides/templates/recommendations/)

## Show recommendations in a Sleeknote popup

**Likely cause.** Not a fault — a setup question.

**Fix.**

1. In Sleeknote, open the campaign, **Add Elements**, and drag the Hello Retail plugin into place.
2. Copy the box's **Product Box Key** (in the box's **General** section) into the Sleeknote ID
   field and save the campaign.
3. Strategy and design are then managed in Hello Retail and apply to the popup at once. Name the
   box so it is clear it serves Sleeknote.

**Check with.** `recoms_list` to find the box.

**Source:** [Sleeknote integration](https://support.helloretail.com/product-recommendations/sleeknote-integration/)
