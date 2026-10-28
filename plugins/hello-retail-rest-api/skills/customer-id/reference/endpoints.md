# Connect customerId API Reference

Source of truth: Hello Retail's own example collection at
https://github.com/helloretail/api-usage-examples (the
`Insomnia_endpoint_examples_official_documentation.yaml` file's "Connect
customerId and trackingUserId" request in the Tracking folder, tagged
`#connect-customerId-and-trackingUserId` for skill consumption). The developer
documentation only covers the SDK equivalent, `setCustomerId`, at
https://developer.helloretail.com/sdk/tracking/set_custom_id_on_tracking_user/ -
re-check both when in doubt; this file is a working summary.

## Table of contents

- [Endpoint](#endpoint)
- [SDK vs custom integration](#sdk-vs-custom-integration)
- [Request body](#request-body)
- [Response body](#response-body)
- [Worked example](#worked-example)
- [Known documentation gaps](#known-documentation-gaps-as-of-this-writing)

## Endpoint

| | |
|---|---|
| URL | `https://core.helloretail.com/serve/collect/customerId` |
| Method | `POST` - verified 2026-10-16, a `GET` returns HTTP 500 `UNEXPECTED ERROR` |
| Content-Type | `application/json` (or `text/plain`, same body - verified 2026-10-16) |
| Authentication | None - no `apiKey` |
| CORS | Verified 2026-10-16: preflight allows any origin, `POST`, and the `Content-Type` header, so a browser can call it directly |

## SDK vs custom integration

When the Hello Retail SDK is on the page, `hrq.push(["setCustomerId",
"<customer id>"])` connects the SDK's own `trackingUserId` to the customer id,
and this endpoint isn't needed. With no SDK, or from the shop's backend, call
this endpoint with the `trackingUserId` the integration manages itself (see
[tracking-user-id](../../tracking-user-id/SKILL.md)).

## Request body

| Field | Type | Required | Notes |
|---|---|---|---|
| `websiteUuid` | string | **Yes - enforced.** | Verified 2026-10-16: missing returns HTTP 400 `{"success":false,"message":"websiteUuid is required"}`; unknown returns HTTP 400 `{"success":false,"message":"website with websiteUuid not found"}`. Checked before any other field. |
| `trackingUserId` | string | **Yes - enforced.** | The current browser's `hello_retail_id`. Verified 2026-10-16: missing returns HTTP 400 `{"success":false,"message":"Either email, customerId, or trackingUserId must be provided"}`; not a 24-character hex string returns HTTP 400 `{"success":false,"message":"Invalid trackingUserId: must be 24-character hex string"}`. Never send the opted-out sentinel `000000000000000000000000` here - skip the call for that shopper instead. |
| `id` | string | **Yes - but not validated cleanly.** | The shop's own internal customer id. Verified 2026-10-16: missing, `""`, or sent under the name `customerId` instead returns HTTP 500 with the generic `UNEXPECTED ERROR` body (`{"success": false, "code": "UNEXPECTED ERROR", "message": "..."}`, a message that only says to contact Hello Retail support) rather than a 400. A JSON number is also accepted, but send a string - it must be the same value the shop sends as `customerId` on every other endpoint, where it is a string. |

## Response body

- Success: HTTP 200 `{"success": true, "message": "Customer id set"}`.
  Verified 2026-10-16, returned identically for a first connection, a repeat
  of the same pair, and a `trackingUserId` already connected to a different
  `id` - in that last case the previous connection is dropped and the new one
  replaces it.
- Error responses: as listed per field above. Validation 400s carry
  `{"success": false, "message": "..."}`; every HTTP 500, the missing-`id`
  one included, carries the generic body that adds
  `"code": "UNEXPECTED ERROR"`.

## Worked example

From Hello Retail's example collection (the `websiteUuid` is Hello Retail's own
API test store, see the plugin README):

```json
POST https://core.helloretail.com/serve/collect/customerId
Content-Type: application/json

{
  "trackingUserId": "6acf333085e256e7ca4fab7f",
  "websiteUuid": "d364dcdc-e618-45bd-b395-8653579884fe",
  "id": "123456789"
}
```

## Known documentation gaps (as of this writing)

- The developer documentation doesn't describe this endpoint at all yet,
  including the fact that a `trackingUserId` holds one connection at a time:
  connecting it to a new `id` disconnects it from the previous one (confirmed
  by Hello Retail). The response is the same success either way, so the
  replacement isn't visible from the API.
