---
source: support-docs
upstream: https://support.helloretail.com/product-agents/price-drop-potential-dashboard/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Price Drop Potential Dashboard"
description: "Use the Price Drop Potential dashboard to identify which products are worth discounting by estimating email reach and revenue before you drop the price."
tags: "Product Agents"
---

# Price Drop Potential Dashboard

## What is it?

The Price Drop Potential dashboard helps you decide which products are worth discounting — before you actually drop the price.

It shows you how many customers could be reached with a Price Drop email if a product's price is reduced, along with a directional estimate of the revenue that could generate. The goal is to make discount planning data-driven, not gut-driven.

> **Note:** The dashboard estimates potential reach. It does not change prices, schedule emails, or guarantee revenue. Emails are only sent when an actual price drop occurs and your Price Drop agents are active.

---

## How it works

The dashboard shows your top 50 products ranked by estimated email reach. For each product, it calculates how many customers could be notified across three Price Drop agent types:

- **Viewed Product** — customers who viewed the product but have not purchased it
- **Purchased Replenishment** — customers who previously purchased the product and may be ready to buy again (only applies to products tagged as consumable)
- **Alternative Product** — customers showing interest in similar products who may respond to a price drop

Reach is calculated for price reductions between 10–89%, the threshold range required to trigger a Price Drop email.

Data refreshes daily. The timestamp in the top right shows when the dashboard was last updated.

---

## Understanding the assumptions

Reach and revenue estimates are based on four assumptions, shown at the top of the dashboard. Two are pulled directly from your account data, and two are industry-based estimates.

| Assumption | Type | What it represents |
| --- | --- | --- |
| Email Coverage | Live | The percentage of your site visitors we can identify by email address, based on your last 180 days of tracking data |
| Permission Rate | Estimated | The estimated percentage of identified visitors who have email marketing consent. Based on an industry baseline — your actual rate may vary |
| Conversion Rate | Estimated | The estimated percentage of recipients who make a purchase after receiving a Price Drop email. Based on typical Price Drop email performance |
| AOV | Live | Your actual average order value over the last 180 days |

Because permission rate and conversion rate are estimates, the reach and revenue figures shown are directional. They are useful for comparing products against each other and prioritising where to focus, not as precise predictions of send volume or revenue.

---

## Reading the table

| Column | What it shows |
| --- | --- |
| All Messages | Total potential emails across all three Price Drop agent types combined |
| Viewed Product | Potential emails to customers who viewed this product but have not purchased it |
| Purchased Replenishment | Potential emails to customers who previously purchased this product and may be ready to buy again. Only shown for products tagged as consumable |
| Alternative Product | Potential emails to customers showing interest in similar products |
| Estimated Revenue | Directional revenue estimate based on your recent Price Drop email performance. Actual results may vary depending on discount depth, timing, and customer behaviour |

---

## How to use it

**Filter and sort** to find the products with the highest reach potential. You can filter by brand or hierarchy and sort by any column.

**Search by product name or SKU** to look up a specific product directly.

**Use reach to prioritise promotions.** Products with a larger reachable audience are likely to generate more engagement from a price drop. Some products with modest sales volume can still have a large pool of interested customers waiting for the right moment.

**Recalculate on demand** using the Update button in the top right. This triggers a fresh calculation based on your latest tracking data and may take a few minutes to complete. For most use cases, the daily refresh is sufficient.

---

## What the dashboard does not do

- Change product prices
- Schedule or trigger emails
- Guarantee revenue outcomes
- Provide real-time recalculation
- Optimise discount depth or margins

---

## Frequently asked questions

**Why are some products not shown?**
The dashboard displays your top 50 products by popularity. Use the search bar to look up a specific product by name or SKU if it is not visible in the default list.

**Why is Purchased Replenishment empty for some products?**
Replenishment reach is only calculated for products tagged as consumable in your product feed. If a product has no replenishment audience, it is not tagged as consumable.

**Do emails send automatically when I view the dashboard?**
No. Viewing the dashboard never triggers emails. Emails are only sent when an actual price drop occurs on your store and your Price Drop agents are active.

**How often does the data refresh?**
Once per day. The timestamp shown in the top right reflects when the last calculation completed. You can trigger a manual recalculation using the Update button.

**Why does my reach number seem low?**
Reach is limited to customers we have identified by email address and who have marketing consent. Anonymous visitors cannot be included. The figures reflect your current data coverage and are estimates based on account-level and industry benchmarks.

---

## Related articles

- [Available Agents and Use Cases](agents-use-cases.md)
- [Intro & Getting Started](intro-getting-started.md)
