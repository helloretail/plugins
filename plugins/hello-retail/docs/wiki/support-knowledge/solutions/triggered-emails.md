---
source: public-docs
verified: 2026-10-29
---

# Triggered Emails — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [Triggered Emails](../../features/triggered-emails/triggered-emails.md), [Triggered Emails base template](../../base-templates/triggered-emails/README.md), [Klaviyo](../../integrations/klaviyo.md), [diagnostics](../diagnostics.md)

| Symptom | Go to |
| --- | --- |
| Abandoned cart emails reach customers who already ordered | [Converted users get cart emails](#abandoned-cart-emails-go-to-customers-who-already-ordered) |
| No abandoned cart emails at all, or the cart list in analytics is empty | [Cart tracking](#no-abandoned-cart-emails-are-sent) |
| The "Return to cart" button is missing, or points at a Hello Retail docs page | [Cart URL](#the-return-to-cart-button-is-missing-or-points-to-the-wrong-page) |
| A trigger is switched on but sends nothing | [Trigger sends nothing](#a-trigger-is-enabled-but-sends-nothing) |
| Price drop or back-in-stock emails do not go out for a product | [Price drop and back in stock](#price-drop-or-back-in-stock-emails-do-not-fire-for-a-product) |
| The "notify me" form on the product page returns an error | [Subscribe form](#the-notify-me-subscribe-form-returns-an-error) |
| An unsubscribed customer still got a triggered email | [Permissions](#an-unsubscribed-customer-still-received-a-triggered-email) |
| Unsubscribes from Hello Retail emails do not reach the newsletter platform | [Permissions](#an-unsubscribed-customer-still-received-a-triggered-email) |
| Emails arrive from a Hello Retail address instead of the shop's own domain | [Sending domain](#emails-are-sent-from-a-hello-retail-address-instead-of-the-shops-domain) |
| Triggered emails land in spam, or SPF fails | [SPF](#triggered-emails-land-in-spam-or-spf-fails) |
| Customers get too many triggered emails | [Sending limits](#customers-receive-too-many-triggered-emails) |
| A post-conversion email went out although the customer ordered again | [Post-conversion repeat order](#a-post-conversion-email-was-sent-after-the-customer-ordered-again) |
| How do I set up a win-back email for lapsed customers | [Reactivation](#how-do-i-email-customers-who-have-not-bought-in-a-while) |
| How do I send a second or third cart reminder | [Cart sequence](#how-do-i-send-a-second-or-third-abandoned-cart-reminder) |
| The design I made is not offered for the trigger | [Design type](#the-design-i-made-is-not-offered-in-the-trigger) |
| A Liquid variable renders empty in the email | [Template variables](#a-liquid-variable-renders-empty-in-the-email) |
| Mobile styles or media queries are ignored | [CSS](#mobile-styles-or-media-queries-are-ignored) |
| The custom font does not show | [Fonts](#the-custom-font-does-not-show-in-the-email) |
| The layout broke after editing the source | [Reset layout](#the-email-layout-broke-after-editing-the-source) |
| Where is triggered email traffic in Google Analytics | [UTM](#where-do-i-find-triggered-email-traffic-in-google-analytics) |

## Abandoned cart emails go to customers who already ordered

**Likely cause.** Hello Retail clears a visitor's tracked cart only when it sees the conversion. If
conversion tracking does not run on every receipt page — typically payment providers that show the
receipt on their own domain — the cart stays "abandoned" and the email goes out.

**Fix.**

1. Put conversion tracking on every receipt or thank-you page, for every payment method the shop offers.
2. Where a payment provider's receipt cannot be tracked, clear the cart at the last step before the
   redirect to the provider by calling `setCart` with an empty cart. This lowers the number of cart
   emails sent, so prefer full conversion tracking.

```javascript
hrq = window.hrq || [];
hrq.push(["setCart", { total: 0, productNumbers: [] }]);
```

**Check with.** `orders_list` — orders paid through the external provider should be in the list;
if they are missing, conversion tracking is the gap. The per-cart view in Triggered Emails
analytics shows each tracked cart's status.

**Source:** [Avoid sending abandoned cart emails to converted users](https://support.helloretail.com/triggered-emails/avoid-sending-abandoned-cart-emails-to-converted-users/) · [Cart tracking (SDK)](https://developer.helloretail.com/sdk/tracking/cart_tracking/)

## No abandoned cart emails are sent

**Likely cause.** Cart tracking is not set up, or Hello Retail is not fully installed: the script
must run, product data must be in Hello Retail, and conversions must be tracked. Cart products that
do not match the feed are not recognised.

**Fix.**

1. Confirm the three prerequisites: the script runs, the product feed (or product span) is in place,
   and conversion tracking works.
2. Track the cart on every change with the SDK `setCart` method, or put the `addwish-cart` span in the
   page body. The Hello Retail extensions for Magento, WooCommerce and PrestaShop include cart tracking
   by default.
3. Reference cart products by canonical product URL or by product number — the same values the feed
   uses.
4. Send the cart total with a dot as the decimal separator, and the shopper's e-mail where it is known
   (for example when logged in), so the cart can be tied to a recipient.

```html
<span class="addwish-cart" style="display:none" data-url="CART_RESTORE_URL" data-total="150.50" data-email="SHOPPER_EMAIL">
  <span class="addwish-product" data-productnumber="p-456-2"></span>
</span>
```

**Check with.** The per-cart list in Triggered Emails analytics (status, value, contents, permission).
`productData_get` on a cart product's URL or number confirms it matches the feed.

**Source:** [How to set up cart tracking](https://support.helloretail.com/triggered-emails/how-to-set-up-cart-tracking/) · [Trigger Types](https://support.helloretail.com/triggered-emails/trigger-types/) · [Triggered Emails Analytics](https://support.helloretail.com/triggered-emails/triggered-emails-analytics/) · [Cart tracking (SDK)](https://developer.helloretail.com/sdk/tracking/cart_tracking/)

> **May be outdated:** the support article calls the span's `data-total` required; the SDK reference
> lists `total` as optional. The trigger-types article links the Magento 1 install guide only.

## The Return to cart button is missing or points to the wrong page

**Likely cause.** The button only renders when the cart tracking supplied a restore URL. If the
platform cannot generate one, the button is hidden. In previews and test emails a Hello Retail
documentation page stands in for the cart URL, so a test that opens that page is expected.

**Fix.**

1. Pass the restore URL as `url` in `setCart`, or as `data-url` on the `addwish-cart` span.
2. Only mention the button in the email copy once it renders in a live send.
3. In a custom design, guard the button so it disappears when no URL exists:

```liquid
{% if cart_url %}<a href="{{ cart_url }}">Recover my cart</a>{% endif %}
```

**Source:** [Cart Specific URL for Abandoned Cart Emails](https://support.helloretail.com/triggered-emails/cart-specific-url-for-abandoned-cart-emails/) · [Abandoned Cart Design](https://support.helloretail.com/triggered-emails/abandoned-cart-design-triggered-emails/) · [Template Tags and Variables](https://support.helloretail.com/triggered-emails/template-tags-and-variables/)

## A trigger is enabled but sends nothing

**Likely cause.** The trigger was not saved, the recipients have no synced permission, or the data the
trigger needs is missing: cart tracking for Abandoned Cart, order data for Post-Conversion, product
views plus price or stock changes for Price Drop and Back in Stock.

**Fix.**

1. Open the trigger under Emails → Triggered Emails (Abandoned Cart, Price drop, Post-conversion),
   tick **Enable trigger**, pick a design and **Save**.
2. Review the trigger's permission settings; recipients without synced permission are not mailed.
   US businesses selling to US companies can turn on **Skip permissions** on the trigger.
3. Check the trigger's own data requirement (see the entries above and below).
4. Send a test email from the trigger editor to confirm the design and subject render.

**Check with.** Triggered Emails analytics (sent, opens, clicks per trigger; permission per cart).
`orders_list` for order data; `auditLog_getEntries` to see whether someone changed the trigger.

**Source:** [Setting up the Abandoned Cart Trigger](https://support.helloretail.com/triggered-emails/setting-up-the-abandoned-cart-trigger/) · [Setting up the Post-Conversion Trigger](https://support.helloretail.com/triggered-emails/setting-up-the-post-conversion-trigger/) · [Synchronizing Permissions](https://support.helloretail.com/triggered-emails/synchronizing-permissions/) · [Trigger Types](https://support.helloretail.com/triggered-emails/trigger-types/)

## Price drop or back-in-stock emails do not fire for a product

**Likely cause.** Price Drop only fires when the drop clears the trigger's rules: a minimum
percentage, a lookback window and a minimum number of views of the product. Back in Stock fires
when a product the shopper viewed while it was out of stock changes to in stock. Shoppers who
subscribed through a "notify me" form are registered per product.

**Fix.**

1. Open Emails → Triggered Emails → Price drop and review the minimum drop percentage, the lookback
   timeframe and the minimum view count. Loosen them if they are stricter than the shop's discounts.
2. Confirm the price or stock change actually reached Hello Retail through the feed.
3. For explicit subscriptions, see the subscribe-form entry below.

**Check with.** `productData_get` for the product's current price, old price and stock;
`feeds_getLatestRun` to confirm the feed that carries the change has run.

**Source:** [Setting Up the Price Drop Trigger](https://support.helloretail.com/triggered-emails/setting-up-the-price-drop-trigger/) · [Trigger Types](https://support.helloretail.com/triggered-emails/trigger-types/)

> **May be outdated:** the Introduction to Triggered Emails article says price drop emails are part of
> the Wish List service and need the wish list widget on the site. Trigger Types and the price drop
> setup article describe automatic tracking of viewed products instead, which matches the feature page.

## The notify-me subscribe form returns an error

**Likely cause.** The `triggeredEmailSubscribe` call returns a status string. The usual failures:
`email is invalid`, `type is invalid` (must be `price_drop` or `back_in_stock`),
`No product with given url found` (the URL does not match a product in Hello Retail), and
`Triggered Email Feature not enabled` (the feature, or the trigger for that type, is off).

**Fix.**

1. Pass the product URL explicitly if the form is not on the product page; otherwise the current page
   URL is used.
2. Check the URL against the product in Hello Retail.
3. Enable the matching trigger (Price drop or Back in Stock).
4. Treat `email subscribed` as success. The same status is returned when the address was already
   subscribed; only one email is sent per event.

```javascript
hrq = window.hrq || [];
hrq.push(["triggeredEmailSubscribe", email, "back_in_stock", productUrl, function (status) {
  // "email subscribed" means success
}]);
```

Without the SDK, POST `{ websiteUuid, email, url, type }` as JSON (or `text/plain`, which avoids a CORS
preflight) to `https://core.helloretail.com/serve/triggers/subscribe`.

**Check with.** `productData_search` or `productData_get` for the URL the form sends.

**Source:** [Subscribe to Triggered Emails](https://developer.helloretail.com/sdk/triggered_emails/subscribe_to_triggered_emails/)

> **May be outdated:** the article's example form checks `status === "ok"`, but the documented success
> status is `email subscribed`. Code copied from the example never shows its success message.

## An unsubscribed customer still received a triggered email

**Likely cause.** Hello Retail does not manage consent; it sends to the permission list it holds. A
manually uploaded list goes stale as soon as someone withdraws consent. Sync runs only from the
newsletter platform to Hello Retail, so an unsubscribe clicked in a Hello Retail email does not reach
the platform by itself.

**Fix.**

1. Turn on automatic permission sync for the customer's newsletter platform where one exists.
2. If the list is uploaded by hand: export the permissioned addresses as CSV (one address per line, no
   header) and upload under Data Setup → Permissions. Set a schedule to repeat it.
3. Point the unsubscribe link at the platform's own unsubscribe form: Triggered Emails → Settings →
   custom unsubscribe redirect. `{{ email }}` inserts the recipient's address.
4. For past opt-outs, download Triggered Emails → Settings → Unsubscribed email addresses and apply
   the list in the platform.

**Source:** [Notes on keeping email permissions up-to-date](https://support.helloretail.com/triggered-emails/notes-on-keeping-email-permissions-up-to-date/) · [Synchronizing Permissions](https://support.helloretail.com/triggered-emails/synchronizing-permissions/) · [General Settings for Triggered Emails](https://support.helloretail.com/triggered-emails/general-settings-for-triggered-emails/)

> **May be outdated:** the permission upload is placed under Data Setup → Permissions in one article
> and the unsubscribed list under Triggered Emails → Settings in another; confirm where the current
> dashboard keeps each.

## Emails are sent from a Hello Retail address instead of the shop's domain

**Likely cause.** No custom sending domain is set up or verified yet. Until it is, emails use the
configured sender name with a no-reply address on `helloretailmail.com`. The shop's own address only
shows when the domain is verified and DMARC aligns with SPF or DKIM.

**Fix.**

1. Ask Hello Retail support for a custom sending domain; they send the DKIM key for it.
2. Add the records on a dedicated subdomain such as `triggers.example-shop.com`:

| Type | Host | Value |
| --- | --- | --- |
| TXT (SPF) | `triggers.example-shop.com` | `v=spf1 include:_spf.helloretail.com ~all` |
| TXT (DKIM) | `hr._domainkey.triggers.example-shop.com` | key from Hello Retail support |
| CNAME | `hr.triggers.example-shop.com` | `email.helloretailmail.com` |
| MX | `triggers.example-shop.com` | the two Mailgun EU MX hosts listed in the article |

3. Hello Retail verifies the records and then switches the emails to the new domain.

**Source:** [Domain settings for Triggered Emails](https://support.helloretail.com/triggered-emails/domain-settings-for-triggered-emails/) · [Contact Hello Retail support](https://support.helloretail.com/contact/)

## Triggered emails land in spam or SPF fails

**Likely cause.** The sending domain's SPF record does not authorise Hello Retail, or the host has
more than one SPF record, which is a PermError that some receivers treat as a failure.

**Fix.**

1. Add `include:_spf.helloretail.com` to the existing SPF record rather than publishing a second one,
   for example `v=spf1 a mx include:_spf.google.com include:_spf.helloretail.com ~all`.
2. Complete the full custom-domain setup (entry above) so DKIM and DMARC alignment also pass.
3. Keep the unsubscribe link in the base design; the default design has it.

**Source:** [Adding a Hello Retail SPF record](https://support.helloretail.com/triggered-emails/adding-a-hello-retail-spf-record/) · [Domain settings for Triggered Emails](https://support.helloretail.com/triggered-emails/domain-settings-for-triggered-emails/)

## Customers receive too many triggered emails

**Likely cause.** No sending limit is set, so a recipient can qualify for several triggers close
together.

**Fix.**

1. Open Emails → Triggered Emails → Settings and enable the optional sending limits, which cap how
   often one recipient can receive triggered emails.
2. Review the delays between multiple Abandoned Cart or Post-Conversion triggers.

**Source:** [General Settings for Triggered Emails](https://support.helloretail.com/triggered-emails/general-settings-for-triggered-emails/)

## A post-conversion email was sent after the customer ordered again

**Likely cause.** The post-conversion trigger is set to send even if the customer has placed another
order in the meantime.

**Fix.**

1. Open Emails → Triggered Emails → Post-conversion and edit the trigger.
2. Turn off "Send the post-conversion email even if the customer has placed another order in the
   meantime" and save.

**Source:** [Setting up the Post-Conversion Trigger](https://support.helloretail.com/triggered-emails/setting-up-the-post-conversion-trigger/) · [How to reactivate customers who haven't bought in a while](https://support.helloretail.com/triggered-emails/how-to-reactivate-customers-who-havent-bought-in-a-while/)

## How do I email customers who have not bought in a while

**Likely cause.** There is no separate win-back trigger; it is a post-conversion trigger with a long
delay.

**Fix.**

1. Create a post-conversion design first.
2. Triggered Emails → Post-conversion → Create new trigger, enable it, and set **Send after** to 90–180
   days after the last order.
3. Turn off sending when the customer has ordered again in the meantime.
4. Algorithm: for repeat-purchase goods, delete the default steps and add **Recently bought**; for
   other catalogues, remove the **Bought together** step. Save and confirm the trigger is enabled.

**Check with.** `orders_list` — the trigger depends on order data reaching Hello Retail.

**Source:** [How to reactivate customers who haven't bought in a while](https://support.helloretail.com/triggered-emails/how-to-reactivate-customers-who-havent-bought-in-a-while/)

## How do I send a second or third abandoned cart reminder

**Likely cause.** Each reminder is its own trigger.

**Fix.**

1. Under Triggered Emails → Abandoned Cart, enable up to three triggers and set the delay for each.
2. Give each its own design, named after its timing, so the copy can escalate (for example a voucher
   only in the last one; the voucher code comes from the shop system).
3. The same works for Post-Conversion, also up to three.

**Source:** [Setting up the Abandoned Cart Trigger](https://support.helloretail.com/triggered-emails/setting-up-the-abandoned-cart-trigger/) · [Abandoned Cart Design](https://support.helloretail.com/triggered-emails/abandoned-cart-design-triggered-emails/)

## The design I made is not offered in the trigger

**Likely cause.** Each design has a type, and a trigger only lists designs of its own type. A base
design is not selectable on its own; it wraps the trigger designs.

**Fix.**

1. Under Triggered Emails → Designs, create the design with the matching button (New default abandoned
   cart / price drop / back in stock / post conversion design).
2. Select the base design inside it.

**Source:** [Liquid in Triggered Emails](https://developer.helloretail.com/guides/templates/triggered_emails/) · [Design Overview for Triggered Emails](https://support.helloretail.com/triggered-emails/design-overview-for-triggered-emails/)

## A Liquid variable renders empty in the email

**Likely cause.** Variables differ per trigger type. `email`, `unsubscribe_url` and `subject` exist in
all types; `cart_url` and `cart_total` only on Abandoned Cart (and `cart_url` only when a restore URL was
tracked); `receipt` only on Post-Conversion. A base design shared by all types breaks on a variable
that one type lacks.

**Fix.**

1. In the base design, use only the shared variables and `{{ blocks.content }}` (the blocks the trigger
   design defines with `{% block … %}`), or guard each type-specific variable with `{% if … %}`.
2. In trigger designs, loop `products` and guard optional lists:

```liquid
{% if relatedProducts %}{% for product in relatedProducts %}{{ product.title }}{% endfor %}{% endif %}
```

3. `oldPrice` is only set when `isOnSale` is true; extra feed fields are listed under Data Setup → Inventory.

**Check with.** `dataFields_getProductFields` for the fields available on products.

**Source:** [Template Tags and Variables](https://support.helloretail.com/triggered-emails/template-tags-and-variables/) · [Liquid in Triggered Emails](https://developer.helloretail.com/guides/templates/triggered_emails/)

> **May be outdated:** the support article says `relatedProducts` exists only on Price Drop and Back in
> Stock; the developer guide lists it under Abandoned Cart and not under Price Drop or Back in Stock.
> Guard it everywhere until confirmed with a test send.

## Mobile styles or media queries are ignored

**Likely cause.** When the email is sent, rules in a `<style>` block are inlined into the HTML. `@media`
rules are not inlined, so the inlined desktop styles win.

**Fix.**

1. Add `!important` to every declaration inside each `@media` rule.

**Source:** [Technical details about CSS and styling](https://support.helloretail.com/triggered-emails/technical-details-about-css-and-styling/)

## The custom font does not show in the email

**Likely cause.** The font was not loaded in the base design, or the recipient's email client does
not support web fonts and falls back to the fallback font.

**Fix.**

1. Pick a Google Font and copy its link tag.
2. Open the base design, **Edit source**, paste the link tag in `<head>`, and set the `content_font`
   variable to the family plus a generic fallback, for example `Roboto, Arial, sans-serif`.
3. Save. Clients without web-font support still show the fallback — that is expected.

**Source:** [Changing font for Triggers](https://support.helloretail.com/triggered-emails/changing-font-for-triggers/)

> **May be outdated:** the article's numbered steps jump from 1 to 4; the steps for opening the base
> design are missing from the published text.

## The email layout broke after editing the source

**Likely cause.** Hand edits to the HTML and CSS can render differently across email clients; the
predefined parameters render consistently.

**Fix.**

1. Press **Reset layout** at the top of the design to return to the default.
2. Make brand changes through the parameters (Header Image Url, header background colour, button
   colour as a hex code, footer) rather than source edits where possible.
3. Send a test email before saving the design to a live trigger.

**Source:** [Base Design for Triggered Emails](https://support.helloretail.com/triggered-emails/base-design-for-triggered-emails/) · [Abandoned Cart Design](https://support.helloretail.com/triggered-emails/abandoned-cart-design-triggered-emails/)

## Where do I find triggered email traffic in Google Analytics

**Likely cause.** Hello Retail tags every outbound link automatically; the traffic is there under its
UTM values.

**Fix.**

1. Filter GA on source `helloretail`, medium `triggered-email`.
2. Campaign identifies the trigger: `abandoned-cart-1` to `-3`, `price-drop-1`, `post-conversion-1` to `-3`.

**Source:** [Tracking Triggered Emails in Google Analytics](https://support.helloretail.com/triggered-emails/tracking-triggered-emails-in-google-analytics/)

> **May be outdated:** the UTM table has no row for Back in Stock, although it is one of the four
> trigger types.
