---
source: public-docs
verified: 2026-10-29
---

# Account and privacy — problems and fixes

> Extracted from Hello Retail's support and developer docs. Parts of those docs describe an older
> dashboard or older behaviour, so treat each fix as a lead: confirm it against the website's live
> configuration (the hello-retail MCP) or a reproduction on the storefront before giving it to a
> customer. Where a `field` page in this wiki disagrees, the field page wins.

Related: [diagnostics](../diagnostics.md), [review and testing](../../onboarding/review-and-testing.md),
[tracking and script](./tracking-and-script.md), [solutions index](./solutions.md)

| Symptom | Go to |
| --- | --- |
| "How do I log in to the dashboard?" | [Dashboard login](#how-do-i-log-in-to-the-dashboard) |
| "How do I get an account?" | [Sign-up](#how-do-we-get-a-hello-retail-account) |
| "Give our agency / a colleague access" | [Add a user](#give-a-colleague-or-an-agency-access-to-the-dashboard) |
| "Remove someone's access" / "transfer ownership" | [Revoke and transfer](#remove-a-users-access-or-transfer-ownership-of-the-account) |
| "The Hello Retail panel on our shop no longer logs me in" | [Panel login](#the-hello-retail-panel-on-the-storefront-no-longer-logs-me-in) |
| "Where is the website UUID / API key?" | [UUID and API key](#where-do-we-find-the-website-uuid-and-the-api-key) |
| "Who changed this setting?" | [Activities Log](#who-changed-this-setting) |
| "The dashboard misbehaves in my browser" | [Dashboard browser](#the-dashboard-misbehaves-in-my-browser) |
| "Where is the DPA?" / "are you GDPR compliant?" | [DPA](#we-need-the-data-processing-agreement) |
| "Which sub-processors do you use?" | [Sub-processors](#which-sub-processors-does-hello-retail-use) |
| "Where is our data stored?" | [Data location](#where-is-our-data-stored) |
| "What do you collect about our visitors?" | [Data collected](#what-does-hello-retail-collect-about-our-visitors) |
| "How long do you keep the data?" | [Retention](#how-long-does-hello-retail-keep-the-data) |
| "A shopper wants their data deleted or a copy of it" | [Deletion and access](#a-shopper-asks-us-to-delete-or-hand-over-their-data) |
| "Who is your DPO?" | [DPO](#who-is-hello-retails-data-protection-officer) |
| "Can triggered emails go to shoppers without opt-in?" | [Email permission](#may-triggered-emails-go-to-shoppers-who-never-opted-in) |
| "Shopper opt-out, cookie list, consent banner" | [Tracking and script](./tracking-and-script.md#we-may-not-track-shoppers-until-they-accept-cookies) |

## How do I log in to the dashboard

**Likely cause.** A new user, or one who lost the sign-in link.

**Fix.**

1. Go to [my.helloretail.com/company/signin.html](https://my.helloretail.com/company/signin.html).
2. Sign in with the email address and password of the Hello Retail user.
3. Someone with access to several companies picks the company from **Accessible companies**.

**Source:** [Signup & Login](https://support.helloretail.com/general-setup/signup-login/) · [How to Add Users to your Hello Retail Account](https://support.helloretail.com/general-setup/how-to-add-users-to-your-hello-retail-account/)

## How do we get a Hello Retail account

**Likely cause.** A new colleague, or a shop that has not signed up.

**Fix.**

1. A person joining an existing company account needs an **invitation** from its owner or an admin —
   see the next entry.
2. A new company: contact Hello Retail sales; pricing is quoted per setup.

**Source:** [Signup & Login](https://support.helloretail.com/general-setup/signup-login/) · [FAQs](https://support.helloretail.com/general-setup/faqs/)

> **May be outdated:** [First Steps as a Hello Retail User](https://support.helloretail.com/general-setup/first-steps-as-a-hello-retail-user/)
> tells new shops to create a business account themselves on a sign-up page; Signup & Login says
> sign-up requires an invitation. Do not send a customer to self sign-up without checking.

## Give a colleague or an agency access to the dashboard

**Likely cause.** The account owner wants to share access.

**Fix.**

1. Sign in and open the right company.
2. Click the account logo top right → **Users**.
3. Under **Users with access**, click **Invite new user**, enter one or more email addresses, **Send
   invite**.
4. The invitee gets an email with a link; while it is pending they are listed under **Users with
   pending invitations**. They sign in with an existing Hello Retail login or sign up, and then move to
   **Users with access**.
5. One login can reach several companies, as long as each company has invited it — agencies do not
   need separate accounts.
6. An invitation sent by mistake: **Delete invitation** in the pending list. The person is not
   notified.

**Source:** [How to Add Users to your Hello Retail Account](https://support.helloretail.com/general-setup/how-to-add-users-to-your-hello-retail-account/)

## Remove a user's access or transfer ownership of the account

**Likely cause.** A colleague or agency has left, or the account owner changes.

**Fix.**

1. Revoke: **Users** page, click the user's email under **Users with access**, **Revoke access**. It
   takes effect immediately and the user is not notified.
2. Transfer: on the **Users** page, **Transfer ownership**, then choose the new owner from the users
   who already have access.

**Source:** [How to Add Users to your Hello Retail Account](https://support.helloretail.com/general-setup/how-to-add-users-to-your-hello-retail-account/)

## The Hello Retail panel on the storefront no longer logs me in

**Likely cause.** Browsers are phasing out third-party cookies, so signing in at my.helloretail.com no
longer logs you in to the on-site panel automatically. The panel login is also scoped per domain.

**Fix.** With the Hello Retail script loaded on the page, start the login on the shop itself:

1. Add `?hello_retail_login` to the shop URL and reload — the panel button appears; click it to open
   the login window.
2. Or use **Go to Website** in the dashboard's top navigation, or the external link in the websites
   overview — both add that parameter for you.
3. Or run `hrq.push(["login"])` in the browser console, or save it as a bookmarklet:
   `javascript:(() => {hrq = window.hrq || []; hrq.push(["login"]); })();`
4. Log in separately on every domain you manage.

If none of these shows the panel, the script itself is not loading — go to
[script-not-loading.md](../script-not-loading.md). How QA uses the panel is in
[review and testing](../../onboarding/review-and-testing.md).

**Source:** [Hello Retail panel login & third-party cookie phase-out](https://support.helloretail.com/other/hello-retail-panel-login-third-party-cookie-phase-out/)

## Where do we find the website UUID and the API key

**Likely cause.** A developer needs them for the API or to queue feed runs.

**Fix.**

1. Website UUID: **Websites → Go to Settings**.
2. API key: in the top-level section of the dashboard; the first time, click **Create** to generate
   one.

**Check with.** `website_getInfo` for the UUID.

**Source:** [Hello Retail API](https://support.helloretail.com/general-setup/hello-retail-api/) · [Queue Product Feed Runs Via API](https://support.helloretail.com/general-setup/queue-product-feed-runs-via-api/)

## Who changed this setting

**Likely cause.** A configuration changed and nobody remembers doing it.

**Fix.**

1. Open the dashboard's **Activities Log**. It is always on and records changes per domain.
2. Pick a date range (inclusive), filter by resource group with the tabs, or click a resource-type
   pill on an entry to filter to that type; sort Newest or Oldest; **Load More** for older entries.
3. It covers feed setup (product, category, orders, permissions) and the configuration and
   algorithms of Search, Recommendations, Pages, Newsletters, Triggered Emails, Retail Media and
   Product Agents.

**Check with.** `auditLog_getEntries` — the same history through the MCP, with the filters described in
[diagnostics](../diagnostics.md).

**Source:** [Activities Log](https://support.helloretail.com/general-setup/activities-log/)

## The dashboard misbehaves in my browser

**Likely cause.** An unsupported or outdated browser.

**Fix.** Use the latest or second-latest version of Chrome, Firefox, Safari or Edge on desktop.

**Source:** [Browser Support Policy](https://support.helloretail.com/other/browser-support-policy/)

## We need the data processing agreement

**Likely cause.** A legal or procurement review.

**Fix.**

1. Hello Retail is the data processor and the shop is the data controller; the shop accepts Hello
   Retail's standard DPA and general terms on sign-up.
2. The DPA is published at [helloretail.com/dpa](https://helloretail.com/dpa).
3. Common questions are answered in the GDPR FAQ; anything else goes to Hello Retail support
   ([contact page](https://support.helloretail.com/contact/)).

**Source:** [GDPR - Data Processor Agreement](https://support.helloretail.com/other/gdpr-data-processor-agreement/) · [GDPR - FAQ](https://support.helloretail.com/other/gdpr-faq/) · [Notes about GDPR](https://support.helloretail.com/other/notes-about-gdpr/)

## Which sub-processors does Hello Retail use

**Likely cause.** The customer's DPA review needs the list.

**Fix.** Send the published list. It names a hosting provider (Amazon Web Services), an email
service, a monitoring service and a consultancy, each with its processing activity, whether
personal data is transferred to third countries, and whether it acts on standard terms.

**Source:** [List of Sub-Processors](https://support.helloretail.com/other/list-of-sub-processors/)

## Where is our data stored

**Likely cause.** A data-residency question.

**Fix.** The docs say data is stored in databases hosted by Amazon Web Services in Ireland, and that
data is stored and processed within the EU.

**Source:** [About Personal Data & Privacy](https://support.helloretail.com/other/about-personal-data-privacy/) · [Notes about GDPR](https://support.helloretail.com/other/notes-about-gdpr/)

> **May be outdated:** the sub-processor list marks every sub-processor, including two with US
> addresses, as transferring personal data to third countries — which does not sit with "all data is
> stored and processed within the EU". Do not give a residency guarantee without checking with Hello
> Retail first.

## What does Hello Retail collect about our visitors

**Likely cause.** The shop is writing its privacy policy or answering a shopper.

**Fix.** Per visitor, identified by a unique id in a cookie: pages viewed, products added to cart and
bought, interactions with Hello Retail components, the IP address and user agent of the session, and
an email address when one is provided (for example at checkout). The cookie names for the privacy
policy are in
[tracking and script](./tracking-and-script.md#which-cookies-do-we-list-in-our-privacy-policy).

**Source:** [About Personal Data & Privacy](https://support.helloretail.com/other/about-personal-data-privacy/) · [Notes about GDPR](https://support.helloretail.com/other/notes-about-gdpr/)

> **May be outdated:** About Personal Data & Privacy still describes a Hello Retail Wishlist account
> for consumers, a product the rest of the docs no longer mention.

## How long does Hello Retail keep the data

**Likely cause.** The customer notices the DPA states no retention period.

**Fix.** Explain that under GDPR the data controller — the shop — defines retention; Hello Retail
processes on the shop's instructions, so the DPA sets no fixed period. Retention questions go to Hello
Retail support.

**Source:** [GDPR - FAQ](https://support.helloretail.com/other/gdpr-faq/)

## A shopper asks us to delete or hand over their data

**Likely cause.** A GDPR erasure or access request reaches the shop.

**Fix.**

1. The shop contacts Hello Retail support
   ([contact page](https://support.helloretail.com/contact/)) with the shopper's identifiers — email
   address, customer ID or cookie ID — and says whether it is a deletion or an access request.
2. To stop future tracking for that browser, the shop calls
   `hrq.push(["setTrackingOptOut", true])` — see
   [tracking and script](./tracking-and-script.md#a-shopper-wants-to-opt-out-of-tracking).

**Source:** [GDPR - FAQ](https://support.helloretail.com/other/gdpr-faq/)

## Who is Hello Retail's data protection officer

**Likely cause.** A legal review asks for the DPO contact.

**Fix.** The DPO is reached through Hello Retail support, which forwards the enquiry.

**Source:** [GDPR - DPO](https://support.helloretail.com/other/gdpr-dpo/)

## May triggered emails go to shoppers who never opted in

**Likely cause.** The shop wants to widen triggered-email reach.

**Fix.**

1. In the EU, marketing email needs opt-in. The usual setup is to synchronise the shop's email
   permissions with Hello Retail through the APIs or an ESP connector; the shop is responsible for
   those permissions being lawful and current.
2. Hello Retail can be set to email every address seen on the site (conversion tracking, order data)
   only in markets where opt-in is not required. It is not lawful in the EU apart from narrow local
   exceptions, such as Denmark's rule for accessories to a recent purchase with an opt-out at
   checkout. The docs recommend keeping it disabled unless a legal basis is verified.
3. Hello Retail cannot tell consent status or market from an email address; compliance is the
   shop's.

**Source:** [About Email Permission & Consent](https://support.helloretail.com/other/about-email-permission-consent/) · [Notes about GDPR](https://support.helloretail.com/other/notes-about-gdpr/) · [Recommendations on Data Tracking & Permission Handling](https://support.helloretail.com/other/recommendations-on-data-tracking-permission-handling/)

> **May be outdated:** Notes about GDPR also mentions extending triggered-email reach through "Hello
> Retail Wish List permissions" sent with Hello Retail branding — the same Wishlist product the other
> articles no longer mention. Confirm it still exists before offering it.
