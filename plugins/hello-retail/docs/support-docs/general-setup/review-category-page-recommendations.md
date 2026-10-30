---
source: support-docs
upstream: https://support.helloretail.com/general-setup/review-category-page-recommendations/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Review Category Page Recommendations"
description: "Technical checklist to review and live test Hello Retail category page recommendations, including rendering, sliders, styling, placement, buy buttons, and category coverage."
tags: ""
---

# Review Category Page Recommendations

## Category Page Recommendations

Use this checklist to verify that category page recommendations are implemented and working as expected.

### Introduction

Before testing, sign in to your Hello Retail account at: [https://helloretail.com/company/signin.html](https://my.helloretail.com/company/signin.html)

After signing in, open your website to start the review.

> **Note:**
>
> Recommendation boxes are not visible to all visitors until you click Make Live in the Hello Retail panel. Use Live Test to review privately.

> **Note:**
>
> Some browsers block cross-site tracking. If the Hello Retail panel is not visible, allow cross-site tracking for your site in the browser.

### Step 1

Visit a category page on your website.

> **Note:**
>
> Recommendations are not rendered on category pages that list fewer than 10 products.

### Step 2

Enable Live Test for your recommendation boxes.

1. Make sure you are on a category page.
2. Click the Hello Retail icon in the bottom-left corner to open the Hello Retail panel.
3. Navigate to Product Boxes, and toggle Show on for the recommendation boxes you want to display.
4. Close the panel by clicking the Hello Retail icon again.
5. Refresh the page in your browser (On Mac: CMD+R, On Windows: CTRL+R).

### **Step 3**

If a recommendation uses a slider, verify that it scrolls and loads items correctly.

### Step 4

Verify that component colors match your site’s design.

### Step 5

Verify that price formatting and currency match the rest of the website.

### Step 6

Verify the placement of the boxes and that they render in the intended location on the page.

### Step 7

Verify that badges are shown correctly (e.g., New, On sale).

### Step 8

If your recommendation boxes include Buy button functionality, verify that the buttons work as intended.

> **Note:**
>
> For products with variants, the Buy button in recommendations redirects to the master product page.

### Step 9

Make sure the products shown match the current category page.

### Step 10

Verify that category recommendations work on top-level and subcategory pages (only if applicable).

### **Final Step**

When every recommendation box on the category page works as expected, push your recommendations live.

Open the Hello Retail panel, go to Product Boxes, select the recommendations you want to publish, and click the Make Live button.

## What shall we review next?

### Recommendations

-   [Frontpage](review-frontpage-recommendations.md)
-   [404 Page](review-404-page-recommendations.md)
-   [Product Page](review-product-page-recommendations.md)
-   [Upsell Step](review-upsell-recommendations.md)
-   [Cart Page](review-cart-page-recommendations.md)

### Dynamic Search

-   [List Search](review-list-search.md)
-   [Grid Search](review-grid-full-search.md)
-   [Overlay Search](review-overlay-search.md)

## Test your website on mobile devices

Please select your browser:

<div class="supported-browser">
  <a href="test-on-mobile-devices-with-chrome.md">

    Chrome
  </a>
  <a href="test-on-mobile-devices-with-firefox.md">

    Firefox
  </a>
</div>
