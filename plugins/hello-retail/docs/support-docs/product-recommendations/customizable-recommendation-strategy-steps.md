---
source: support-docs
upstream: https://support.helloretail.com/product-recommendations/customizable-recommendation-strategy-steps/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Customizable Recommendation Strategy Steps"
description: "Configure customizable recommendation strategy steps to control which products are shown, including filters, step types, exclusions, and publishing."
tags: ""
---

# Customizable Recommendation Strategy Steps

This guide explains how to configure customizable recommendation strategy steps so you can control exactly which products are shown to customers.

You achieve this by adding, configuring, and ordering algorithm steps that return the products you want to display.

Follow the procedure below:

1\. Navigate to the **Recommendation** section in your Hello Retail dashboard, click **Overview** in the dropdown menu, then select the recommendation you need (this example uses the **Retargeted** products type) or create a new one.

You can see how to [create](how-to-create-your-own-product-recommendations.md) or [edit](how-to-edit-a-product-recommendation-box.md) a product recommendation box in these guides. For an overview of recommendation types, see [this article](different-types-of-product-recommendations.md).

2. Click on the Recommendation Strategy in the Box Editor section. Here you can add filters to your recommendation. More information about filters can be found [here](../general-setup/product-recommendations-filters.md).

Then click on **Customize** in the dropdown menu.

3. To add another recommendation strategy step, click on the Add another step box below the steps you already have (if any) and select the recommendation type from the dropdown menu.

_This GIF demonstrates how to interact with Hello Retail's functionality_

4\. In the following window, you can change the type of recommendation step in the **Type** box.

_This GIF demonstrates how to interact with Hello Retail's functionality_

> **Note:**
>
> Find details about recommendation types (strategies) [here](recommendation-strategies.md#). This example uses a cart recommendation page to suggest products related to items in the cart.

In the logic step box, below the **Type** box, configure cart upsell conditions. Use these conditions to promote products related to items in the cart. For example, target specific products so that when a match is detected, the customer is shown related items that complement the main product.

_This GIF demonstrates how to interact with Hello Retail's functionality_

Enable **Exclude products** to remove products returned by this step from all subsequent steps.

> **Note:**
>
> Use Exclude products to suppress utility items such as free shipping labels, gift cards, or gift wrapping so they do not appear in later steps.

Enable **Use as related products** to treat the products found in this step as the related product context for subsequent steps.

> **Note:**
>
> Use this when you want later steps to reference these results for related-to logic, for example to surface items that are frequently bought together.

The **Starting point** box sets a threshold to include products viewed more than the specified number of days ago.

In the **Max products** box, set the number of products to show. Zero means no limit.

Enable **Only offers** to show only products that are on sale.

> **Note:**
>
> Showing discounted products can increase engagement and conversions when running sales-focused recommendations.

_This GIF demonstrates how to interact with Hello Retail's functionality_

You can adjust which products are shown on your webshop by adding and modifying global filters.

More information about the filters can be found [here](how-to-addremove-global-brand-filters-for-recommendations.md).

Once your recommendation strategy steps are set up, click on the **Save and publish** button.
