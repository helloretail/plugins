---
source: support-docs
upstream: https://support.helloretail.com/platforms-and-newsletter-providers/norce-commerce-data-synchronisation/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Norce Commerce data synchronisation"
description: "Configure Norce Commerce product and ProductStatus feeds with delta updates to sync data to Hello Retail. Includes API tokens, channel key, and shop info."
tags: "Setup of Installation: Norce"
---

# Norce Commerce data synchronisation

# Norce Commerce

This guide explains how to synchronise Norce Commerce product data with Hello Retail by using Norce product feed exports and delta updates.
After completing this guide, create a default Norce Commerce product feed integration in the Hello Retail Dashboard.
The API credentials and general shop information mentioned in this guide can also be used to set up an order feed and synchronise orders.

* * *

### Overview

To enable data synchronisation between Norce Commerce and Hello Retail, we use:

-   **Product** and **ProductStatus** exports from Norce Commerce.

-   **Delta functionality** to allow feeds to run more frequently with minimal system load.

This document will walk you through:

1.  Setting up the product feed channel.

2.  Configuring delta functionality.

3.  Creating API credentials for Hello Retail.

4.  Gathering general shop information.

### 1\. Create a Product Feed Channel

Follow the steps in the Norce documentation under **Configuration** to create a product feed channel:
 [Building a Norce Product Feed Receiver - Configuration](https://docs.norce.io/developer-portal/app-development/building-a-norce-product-feed-receiver#configurations)

Make sure you:

-   Set the feed format to **JSON**.

-   Set **Include Inactivated Variant Day Count** to `1`.

Once the feed is configured, provide Hello Retail with the **Channel Key** parameter.

### 2\. Configure Delta Functionality

The integration uses delta updates. Configure delta tracking in Norce so incremental changes are generated correctly.

Follow the sections in the Norce documentation:

-   **Enable tracking of delta changes**

-   **Delta configuration**

 [Configure Delta Changes](https://docs.norce.io/developer-portal/app-development/building-a-norce-product-feed-receiver#configure-delta-changes)

Adjust your delta settings to match your desired update frequency and system load.

### 3\. Create API Credentials for Hello Retail

We require API credentials to connect to your Norce Commerce environment. Follow this guide to create the necessary API tokens:
 [Accessing APIs with OAuth2 Accounts](https://docs.norce.io/api-reference/accessing-apis-with-oauth2-accounts#create-api-tokens)

Provide Hello Retail with the following parameters:

-   **Client ID**

-   **Client Secret**

-   **Client Scope** (if scope is not `prod`)

### 4\. Gather General Shop Information

Provide the following details about your shop:

-   **Application ID** – Found in Norce under **Settings → Applications**.

-   **Primary culture code** – Located in **Settings → Applications → Cultures**.

-   **Client slug** – Found in **Settings → Client**.

-   **Client region** – Most commonly `se`. Confirm with Norce if uncertain.
