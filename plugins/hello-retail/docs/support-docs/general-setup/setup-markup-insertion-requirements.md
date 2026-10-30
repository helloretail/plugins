---
source: support-docs
upstream: https://support.helloretail.com/general-setup/setup-markup-insertion-requirements/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Setup Markup Insertion Requirements"
description: "Configure markup containers for Hello Retail recommendations and search, including results container and instant search input IDs, for manual setup."
tags: ""
---

# Setup Markup Insertion Requirements

This page is part of the Manual Setup guide. See the main page [here](manual-setup.md). If you are building a Single-Page Application and do not use Hello Retail rendering, you can skip this guide.

* * *

### **Recommendation boxes**

Hello Retail recommendation boxes are rendered by adding container divs with specific IDs to your site’s markup. Learn how to find the correct IDs for your site [here](how-to-add-product-recommendations-to-your-webshop.md).

If you are building an extension, provide a UI to configure the IDs of the container divs in your platform. This lets users change the mapping between container divs and loaded content without code changes.

* * *

### **Search**

To support Hello Retail Search, do the following:

1: Provide a dedicated page to display full search results. In addition to your normal layout (navigation, header, etc.), add a container div where Hello Retail will insert the results.

```html
<div id="hr-search-results"></div>
```

2: Add an id to your search input for Instant Search. Prefer updating the existing input rather than replacing it, so the current behavior continues until Hello Retail takes over.

```html
<input id="hr-search-input"></input>
```

* * *

## Unsupported platforms:

### Guides

-   [Tracking requirements](setup-for-tracking-requirements.md)
-   Markup insertion requirements
-   [Data synchronization requirements](setup-and-data-synchronization-requirements.md)

### Main page

-   [Main page](manual-setup.md)
