---
source: public-docs
verified: 2026-10-29
---

# Script and tracking setup — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [script not loading](../script-not-loading.md), [diagnostics](../diagnostics.md),
[SPA tracking](../../onboarding/spa-tracking.md), [data requirements](../../onboarding/data-requirements.md),
[review and testing](../../onboarding/review-and-testing.md), [solutions index](./solutions.md)

| Symptom | Go to |
| --- | --- |
| "Nothing from Hello Retail shows on the page" | [script-not-loading.md](../script-not-loading.md) — start there, not here |
| "Where do I get the script and where does it go?" | [Install the script](#where-do-i-get-the-script-and-where-does-it-go) |
| "The other-language domain shows the wrong shop's recommendations" | [Snippet with or without a UUID](#another-domain-shows-the-wrong-websites-content) |
| "We want to add it through Google Tag Manager" | [GTM](#we-want-to-install-the-script-through-google-tag-manager) |
| "We use Cloudflare and the script does not run" | [Rocket Loader](#we-use-cloudflare-and-the-script-does-not-run) |
| "We built our own integration — what must the shop send?" | [Tracking requirements](#we-built-our-own-integration--what-tracking-does-the-shop-have-to-implement) |
| "Search and recommendations have nowhere to render on our custom shop" | [Markup](#search-or-recommendations-have-nowhere-to-render-on-a-custom-shop) |
| "Page views stop after the first page on our React / Vue shop" | [SPA](#page-views-stop-after-the-first-page-on-a-single-page-application) |
| "Our own staff traffic skews the statistics" | [Filter IPs](#our-own-staff-or-agency-traffic-skews-the-statistics) |
| "We see no Hello Retail events in Google Analytics" | [GA events](#no-hello-retail-events-show-up-in-google-analytics) |
| "We may not track until the shopper consents" | [Consent](#we-may-not-track-shoppers-until-they-accept-cookies) |
| "A shopper wants to opt out of tracking" | [Opt-out](#a-shopper-wants-to-opt-out-of-tracking) |
| "Recommendations are not personalised for some visitors" | [Not personalised](#recommendations-and-search-are-not-personalised-for-some-visitors) |
| "Which cookies do we list in our privacy policy?" | [Cookie list](#which-cookies-do-we-list-in-our-privacy-policy) |
| "Does the script slow down our shop?" | [Performance](#does-the-hello-retail-script-slow-down-the-shop) |
| "It looks broken in an old browser" | [Browser support](#it-looks-broken-in-a-particular-browser) |
| "How do we test the mobile view?" | [Mobile testing](#how-do-we-test-the-mobile-view-without-a-phone) |
| "Our developer works on localhost and sees nothing" | [Localhost](#our-developer-works-on-localhost-and-sees-nothing) |

## Where do I get the script and where does it go

**Likely cause.** The shop is on a platform without a Hello Retail extension, or the snippet was
placed in a template that does not render on every page.

**Fix.**

1. If the platform has a Hello Retail extension or app (Magento, Shopify, WooCommerce, PrestaShop,
   DanDomain, Lightspeed, Centra and others are listed), install that instead — it places the
   snippet itself.
2. Otherwise copy the snippet from the dashboard under **Settings → Tracking Script**, or use the
   generic one:

   ```html
   <script async src="https://helloretailcdn.com/helloretail.js"></script>
   <script>
       window.hrq = window.hrq || [];
       hrq.push(['init', {}]);
   </script>
   ```

3. Paste it inside `<head>`, keep `async`, in a global template so it is on **all** pages — not
   only the front page or checkout.

**Check with.** DevTools → Network, filter `helloretail`; the full walk is in
[script-not-loading.md](../script-not-loading.md).

**Source:** [Installing the JavaScript](https://support.helloretail.com/general-setup/installing-the-javascript/) · [Setup for Tracking Requirements](https://support.helloretail.com/general-setup/setup-for-tracking-requirements/)

## Another domain shows the wrong website's content

**Likely cause.** The snippet copied from the dashboard carries a website UUID, which forces that
one website's configuration wherever the snippet is placed. Put on a second domain or language,
it keeps serving the first website.

**Fix.**

1. For several domains or languages edited from one shared template, use the snippet **without**
   a UUID (`hrq.push(['init', {}])`): the script then picks the website by the domain it runs on,
   provided a website exists in Hello Retail for that domain.
2. Keep the UUID form only when you deliberately want to force one configuration.
3. On a single-page app that switches region, pass the new `websiteUuid` with `reload` — see
   [SPA tracking](../../onboarding/spa-tracking.md).

**Check with.** `website_getInfo` for the domain each website is set up with.

**Source:** [Installing the JavaScript](https://support.helloretail.com/general-setup/installing-the-javascript/)

## We want to install the script through Google Tag Manager

**Likely cause.** No access to the theme, or the shop manages third-party scripts in GTM.

**Fix.**

1. In the GTM container: **Tags → New → Tag Type: Custom HTML**, paste the snippet.
2. **Triggering → All Pages**.
3. Save, then **Submit** and **Publish** the container.
4. Use GTM **Preview** to confirm the tag fires on every page.

**Check with.** GTM Preview, then the Network check in [script-not-loading.md](../script-not-loading.md).
If GTM also fires virtual page views on route changes, read the stacked-overlay warning in
[SPA tracking](../../onboarding/spa-tracking.md).

**Source:** [How to Set Up Google Tag Manager](https://support.helloretail.com/general-setup/how-to-set-up-google-tag-manager/)

## We use Cloudflare and the script does not run

**Likely cause.** Cloudflare Rocket Loader in **Automatic** mode changes how scripts load and can
block the Hello Retail partner script.

**Fix.**

1. Switch Rocket Loader to **Manual** mode.
2. In Manual mode, Rocket Loader only runs scripts tagged `data-cfasync="true"`. Do **not** add that
   attribute to the Hello Retail script tag, so it loads normally.

**Check with.** View source: the `helloretail.js` tag must not be rewritten by Rocket Loader, and
the Network request must return 200.

**Source:** [Using CloudFlare / Rocket Loader and Hello Retail](https://support.helloretail.com/general-setup/using-cloudflare-rocket-loader-and-hello-retail/)

## We built our own integration — what tracking does the shop have to implement

**Likely cause.** On a platform without an extension the script handles view and click tracking on
its own, but **cart and conversion tracking are never automatic**.

**Fix.**

1. Script on every page, in `<head>` (above).
2. Cart: send the cart on every add, remove and quantity change — or simply on every page load. A
   variant in the cart must be sent as that variant.
3. Conversion: register the order on the receipt / confirmation page. The JavaScript SDK is
   recommended over the HTML span; the span is covered in
   [feeds and data](./feeds-and-data.md#conversions-are-missing-or-orders-are-not-attributed).
4. Before any SDK call, wait for the script to be ready:

   ```javascript
   hrq = window.hrq || [];
   hrq.push(function() {
       // Hello Retail is ready — SDK calls go here
   });
   ```

5. For abandoned-cart emails, give the cart a restore URL (`cart-url` on the span, `url` in the SDK
   data) that can rebuild the cart from product / quantity pairs.

**Check with.** `apiLog_setLogging` then `apiLog_getEntries` filtered to the `collect_*` endpoints
(mind the privacy rule in [diagnostics](../diagnostics.md)); `orders_list` for conversions arriving.

**Source:** [Setup for Tracking Requirements](https://support.helloretail.com/general-setup/setup-for-tracking-requirements/) · [Tracking setup](https://developer.helloretail.com/guides/setup/tracking_setup/) · [Event binding](https://developer.helloretail.com/sdk/tracking/event_binding/)

> **May be outdated:** [Getting Started](https://support.helloretail.com/general-setup/getting-started/)
> says the script captures add to cart and purchases on its own. Both tracking-requirement articles
> say those two need explicit implementation — follow them.

## Search or recommendations have nowhere to render on a custom shop

**Likely cause.** Managed (script-rendered) Search and recommendations need anchors in the shop's
markup, and a custom platform does not have them.

**Fix.**

1. Recommendations: add the container `<div>` elements with the IDs Hello Retail gives for each box.
2. Search: give the existing search input `id="hr-search-input"` — change the existing input rather
   than replacing it, so the old search keeps working until Hello Retail takes over.
3. Full-page search only: create an empty page with `<div id="hr-search-results"></div>`. Do not
   reuse the shop's own search page — its results flash before Hello Retail's load.
4. An SPA or API-based frontend that renders results itself skips this step.

**Check with.** `search_getDesign` and `recoms_getPlacement` for the selectors the configuration
expects, then confirm they exist on the page.

**Source:** [Setup Markup Insertion Requirements](https://support.helloretail.com/general-setup/setup-markup-insertion-requirements/) · [Markup preparations](https://developer.helloretail.com/guides/setup/markup_preparations/) · [First Steps as a Hello Retail User](https://support.helloretail.com/general-setup/first-steps-as-a-hello-retail-user/)

> **May be outdated:** the support article calls the results page step 1 of Search; the developer
> article marks it optional and only for full-page search (not overlay or embedded). The developer
> article matches current Search setups.

## Page views stop after the first page on a single-page application

**Likely cause.** The script boots once; route changes are invisible to it until the frontend calls
`reload`.

**Fix.** Call `reload` after the new route's content is in the DOM. Mechanism, timing and the
multi-region variant are in [SPA tracking](../../onboarding/spa-tracking.md).

**Source:** [Page tracking for SPA](https://developer.helloretail.com/guides/spa/page_tracking_for_spa/) · [Setup for Tracking Requirements](https://support.helloretail.com/general-setup/setup-for-tracking-requirements/)

> **May be outdated:** the support article and the developer tracking-setup page write
> `hrq.push("reload")`; the SPA page writes the array form `hrq.push(["reload"])`, which is what
> the wiki uses.

## Our own staff or agency traffic skews the statistics

**Likely cause.** Visits from the shop's own office, partners or agency are tracked like shoppers.

**Fix.**

1. Dashboard: **Configuration → Settings → Website settings**, scroll to **Filter IPs**.
2. Enter each IP and click **+**. Wildcards cover a range, for example `192.168.*.*`.
3. Click **Save**. Visits from those addresses are no longer tracked.

**Source:** [Filter IPs — Exclude Your Own Network From Tracking Statistics](https://support.helloretail.com/general-setup/filter-ips-exclude-your-own-network-from-tracking-statistics/)

## No Hello Retail events show up in Google Analytics

**Likely cause.** The script looks for an existing Google Analytics tracker when it starts — the
globals `__gaTracker` or `ga`, falling back to the legacy `_gaq`. If Google Analytics loads after
Hello Retail, or the shop uses a tracker the script does not recognise, nothing is sent.

**Fix.**

1. Load the Hello Retail script **after** the Google Analytics script.
2. Check that events are enabled and that category, action and label are set for the
   recommendations and Search configurations.
3. Expect recommendation views as non-interaction events, and click events to arrive on the
   destination product page after navigation, not on the click itself.

**Check with.** `recoms_getGoogleAnalyticsSettings`.

**Source:** [Google Analytics Events](https://support.helloretail.com/general-setup/google-analytics-events/)

> **May be outdated:** the article describes Universal Analytics (`ga("send", "event", …)`,
> Behavior → Events → Overview), which Google has retired. A shop on GA4 with only `gtag` has no
> `ga` or `__gaTracker` object. The article also says the category defaults to "Hello Retail" while
> its own examples send "Addwish". Confirm current behaviour before promising GA events.

## We may not track shoppers until they accept cookies

**Likely cause.** The shop's market requires opt-in, so Hello Retail must start opted out and be
switched on when the consent banner says yes.

**Fix.**

1. To set no Hello Retail cookies at all before consent, opt out in the init call itself:

   ```html
   <script>
       window.hrq = window.hrq || [];
       hrq.push(['init', { trackingOptOut: true }]);
   </script>
   ```

2. Or decide on load from the consent tool's state, just before `</head>`:

   ```html
   <script>
       hrq = window.hrq || [];
       hrq.push(function(sdk) {
           sdk.setTrackingOptOut(CONSENT_BOOLEAN ? false : true);
       });
   </script>
   ```

3. When the shopper accepts, call `hrq.push(["setTrackingOptOut", false]);`.
4. The support article has ready-made pairs (head check plus consent-event listener before
   `</body>`) for Cookiebot (`Cookiebot.consent.marketing`, `CookiebotOnLoad`), Cookie Information
   (`cookie_cat_marketing`, `CookieInformationConsentGiven`) and CookieYes (`advertisement`,
   `cookieyes_consent_update`). Use the consent category the shop actually configured.
5. If the shop instead blocks `helloretail.js` entirely until consent, nothing renders for shoppers
   who decline — see step 3 of [script-not-loading.md](../script-not-loading.md).

**Check with.** In the browser console, `hrq.push(["getTrackingOptOut", function(o){ console.log(o) }])`
before and after accepting the banner.

**Source:** [Opt-in and -out of Tracking](https://support.helloretail.com/other/opt-in-and-out-of-tracking/) · [Opt-in and -out of tracking (SDK)](https://developer.helloretail.com/sdk/tracking/opt_in_out_of_tracking/)

## A shopper wants to opt out of tracking

**Likely cause.** A privacy request, or the shop wants an opt-out link in its customer-service pages.

**Fix.**

1. Call `hrq.push(["setTrackingOptOut", true]);` — for example from a link on the shop's privacy or
   support page. `false` opts back in.
2. The SDK remembers the choice in a cookie, so it only needs setting once per browser. There is
   no REST call for this — it is JavaScript only.
3. Hello Retail keeps rendering; the content is simply not personalised for that browser.
4. For deleting data already collected, see
   [account and privacy](./account-and-privacy.md#a-shopper-asks-us-to-delete-or-hand-over-their-data).

**Source:** [Opt-in and -out of tracking (SDK)](https://developer.helloretail.com/sdk/tracking/opt_in_out_of_tracking/) · [GDPR - FAQ](https://support.helloretail.com/other/gdpr-faq/)

## Recommendations and search are not personalised for some visitors

**Likely cause.** Those visitors are opted out (declined consent, the `trackingOptOut` init flag,
or an earlier opt-out), browse privately, cleared their cookies, or use a browser whose tracking
prevention shortens cookie lifetime. Opted-out browsers still get Hello Retail content, just not
personalised.

**Fix.**

1. Reproduce with consent accepted, in a normal window.
2. Check the consent wiring above — a category mismatch (for example `marketing` vs `statistics`)
   keeps everyone opted out.
3. Explain to the customer that shoppers who decline, or whose browser expires the cookie early,
   are expected to see non-personalised content.

**Source:** [About Cookie Tracking](https://support.helloretail.com/other/about-cookie-tracking/) · [Opt-in and -out of Tracking](https://support.helloretail.com/other/opt-in-and-out-of-tracking/)

## Which cookies do we list in our privacy policy

**Likely cause.** The shop must disclose Hello Retail's cookies and storage under local rules.

**Fix.** List Hello Retail as the provider and these keys:

- General tracking and personalisation: `hello_retail_id` (cookie, 365 days), `awtracking_optout`
  (cookie, about 10 years), `aw_source` and `aw_target` (session cookies), `hr_initial_load`
  (optional session cookie), and the session-storage keys `aw-{domain}_cc`, `aw-{domain}-{*}_cc`,
  `aw-{domain}_cchash`, `aw-{domain}-{*}_cchash`, `aw_pb`.
- Only when Hello Retail Search is installed: the session-storage keys `search_search_redirects`,
  `search_search_redirects_hash` and the `search_input_template_*`, `search_initialization_code_*`,
  `search_result_styles_*`, `search_input_hash_*`, `search_initialization_hash_*`,
  `search_style_hash_*` families.

The article also gives suggested purpose wording. The tracking cookie is set for one year; the
shop remains responsible for its own consent implementation.

**Source:** [About the Hello Retail Cookies](https://support.helloretail.com/other/about-the-hello-retail-cookies/) · [About Cookie Tracking](https://support.helloretail.com/other/about-cookie-tracking/)

> **May be outdated:** [About Cookie Tracking](https://support.helloretail.com/other/about-cookie-tracking/)
> describes a third-party cookie set on Hello Retail's domain and links to the retired
> apidocs site; the developer [Tracking User](https://developer.helloretail.com/sdk/tracking/tracking_user/)
> page says the tracking id lives in a first-party cookie. Treat the cookie list above as the
> disclosure, and the first-party description as current.

## Does the Hello Retail script slow down the shop

**Likely cause.** A performance review or a merchant wary of third-party scripts.

**Fix.** Answer from the article: the script loads `async` and does not block rendering, sends its
requests asynchronously, is compressed and served from a CDN, and is cached by URL by the browser.
The trade-off that does exist is a short delay before managed content is inserted after page load;
a shop that needs content present at first paint uses the API instead — see
[implementation methods](../../onboarding/implementation-methods.md).

**Source:** [About the Hello Retail JavaScript](https://support.helloretail.com/general-setup/about-the-hello-retail-javascript/) · [Hello Retail API](https://support.helloretail.com/general-setup/hello-retail-api/)

## It looks broken in a particular browser

**Likely cause.** The browser is outside the support policy.

**Fix.** Recommendations and Search support current versions of Chrome, Firefox, Safari and Edge on
desktop, and current Firefox, Safari and Chrome on mobile — any browser above roughly one percent of
usage. Older browsers may work but are not guaranteed. The dashboard supports the latest two
versions of Chrome, Firefox, Safari and Edge on desktop.

**Check with.** Reproduce in a current version of the same browser before filing a defect.

**Source:** [Browser Support Policy](https://support.helloretail.com/other/browser-support-policy/)

## How do we test the mobile view without a phone

**Likely cause.** QA or the customer wants to see the mobile layout from a desktop.

**Fix.**

1. Chrome: right-click → **Inspect**, open the Device Toolbar, pick a device from the **Device**
   list, rotate for landscape.
2. Firefox: **Inspect Element** (`Ctrl+Shift+I` / `Cmd+Option+I`), Responsive Design Mode, pick a
   device preset.
3. Both are simulations — fonts, GPU rendering, sensors and the browser engine can differ from a
   real device. Confirm a device-specific bug on real hardware before reporting it.

**Source:** [Test on Mobile Devices with Chrome](https://support.helloretail.com/general-setup/test-on-mobile-devices-with-chrome/) · [Test on Mobile Devices with Firefox](https://support.helloretail.com/general-setup/test-on-mobile-devices-with-firefox/)

## Our developer works on localhost and sees nothing

**Likely cause.** The script selects the website by domain, and `localhost` is not a configured
website.

**Fix.** Force the target website by passing its UUID, so local development runs against the live
configuration and data — see the developer docs on forcing a specific website.

**Source:** [First Steps as a Hello Retail User](https://support.helloretail.com/general-setup/first-steps-as-a-hello-retail-user/) · [Forcing a specific website](https://developer.helloretail.com/guides/troubleshooting/#forcing-a-specific-website)
