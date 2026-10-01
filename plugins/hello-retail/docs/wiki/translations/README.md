---
source: field
verified: 2026-09-15
---

# UI Translations (QA team)

Canonical translations for Hello Retail **Search**, **Recommendations**, and **Pages** UI strings, provided by the QA team. Use these **first** whenever you need to translate or change a UI string in a template; only fall back to your own knowledge for strings this file doesn't cover (and make sure the result reads naturally for the locale).

## Files

- **`Translations-2023.xlsx`** — the original source workbook (kept in the internal repository, not bundled here). One tab per language (Danish, Swedish, Norwegian, Finnish, Dutch, German, French, Spanish, Portuguese, Italian, Polish, Korean, Chinese) plus a `Template` tab. Each tab lays the strings out in three column blocks: **RECOMMENDATIONS** (cols B–D), **SEARCH** (cols F–G), **PAGES** (cols I–J), with the English source string and its translation side by side.
- **`translations.json`** — flattened, lookup-friendly version generated from the workbook. **Use this one when generating templates.**

## `translations.json` shape

```json
{
  "_meta": {
    "languages": {
      "Danish":  ["da", "da-DK", "dk", ".dk", "Dansk"],
      "Swedish": ["sv", "sv-SE", "se", ".se", "Svenska"],
      …
    },
    …
  },
  "sections": {
    "SEARCH":          { "<English string>": { "Danish": "…", "Swedish": "…", "Finnish": "…", … } },
    "RECOMMENDATIONS": { "<English string>": { … } },
    "PAGES":           { "<English string>": { … } }
  }
}
```

Each entry is keyed by the **English** UI string, and each translation inside it by the **English name of the language**: `Danish`, `Swedish`, `Norwegian`, `Finnish`, `Dutch`, `German`, `French`, `Spanish`, `Italian`, `Polish`, `Portuguese`, `Korean`, `Chinese`. These are the workbook's tab names. The file never uses codes as keys, so there is no `dk`, `da`, `se` or `sv` key.

To get from a code to the key, use `_meta.languages`. It lists every code, domain and `<html lang>` value for each language. Find the store's value in a list, and the name the list is under is the key:

| Store says | Key |
|---|---|
| `da`, `da-DK`, `dk`, `.dk` | `Danish` |
| `sv`, `sv-SE`, `se`, `.se` | `Swedish` |
| `no`, `nb`, `nn`, `.no` | `Norwegian` |
| `fi`, `.fi` | `Finnish` |
| `ko`, `ko-KR`, `kr`, `.kr` | `Korean` |
| `zh`, `zh-CN`, `cn`, `.cn` | `Chinese` (Simplified only; nothing for `zh-TW` / `zh-HK`) |

The other languages follow the same pattern (`nl` → `Dutch`, `de` → `German`, and so on). A language key appears only where the workbook has a translation for that string. Polish covers about half the strings, and Portuguese, Korean and Chinese cover fewer than ten each.

## How to use it (template generation)

1. When the skill resolves the localization header (or changes any UI label), for each English token look it up in `translations.json` under the relevant section (`SEARCH` for Search templates, `RECOMMENDATIONS` for recoms).
2. If the English token matches an entry and has a key for the target language's name (for example `sections.SEARCH["Sort by"]["Danish"]` for a `.dk` / `da` store) → **use that translation verbatim.** Many cells list more than one option separated by `/` (e.g. `"Sortering / Sortera efter"`, or DE `"Ihre Auswahl ergab xx Produkte / Deine Entscheidungen haben gegeben xx Produkte"`) — choose using the rule below.
3. If the token or language is **missing** → translate from your own knowledge, keep e-commerce register, and add a MISSING-DATA note so the operator can verify.
4. Cross-check against the customer's storefront copy — if their site already uses specific wording, that wins over both this file and the dictionary.

### Choosing between `/`-separated options

Options separated by `/` are **not interchangeable** — they usually differ by **register** (formal vs informal address) and sometimes by **quality** (one is a cleaner phrasing than a literal/awkward one). Decide in this order:

1. **Match the customer's own site.** If the storefront already shows one of the options (or that exact UI label), use it verbatim. Consistency with their site beats everything.
2. **Match the site's register, decided once for the whole template.** Determine formal vs informal from the storefront copy and apply it to *every* option you pick, so the template is internally consistent:
   - German: formal **Sie / Ihr / Ihre** vs informal **Du / Dein / Deine**
   - Dutch: formal **u / uw** vs informal **je / jij / jouw**
   - French: formal **vous** vs informal **tu**
   - Spanish: formal **usted** vs informal **tú**
   - (Nordic languages are effectively always informal — pick the natural one.)
3. **Prefer the natural, concise option.** Discard clumsy literal calques even when they're in the right register (e.g. for DE "Your choices gave xx products", prefer `Ihre Auswahl ergab xx Produkte`, not `Deine Entscheidungen haben gegeben xx Produkte`).
4. **If formal-vs-informal is genuinely ambiguous and it affects the whole UI → ask the operator** instead of guessing; it's a site-wide tone decision.

Default when there is no signal at all: the **first** option, and **formal** register for languages that distinguish (DE/NL/FR/ES) — formal is the safer retail default.

## Regenerating `translations.json`

If the workbook is updated, re-run the extractor (Recommendations = cols 2/3, Search = cols 5/6, Pages = cols 8/9). **Pair each translation with its own English cell *within the same tab*, then merge across tabs on the (normalized) English string** — do **not** align by row number across tabs, because the language tabs have different row counts and that misaligns Finnish/Dutch/Italian/etc. Key each translation by its tab's language name (`Danish`, `Swedish`, …), never by a code, and keep `_meta.languages` in the file.

`translations.json` has also had a manual QA pass on top of the raw extract: embedded notes (`(DON'T USE …)`, `(if … feed)`, English glosses) were stripped from the values, the typo key `Show resultat` was renamed to `Show results`, and a few clear translation errors were corrected (e.g. ES `Sale`/`News`/`New`, FI `Season`, KO highest-price sort, IT `Show product`, NL `Select option`/`Compare`). The workbook remains the untouched master — fold these back into it when convenient.
