---
source: support-docs
upstream: https://support.helloretail.com/product-recommendations/recommendation-strategies/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Recommendation Strategies"
description: "Overview of Hello Retail recommendation strategies, including ranking logic and configuration options available in the Recommendations dashboard."
tags: ""
---

# Recommendation Strategies

This article lists the recommendation strategies available in the Hello Retail dashboard and explains how each one works. As of February 2025, the following algorithm steps can be selected from the "Recommendations" menu:

## Alternatives

Selects products similar to the _currently viewed product_.

Recommendations are ranked by similarity to the current product. You can optionally prioritize products with a price close to the current product’s price. Similarity remains the primary ranking signal. When two products have similar relevance, the price weighting slider lets you decide how much to favor price proximity.

## Bought together

Picks products that are frequently purchased together with the currently viewed product.

By default, items are ranked by co-purchase frequency. As with Alternatives, you can also apply optional price similarity weighting.

## Manual product selection

Manually choose exactly which products to show. Find products by searching for title or URL in the search field.

## Related products

Shows products that many visitors view together with the currently viewed product.

## Retargeted products

Uses the individual user’s browsing history (tracked by cookie). Products are ordered by recency: most recently viewed first.

## Top products

Shows the most popular products, ranked by how often a product is sold relative to how often it is viewed across all visitors.

## Search

Runs a product search, typically on attributes like title. Often used to match products that share terms with the current product’s name. This is a query-based approach rather than a behavioral algorithm.

## Recently bought

Similar to _Retargeted products_, but based on the user’s recent _purchases_ instead of views. Ordered by recency of purchase.

## Current cart contents

Returns the products currently in the user’s cart (tracked by cookie). A cart is considered current if it has been updated within the last 20 minutes.

## Most bought

Shows products that are purchased most often across the shop. A time-decay is applied so recent buying behavior weighs more than older sales. Seasonal items will appear less over time unless purchases continue.

## Most viewed

Shows products with the highest total views across all visitors.

## Products viewed together

Returns products that many visitors view together with either:
- the user’s _recently viewed_ products, or
- the user’s _recently bought_ products.

Select the source in the "Viewed with" dropdown. The underlying co-view signals come from all visitors; the user’s own items determine the anchor context.

## Products bought together

Same configuration options as above, but results are based on co-purchase signals from all visitors rather than co-views. Choose whether to anchor on the user’s recently viewed or recently bought products.

## Random products

Outputs a selected number of random products. Useful when you want high variation and do not need relevance to other products.

## Recently created

Shows products sorted by creation date, descending. You can provide a creation date per product in the product feed. If a product has no creation date, Hello Retail uses the first-seen timestamp in the system.
