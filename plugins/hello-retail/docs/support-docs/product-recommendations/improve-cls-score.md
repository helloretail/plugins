---
source: support-docs
upstream: https://support.helloretail.com/product-recommendations/improve-cls-score/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Improve CLS score"
description: "Reduce Cumulative Layout Shift for Hello Retail Product Recommendations by preallocating space with CSS. Configure min heights per breakpoint to prevent jumps."
tags: "Tips and Tricks: Product Recommendations"
---

# Improve CLS score

When customers visit your shop, the user experience is important. You may have used tools such as Google's to test UX and found areas to improve. One key metric is [CLS](https://web.dev/cls/) (Cumulative Layout Shift), which measures how much the layout moves while the page loads. For example, you try to click a button and the page shifts because an image loads and pushes content down. This is a poor experience, and it is worth eliminating.

### CLS and Hello Retail

If you use Hello Retail Product Recommendations, you might see layout shifts when recommendations load. The shift occurs because recommendations are injected after parts of your page have already rendered. Your page loads, then Hello Retail injects a row of products, which pushes content below down by the height of the injected block. In most cases, this is fast and barely noticeable. However, you may still want to avoid the shift to improve user experience and your test scores.

#### How to fix layout shifts

The fix is straightforward. Preallocate space for the recommendation block before Hello Retail injects the products. If the space is already reserved in your HTML and CSS, the page will not shift when the products appear.

Be aware that the recommendation block height is responsive. It depends on screen size, template, grid, and other layout factors. There is no reliable way to know the exact height before the products render, so you must approximate per breakpoint.

A practical approach:
- Measure the rendered height of Product Recommendations at your common breakpoints.
- Add CSS that sets a min-height for the container at those breakpoints.
- Apply the class to each container where Product Recommendations load.

An example: on desktop, the product block height could be 430 pixels. Set min-height to 430 pixels on the container DIV to prevent shifting. On a tablet, the height might be 300 pixels. If you keep 430 pixels on tablet, you will get 130 pixels of whitespace. Use breakpoint-specific min-heights to reduce this.

#### An example

Because Hello Retail loads after your page, the fix must be implemented in your shop's code. The space must be allocated before Hello Retail renders. Implement a resolution-dependent solution that covers a set of common breakpoints to handle most devices.

Define a CSS class as shown below. In this example, different min-heights are defined per screen width so the correct space is reserved per device. The breakpoint values and heights are examples only. Measure your own heights after the recommendations render, using device simulation tools such as Chrome DevTools.

The class:

```html
.hr-recom-cls{
    min-height: 460px;
}

@media only screen and (max-width: 600px) {
    .hr-recom-cls{
        min-height: 400px;
    }
}
@media only screen and (max-width: 720px) {
    .hr-recom-cls{
        min-height: 430px;
    }
}
@media only screen and (max-width: 1080px) {
    .hr-recom-cls{
        min-height: 450px;
    }
}
```

After you define the class, add it to each DIV where the Product Recommendations are loaded. Example:

```html
<div id="hr-productbox-k5b749wb4ey555516e9a77dfbf" class="hr-recom-cls"></div>
```

This is not a complete solution for all devices, but if you cover common breakpoints with appropriate min-heights, you will reduce CLS and improve the experience for most visitors.
