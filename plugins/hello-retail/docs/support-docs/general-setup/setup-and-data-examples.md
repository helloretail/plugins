---
source: support-docs
upstream: https://support.helloretail.com/general-setup/setup-and-data-examples/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Setup and Data Examples"
description: "Technical examples for setting up product, order, and category feeds for Hello Retail, including field specs and valid JSON to ensure correct data sync."
tags: ""
---

# Setup and Data Examples

This guide provides examples for setting up the data feeds that Hello Retail uses to ingest data from your webshop. The examples are part of the [General setup — data synchronization requirements](setup-and-data-synchronization-requirements.md) guide.
The examples are not requirements. You can choose your own field names. Hello Retail can process the data as long as the file is structurally valid for the chosen format.

* * *

### Product feed — sample product:

```json
[
  {
    "type": "configurable",
    "id": 917,
    "sku": "2heu28371prop",
    "ean": "1234576251872",
    "productNumber": "837192837217",
    "price": 100,
    "priceExVat": 80,
    "oldPrice": 130,
    "oldPriceExVat": 104,
    "hasPriceRange": false,
    "currency": "DKK",
    "title": "Cool Bike helmet",
    "brand": "Helmetking",
    "description": "This bike helmet has a great fit with an adjustable strap. comes in two colors.",
    "hierarchies": [
      [
        "equipment",
        "bike equipment",
        "helmets"
      ],
      [
        "equipment",
        "outlet"
      ]
    ],
    "attributes": {
      "color": [
        "blue",
        "red"
      ],
      "size": [
        "unisex"
      ]
    },
    "keywords": "helmet safety cycling",
    "tags": [
      "safety",
      "outdoor"
    ],
    "url": "https://www.domain.com/cool-bike-helmet",
    "imgUrl": "https://www.domain.com/cache/250x250/cool-bike-helmet.jpg",
    "secondaryImgUrls": [
      "https://www.domain.com/cache/250x250/cool-bike-helmet-blue.jpg",
      "https://www.domain.com/cache/250x250/cool-bike-helmet-red.jpg",
      "https://www.domain.com/cache/250x250/cool-bike-helmet-2.jpg"
    ],
    "overlay": [
      "https://www.domain.com/cache/25x25/saving-badge.jpg"
    ],
    "visibility": "search/catalog",
    "instock": true,
    "quantity": 5,
    "createdDate": "2019-05-12 10:04:05",
    "isNews": false,
    "variants": [
      {
        "type": "variant",
        "id": "918",
        "sku": "2heu28371propblue",
        "ean": "1234576251823",
        "productNumber": "837192837218",
        "price": 100,
        "priceExVat": 80,
        "oldPrice": 130,
        "oldPriceExVat": 104,
        "hasPriceRange": false,
        "currency": "DKK",
        "title": "Cool Bike helmet blue",
        "description": "This blue bike helmet has a great fit with an adjustable strap. it also comes in red.",
        "hierarchies": [
          [
            "equipment",
            "bike equipment",
            "helmets"
          ],
          [
            "equipment",
            "outlet"
          ]
        ],
        "attributes": {
          "color": [
            "blue"
          ],
          "size": [
            "unisex"
          ]
        ],
        "keywords": "helmet safety cycling",
        "tags": [
          "safety",
          "outdoor"
        ],
        "url": "https://www.domain.com/cool-bike-helmet-918",
        "imgUrl": "https://www.domain.com/cache/250x250/cool-bike-helmet-blue.jpg",
        "secondaryImgUrls": [
          "https://www.domain.com/cache/250x250/cool-bike-helmet-2.jpg"
        ],
        "overlay": [
          "https://www.domain.com/cache/25x25/saving-badge.jpg"
        ],
        "visibility": "search/catalog",
        "instock": true,
        "quantity": 3,
        "createdDate": "2019-05-12 10:04:05",
        "isNews": false
      }
    ]
  }
]
```

Back to [General setup - data synchronization](setup-and-data-synchronization-requirements.md).

* * *

### Sample order:

```json
[
  {
    "id": 888,
    "orderNumber": "91826od",
    "orderProducts": [
      {
        "id": 144,
        "url": "https://www.domain.com/cool-bike-helmet",
        "productNumber": "738237238232",
        "quantity": 1,
        "price": 100,
        "priceExVat": 80
      },
      {
        "id": 322,
        "url": "https://www.domain.com/bike-gloves",
        "productNumber": "837192837217-xxl",
        "quantity": 1,
        "price": 100,
        "priceExVat": 80
      }
    ],
    "createdDate": "2019-05-12 10:04:05",
    "total": 200,
    "email": "customer@example.com"
  }
]
```

Back to [General setup - data synchronization](setup-and-data-synchronization-requirements.md).

### Sample category:

```json
[
  {
    "id": "72",
    "url": "https://www.domain.com/equipment/bike-equipment/helmets",
    "title": "Helmets",
    "hierarchy": [
      "equipment",
      "bike equipment",
      "helmets"
    ],
    "keywords": "safety bike helmets",
    "description": "Helmets for everyone"
  }
]
```

Back to [General setup - data synchronization](setup-and-data-synchronization-requirements.md).

* * *

### productData fields specifications:

**type:** string
Product type in your platform, for example configurable, simple, bundle.

**id:** string
Unique product identifier.

**sku:** string
SKU of the product.

**ean:** string
EAN of the product.

**productNumber:** string
Product number.

**price:** string or float
Current price in the default or requested currency, including tax, as shown on the website.

**priceExVat:** string or float
Current price in the default or requested currency, excluding tax, as shown on the website.

**previousPrice:** string or float
Standard price in the default or requested currency, including tax. For non-sale products this equals price.

**previousPriceExVat:** string or float
Standard price in the default or requested currency, excluding tax. For non-sale products this equals priceExVat.

**hasPriceRange:** bool
Indicates whether the product has a range of prices, for example due to variants.

**currency:** string
ISO currency code used for the price.

**title:** string
Product title in the default or requested language.

**brand**: string
Brand of the product.

**description:** string
Product description in the default or requested language.

**hierarchies:** list of hierarchy lists
A hierarchy represents the breadcrumb path from the root category to the deepest subcategory.
Products can belong to multiple hierarchies.
If one hierarchy is the default, list it first.

**attributes:** object
Key value pairs for product attributes. Key is the attribute name. Value is a list of assigned attribute values.

**keywords:** string
Space separated product keywords.

**tags:** list
List of product tags.

**url:** string
Product URL in the default or requested language.

**imgUrl:** string
Default image URL, preferably scaled to the size used on category or listing pages.

**secondaryImgUrls:** list
List of alternative image URLs, preferably scaled to the size used on category or listing pages.

**overlay:** list
List of HTML snippets or image URLs used to display badges or overlays on the product tile.

**visibility:** string
Product visibility setting, for example search, search/catalog, hidden.

**instock:** bool
Whether the product is in stock.

**quantity:** string or number
Quantity in stock. For products with variants, use the sum across variants.

**createdDate:** string
Timestamp of product creation formatted as yyyy-MM-dd HH:mm:ss.

**isNews:** bool
Whether the product should be considered new.

**variants:** list of productData
List of product variants. If one variant is the default, list it first.

Back to [General setup - data synchronization](setup-and-data-synchronization-requirements.md).
