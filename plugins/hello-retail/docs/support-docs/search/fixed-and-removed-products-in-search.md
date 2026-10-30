---
source: support-docs
upstream: https://support.helloretail.com/search/fixed-and-removed-products-in-search/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Fixed and Removed Products - in Search (Deprecated)"
description: "Legacy guide for Fixed and Removed Products in Hello Retail Search. Learn how these features were migrated to Search Word Boosts and where to manage rules."
tags: "Tips and Tricks: Search"
---

# Fixed and Removed Products - in Search

> **Feature Replaced - Use Search Word Boosts Instead:**
>
> The "Edit fixed products" and "Edit removed products" features have been replaced by [Search Word Boosts](search-word-boosts.md). The old interface is no longer available.
>
> All existing fixed and removed products were automatically migrated to Search Word Boosts. Your configurations are now available in the new interface with additional capabilities.
>
> [Go to Search Word Boosts Documentation →](search-word-boosts.md)

* * *

## What Happened?

The old Fixed Products and Removed Products features allowed you to:

- Fixed Products: Pin specific products or content to the top for defined search terms.
- Removed Products: Hide specific products or content for defined search terms.

These features have been replaced by the new Search Word Boosts system, which provides the same functionality plus many improvements.

> **Note:**
>
> This change applies to both Product Search engines (products) and Content Search engines (categories, brands, pages, blog posts).

* * *

## Where Did My Configurations Go?

All your fixed and removed product configurations were automatically migrated to the new Search Word Boosts system.

To find your migrated configurations:

1. Navigate to Search → Engines in the Hello Retail dashboard.
2. Select the search engine you want to manage.
3. Click on Search Word Boosts (or View All in the Query Rules card).
4. You will see your previous fixed and removed products listed as Search Word Boosts.

Each legacy configuration was converted as follows:
- Fixed Products → Search Word Boosts with Pinned Product(s) (pinned products or content).
- Removed Products → Search Word Boosts with Excluded Product(s) (hidden products or content).

This applies to all search engine types—both Product Search and Content Search.

> **Note:**
>
> The previous implementation stored hardcoded product and content URLs. If an item was deleted or its URL changed, the rule no longer matched and the item was not shown or excluded. These outdated items were skipped during migration to Search Word Boosts. A backup of your legacy configuration is available. Contact Hello Retail support if you need to recover specific items.

* * *

## What's Better About Search Word Boosts?

The new Search Word Boosts system provides everything the old system did, plus:

### ✅ Unified Interface
Previously, fixed and removed products were managed on separate pages. Now both are managed together in one place.

### ✅ Multiple Search Terms Per Rule
Group related search terms (for example, sneakers, trainers, running shoes) and manage them as one rule.

### ✅ Priority Ordering
Set the exact order of pinned products with drag-and-drop.

### ✅ Visual Product Search
Search and select products by name with images instead of entering URLs manually.

### ✅ Field-Specific Boosting (Product Search)
Boost products based on attributes such as brand, category, or keywords for specific search terms.

### ✅ Better Organization
View all rules in a single table with status indicators, creation dates, and quick edit or delete actions.

* * *

## How to Use the New System

For complete instructions on using Search Word Boosts, see the [Search Word Boosts Documentation](search-word-boosts.md).

### Quick Start:

1. Access Search Word Boosts: Go to Search → Engines → [Select engine] → Query Rules.
2. View Existing Rules: Your migrated configurations appear in the overview table.
3. Create New Rules: Click Create Rule to add new search term customizations.
4. Edit Rules: Click the pencil icon next to any rule to modify it.
5. Pin Products or Content: Use the Elevate tab to pin items to the top (same as old fixed products or content).
6. Hide Products or Content: Use the Exclude tab to hide items (same as old removed products or content).

* * *

## Need Help?

If you need assistance with the migration or have questions about using Search Word Boosts:

- Full Documentation: [Search: Search Word Boosts](search-word-boosts.md)
- Related Features:
  - [Search: Redirects](search-redirects.md) - Send customers to specific pages
  - [Search: Synonyms](search-synonyms.md) - Help customers find products using different terms
  - [Boosts & Personalized Search](boosts-personalized-search.md) - Fine-tune search relevance globally

* * *

## Legacy Documentation (For Reference Only)

The information below describes how the old system worked and is kept for reference purposes only. This interface is no longer available.

### How Fixed Products Worked (Old System)

With fixed products, you could force Hello Retail Search to display a specific product when a customer entered a search word you defined. For example, if you wanted to promote a particular product when customers searched for "shoe", the product would be prioritized above the other products Hello Retail would otherwise present.

You configured fixed products under Search → Search Engines and clicked Edit fixed products (this button no longer exists).

There were two input fields. Under Search term, you entered the term that should trigger the system to display the specific product. Under Product URL, you entered the direct URL to the product you wanted to promote.

### How Removed Products Worked (Old System)

If you wanted to exclude a product for specific search terms, you could do that under Search → Search Engines by clicking Edit removed products (this button no longer exists).

The process was the same as for fixed products: you entered a Search term and provided a Product URL for the product you wanted to exclude when a customer searched for that term.

* * *

> **Ready to Get Started?:**
>
> The new Search Word Boosts system is more powerful and easier to use. Your existing configurations have been migrated and are ready to use.
>
> [Get Started with Search Word Boosts →](search-word-boosts.md)
