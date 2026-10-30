---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/how-to-add-newsletter-content-to-heyloyalty/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "How to Add Newsletter Content to HeyLoyalty"
description: "Step-by-step guide to generate a Hello Retail Newsletter Content code snippet and embed it in HeyLoyalty templates or campaigns, including editor behavior."
tags: "Setup of Newsletter Content: HeyLoyalty"
---

# How to Add Newsletter Content to HeyLoyalty

Here's a simple guide on how to add your newsletter content code snippet to [HeyLoyalty](https://www.heyloyalty.com/).

#### Prerequisite

Before you can create an auto campaign, you must first create a design for the newsletter content. To learn how, click [here](../newsletter-content/create-a-newsletter-content-design.md). When your design is ready, proceed with this guide to integrate with HeyLoyalty.

### How to get your Hello Retail code snippet

**Step 1**: Log into your Hello Retail account [here](https://my.helloretail.com/company/signin.html) and create an auto campaign for the product recommendations to include in your newsletter. _(If you already created a design, you can skip to Step 4.)_

**Step 2**: When you are logged in, navigate to: **Newsletter Content** > **Auto campaigns**.

- If you already created an "**Auto campaign config**", click "**Edit auto campaign config**".
- If you have not created an "**Auto campaign config**", follow the steps below.

__ _(Click "Create new auto campaign config" to create a design and code snippet.)_

**Step 3**: Fill out the fields. Choose either **2** or **3 products** per row, then set the total number of products to display. _(In the example config, three products per row and six products in total are shown in the newsletter.)_

_(Fill out the fields as shown.)_

**Step 4:** Optionally select fixed products (these are always shown) and set the "**Recommendation strategy**" (you can leave the default). Then click the "**Code snippet**" tab, select "**HeyLoyalty**" as the Newsletter platform, and copy the **code snippet** shown.

_(Select HeyLoyalty as the newsletter platform and copy the code snippet as shown.)_

**Step 5**: You are done in Hello Retail and ready to insert the newsletter content into your HeyLoyalty email template.

### How to insert the Hello Retail code snippet into HeyLoyalty

**Step 1**: Log into your HeyLoyalty account at [https://app.heyloyalty.com/login](https://app.heyloyalty.com/login).

**Step 2**: In the admin, you can add the newsletter content to a reusable template in "**Templates**" or add it to a single campaign in "**Kampagner**".

**Step 3**: In the campaign or template **editor**, select "**1 blok**" and then "**HTML**" as the content type. Drag the block to where the newsletter content should appear in the email. See the image below.

_(Select "1 blok" and "HTML" as the block content, then drag it into the newsletter.)_

**Step 4:** After placing the block in your newsletter, click the "**Kilde**" button to open the source editor and insert the Hello Retail code snippet.

_(Click "Kilde" to open a pop-up window where you can insert the code snippet.)_

**Step 5:** Paste the code snippet you created earlier and click "**OK**" when done.

 _(Paste the code snippet you created in "How to get your Hello Retail code snippet".)_

**Step 6**: Save the template or campaign. Your newsletter content is now implemented.

> **Note:**
>
> The newsletter content does not render inside the HeyLoyalty editor. Product recommendations are generated per subscriber at send time. Use a test send or live send to verify rendering.
