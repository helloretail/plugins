---
source: field
verified: 2026-10-02
---

# PrestaShop

PrestaShop is supported with the Hello Retail module, which installs under
`/modules/addwish/`. Install guide:
[PrestaShop Installation Guide](https://support.helloretail.com/platforms-and-newsletter-providers/prestashop-installation-guide/).

Feed field mapping, variant attributes and the transform template are in the `feed-setup`
skill's PrestaShop reference. This page covers what the module exposes and the setting that
makes prices wrong without any error.

---

## Endpoints the module exposes

| Endpoint | What it's for |
|---|---|
| `/modules/addwish/info.php` | Module version, PrestaShop version, the shop's languages, countries and currencies. Older modules serve it as `/modules/addwish/addwishinfo.php`; try that when `info.php` is missing. |
| `/modules/addwish/addwishfeed.php`, `/modules/addwish/productfeed.php` | The product feed. Paged with `page` (starts at **0**) and `pageSize`. |

Whether `info.php` requires authentication has not been verified.

### What `info.php` returns

```xml
<info extension-version="1.2.58">
    <languages default="1">
        <language id="1" code="sv" active="yes"/>
        <language id="2" code="no" active="yes"/>
        <language id="3" code="da" active="yes"/>
        <language id="5" code="gb" active="no"/>
    </languages>
    <countries default="18">
        <country id="18" code="SE" name="Sweden" active="1"/>
    </countries>
    <currencies default="1">
        <currency id="2" code="DKK" active="1"/>
        <currency id="3" code="NOK" active="1"/>
        <currency id="1" code="SEK" active="1"/>
    </currencies>
    <prestaversion>8.1.2</prestaversion>
</info>
```

How to read it:

- **`default` is an id, not a code.** Look it up among the child elements. Above, the default
  currency `1` is SEK, although DKK is listed first.
- **Language codes are PrestaShop's own.** English can appear as `gb` as well as `en`.
- **Inactive languages are listed too.** Build feeds for the `active="yes"` ones only.
- **A code can appear twice.** One shop listed `de` as id 6 (active) and id 8 (inactive).
  Always choose by id.

---

## The default country sets the VAT in the feed

The feed calculates prices with the tax rules of the shop's **default country**. When that
default is a country the shop does not sell to, every price in the feed carries the wrong
VAT. The feed run still succeeds, so nothing reports a problem.

The sign in `info.php` is a `default` id that does not match any `<country>` listed:

```xml
<languages default="4">
    <language id="2" code="sv" active="yes"/>
    <language id="4" code="fi" active="yes"/>
    …
</languages>
<countries default="18">
    <country id="7" code="FI" name="Finland" active="1"/>
</countries>
<currencies default="8">
    <currency id="8" code="EUR" active="1"/>
</currencies>
```

Everything here points at Finland: the default language is 4 (`fi`), the only currency is EUR
and the only country listed is Finland (id 7). The default country is 18, which is Sweden. A
plain `addwishfeed.php` therefore prices with Swedish VAT.

**Fix:** pass the country explicitly, using its id from `info.php`:

```
/modules/addwish/addwishfeed.php?country_id=7
```

When the default country is already correct, leave the parameter out.

## Choosing the language

Use `lang_id` with a language id from `info.php`, for example
`/modules/addwish/addwishfeed.php?country_id=7&lang_id=4`. Build one feed per active
language the shop needs indexed.

---

**Related:** [plugin info endpoints](../plugin-info-endpoints.md) ·
[ecommerce platforms](../ecommerce-platforms.md)

## Timeline

- 2026-10-02: Page created: endpoints, `info.php` shape, the default-country VAT trap and the
  `country_id` / `lang_id` parameters.
