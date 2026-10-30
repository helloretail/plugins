---
source: support-docs
upstream: https://support.helloretail.com/search/search-word-boosts/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Search Word Boosts"
description: "Configure Search Word Boosts to pin or hide results and adjust relevance for specific queries in Hello Retail Product and Content Search engines."
tags: "Tips and Tricks: Search"
---

# Search Word Boosts

In this guide, you can read and learn about Search Word Boosts and how to customize search results for specific search terms by pinning products or content, hiding irrelevant items, and adjusting relevance.

* * *

## What are Search Word Boosts?

When customers use the search functionality on your webshop, Hello Retail automatically presents the most relevant results—whether products or content (categories, brands, pages, blogs)—based on popularity, relevancy, and many other parameters. In most cases, this works well. However, there are situations where you might want direct control over what appears for specific search terms.

**Search Word Boosts** allow you to create custom configurations for specific search terms, giving you the ability to:

- **Pin products or content** to appear at the top of search results in a specific order
- **Hide products or content** that are not relevant for certain search terms
- **Group multiple search terms** to share the same configuration
- **Adjust relevance** by boosting specific product attributes (Product Search engines only)

Search Word Boosts work for both:
- **Product Search engines**: Pin or hide products from your catalog
- **Content Search engines**: Pin or hide categories, brands, blog posts, or site pages

For example, if customers search for "red dress" but your results show blue dresses first, you can create a Search Word Boost to pin your best red dresses to the top. Or if you have a Content Search for categories and customers search for "sale", you can pin your main "Sale" category to appear first.

* * *

## What's Different About Search Word Boosts?

Search Word Boosts are the new way to manage fixed and removed products and content in search. If you've previously used the old **"Edit fixed products"** and **"Edit removed products"** features, Search Word Boosts replace those with a more powerful and user-friendly interface:

- **Unified Interface**: Manage pinned and hidden items (products or content) in one place (previously required separate pages)
- **Multiple Search Terms**: Apply the same configuration to multiple related search terms (e.g., "sneakers", "trainers", "running shoes")
- **Priority Ordering**: Drag and drop pinned items to control exactly which order they appear (previously no ordering control)
- **Works for Product and Content Search**: Manage both product results and content results (categories, brands, pages, blogs)
- **Field Boosting**: Fine-tune relevance by boosting products based on brand, category, or other attributes (Product Search engines only)

> **Note:**
>
> The old "Edit fixed products" and "Edit removed products" buttons are no longer available. All existing fixed and removed items have been migrated to Query Rules.

* * *

## How to Access Search Word Boosts

1. Start by logging into your Hello Retail account. On the dashboard view, navigate to the left-hand side menu. Under the **On-site** section, click on **Search** to unfold the drop-down menu.
2. Click on **Engines** to see your list of search engines.
3. Find the search engine you want to configure (either Product Search or Content Search) and click on it to view the details.
4. In the engine details view, you'll see a **Search Query Rules** card. Click on **View All** or **Create Rule** to start managing your Search Word Boosts.

* * *

## How to Create a Search Word Boost

### Step 1: Create a New Rule

1. From the Search Word Boosts overview page, click on **Create Rule**.
2. A full-screen editor opens with three tabs: **Pin Product(s)**, **Exclude Product(s)**, and **Boost by Attribute** (the Boost tab appears for Product Search engines only).

### Step 2: Add Search Terms

At the top of the editor, you'll see a **Search Terms** input field.

1. Type a search term and press Enter or type a comma to add it.
2. You can add multiple search terms that should share the same configuration. For example: "sneakers, trainers, running shoes".
3. Each search term appears as a removable chip. Click the X to remove a term if needed.

**Tip**: Grouping related search terms saves time—you only need to configure pinned items and exclusions once for all those terms.

### Step 3: Pin Products or Content (Pin Product(s) Tab)

The **Pin Product(s)** tab is where you pin specific products or content to always appear at the top of search results.

**For Product Search engines:**

1. Click on the **Pin Product(s)** tab.
2. Use the search box to find products you want to pin.
3. Click on a product to add it to your pinned list.
4. **Drag and drop** products to reorder them. The product at the top appears first in search results, followed by the second, and so on.
5. You can add as many products as you need. They always appear at the top of search results in the order you specify.

**For Content Search engines:**
1. Click on the **Pin Product(s)** tab.
2. Use the search box to find content items (categories, brands, pages, or blog posts) you want to pin.
3. Click on an item to add it to your pinned list.
4. **Drag and drop** items to reorder them. The item at the top appears first in search results.
5. Pinned content always appears at the top of search results in the order you specify.

**Example Use Cases**:
- **Product Search**: You're running a promotion on a specific red dress. When customers search for "red dress", you want that promotional item to appear first, followed by other popular red dresses.
- **Content Search**: Customers search for "sale" and you want your main "Sale" category to appear first, followed by your "Clearance" category.

### Step 4: Hide Products or Content (Exclude Product(s) Tab)

The **Exclude Product(s)** tab is where you hide products or content that should not appear for specific search terms.

**For Product Search engines:**

1. Click on the **Exclude Product(s)** tab.
2. Use the search box to find products you want to hide.
3. Click on a product to add it to your exclusion list.
4. These products are completely removed from search results for the specified search terms.

**For Content Search engines:**
1. Click on the **Exclude Product(s)** tab.
2. Use the search box to find content items you want to hide.
3. Click on an item to add it to your exclusion list.
4. These items are completely removed from search results for the specified search terms.

**Example Use Cases**:
- **Product Search**: Customers search for "kids shoes" but your results include adult shoes because they have "kids" in the description. Exclude those adult shoe products from appearing.
- **Content Search**: You have an outdated "Old Sale" category that still appears when customers search for "sale". Exclude it so only current sale categories appear.

### Step 5: Add Field Boosts (Product Search Engines Only)

The **Boost by Attribute** tab allows you to fine-tune product relevance by boosting products that match specific attributes.

> **Note:**
>
> Boost by Attribute is available for Product Search engines only. Field-specific boosts for Content Search engines are not available yet.

1. Click on the **Boost by Attribute** tab.
2. Click on **Add Boost**.
3. Select a **Field** to boost (such as Brand, Title, Category, Keywords, or Description).
4. Enter the **Value** to match (e.g., "Nike" for the Brand field).
5. Set the **Boost strength** (positive numbers increase relevance, negative numbers decrease it).
6. Add multiple boosts to create more granular relevance rules.

**Example Use Case**: When customers search for "running shoes", you want to prioritize products from your premium brand "Nike". Add a boost with Field: "Brand", Value: "Nike", Boost: +5 to increase Nike products' ranking.

### Step 6: Save Your Rule

1. Once you've configured your search terms, pinned products, exclusions, and boosts, click **Save** at the bottom of the editor.
2. Your rule appears in the Query Rules overview table.
3. The rule takes effect immediately for the search terms you specified.

* * *

## How to Edit an Existing Rule

1. From the Query Rules overview, find the rule you want to edit.
2. Click the **Edit** icon (pencil) in the row.
3. Make your changes to search terms, pinned items (products or content), exclusions, or boosts.
4. Click **Save** to apply your changes.

* * *

## How to Delete a Rule

1. From the Query Rules overview, find the rule you want to delete.
2. Click the **Edit** icon (pencil) in the row.
3. At the bottom of the editor, click **Delete Rule**.
4. Confirm the deletion. The confirmation button appears after you click once to prevent accidental deletions.
5. The rule is removed, and those search terms return to automatic results.

* * *

## Understanding the Query Rules Overview Table

The overview table shows all your configured Search Word Boosts with the following information:

| Column | Description |
|--------|-------------|
| **Queries** | The search terms this rule applies to (can be multiple terms) |
| **Status** | Whether the rule is Active, Expired, or Scheduled |
| **Has Pinned Product(s)** | Shows ✓ if products or content are pinned to the top |
| **Has Excluded Product(s)** | Shows ✓ if products or content are hidden |
| **Has Boosts** | Shows ✓ if field boosts are configured (Product Search only) |
| **Created At** | Date when the rule was created |
| **Edit** | Click the pencil icon to edit the rule |

You can sort the table by clicking on column headers, and use pagination to browse through many rules.

* * *

## Real-World Use Cases

### Use Case 1: Seasonal Promotions

**Scenario**: It's summer, and you want to promote your new collection of summer dresses when customers search for "dress" or "dresses".

**Solution**: Create a Search Word Boost for "dress, dresses" and pin your top 5 summer dress products to appear first. This ensures customers see your seasonal collection before other dress products.

### Use Case 2: Brand Campaigns

**Scenario**: You're running a special campaign with Nike, and you want Nike products to rank higher when customers search for "running shoes".

**Solution**: Create a Search Word Boost for "running shoes" and add a boost with Field: "Brand", Value: "Nike", Boost: +10. Nike running shoes will now appear higher in the results without completely hiding other brands.

### Use Case 3: Fixing Irrelevant Results

**Scenario**: Customers searching for "organic baby food" are seeing non-organic adult food products because those products mention "baby" in their descriptions.

**Solution**: Create a Search Word Boost for "organic baby food, baby food organic" and exclude the irrelevant adult food products. Only relevant baby food products will appear.

### Use Case 4: Reusing Configurations Across Similar Terms

**Scenario**: Customers use many different terms to search for the same thing: "sneakers", "trainers", "running shoes", "athletic shoes".

**Solution**: Create one Search Word Boost with all these search terms grouped together. Configure your pinned products and exclusions once, and they'll apply to all those search terms. This saves time compared to creating separate rules for each term.

### Use Case 5: Promoting Content (Content Search)

**Scenario**: You have a Content Search engine for categories, and when customers search for "deals" or "discounts", you want to make sure they see your main promotional categories first.

**Solution**: Create a Search Word Boost for "deals, discounts, sale, offers" and pin your main categories: "Weekly Deals" first, "Clearance Sale" second, and "Special Offers" third. This ensures customers always see your most important promotional sections.

### Use Case 6: Hiding Outdated Content (Content Search)

**Scenario**: You have old blog posts or archived categories that still appear in search results but aren't relevant anymore. For example, when customers search for "gift guide", outdated "2023 Gift Guide" posts appear alongside current ones.

**Solution**: Create a Search Word Boost for "gift guide, gifts, presents" and exclude the old blog posts from 2023. Only current, relevant gift guides will appear in search results.

### Use Case 7: Brand Landing Pages (Content Search)

**Scenario**: You have dedicated brand pages, and when customers search for "Nike" or "Adidas", you want the brand page to appear before individual products.

**Solution**: In your Content Search engine, create Search Word Boosts pinning brand pages to the top for brand-related searches. For example, "Nike, Nike shoes, Nike products" pins the Nike brand page first.

* * *

## General Notes About Search Word Boosts

- **Immediate Effect**: Search Word Boosts take effect immediately after saving. You don't need to wait for indexing or processing.
- **Priority Order**: When you pin items (products or content), the order you set is exactly the order customers will see them. The first item in your list appears first in search results.
- **Search Term Matching**: Search terms are matched exactly as customers type them. Consider adding common variations and misspellings as separate terms in the same rule.
- **Combining with Other Features**: Search Word Boosts work alongside your other search configurations like [Synonyms](search-synonyms.md), [Redirects](search-redirects.md), and [Stop Words](search-stop-words.md).
- **Product Search vs Content Search**: Both types of search engines support Search Word Boosts for pinning and excluding items. Field-specific boosting is currently only available for Product Search engines.
- **Content Types Supported**: For Content Search engines, you can pin or hide categories, brands, blog posts, and site pages depending on your search engine configuration.
- **Don't Overuse**: While Search Word Boosts are powerful, remember that Hello Retail's automatic algorithms are designed to present relevant results. Use Search Word Boosts strategically for specific cases rather than trying to control every search term.
- **Monitor Performance**: Use the [Search Analytics](search-analytics.md) to see which search terms customers are using, and identify opportunities to create helpful Search Word Boosts.

* * *

## Tips and Best Practices

### Start with "Top Searches Without Results"

Navigate to **Search → Analytics** and scroll to **Top searches without results**. These are strong candidates for Search Word Boosts or Redirects, as customers are searching for something your current search can't find automatically.

### Group Related Search Terms

If customers use multiple ways to search for the same thing (e.g., "tee", "t-shirt", "tshirt"), create one Query Rule with all variations. This keeps your configuration organized and easier to maintain.

### Use Specific, Not Generic Rules

Create Search Word Boosts for specific search terms rather than very broad ones. For example, create rules for "red evening dress" rather than just "dress". This gives you more precise control while still allowing the algorithms to handle general searches.

### Test Your Rules

After creating a Query Rule, try searching for those terms on your webshop to verify the results look correct. Make sure pinned items (products or content) appear in the right order and excluded items are hidden.

### Review and Update Regularly

As your catalog changes and seasons shift, review your Search Word Boosts periodically:
- **Product Search**: Remove outdated rules for products no longer in stock, and create new rules for current promotions
- **Content Search**: Update rules when blog posts become outdated, categories are restructured, or new content pages are added

### Combine with Boosts for Fine Control (Product Search)

Instead of pinning every product, use field boosts to influence relevance while still letting the algorithms do their job. For example, boost products from a specific category by +3 rather than manually pinning 20 products.

> **Note:**
>
> Field-specific boosts are currently available only for Product Search engines.

* * *

## Frequently Asked Questions

**Q: What happened to the old "Edit fixed products" and "Edit removed products" features?**

**A:** These features have been replaced by Search Word Boosts, which provide the same functionality with additional capabilities. All existing fixed and removed products and content have been migrated to Query Rules. You'll find and manage them from the Search Word Boosts overview.

**Q: Can I use Search Word Boosts for both Product Search and Content Search engines?**

**A:** Yes. Search Word Boosts work for both engine types. For Product Search engines, you can pin/hide products and use field-specific boosts. For Content Search engines, you can pin/hide content items (categories, brands, pages, blog posts), but field-specific boosts are not yet available for content.

**Q: What's the difference between Search Word Boosts and Redirects?**

**A:** [Redirects](search-redirects.md) send customers to a specific URL (like an information page) when they search for a term. Search Word Boosts modify the search results themselves by pinning items, hiding items, or adjusting relevance. Use Redirects for non-product pages ("opening hours", "contact") and Search Word Boosts for controlling search results.

**Q: What's the difference between Search Word Boosts and Synonyms?**

**A:** [Synonyms](search-synonyms.md) tell the search engine that two words mean the same thing (e.g., "sneakers" = "trainers"). This helps customers find results when using different terminology. Search Word Boosts let you customize what appears for specific searches. You can use both: a Synonym to ensure "trainers" finds "sneakers", plus a Search Word Boost to pin your best sneakers to the top.

**Q: Can I see which Search Word Boosts are being used most?**

**A:** Currently, you can see Search Word Boosts in the overview table and sort by creation date. To understand which search terms are popular, check [Search Analytics](search-analytics.md) for top searches, then create Search Word Boosts for the most important ones.

**Q: What happens if a product I pinned goes out of stock?**

**A:** The product will still be pinned in the search results according to your rule. Review and update your Search Word Boosts periodically to remove products that are no longer available. The same applies to content—if you've pinned a blog post or category that's no longer relevant, remove it from the rule.

**Q: Can I pin the same product or content item for multiple different Search Word Boosts?**

**A:** Yes. A product or content item can be pinned in multiple different Search Word Boosts. Each rule works independently for its own set of search terms.

**Q: What types of content can I manage with Search Word Boosts?**

**A:** For Content Search engines, you can pin or hide:
- **Categories** - Product categories from your catalog
- **Brands** - Brand pages
- **Blog Posts** - Articles and blog content
- **Site Pages** - Information pages and landing pages

The specific content types available depend on how your Content Search engine is configured.

**Q: Why can't I use field boosts in my Content Search engine?**

**A:** Field-specific boosts for Content Search engines (categories, brands, pages, blogs) will be available in a future update. Currently, field-specific boosts in Search Word Boosts are only available for Product Search engines. However, you can still configure global boosts for Content Search engines in the engine settings, just not on a per-query basis yet.

* * *

## Related Articles

- [Search: Synonyms](search-synonyms.md) - Help customers find products using different terminology
- [Search: Redirects](search-redirects.md) - Send customers to specific pages for certain search terms
- [Boosts & Personalized Search](boosts-personalized-search.md) - Learn about global search boosting
- [Search Analytics](search-analytics.md) - Understand what customers are searching for
- [Configuring Your Search Engine](configuring-the-search-engine.md) - General search engine setup and configuration
- [Fixed and Removed Products (Deprecated)](fixed-and-removed-products-in-search.md) - Information about the legacy system that Search Word Boosts replaced
