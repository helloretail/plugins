---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/template-tags-and-variables/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Template Tags and Variables"
description: "Reference for Liquid tags and variables in Hello Retail Triggered Emails. See product fields, loops, and special variables with examples and usage."
tags: ""
---

# Template Tags and Variables

The Hello Retail Triggered Email templates use the open-source template language Liquid. You can [find the Liquid reference here](http://shopify.github.io/liquid/) and, if you are new to Liquid, a [Liquid for Designers guide here](https://github.com/Shopify/liquid/wiki/Liquid-for-Designers).

This article lists the variables available in Triggered Email templates.

## The product tag and its variables

The `product` tag represents a product. It exposes fields such as the product title and price, along with other attributes. Available variables:

- `title`
- `price`
- `url`
- `imgUrl`
- `isOnSale`
- `oldPrice`
- `currency`
- `inStock`
- `brand`

> **Note:**
>
> oldPrice is available only when isOnSale is true.

**Example:**

```liquid
<div>
   <h3>{{ product.title }}</h3>
   <br/>
   <span style="color:green;">{{ product.price }} {{ product.currency }}</span><br/>
   <div class="button"><a href="https://support.helloretail.com/triggered-emails/{{ product.url }}">Buy now!</a></div>
</div>
```

> **Note:**
>
> Additional product attributes may be available depending on your setup and product feed. Go to Data Setup > Inventory to see the attributes available on your products.

## The products loop

The `products` variable contains the list of products provided by the trigger. Loop over it to render each product. Inside the loop, each `product` exposes the fields listed above.

**Example:**

```liquid
{% for product in products %}
<div>
  <h3>{{ product.title }}</h3>
  <br/>
  <span style="color:green;">{{ product.price }} {{ product.currency }}</span><br/>
  <div class="button"><a href="https://support.helloretail.com/triggered-emails/{{ product.url }}">Buy now!</a></div>
</div>
{% endfor %}
```

## Additional variables available

### firstProduct

The `firstProduct` variable returns the first product in `products`.

Use it in subject lines or opening paragraphs.

**Example:**

```
  {{ firstProduct.title }} among other products just dropped in price
```

### mostPopularProduct

The `mostPopularProduct` variable returns the most popular product in the products list.

Useful for subject lines and key highlights.

**Example:**

```liquid
Ups, you just left {{ mostPopularProduct.title }}
{% if products.size > 1 %}
   and {{ products.size|minus:1 }} more things behind you...
{% endif %}
```

### mostExpensiveProduct

The `mostExpensiveProduct` variable returns the most expensive product in the products list.

Use it for subject lines or lead content.

**Example:**

```liquid
{{ mostExpensiveProduct.title }} are now back in stock at only {{ mostExpensiveProduct.price }}
```

### relatedProducts

When available, the `relatedProducts` variable is a list of related product objects.

> **Note:**
>
> relatedProducts is available only on the Price drop and Back in stock triggers.

**Example:**

```liquid
{% if relatedProducts %}
  <h1>Related products</h1>
  {% for product in relatedProducts %}
    <div>
      <h3>{{ product.title }}</h3>
      <br/>
      <span style="color:green;">{{ product.price }} {{ product.currency }}</span><br/>
      <div class="button"><a href="https://support.helloretail.com/triggered-emails/{{ product.url }}">Buy now!</a></div>
    </div>
  {% endfor %}
{% endif %}
```

### unsubscribe_url

The `unsubscribe_url` variable contains the system-generated unsubscribe link for the recipient.

**Example:**

```html
<a href="https://support.helloretail.com/triggered-emails/{{ unsubscribe_url }}">Click here to unsubscribe!</a>
```

### cart_total

The `cart_total` variable can be used on Abandoned Cart triggers when cart data is available.

**Example:**

```liquid
{% if cart_total %}
  <strong>Total: {{ cart_total }}</strong>
{% endif %}
```

### cart_url

The `cart_url` variable can be used on Abandoned Cart triggers when a recovery URL is available.

**Example:**

```liquid
{% if cart_url %}
  <div class="button"><a href="https://support.helloretail.com/triggered-emails/{{ cart_url }}">Recover my cart</a>
{% endif %}
```
