---
source: support-docs
upstream: https://support.helloretail.com/search/introduction-to-search/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Introduction to Search"
description: "Overview of Hello Retail Search options including Overlay, Instant, Embedded, and Full Search, with layouts, behaviors, and when to use each."
tags: ""
---

# Introduction to Search

## Available Search Solutions

Hello Retail provides multiple search interfaces you can deploy on your storefront. This page outlines the options and how to configure and control their behavior.

* * *

## Types & Behavior

Hello Retail offers four different search options:

- Overlay Search
- Instant Search
- Embedded Search
- Full Search

Embedded Search renders a search component directly within a page section, typically a category or landing page, and can be configured to match local layout and filtering.

## Design & Layout

### Overlay Search

Overlay Search uses a unified overlay that can display products and other content on any page. It supports infinite scrolling, built-in filtering and sorting, and is optimized for mobile.

### Instant Search & Full Search

Use two separate experiences:

- Instant Search shows inline suggestions and a small set of results as the user types. It is intended to be available on all pages where a search input is present.
- Full Search renders a complete results page on a dedicated route and can show an extensive result set with filters and sorting.

Instant Search offers two styles:

- Grid
- List

Full Search offers three styles:

- Paged
- Infinite
- Responsive

### Behavior

1. Instant Search returns results as the visitor types in the search field. This provides immediate, visual feedback and helps users refine queries without leaving the current page.
2. Full Search supports two loading patterns. Infinite loads additional results automatically as the visitor scrolls, when available. Paged uses classic pagination so the visitor can navigate across discrete pages of results.
