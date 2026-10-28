---
name: customer-id
description: Use when a custom frontend or backend knows who the shopper is in the shop's own system (they logged in, created an account, or checked out with an account) and wants Hello Retail to treat that shopper's devices and browsers as one customer - covers the Connect customerId REST API (core.helloretail.com/serve/collect/customerId), which links a trackingUserId to the shop's internal customer id so personalization is shared across every connected trackingUserId. Trigger on "connect the customer id", "link trackingUserId to our customer id", "setCustomerId without the SDK", "cross-device personalization", "same customer on mobile and desktop", "identify logged-in users to Hello Retail", or a question about what customerId means on the tracking endpoints. This is the REST counterpart of the SDK's setCustomerId; when the Hello Retail SDK is on the page, use setCustomerId instead.
---

# Hello Retail Connect customerId API

## Overview

A `trackingUserId` identifies one browser on one device (see
[tracking-user-id](../tracking-user-id/SKILL.md)). The same person shopping on
their phone and on their laptop therefore looks like two unrelated shoppers to
Hello Retail, and personalization on each device only knows about what happened
on that device.

When the shop itself knows who the shopper is - they logged in, created an
account, or checked out with an account - it can tell Hello Retail which of
its own internal customer ids that `trackingUserId` belongs to. Hello Retail
then connects every `trackingUserId` that has been linked to the same customer
id: behaviour tracked on device 1 is also taken into account when the shopper
uses Hello Retail solutions on device 2, and the other way round.

```
POST https://core.helloretail.com/serve/collect/customerId
Content-Type: application/json
```

No `apiKey` - unlike sending `customerId` on the tracking endpoints, this call
needs nothing beyond the three body fields below. A successful call returns
HTTP 200 `{"success":true,"message":"Customer id set"}` (verified
2026-10-16).

Full field-by-field reference: [reference/endpoints.md](reference/endpoints.md).

Hello Retail's developer documentation currently only describes the SDK way of
doing this (`hrq.push(["setCustomerId", "<customer id>"])`, at
https://developer.helloretail.com/sdk/tracking/set_custom_id_on_tracking_user/).
This REST endpoint is documented in Hello Retail's own example collection at
https://github.com/helloretail/api-usage-examples
(`Insomnia_endpoint_examples_official_documentation.yaml`, Tracking folder,
"Connect customerId and trackingUserId", tagged
`#connect-customerId-and-trackingUserId`).

## Before writing any code

0. **Check whether the Hello Retail SDK is on the page.** If it is, call the
   SDK's `setCustomerId` instead of this endpoint - the SDK already holds the
   `trackingUserId` it minted, and this is the same relationship as
   [tracking-user-id](../tracking-user-id/SKILL.md)'s step 0. This endpoint is
   for integrations with no SDK, and for connecting from the shop's backend.
1. **You need a real `trackingUserId` for the current browser** - the
   `hello_retail_id` cookie value, minted and cached as
   [tracking-user-id](../tracking-user-id/SKILL.md) describes. Wait on that
   skill's readiness Promise before calling this endpoint, or the call races
   the mint and goes out with no `trackingUserId` at all.
2. **You need the shop's own stable customer id** - the primary key of the
   customer record in the shop's system (e.g. the platform's customer number).
   Ask the customer which field that is rather than guessing. It must be the
   same value everywhere the shop later sends `customerId` to Hello Retail
   (Click/View/Cart/Conversion tracking, Recommendations, Customer Bias), and
   it must never be reassigned to a different person.
3. **You need the `websiteUuid`** (see `website_getInfo` if you don't have it).
4. **Decide when the call fires.** The moment the shop learns who the shopper
   is: a successful login, account creation, or a checkout completed while
   logged in. Not on every page view - see the gotcha below.
5. **Check tracking consent first.** Connecting a browser to a named customer
   record is a tracking action, at least as much as minting the
   `trackingUserId` was. A shopper who has declined tracking has no real
   `trackingUserId` to connect (they send the `000000000000000000000000`
   sentinel instead - see
   [tracking-user-id](../tracking-user-id/SKILL.md#respecting-a-shoppers-tracking-opt-out)),
   so skip this call entirely for them. Never send the sentinel to this
   endpoint.

## Core request shape

```json
{
  "trackingUserId": "<hello_retail_id cookie value>",
  "websiteUuid": "<website-uuid>",
  "id": "<the shop's internal customer id>"
}
```

## Gotchas worth knowing before you build

- **The customer id field is `id`, not `customerId`.** Every other endpoint
  that accepts the shop's customer id calls the field `customerId`; this one,
  whose whole job is that id, calls it `id`. Copying `customerId` over from a
  tracking request body gives an HTTP 500, not a helpful validation message -
  see the next gotcha.
- **A missing or empty `id` returns HTTP 500, not 400.** Verified 2026-10-16:
  with a well-formed `trackingUserId` and `websiteUuid`, leaving `id` out,
  sending `"id": ""`, or sending it as `customerId` all return HTTP 500
  with the generic body `{"success": false, "code": "UNEXPECTED ERROR",
  "message": "..."}`, where the message only says to contact Hello Retail
  support.
  It looks like an outage and isn't one. Validate on your side that `id` is a
  non-empty string before calling, and when you see this 500, check the body
  before contacting support.
- **`trackingUserId` is format-validated** exactly like on the tracking
  endpoints: verified 2026-10-16, a value that isn't a 24-character hex string
  returns HTTP 400 `"Invalid trackingUserId: must be 24-character hex string"`.
  Never hand-construct one - see
  [tracking-user-id](../tracking-user-id/SKILL.md#format).
- **Send `id` as a string.** Verified 2026-10-16, a JSON number
  (`"id": 123456789`) is accepted too, but every other endpoint's `customerId`
  is a string, and `123456789` and `"123456789"` are not guaranteed to be the
  same key. Stringify it once, in one place, and use that value everywhere.
- **Connect once per browser per customer, not on every request.** The link
  is stored on Hello Retail's side; it doesn't need to be re-sent with every
  page view. Repeating the call is harmless - verified 2026-10-16, re-sending
  the same pair returns the same `"Customer id set"` success - but it's wasted
  traffic. Fire it on the login/account event, and if the frontend can't
  tell whether it already did (e.g. a session restored from a long-lived
  login cookie), remember the `trackingUserId` + customer id pair you last
  connected and only call again when either changes. A new `trackingUserId`
  (the shopper cleared cookies, or this is a new device) is exactly the case
  that does need a new call.
- **After connecting, keep sending `trackingUserId` everywhere you already
  did.** Connecting doesn't replace the `trackingUserId` on Search, Pages,
  Recommendations or the tracking endpoints; it makes Hello Retail treat that
  `trackingUserId`'s activity as the customer's. Sending `customerId` on those
  endpoints instead is a separate option with its own rule: it requires an
  `apiKey` query-string parameter, and on Recommendations it is mutually
  exclusive with `trackingUserId` - see
  [click-tracking-api](../click-tracking-api/SKILL.md) and
  [recommendations-api](../recommendations-api/SKILL.md).
- **Browser or backend - both work.** Verified 2026-10-16, the endpoint
  answers CORS preflights for any origin, so a frontend can call it directly
  after login. A server-side login handler can send it just as well, as long
  as it has the shopper's current `hello_retail_id` (read from the request's
  cookies); that keeps the customer id out of browser JavaScript entirely,
  which many shops prefer.
- **A `trackingUserId` belongs to one customer id at a time; the latest
  connection wins.** Connecting a `trackingUserId` that is already connected
  to a different customer id disconnects it from the previous one and
  connects it to the new one, with the same `"Customer id set"` success
  response. That makes shared devices behave sensibly: when a second person
  logs in on a family computer, that browser's activity moves to their
  customer from then on. It also means a wrong or unstable `id` (a session
  id, a value that changes between logins) silently pulls the browser away
  from the real customer - another reason step 2 above insists on the stable
  primary key.
- **There is no "disconnect" call, and logout needs none.** Logging out
  doesn't need to call Hello Retail; the browser stays connected to the last
  customer until someone else logs in on it, which reconnects it as above.

## When something doesn't work

- HTTP 500 `UNEXPECTED ERROR` on every call → `id` is missing or empty, or
  was sent as `customerId` - see the gotchas above. Log the request body you
  actually sent before assuming an outage.
- HTTP 400 `"websiteUuid is required"` / `"website with websiteUuid not found"`
  → the `websiteUuid` is missing or wrong for this website.
- HTTP 400 `"Either email, customerId, or trackingUserId must be provided"` →
  `trackingUserId` is missing from the body, usually because the call raced
  the mint - await the readiness Promise from
  [tracking-user-id](../tracking-user-id/SKILL.md).
- The call succeeds but personalization on the second device still looks like
  a stranger's → check that both devices were connected with exactly the same
  `id` value (no whitespace, same type, not an email on one and a number on
  the other), and that the second device's call actually fired after its own
  login.
- A customer's cross-device personalization stops including one of their
  devices → check whether someone else logged in on that browser since, or
  whether the shop sent a different `id` for them on a later login; either
  reconnects that `trackingUserId` and disconnects it from them - see "the
  latest connection wins" above.
- Requests seem to vanish, time out, or return unexpected status codes → use
  `apiLog_getEntries` / `apiLog_getStats` filtered to
  `apiEndpoints: ["collect_customerid"]` - see
  [troubleshooting-with-hello-retail-mcp](../troubleshooting-with-hello-retail-mcp/SKILL.md)
  for the gotchas (logging must be turned on first, PII considerations, etc).
