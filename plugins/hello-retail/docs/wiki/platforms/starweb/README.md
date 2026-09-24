---
source: field
verified: 2026-09-15
---

# Starweb
Starweb is a Nordic ecommerce platform. Hello Retail supports it via the [Starweb Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/starweb-installation-guide/).

**Add-to-cart specifics:** Starweb ships a `quickShop` global. Calling `quickShop.init()` after HR renders products wires up add-to-cart. See [add-to-cart.md](./add-to-cart.md).

**Multi-currency and customer-unique prices:** Starweb's dynamicPriceHandler renders HR tile prices per currency and per customer. Ask about price quirks before building; without them, prices work as usual. Every shop has the older, buggy `dynamicPriceHandler` by default; use `dynamicPriceHandler25`, which Starweb has to activate per shop. It needs a fixed price markup in the tile and a render call per surface. See [dynamic-price-handler.md](./dynamic-price-handler.md).

**Feeds:** map `price` from `activePriceExVat` (the price in force, including scheduled prices), not `specialPriceIncVat`. See [feeds.md](./feeds.md).

**Code:**

- [add-to-cart.md](./add-to-cart.md) — `quickShop.init()`
- [dynamic-price-handler.md](./dynamic-price-handler.md) — per-currency price rendering (`dynamicPriceHandler25`)
- [feeds.md](./feeds.md) — `price` from `activePriceExVat`, V2 helper and V1 selector

---

## Timeline
- 2026-05-21: Page seeded from the team's Starweb cheat sheet.
- 2026-09-24: Linked the dynamicPriceHandler page.
- 2026-09-24: Linked the feeds page.
