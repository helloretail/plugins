---
source: public-docs
verified: 2026-10-29
---

# Tracking and the JavaScript SDK — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [script not loading](../script-not-loading.md), [diagnostics — audit log and API log](../diagnostics.md), [SPA page tracking](../../onboarding/spa-tracking.md), [data requirements](../../onboarding/data-requirements.md), [implementation methods](../../onboarding/implementation-methods.md), [click tracking on the buy button](../../platforms/add-to-cart.md), [Pages REST snippets](../../cheat-sheets/pages/general.md)

If nothing from Hello Retail appears on the page at all, start at
[script-not-loading.md](../script-not-loading.md) — every entry below assumes `helloretail.js` loads.

| Symptom | Go to |
| --- | --- |
| "Our hrq call does nothing" or a TypeError before the script is ready | [SDK call runs before the script is ready](#sdk-call-runs-before-the-script-is-ready) |
| "Is the tracking request even reaching Hello Retail?" | [Is the tracking request arriving at all](#is-the-tracking-request-arriving-at-all) |
| A REST tracking call returns 400 or 500 | [Tracking REST call returns 400 or 500](#tracking-rest-call-returns-400-or-500) |
| "The script serves the wrong website" or "we test from a staging domain" | [Script serves content for the wrong website](#script-serves-content-for-the-wrong-website) |
| "Carts aren't tracked" or abandoned-cart mails don't fire | [Cart is not tracked or never clears](#cart-is-not-tracked-or-never-clears) |
| "Our sales don't show up in the statistics" | [Conversions are missing from the statistics](#conversions-are-missing-from-the-statistics) |
| "Product views aren't registered" or are counted twice | [Product views are not registered](#product-views-are-not-registered) |
| "Clicks on Hello Retail products don't show in the statistics" (managed) | [Clicks on managed solutions are not registered](#clicks-on-managed-solutions-are-not-registered) |
| "Our API/SDK integration doesn't register clicks" | [Clicks from an API or SDK integration are not registered](#clicks-from-an-api-or-sdk-integration-are-not-registered) |
| "How do we verify our click tracking?" | [Verifying click tracking in an API or SDK integration](#verifying-click-tracking-in-an-api-or-sdk-integration) |
| "We want to track server-side" or "clicks get lost on navigation" | [Server-side tracking and lost clicks](#server-side-tracking-and-lost-clicks) |
| "Personalization resets on every request" in an API integration | [A new tracking user on every request](#a-new-tracking-user-on-every-request) |
| "Logged-in customers lose their history across devices" | [Identifying logged-in customers across devices](#identifying-logged-in-customers-across-devices) |
| "Activity moved to the wrong customer" | [Activity ends up on the wrong customer](#activity-ends-up-on-the-wrong-customer) |
| "How do we attach the customer's e-mail to the visitor?" | [Registering an e-mail on the visitor](#registering-an-e-mail-on-the-visitor) |
| "Customer bias returns nothing" or "401 on customer bias" | [Customer bias returns nothing or is refused](#customer-bias-returns-nothing-or-is-refused) |
| "How do we use customer bias for a hero banner or a mail?" | [Using customer bias outside Hello Retail solutions](#using-customer-bias-outside-hello-retail-solutions) |

## SDK call runs before the script is ready

**Likely cause.** The page calls an SDK method before `helloretail.js` has finished loading. The
script loads `async`, so code that touches the SDK directly can run first.

**Fix.**

1. Always go through the command queue, which holds calls until the script is ready:

    ```javascript
    hrq = window.hrq || [];
    hrq.push(["setCart", { total: 0, productNumbers: [] }]);
    ```

2. To make several calls, push a callback instead; it receives the ready `sdk` object:

    ```javascript
    hrq = window.hrq || [];
    hrq.push(function (sdk) {
        sdk.setCart({ total: 0, productNumbers: [] });
    });
    ```

3. Pushing a function is shorthand for binding it to the `ready` event. The long form is
   `hrq.push(["bind", "ready", fn])`; `bind_once` fires once only, and `unbind` needs the
   **same function instance** that was bound. `ready` is the only event documented.

**Check with.** In the console, `typeof window.hrq` is `object` once the script has booted (see
[script-not-loading.md](../script-not-loading.md)).

**Source:** [Troubleshooting](https://developer.helloretail.com/guides/troubleshooting/) · [Event binding](https://developer.helloretail.com/sdk/tracking/event_binding/)

## Is the tracking request arriving at all

**Likely cause.** Before debugging the payload, establish whether Hello Retail receives the
request, and for which website. Requests are logged against the website they resolve to (from
`websiteUuid` in the parameters or body, or a resource such as a recom box key or search config
id) — a request that resolves to another website, or to none, is not in the log you are reading.

**Fix.**

1. Switch on request logging for the website (dashboard: **API → Log → Request Log** toggle, or
   the MCP), reproduce, then refresh the log.
2. Filter by endpoint (for example `collect/click: POST`) and by HTTP status.
3. Tag your own test requests with `?apiLogTag=<tag>` and filter on the tag (the "Misc." filter in
   the dashboard) to find them in a busy production log.
4. No entry → check the `websiteUuid` the integration sends. Right UUID and still no entry → the
   request never reached Hello Retail; the cause is on the customer's side.
5. Request logging does not cover the Product Intelligence GraphQL endpoint.

**Check with.** `apiLog_setLogging` to switch recording on, `apiLog_getEntries` filtered on the
`collect_*` endpoints, `apiLog_getStats` for counts. Read [diagnostics.md](../diagnostics.md)
first — recording captures shoppers' personal data, so the customer agrees before it is switched on.

**Source:** [Troubleshooting — API request logging](https://developer.helloretail.com/guides/troubleshooting/) · [Verify click tracking integration](https://developer.helloretail.com/guides/verify-click-tracking/)

> **May be outdated:** the developer docs say logging stays on for **7 days** and each toggle
> extends it by 7 days; [diagnostics.md](../diagnostics.md) (field) says the recording window is
> always **3 days**, with entries deleted 7 days after capture. Follow the field page.

## Tracking REST call returns 400 or 500

**Likely cause.** A 400 means invalid input — usually `websiteUuid` missing (`"websiteUuid is
required"`) or not matching a website (`"Website not found"`). A 500 is a server-side failure.

**Fix.**

1. Every `/serve/collect/*` call (`pageview`, `click`, `cart`, `conversion`) is a `POST` with a
   JSON body that includes both `websiteUuid` and `trackingUserId`.
2. Send `Content-Type: application/json` or `text/plain`. `text/plain` keeps a browser request
   "simple" and avoids a CORS preflight.
3. A 500 that persists goes to [Hello Retail support](https://support.helloretail.com/contact/).

**Check with.** `apiLog_getEntries` with the client-error status range on the `collect_*`
endpoints.

**Source:** [Cart tracking](https://developer.helloretail.com/sdk/tracking/cart_tracking/) · [Conversion tracking](https://developer.helloretail.com/sdk/tracking/conversion_tracking/) · [View tracking](https://developer.helloretail.com/sdk/tracking/view_tracking/) · [Click tracking](https://developer.helloretail.com/sdk/tracking/click_tracking/)

## Script serves content for the wrong website

**Likely cause.** The script detects the website from the domain it runs on. On a staging host, a
new market domain, or any domain other than the one set up in Hello Retail, it picks the wrong
website or none.

**Fix.**

1. Force the website in the init call:

    ```html
    <script async src="https://helloretailcdn.com/helloretail.js"></script>
    <script>
        window.hrq = window.hrq || [];
        hrq.push(["init", { websiteUuid: "{website uuid}" }]);
    </script>
    ```

2. On a multi-region single-page app, pass the new region's `websiteUuid` with
   `hrq.push(["reload", { websiteUuid: "…" }])` — see [spa-tracking.md](../../onboarding/spa-tracking.md).

**Check with.** `website_getInfo` returns the website UUID and its configured domain.

**Source:** [Troubleshooting — Forcing a specific website](https://developer.helloretail.com/guides/troubleshooting/)

> **May be outdated:** the developer docs place the UUID under **Settings → Website Settings →
> General → Website unique id**; the support article on API credentials says **Websites → Go to
> Settings**. Confirm the current dashboard path before quoting either.

## Cart is not tracked or never clears

**Likely cause.** `setCart` is not called on every cart change, identifies products by a value the
feed does not use, or is never called with an empty cart. A missing cart breaks the abandoned-cart
trigger as well as cart-based personalization.

**Fix.**

1. Call `setCart` every time the cart changes, sending the **whole** cart — each call replaces the
   previous one.
2. Identify the products by `urls` (canonical URLs) **or** `productNumbers`; either must match the
   values in the product feed exactly.
3. Optional fields: `total`, `url` (a link that restores the cart — used in abandoned-cart
   mails), `email`.
4. When the cart is emptied, send an empty list so Hello Retail clears it too:

    ```javascript
    hrq = window.hrq || [];
    hrq.push(["setCart", { total: 0, productNumbers: [] }]);
    ```

5. Server-side: `POST https://core.helloretail.com/serve/collect/cart` with the same object plus
   `trackingUserId` and `websiteUuid`; success is `{"success": true, "message": "Cart tracked"}`.

**Check with.** DevTools → Network: a `POST` to `/serve/collect/cart` on each cart change.
`productData_get` confirms the product number or URL sent exists in the catalog.

**Source:** [Cart tracking](https://developer.helloretail.com/sdk/tracking/cart_tracking/) · [Server side tracking](https://developer.helloretail.com/guides/tracking/server_side_tracking/)

> **May be outdated:** the property table types `total` as a String while every example sends a
> number.

## Conversions are missing from the statistics

**Likely cause.** `trackConversion` does not fire on the order-confirmation page, or fires with an
order number or product identifiers that do not match the order feed and product feed. Browsers
that block tracking calls also lose conversions.

**Fix.**

1. Call `trackConversion` immediately when the order completes, with `total`, `orderNumber`,
   `email`, optional `customerId`, and `products` (each with `productNumber`, `url`, `quantity`,
   `lineTotal`).
2. `orderNumber` must be identical to the order number in any order feed.
3. Add an order feed as a backstop: it imports historic orders, orders from other channels, and
   orders whose tracking call was blocked.
4. Server-side: `POST https://core.helloretail.com/serve/collect/conversion` with the same object
   plus `trackingUserId` and `websiteUuid`.

**Check with.** `orders_list` for the orders Hello Retail holds; `apiLog_getEntries` on the
conversion endpoint after a test order.

**Source:** [Conversion tracking](https://developer.helloretail.com/sdk/tracking/conversion_tracking/) · [Introduction to Hello Retail](https://developer.helloretail.com/guides/introduction/)

## Product views are not registered

**Likely cause.** Automatic view tracking cannot match the page to a product (the canonical URL or
product number differs from the feed), the shop is a single-page app, or automatic tracking was
switched off without manual tracking replacing it.

**Fix.**

1. Ordinary storefront: the script tracks page views by itself; no code is needed.
2. Single-page app: call `hrq.push(["reload"])` after each route change — see
   [spa-tracking.md](../../onboarding/spa-tracking.md).
3. Manual tracking: disable the automatic page view first, or views are counted twice:

    ```javascript
    hrq.push(["init", { trackPageView: false }]);
    ```

    then call `hrq.push(["trackPageView", null, "{product id}"])` on each product view. Hello
    Retail tries the product number first, then the URL (`document.location.href` when none is
    passed).
4. REST: `POST https://core.helloretail.com/serve/collect/pageview` with `trackingUserId`,
   `websiteUuid` and optionally `location` (a full URL), `referrer`, `url`, `productNumber`.

**Check with.** `productData_get` for the product number or URL the page sends; DevTools → Network
for the `/serve/collect/pageview` request.

**Source:** [View tracking](https://developer.helloretail.com/sdk/tracking/view_tracking/)

## Clicks on managed solutions are not registered

**Likely cause.** Managed Search, Recommendations and Pages put a tracking fragment
(`#aw_source=…`) on every product link, and the script extracts it and tracks the click. Clicks are
lost when custom code strips the fragment from the link, or when a buy button in the tile adds to
cart without following the product link.

**Fix.**

1. Keep `#aw_source=` on product links, or let `fix_links` swap it for a click handler (see
   [templates-and-api.md](./templates-and-api.md#click-tracking-lost-in-a-custom-search-or-pages-template)).
2. Buy and add-to-cart buttons inside a tile need their own
   `hrq.push(["trackClick", "{{ product.trackingCode }}"])` — the field rule is in
   [add-to-cart.md](../../platforms/add-to-cart.md).

**Check with.** Click a product with DevTools open: a `POST` to
`https://core.helloretail.com/serve/collect/click` follows.

**Source:** [Click tracking](https://developer.helloretail.com/sdk/tracking/click_tracking/) · [Managed templates](https://developer.helloretail.com/guides/templates/)

## Clicks from an API or SDK integration are not registered

**Likely cause.** The frontend renders `originalUrl` (no fragment) without calling `trackClick`,
builds or caches tracking codes itself, or fires more than one click request per click.

**Fix.**

1. Pick one of the two documented ways:
    - Render the response's `url` — it carries the tracking fragment, and the script tracks the
      click on the landing page; or
    - Render `originalUrl` and call `hrq.push(["trackClick", product.trackingCode])` in the click
      handler.
2. Treat `trackingCode` as opaque: never construct it, and never store one for reuse — it is
   generated per product on every response.
3. Without the script, `POST https://core.helloretail.com/serve/collect/click` with
   `trackingUserId`, `websiteUuid` and `source` (the tracking code).

**Check with.** DevTools → Network for `/serve/collect/click`, then the verification steps in the
next entry.

**Source:** [Click tracking](https://developer.helloretail.com/sdk/tracking/click_tracking/) · [Verify click tracking integration](https://developer.helloretail.com/guides/verify-click-tracking/)

The REST snippet for this call is in the [Pages cheat sheet](../../cheat-sheets/pages/general.md).

## Verifying click tracking in an API or SDK integration

**Likely cause.** Not a fault — the checklist Hello Retail gives to confirm an SDK or REST
click-tracking integration for Search, Recommendations or Pages.

**Fix.**

1. Switch on API request logging for the website and filter on `collect/click: POST`.
2. Click a product on the frontend, then refresh the log. No request → check the `websiteUuid`;
   correct UUID and still nothing → the request never left the customer's side.
3. Open the request and confirm:
    - **one** request per click;
    - a `trackingUserId` is present (when the visitor has opted in to tracking);
    - `source` differs between products;
    - the prefix matches the solution: `pb` managed Recommendations, `ur` unmanaged
      Recommendations, `ps` Search, `pa` Pages.
4. Repeat for every solution the frontend integrates.

**Check with.** `apiLog_setLogging`, then `apiLog_getEntries` on the click endpoint.

**Source:** [Verify click tracking integration](https://developer.helloretail.com/guides/verify-click-tracking/)

## Server-side tracking and lost clicks

**Likely cause.** View, click, cart and conversion tracking can all run server-side, but each call
needs a stable `trackingUserId` per visitor and the `websiteUuid`. Click requests fired from the
browser on navigation get cancelled when the page unloads.

**Fix.**

1. Get a `trackingUserId` once per visitor (next entry) and keep it in the session or a cookie;
   keep `websiteUuid` in configuration.
2. Call the same endpoints as the SDK: `/serve/collect/pageview`, `/serve/collect/click`,
   `/serve/collect/cart`, `/serve/collect/conversion`.
3. Send the **whole** cart on every change; send an empty product list when it is cleared.
4. For click tracking on a link or buy button, send the request with `navigator.sendBeacon` so
   navigation does not cancel it. Serialize the body:

    ```javascript
    navigator.sendBeacon(
        "https://core.helloretail.com/serve/collect/click",
        JSON.stringify({ trackingUserId: "{tracking user id}", websiteUuid: "{website uuid}", source: "{tracking code}" })
    );
    ```

**Source:** [Server side tracking](https://developer.helloretail.com/guides/tracking/server_side_tracking/)

> **May be outdated:** the doc's `sendBeacon` example passes a plain object as the body, which the
> browser sends as the text `[object Object]`. Serialize it as above.

## A new tracking user on every request

**Likely cause.** `GET https://core.helloretail.com/serve/trackingUser` creates a **new**
`trackingUserId` on every call. Calling it per request makes every request look like a new
visitor, so personalization never builds up.

**Fix.**

1. In the browser, ask the SDK instead — it reuses the id stored in the first-party cookie:

    ```javascript
    hrq = window.hrq || [];
    hrq.push(["getTrackingUserId", function (trackingUserId) {
        document.cookie = "helloRetailTrackingUserId=" + trackingUserId + ";path=/";
    }]);
    ```

2. Without the script, call `/serve/trackingUser` once per visitor and store the returned `id` in
   the session or a cookie. Never share one id between visitors.
3. Managed solutions and SDK methods handle the id themselves; only REST integrations pass it.

**Source:** [Tracking user](https://developer.helloretail.com/sdk/tracking/tracking_user/) · [Server side tracking](https://developer.helloretail.com/guides/tracking/server_side_tracking/)

> **May be outdated:** the developer docs call `/serve/trackingUser` with a `GET` and no body; the
> [Pages cheat sheet](../../cheat-sheets/pages/general.md) calls it with a `POST` carrying
> `websiteUuid`. Confirm which one the endpoint accepts before quoting it.

## Identifying logged-in customers across devices

**Likely cause.** The tracking cookie identifies one browser on one device, and some browsers
delete tracking cookies quickly. Without a customer id, Hello Retail cannot join a customer's
activity across devices or cleared cookies.

**Fix.**

1. When the shop knows the customer (logged in), call:

    ```javascript
    hrq = window.hrq || [];
    hrq.push(["setCustomerId", "{customer id}"]);
    ```

2. Or include `customerId` in `trackConversion`.
3. For orders from before tracking started, put the customer id in the order feed.
4. The id must identify exactly one person — the shop owns it, and Hello Retail trusts that it is
   unique.
5. Association is asynchronous; expect a short delay before personalization uses the combined
   history.

**Source:** [Identifying customers](https://developer.helloretail.com/guides/tracking/identifying_customers/) · [Set a custom id on your customer](https://developer.helloretail.com/sdk/tracking/set_custom_id_on_tracking_user/)

> **May be outdated:** the introduction's terminology table says carts, conversions, page views and
> clicks are associated with the `customerId`, and that Hello Retail assigns one to every visitor;
> the tracking pages say tracked activity belongs to the `trackingUserId` until the shop sets a
> customer id. Follow the tracking pages.

## Activity ends up on the wrong customer

**Likely cause.** `setCustomerId` or a conversion arrived with a different customer id than the
one already associated with the tracking user, or the shop's ids are not unique per person.

**Fix.**

1. A new customer id **moves** the current tracking user's activity to the new id. Other tracking
   users stay with the old id.
2. Make sure the id the shop sends identifies one person only — Hello Retail trusts it to be
   unique.

**Source:** [Identifying customers — Changing the association](https://developer.helloretail.com/guides/tracking/identifying_customers/)

## Registering an e-mail on the visitor

**Likely cause.** Personalization keyed on an e-mail address (Newsletter Content, customer bias by
e-mail) only works when that address has been associated with tracking users.

**Fix.**

1. Associate the address with `setCustomerEmail`, or send `email` with `trackConversion`:

    ```javascript
    hrq = window.hrq || [];
    hrq.push(["setCustomerEmail", "{customer e-mail}"]);
    ```

2. Newsletter Content cannot read the browser cookie, so it passes the recipient's address in the
   link and image URL and uses the most recent tracking user for that address. If the shop sets
   customer ids, swap the `userEmail` parameter for `customerId` in the Newsletter Content snippet.

**Source:** [Register email on tracking user](https://developer.helloretail.com/sdk/tracking/reg_email_on_tracking_user/) · [Identifying customers — Newsletter Content](https://developer.helloretail.com/guides/tracking/identifying_customers/)

## Customer bias returns nothing or is refused

**Likely cause.** The lookup key is not linked to any activity, the field name does not exist in
the catalog, or an e-mail or customer-id lookup was sent without the API key.

**Fix.**

1. SDK: `hrq.push(["getCustomerBias", { fields: ["brand"], numberOfValues: 5 }, callback])` —
   `numberOfValues` defaults to 5, maximum 10. Check `response.success` before reading
   `response.bias`.
2. REST: `POST https://core.helloretail.com/serve/customer/bias` with `websiteUuid`, `fields`, and
   one of `trackingUserId` (generated by Hello Retail), `email` or `customerId`.
3. Lookups by `email` or `customerId` need the API key as `Authorization: Bearer {api key}`, so
   they belong on the server, not in the browser.
4. The e-mail or customer id must already be linked to tracking users — through conversion
   tracking, `setCustomerEmail` or `setCustomerId`.
5. Field names are product fields: hierarchies per level (`hierarchyLevel1`, `hierarchyLevel2`, …;
   values end in `$`, for example `Men$Shoes$`), custom fields as `extraData.<name>`.

**Check with.** `dataFields_getProductFields` lists the field names that exist on the website.

**Source:** [Customer bias using the SDK](https://developer.helloretail.com/sdk/customer_bias/) · [Customer bias using the REST API](https://developer.helloretail.com/api/customer_bias/) · [Introduction to customer bias](https://developer.helloretail.com/guides/customer_bias/)

## Using customer bias outside Hello Retail solutions

**Likely cause.** Not a fault — customers ask how to personalize elements Hello Retail does not
render, such as a front-page hero banner or a discount in a mail.

**Fix.**

1. Front-page banner: request `hierarchyLevel1` and `hierarchyLevel2` with `getCustomerBias`, show
   the banner for the top level-2 value if one exists, fall back to the top level-1 value, and
   fall back again to a default banner when `success` is false.
2. Mail decisions (for example a discount for shoppers drawn to high-margin products): call the
   REST endpoint server-side by `email` with the API key, reading an `extraData` field from the
   feed. This needs view and conversion tracking in place.
3. Each returned value carries a `weight`: a percentage relative to the other returned values for
   that field.

**Source:** [Introduction to customer bias](https://developer.helloretail.com/guides/customer_bias/)
