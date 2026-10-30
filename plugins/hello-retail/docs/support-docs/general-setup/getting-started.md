---
source: support-docs
upstream: https://support.helloretail.com/general-setup/getting-started/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Getting Started with Hello Retail"
description: "Set up Hello Retail. Connect your platform, index your catalog, implement tracking, and launch Search, Recommendations, and analytics with best practices."
tags: ""
---

# Getting Started with Hello Retail

Welcome to Hello Retail. This guide explains the core concepts, how to connect your store, and which features to launch first. It is aimed at technical teams who want a fast, reliable setup that delivers relevant experiences across the customer journey.

## Understanding Hello Retail
Hello Retail is a personalization platform for e-commerce. It uses your catalog and customer behavior to deliver relevant search results, recommendations, and content across web and email.

### Core Platform Benefits
Hello Retail personalizes search, navigation, and content to improve relevance and user experience. It learns from on-site behavior and orders to optimize outcomes such as conversion and average order value.

### Key Features Overview
The platform includes Search, Product Recommendations, Dynamic Category Pages, Retail Media, Newsletter Content, Triggered Emails, Audience Segmentation, and Analytics and Insights.

### AI-Powered Technology
Hello Retail applies machine learning to product data and first-party customer events, such as product views, carts, and orders. Models adapt in real time and update continuously, so outputs reflect current inventory, pricing, and customer intent.

## Initial Setup and Configuration
Follow these steps to connect your store and enable core features.

### Account Setup
Create your Hello Retail account and connect your e-commerce platform. We support major platforms such as Shopify, WooCommerce, Magento, and PrestaShop, as well as custom integrations. The setup wizard guides authentication, permissions, and data connection.

### Product Catalog Integration
Provide your product catalog via a platform app, a feed URL, or the API. Hello Retail indexes products and keeps the index updated. Ensure each product has a stable ID, title, price, availability, category, image, and relevant attributes. Variants and custom attributes should be consistent and well-structured.

### Tracking Implementation
Install the Hello Retail tracking script to collect behavior events. The script captures page views, product views, add to cart, purchases, and other key interactions that power Search, Recommendations, and Analytics. For single-page applications, trigger tracking on route changes.

### Data Quality Assurance
Validate catalog completeness and event accuracy. Check that IDs match between tracking and the catalog, currencies are correct, and categories and attributes are mapped as expected. Monitor indexing status before enabling front-end features.

## Essential Features to Implement First
Start with features that deliver immediate value and require minimal configuration.

### Personalized Search
Enable Hello Retail Search to return relevant, personalized results. Configure autocomplete, filters and facets, synonyms, and merchandising rules. Search quality depends on catalog coverage and event tracking, so verify both before launch.

### Product Recommendations
Add recommendation widgets to key templates such as the homepage, product detail pages, and cart. Start with similar products and customers also bought strategies. Configure fallbacks, price and stock filters, and placements for both desktop and mobile.

### Email Personalization
Connect your email service provider and insert Hello Retail content blocks into newsletters and triggered emails. Use customer identifiers that are consistent with your site tracking. Configure fallbacks for anonymous users and ensure consent handling aligns with your CMP.

### Basic Analytics Setup
Open the Analytics dashboard to track impressions, clicks, revenue contribution, and conversion lift for each feature. Align attribution settings with your internal reporting. Use these metrics to prioritize iterations.

## Best Practices for Success
Adopt a measured rollout and instrument everything so you can iterate with confidence.

### Start Small, Scale Gradually
Launch one or two features per surface, validate tracking and UX, then expand. This reduces risk and makes it clear which changes drive impact.

### Monitor Performance Regularly
Review performance in the Hello Retail Analytics dashboard and your BI tools. Track feature-specific KPIs such as search CTR, add-to-cart rate from recommendations, and revenue contribution.

### A/B Testing Strategy
Use controlled experiments to test algorithms, placements, and merchandising rules. Run one test per surface at a time, target sufficient sample sizes, and keep consistent attribution windows.

### Customer Data Privacy
Ensure compliance with GDPR, CCPA, and your internal policies. Integrate with your consent management platform, process only necessary data, and review data retention settings with your legal team.

## Next Steps and Advanced Features
After the core rollout, extend personalization and optimize performance.

### Advanced Segmentation
Build audience segments using behavior, preferences, and purchase history. Use segments to tailor on-site content, recommendations, and email campaigns.

### Retail Media Opportunities
Monetize high-intent traffic with sponsored products and banner placements. Apply guardrails such as relevance thresholds and frequency caps to protect user experience.

### API Integration
Use Hello Retail APIs to create custom experiences, sync audiences, and power personalization in additional channels or back-office systems.

### Performance Optimization
Continuously refine ranking rules, widget placements, filters, and content. Use analytics and experiment results to guide changes and prevent regressions.

> **Key Takeaways:**
>
> Connect your platform, index the catalog, and implement tracking before launching features. Start with Search, Recommendations, and email content, then iterate using analytics and A/B tests. Maintain strong data quality and privacy compliance throughout the rollout.
