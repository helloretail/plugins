# Algorithm intake — ask how the recom should pick its products, then build it

The operator describes, in their own words, which products a box should show; you turn that into
the box's strategy — ordered steps plus filters — confirm it in plain words, and write it.
Called from `box-setup.md` → step 4 (asking) and step 7 (writing). The step and filter semantics
are the MCP's own: read `docs_get("docs://product-algorithms/format")` once before translating.

> **How many products the box shows is not part of the algorithm.** It is the box's
> `productCount`, a general setting — asked separately (`box-setup.md` → step 4, from the shop's
> own slider or 8 / 10 / 12) and written with `recoms_updateGeneralSettings` (step 6). The algorithm
> only decides **which** products fill those slots and in what order; `recoms_getAlgorithm`
> reports `productCount` read-only, and `recoms_updateAlgorithm` has no field for it. A number in
> the operator's answer ("show 12 bestsellers") goes to the product count, not into a step.

## 1. Ask — best-practice options first, own words welcome

`recoms_listBestPracticeAlgorithms(websiteUuid, type)` returns the proven setups for the box's
page type, each with a name and one line on what it shows. Ask with one `AskUserQuestion` call
(`box-setup.md` → *How to ask*, round D), header *Algorithm*: *"How should the \<page\> recom
pick its products?"* — one option per best-practice algorithm, its name as the label and the
MCP's line as the description, the one that fits the page (or the ClickUp card's algorithm name)
first and marked "(Recommended)". More than four → the four that fit the page type best, and name
the rest in the chat line before the call. *Other* is the door for the operator's own words — say
so in the question: *"Other: describe it in your own words, e.g. products often bought with this
one, then others from the same category, only in stock"*.

- **An option, nothing else** → that best-practice algorithm as it stands (§5, first case).
- **An option plus changes** ("the second one, but only in-stock products", via *Other*) → start
  from its steps, apply the changes (§2), and ask only what §3 still needs.
- **Own words** → translate them (§2), then §3.

## 2. Translate the words into steps

Steps run top to bottom; each fills the slots — the box's product count — that the ones before it
left, and a step that finds nothing just passes to the next. So the operator's first idea is step 1, and every "then …",
"otherwise …", "if there aren't enough …" is a later step.

**What to show — the step type:**

| The operator says | Step | Notes |
|---|---|---|
| "bought together with this", "goes with", "complete the look", "accessories" | `BOUGHT_TOGETHER` | PDP, cart. `priceInfluence` 0 unless asked |
| "similar", "alternatives", "instead of this", "other options" | `ALTERNATIVES` | PDP. `priceInfluence` 0.25 by default; "similar price" → 0.5 |
| "what people buy next / after this" | `BOUGHT_NEXT` | |
| "related products" (the feed's own relations) | `RELATED` | |
| "recently viewed", "pick up where they left off" | `RETARGETED` | "not what they just saw" → `skipDaysAgo: 1`; a window → `numberDaysAgo` |
| "based on what they looked at" | `VIEWED_WITH`, `relatedTo: RETARGETED` | |
| "based on what they bought" | `BOUGHT_WITH`, `relatedTo: RECENTLY_BOUGHT` | |
| "bestsellers", "popular", "top products" | `TOP` | "most bought" → `MOST_BOUGHT`; "most viewed" → `MOST_VIEWED` |
| "popular in this category" | `TOP` + step filter `hierarchies IN $hierarchies` | category / PDP; needs page context (below) |
| "new arrivals", "newest" | `RECENTLY_CREATED` | "last 30 days" → `numberDaysAgo: 30` |
| "these products" (named items) | `MANUAL`, `productIds` | ignores filters and limits |
| "results for \<term\>" | `SEARCH`, `searchTerm` | `$title` = the page product's title |
| "anything", "fill it up" | `RANDOM` | last-resort filler only |
| "goes with what's in the cart" | `CURRENT_CART` `useAsContext: true`, then `BOUGHT_TOGETHER` | cart, upsell |

**What to leave out — excluding steps** (first in the list; they show nothing themselves):

| The operator says | Step |
|---|---|
| "not what's already in the cart" | `CURRENT_CART`, `excludeProducts: true` |
| "not what they bought recently" | `RECENTLY_BOUGHT`, `excludeProducts: true`, `numberDaysAgo` (e.g. 90) |

**Limits and conditions — filters:**

| The operator says | Filter / field | Where |
|---|---|---|
| "only in stock" | `inStock EQUALS true` | global |
| "only on sale" | `onlyOffers: true` | the step it applies to |
| "same category" | `hierarchies IN $hierarchies`; "same main category" → `$hierarchies\|trimToLevel:2` | step |
| "same brand" | `brand EQUALS $brand` | step |
| "cheaper / dearer than this" | `price LESS_THAN $price` / `price GREATER_THAN $price` | step |
| "between 100 and 500" | `price GREATER_THAN 100`, `price LESS_THAN 500` | global or step |
| "only brand X / category Y" | `brand EQUALS "X"` / `hierarchies IN [["y"]]` | global |
| "their favourite brand" | step filter `brand EQUALS $user.bias.brand`, condition `COMPARE user.bias.brand NE ""` | step, followed by a fallback step |
| "at most 4 of these" | `productLimit: 4` — a cap on **one step**, never the box total | the step |
| "variants count as one" / "show each colour" | `filterByGroupingKey` `true` (default) / `false` | whole box |

Rules the translation must keep (from the format doc):

- **Field names** come from `recoms_getAlgorithm` → `filterableFields`; a field not there can't be
  filtered on. **Literal values** come from `productData_getFieldValues` — never guess a brand or a
  hierarchy spelling. Hierarchies are `$`-separated (`kids$shoes`) and nest one level deeper
  (`[["kids","shoes"]]`); list-valued fields always take a JSON list.
- **`$hierarchies` on a category box** needs the category from the page: check the box's crawl
  config (`box-setup.md` → step 8) and set it up in the same plan when it's missing.
- **Only the extra fields a step type has** — a field belonging to another type is refused.
- `excludeProducts` / `useAsContext` only on the types the doc marks excludable / context.

## 3. Ask only what the words left open

One `AskUserQuestion` call (`box-setup.md` → round E) holding only the questions the answer
didn't settle — they are independent, so up to four in the call, and the tool shows them one at a
time. Nothing open → no call. The recommended option is the default the operator gets when they
have no view:

| Question | Header | Options, recommended first |
|---|---|---|
| **Fallback** — when the first idea finds too little (a new product with no purchase history, a first-time visitor): *"What fills the box when that finds too little?"* | *Fallback* | Category / PDP box: *Top products in this category* (Recommended), *Top products overall*, *Show fewer*. Elsewhere: *Top products overall* (Recommended), *Show fewer*. |
| **Stock** — *"Only in-stock products?"* | *Stock* | *Only in stock* (Recommended), *Include out-of-stock* |
| **Leave anything out?** — `multiSelect: true`, nothing recommended | *Exclude* | *Nothing*, *What's already in the cart* (cart / upsell boxes), *What they bought recently*, *A brand or category* (*Other* says which) |
| **Price** — *"Any price rule?"* | *Price* | *No price rule* (Recommended), *Similar price to the page product* (PDP), *Cheaper than the page product* (PDP), *A range* (*Other* says which) |

## 4. Read it back in plain words and get a yes

Show the steps the way the dashboard numbers them, in the operator's language, with no field
names:

> Here is how the **PDP** recom will pick its products:
>
> 1. Products often bought together with this one
> 2. Then alternatives to this one, at a similar price
> 3. Then top products in the same category
>
> Only in-stock products. Variants count as one product. Right?

Show this in chat, then ask the yes with `AskUserQuestion` (`box-setup.md` → round F), header
*Algorithm*: *"Is this how the \<page\> recom should pick its products?"* — *Yes* / *No, I'll
correct a step*; the correction comes through *Other*. A correction → change that step, read it
back again, ask again. Wait for the yes before any write. This read-back is also what goes into
the hand-off.

## 5. Write it

- **A best-practice algorithm as it stands** → a new box: `recoms_create` with that
  `algorithmName`; an existing box: `recoms_applyBestPracticeAlgorithm`. Applying replaces the
  steps only and keeps the box's own global filters. Then read `recoms_getAlgorithm`: when its
  global `filters` or `filterByGroupingKey` differ from what the operator confirmed (in stock,
  say), send just those with `recoms_updateAlgorithm`.
- **Anything else** → create the box (if new) with the closest best-practice algorithm, then
  `recoms_getAlgorithm` → `recoms_updateAlgorithm` with the **whole** `steps` list in run order, the
  **whole** `filters` list and `filterByGroupingKey`. Leave `number` out. For a step that was
  already there, send back `numberReceipts`, `skipReceipts` and `priceInfluence` as read.
- **Refused** → the error names the step; fix it and write again, once. Still refused → tell the
  operator which part can't be built, and offer the nearest thing that can.
- **Warnings** → relay them as they are; they flag setups that store fine but probably don't do
  what was meant.
- **Read back** with `recoms_getAlgorithm` and compare with the confirmed plan, step by step.
  `matchesBestPractice` tells you whether the box still runs a best-practice algorithm unchanged.

## Worked example

> "Things people buy with this product, and if there aren't enough, other stuff from the same
> category. Nothing that's sold out, and not more than 4 of the bought-together ones."

```json
{
  "steps": [
    { "productType": "BOUGHT_TOGETHER", "priceInfluence": 0, "productLimit": 4 },
    { "productType": "TOP", "productLimit": 0,
      "filters": [ { "field": "hierarchies", "operator": "IN", "value": "$hierarchies" } ] }
  ],
  "filters": [ { "field": "inStock", "operator": "EQUALS", "value": "true" } ],
  "filterByGroupingKey": true
}
```

Nothing left open except the fallback beyond step 2 — ask it (§3.1); "show fewer" leaves the list
as it is.
