---
source: support-docs
upstream: https://support.helloretail.com/product-recommendations/how-to-edit-global-price-filters-for-recommendations/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How To Edit Global Price Filters For Recommendations"
description: "Configure global price filters for Hello Retail recommendations. Learn how to limit results by price and apply filters across the recommendation strategy."
tags: "Tips and Tricks: Product Recommendations"
---

# How To Edit Global Price Filters For Recommendations

Contents

1.  [What are Global Filters?](#what-are-global-filters)
2.  [Using Upsell Recommendation as an Example](#using-upsell-recommendation-as-an-example)
3.  [How to Add Global Filters to your Recommendations](#how-to-add-global-filters-to-your-recommendations)
4.  [Video Example of the Top Products Box Recommendation for a Price Filter](#video-example-of-the-top-products-box-recommendation-for-a-price-filter)

This guide explains how to configure global price filters for Recommendations. For more about filters in Recommendations, see [this overview](../general-setup/product-recommendations-filters.md).

* * *

## [What are Global Filters?](#what-are-global-filters)

Global price filters control which products are shown to customers. They apply consistent filter logic across all steps in a Recommendation Strategy. A Recommendation Strategy defines which products are displayed. By adding filters, you change how Recommendations are selected and delivered.

You can configure global filters for many needs, such as specific brands, the number of products to show, and hierarchy constraints. For more examples and scenarios, see [global and source filters](../general-setup/product-recommendations-filters.md#global-and-source-filters).

Read more about customizing recommendation steps [here](how-to-create-your-own-product-recommendations.md) and about Recommendations in general [here](getting-started-with-product-recommendations.md).

* * *

## [Using Upsell Recommendation as an Example](#using-upsell-recommendation-as-an-example)

This guide uses the **Upsell** step as an example to show how to add a global price filter. We will configure the Upsell step to show only products priced below 200. For more about Upsell, see [this guide](upsell-recommendations.md).

* * *

## [How to Add Global Filters to your Recommendations](#how-to-add-global-filters-to-your-recommendations)

1.  Sign in to your Hello Retail account. In the **Companies** overview, find the desired company under **Websites** and click your company.

2.  Go to **Recommendations** in the left menu and click **Overview**.
3.  Click the Recommendation you want to filter. In this example, select **Upsell**.

    _This image shows steps 2 and 3 on the dashboard, where the user navigates to Recommendations under the ON-SITE section._

4.  On the Recommendation page, scroll to **Recommendation Strategy** and expand the section.
5.  Click **Add filter**. In the first input, select Price. In the second input, choose the operator. In the third input, enter the value, for example 200.

_This image shows steps 4 and 5, where the user opens Recommendation Strategy to view and configure filters._

You can also add Global Brand Filters and Global Hierarchy Filters for your Recommendations. Learn more about Brands [here](how-to-addremove-global-brand-filters-for-recommendations.md) and Hierarchies [here](how-to-addremove-global-hierarchies-filters-for-recommendations.md).

* * *

## [Video Example of the Top Products Box Recommendation for a Price Filter](#video-example-of-the-top-products-box-recommendation-for-a-price-filter)

The video below shows how to limit a price filter for a Top Products recommendation to only show products priced below 200.

The same steps apply to other filters, including brands and hierarchies, configured under **Recommendation Strategy**.
