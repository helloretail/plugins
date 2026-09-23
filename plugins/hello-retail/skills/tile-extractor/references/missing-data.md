# Common missing data — always flag in the response text

Read this before workflow step 7 of `../SKILL.md` (the parity table) and again when writing the
`MISSING DATA` section. Every row here is a field that is routinely absent or empty; check each one
that the native tile needs against the `productData_get` rows before assuming it is there.

| Field                                            | Note                                                                                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| `extraData.altImage`                             | Hover image — often missing. Check what it actually CONTAINS before using: on multi-color feeds it may be a *different color's* packshot, and swapping to it on hover misleads. If no faithful hover image exists, prefer omitting the hover element with operator approval (Output Rule #6 exception) over a `product.imgUrl` fallback that causes a contain→cover crop-jump |
| `extraData.ratingAvg`                            | May not be in feed — ask feed team to add                                                                                                  |
| `extraData.ratingCount`                          | May not be in feed — ask feed team to add                                                                                                  |
| `extraData.id`                                   | Internal product/variant ID — needed for ATC forms on some platforms                                                                       |
| `extraData.hasOptions` / `extraData.hasVariants` | Needed for "Vælg variant" vs "Køb" logic                                                                                                   |
| `extraData.itemNumber`                           | Magento entity ID — required for all dynamic `id`/`class` attributes in Magento tiles                                                      |
| `extraDataList.swatchIMG`                        | Magento swatch images — served from Magento CDN, not in feed by default; use `product.imgUrl` as fallback                                  |
| `extraData.brandLogoUrl`                         | Brand logo for CLK/third-party brand badge systems — not in feed; render brand name as text fallback via `extraData.extraattributes_brand` |
| Shopify `section-id`                             | Page-specific, not in feed — omit entirely                                                                                                 |
| `extraDataList.siblingUrls`                      | Sibling product URLs — often missing, fallback to `product.url`                                                                            |
| `brand`                                          | Often empty even when the storefront shows a brand — on Magento check `extraData.extraattributes_brand` instead                            |
| `extraDataList.size`                             | Weight/size shown on the native tile (e.g. "2805 gram") — usually unmapped                                                                 |
| Dietary / certification labels                   | No standard field — needs a new feed attribute; one list can drive both a corner badge and a cert icon                                     |
| "Popular" / "New" badge flags                    | No standard field; sale is the only derivable label and it comes from `product.isOnSale`, never from a price comparison                    |
| `product.priceExVat`                             | Excl.-VAT price for incl./excl. pairs — the team adds it to the feed; ask when the native tile shows both                                  |
| Lowest-30-day price (Omnibus)                    | Customer-specific `extraData.*`; omit the element until the feed carries it — never a static fallback                                      |
| Unit price / delivery text / stock count          | Customer-specific `extraData.*`; static fallback copied from the native tile + ask the feed team                                            |
| `product.minPrice` / `maxPrice`                  | Price range for variant products — not standard; check the row, else "from" prefix on `product.price` + ask                                |
| `product.trackingCode`                           | Required for `trackClick` on the ATC button — confirm it is present in the `productData_get` row                                           |
| Full-size feed images                            | `imgUrl` much larger than the rendered tile — fix in the feed or ask the customer for sized images (Rule 8)                                |
