---
source: support-docs
upstream: https://support.helloretail.com/general-setup/queue-product-feed-runs-via-api/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Queue Product Feed Runs Via API"
description: "Trigger Hello Retail product feed runs via API. Learn full and delta runs, rate limits, queuing, and how to call the productfeedruns endpoint."
tags: "Documentation & API"
---

# Queue Product Feed Runs Via API

**Intro:**

In this guide, you can learn how to use two different run types for product feeds.

The _/productfeedruns_ endpoint triggers a rerun of the currently active product feeds configured in Hello Retail for any of your webshops.

Most webshops have a single product feed. In some edge cases, multiple feeds exist. Calling this endpoint queues a run for all active feeds on the specified webshop.

* * *

### Two types of runs

Hello Retail supports two run types: a _full feed run_ and a _delta feed run_.

A full feed run downloads and parses the complete product feed. The feed must represent your entire product catalog.

A delta feed run downloads and parses only the changes since the last run. The feed must represent the subset of your catalog that changed since the previous run.

Delta runs need to be supported by your system. Read more [here](setup-and-data-synchronization-requirements.md#delta-feeds).

Full feed runs are resource-intensive and are limited to a maximum of 1 run per hour.

Delta feeds can be run every 10 minutes. Combining delta feeds with the _/productfeedruns_ endpoint provides fast product synchronization between your system and Hello Retail.

Below is the complete request URL for the _/productfeedruns_ endpoint:

```none
POST
```

```none
 https://core.helloretail.com/api/websites/{websiteUuid}/productfeedruns?apiKey={apiKey}
```

> **Note:**
>
> Add the query parameter full=true to force a full run. If omitted and your configuration supports delta runs, a delta run is queued.

> **Note:**
>
> If a feed run is in progress or rate limits prevent an immediate run, the request is queued and executed as soon as rate limits allow.

To use the endpoint, you need your website UUID and an API key.

Log in to your business account on [my.helloretail.com](https://my.helloretail.com/) and follow [these](hello-retail-api.md#website-uuid-and-api-key-in-the-dashboard) instructions to find them.

* * *

### **How does the response look?**

Below is an example result from calling the _/productfeedruns_ endpoint for a website with two active product feeds set up:

```none
{
    "data": [{
        "id": "123",
        "type": "productfeedruns",
        "attributes": {
            "type": "Magento 1 - paginated",
            "url": "http://testshop.com/productfeed",
            "dateQueued": "Wed nov 15 09:10:02 UTC 2020",
            "blockedUntil": "Wed nov 15 09:10:02 UTC 2020",
            "runType": "DELTA"
        }
    },{
        "id": "456",
        "type": "productfeedruns",
        "attributes": {
            "type": "Json",
            "url": "http://testshop.com/extraproductfeed",
            "dateQueued": "Wed nov 15 05:11:02 UTC 2020",
            "blockedUntil": "Wed nov 15 05:34:02 UTC 2020",
            "runType": "FULL"
        }
    }]
}
```
