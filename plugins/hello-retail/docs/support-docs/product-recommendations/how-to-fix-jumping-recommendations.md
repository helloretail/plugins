---
source: support-docs
upstream: https://support.helloretail.com/product-recommendations/how-to-fix-jumping-recommendations/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to fix jumping recommendations"
description: "Resolve jumping or shifting Hello Retail recommendation boxes by adding min-height and container styles to the hr-XXX div. Includes exact HTML example."
tags: "Tips and Tricks: Product Recommendations"
---

# How to fix jumping recommendations

If Hello Retail recommendation boxes jump or shift on your site, use this guide to stabilize them. Recommendations render asynchronously; a defined minimum height prevents layout shifts while content loads.

TL;DR: For this fix to work, your setup must use our recommended `<div>` containers from this page: [/general-setup/how-to-add-product-recommendations-to-your-webshop/](../general-setup/how-to-add-product-recommendations-to-your-webshop.md)

To fix jumping recommendations on your site, add this inline style to each recommendation container div after the class="hr-XXX" attribute and before the >:

style="min-height: 300px; width:100%; background: transparent; visibility: visible;"

If you added the code correctly, it should look like this:

```html
<div class="hr-frontpage-box-1" style="min-height: 300px; width:100%; background: transparent; visibility: visible;"></div>
```
