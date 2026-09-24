# Rating widgets — identify the system, then copy its recipe

Read this before workflow step 5 of `../SKILL.md` (third-party widgets).

## Identify the rating system first

```javascript
Object.keys(window).filter((k) =>
  k.toLowerCase().match(/loox|yotpo|stamped|okendo|rateit|judge|review/),
);

Array.from(document.querySelectorAll("symbol")).map((s) => s.id);

const el = document.querySelector('[class*="rating"],[class*="rateit"]');
Array.from(el?.attributes || []).map((a) => ({ n: a.name, v: a.value }));
```

## Per-system recipes

Once you know which system the site uses, copy the exact widget markup from its platform file:
**Loox** (Shopify) → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/shopify/rating.md`; **rateit** (DanDomain / Lightspeed) →
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/dandomain/rating.md`; **Magento 2 native** (CSS-width) →
`${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/magento/rating.md`; **Lipscore** (any platform, the one the team has
re-initialised in production) → `${CLAUDE_PLUGIN_ROOT}/docs/wiki/features/search/lipscore-ratings.md`. For any other
system (Yotpo, Stamped, Okendo, Judge.me, Trustpilot) there is no captured recipe: reproduce the
widget's attributes from the live tile, map count and average to `extraData.ratingCount` /
`extraData.ratingAvg`, record the widget's global and any init function you can see (`window.yotpo`,
`window.jdgm`, …) under `PLATFORM`, and leave the re-init to the shell (it goes through its
analyze → plan → discuss loop). The generic JS engine (`js-engine.md`) initializes Loox
and rateit automatically — standalone tiles only.

## The cross-platform JS engine

The generic engine — slider init, rating init (Loox + rateit), and a `MutationObserver` that re-runs
both for HR-injected tiles — lives in `js-engine.md`. Use it for a **standalone** tile with
no shell render-hook; when building for HR Search / Recom, the shell owns re-init (`fix_links` /
`afterInit`) and this observer isn't shipped. The ATC handler is platform-specific — add the matching
block from `${CLAUDE_PLUGIN_ROOT}/docs/wiki/platforms/<platform>/add-to-cart.md` inside the IIFE.
