---
source: field
verified: 2026-09-15
---

# Recoms — DanDomain (Classic / Hostedshop)
DanDomain Classic / Hostedshop / SmartWeb snippets. These rely on platform-specific selectors like `.webshop-showbasket` and `#Content_Productlist`.

For platform-agnostic snippets see [general.md](./general.md).

---

### _Free Shipping (NOK, DanDomain `.webshop-showbasket`)_

Sums prices out of the basket page using the DanDomain-style `.webshop-showbasket .product_price` selector, then either nudges the shopper to free shipping or congratulates them.

> **Why this is DanDomain:** `.webshop-showbasket` is a DanDomain Classic / Hostedshop template wrapper. The currency `NOK` and the Norwegian copy ("Kjøp for … kr mer og få fri frakt") point this at NO market stores.

```javascript
var basketAmount = 0;
document.querySelectorAll(".webshop-showbasket .product_price").forEach((item) => {
    console.log(item.textContent.split("NOK").shift().trim());
    // "1 499,00 NOK" / "1.499,00 NOK" → 1499: keep digits and the decimal comma, then make it a point.
    basketAmount += parseFloat(item.textContent.split("NOK").shift().replace(/[^0-9,]/g, "").replace(",", "."));
});

var heading = jQuery("#hello-retail-{{ key }} h2");   // the base headline <h2> carries no class

if( !isNaN(basketAmount) ) {
    if(basketAmount < 199) {
       var amountLeft = 199 - basketAmount;
       heading.text("Kjøp for "+ amountLeft.toFixed(2).replace(".", ",").replace(",00", "") +" kr mer og få fri frakt");
    }
    else {
        heading.text("Du har oppnådd fri frakt! Andre kunder kjøpte også");
    }
}
```

**Adapt for the customer:**

- Change `NOK` to the customer's currency code.
- Keep the `replace(/[^0-9,]/g, "")` step: without it `parseFloat` stops at the thousands
  separator, so a 1 499 kr product counts as 1 kr and the heading asks for more on a cart that
  already ships free.
- Change `199` to the customer's free-shipping threshold.
- Update the Norwegian copy if the customer is in a different language market.

---

### _STRECHED recom fix (SmartWeb / DanDomain parent: `#Content_Productlist`)_

The generic "STRECHED recom fix" lives in [general.md](./general.md). The DanDomain-typical parent element ID is `#Content_Productlist`, used in the example below. SmartWeb shops often share this ID.

```javascript
document.querySelector('#hello-retail-{{ key }}').style.width = document.querySelector("#Content_Productlist").offsetWidth + "px";
```

If the customer's theme uses a different parent (custom DanDomain Classic templates can vary), inspect the parent and swap the selector.

---

## Timeline
- 2026-05-19: Initial DanDomain-specific recoms file created.
- 2026-09-28: Free Shipping: line prices of 1 000 and more are parsed correctly (`1 499,00` was read as 1, `1.499,00` as 1.499).
