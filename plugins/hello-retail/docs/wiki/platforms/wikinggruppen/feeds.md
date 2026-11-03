---
source: field
verified: 2026-11-03
---

# Wikinggruppen — Feeds

Product feed setup for WGO shops. Read alongside the `feed-setup` skill, which owns the general V2 feed-creation flow. The export is the same on every theme generation.

---

## Source

Every WGO shop serves a Hello Retail product export of its own:

```text
https://<shop-domain>/csv/?action=addwish-products
```

"addwish" is Hello Retail's former name. The URL takes no credentials or headers. Each market site of a multi-site shop has its own export on its own domain.

## V2 feed config

| Setting | Value |
|---|---|
| Format | DSV: delimiter `;`, header row, quote character `"`, skip rows 0 |
| Fetch | `SINGLE_REQUEST`, no request headers, cache busting on, no delta runs |
| Schedule | every 3600 s (hourly) |
| Safety | stop if fewer / more products than expected: on |

## Column → field mapping

The export's columns are Swedish. Hello Retail field names, including every `extraData` key, are **English camelCase**:

| Export column | Hello Retail field | Transform |
|---|---|---|
| `URL` | `url` | — |
| `Produktnamn` | `title` | — |
| `Pris` | `price` | none — VAT included, whole or decimal as exported |
| `OrgPris` | `oldPrice` | none. Always filled; equals `Pris` when the product is not on sale, and Hello Retail derives `isOnSale` from the pair |
| `BildURL` | `imgUrl` | swap the size folder to the list size — see [Images](#images-probably-universal) |
| `Beskrivning` | `description` | strip HTML |
| `Artnr` | `productNumber` | — |
| `EAN` | `ean` | — |
| `Tillverkare` | `brand` | — |
| `Lagersaldo` | `inStock` | `Lagersaldo > 0` |
| `Varugrupper` | `hierarchies` | see [Hierarchies](#hierarchies) |
| `KombinationsID` | `extraData.combinationId` | — **required for add to cart** ([add-to-cart.md](./add-to-cart.md)) |
| `ProduktID` | `extraData.productId` | — |
| `Valalternativ` | `extraData.hasVariants` | `Valalternativ !== "0"` (`"0"` = no variants) |

Currency is not mapped: the feed carries the website's own currency.

Group products on `title` + `imgUrl`.

## Images (probably universal)

WGO serves every product image in several sizes, one folder per size: `/images/normal/…` (the size the export's `BildURL` points to) and `/images/list/…` (the size the theme's own category tiles load). Map the list size, so Hello Retail tiles load the same light images as the native tiles:

```javascript
imgUrl: (row.BildURL || "").replace("/normal/", "/list/"),
```

Do the same for a second image column (`BildURL2`) when the tile uses a hover image.

## Hierarchies

`Varugrupper` holds every category path of the product in one string: paths separated by a comma **with no space after it**, levels inside a path separated by `" - "`. Commas followed by a space belong to a category name and must not split.

```javascript
hierarchies: (row.Varugrupper || "")
  .replace(/,([^\s])/g, "|$1")
  .split("|")
  .filter(Boolean)
  .map(function (path) { return path.split(" - "); })
```

WGO also stores internal groups in `Varugrupper`. Drop these paths when they appear: `#specterimport` and `- 1 GWP`. Campaign and navigation groups (black-week lists, top lists, gift guides) are shop-specific — ask the shop which ones are not real categories.

## Columns that vary per shop

The export's column set depends on the shop's setup. Read the header row before mapping anything beyond the table above. Columns seen in live exports:

| Column | What it holds |
|---|---|
| `BildURL2` | second product image (hover image) |
| `Pris_<CUR>` / `OrgPris_<CUR>` | price / old price per currency on multi-currency shops (`Pris_EUR`, `Pris_NOK`, …) — mapping in [multi-currency.md](./multi-currency.md) |
| `Associerade` | comma-separated article numbers of associated products |
| `BanderollText` | the text of the product's badge ("Nyhet", …) |
| `rewiewScore` (sic) / `reviewNumber` | review score and count. Note the misspelled column name; `"0"` means no reviews |
| `variantProductNumbers` | JSON array of the variants' article numbers |
| `Varugrupp` | the product's main group only |
| `Modell` | model name |

Map shop-specific columns with the same naming rule: English camelCase keys, `extraData` for strings, `extraDataNumber` for numbers, `extraDataList` for lists.

---

## Timeline

- 2026-11-03: Page created from the V2 feed configs of three live WGO setups (plus the feed source of five sibling market sites); source URL, format and core mapping identical on all of them. The English camelCase key names are the house rule for new setups; older setups use Swedish keys (see [README.md → Older feed key names](./README.md#older-feed-key-names)).
