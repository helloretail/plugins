---
source: support-docs
upstream: https://support.helloretail.com/general-setup/review-cart-page-recommendations/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Review Cart Page Recommendations"
description: "Checklist to review Hello Retail cart page recommendations. Learn how to live test, verify styling and pricing, and push Product Boxes live safely."
tags: ""
---

# Review Cart Page Recommendations

## Cart Page Recommendations

Use this checklist to confirm your cart page recommendations render and behave as expected.

### Introduction

Before you start testing your Hello Retail setup, log in to your account at: [https://helloretail.com/company/signin.html](https://my.helloretail.com/company/signin.html)

After logging in, go to your website to start the review.

> **Note:**
>
> When you enable Product Boxes, they are visible only to you in Live Test until you click Make Live. This allows you to review without exposing boxes to visitors.

> **Note:**
>
> Some browsers restrict cross-site tracking by default. If the Hello Retail panel widget does not appear, enable cross-site tracking for your domain in the browser or test with tracking prevention disabled.

### Step 1

Visit the cart page on your website. If you have both a cart page and a checkout page, make sure you are on the cart page and not the checkout page.

> **Note:**
>
> You must have at least one product in the cart for recommendations to work properly.

### Step 2

Enable Live Test for your recommendation boxes.

1.  Make sure you are on the cart page.
2.  Click the Hello Retail icon in the bottom-left corner to open the Hello Retail panel.
3.  Go to Product Boxes and toggle Show on for the recommendation boxes you want to display.
4.  Close the panel by clicking the Hello Retail icon again.
5.  Refresh the page in your browser (On Mac: CMD+R / On Windows: CTRL+R).

### **Step 3**

If any recommendation uses a slider, verify it works correctly.

### Step 4

Verify the component styling matches your site colors.

### Step 5

Verify prices match the rest of the site, including currency, formatting, and VAT settings.

### Step 6

Verify the placement of the boxes and that they do not disrupt the layout.

### Step 7

Verify that badges are shown correctly (e.g., new, on sale).

### Step 8

If your recommendations include a buy button, verify that the buy buttons work as intended.

> **Note:**
>
> If a product has multiple variants, the buy button should redirect to the master product.

### Step 9

If you have a free shipping limit, you might have a dynamic title for your cart page recommendation. Make sure the right currencies and values are shown.

_**Example**:_

_The free shipping limit on your website is 100€. Your customer has 70€ in the basket. Therefore, the title of the dynamic recommendation should look something in the lines of:_

**_"Buy for 30€ more to get free shipping!"_**

_If the customer has more than 100€ in the basket it should look something in the lines of:_

_**"You have obtained free shipping! You might also like..."**_

### Step 10

Verify that the products shown in the recommendations are related to what is in the cart.

### **Final Step**

When you have checked that every recommendation box on the cart page works as expected, you can push your recommendations live.

Open the Hello Retail panel, navigate to Product Boxes, select the recommendations you want to publish, and click the "Make Live" button.

## What shall we review next?

### Recommendations

-   [Frontpage](review-frontpage-recommendations.md)
-   [404 Page](review-404-page-recommendations.md)
-   [Category Page](review-category-page-recommendations.md)
-   [Product Page](review-product-page-recommendations.md)
-   [Upsell Step](review-upsell-recommendations.md)

### Dynamic Search

-   [List Search](review-list-search.md)
-   [Grid Search](review-grid-full-search.md)
-   [Overlay Search](review-overlay-search.md)

## Test your website on mobile devices

Please select your browser:

<div style="display: flex; gap: 20px;">
  <a href="test-on-mobile-devices-with-chrome.md">

  </a>
  <a href="test-on-mobile-devices-with-firefox.md">

  </a>
</div>
