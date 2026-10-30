---
source: support-docs
upstream: https://support.helloretail.com/triggered-emails/adding-a-hello-retail-spf-record/
upstream-commit: 67f765316142
upstream-date: 2026-10-21
title: "Adding a Hello Retail SPF record"
description: "Configure SPF for Hello Retail Triggered Emails. Add include _spf.helloretail.com to your domain SPF TXT record to authorize sending and reduce spam."
tags: ""
---

# Adding a Hello Retail SPF record

Triggered emails from Hello Retail are sent on your behalf (from your address) by our servers.

Mail receivers use Sender Policy Framework (SPF) to verify that the sending server is authorized for the domain in the sending address. If the server is not authorized, messages are more likely to be flagged as spam. SPF is published as a DNS TXT record on your domain.

## Adding an SPF record

Adding an SPF record is straightforward but requires access to your domain’s DNS. A developer or webmaster typically does this.

To explicitly authorize Hello Retail as a trusted sender, your SPF record must include "include:\_spf.helloretail.com".

For example:

v=spf1 include:\_spf.helloretail.com ~all

## Only one SPF record

Each domain must have only one SPF TXT record. If you already have an SPF record, add "include:\_spf.helloretail.com" to that record instead of creating a new record. Multiple SPF records cause a PermError and some receivers may treat SPF as failed.

If your current record is:

v=spf1 a mx ip4:34.240.38.188 ~all

It should be changed to:

v=spf1 a mx ip4:34.240.38.188 include:\_spf.helloretail.com ~all

You may already include other senders. So if your current record is:

v=spf1 a mx ip4:34.240.38.188 include:\_spf.google.com ~all

It should be changed to:

v=spf1 a mx ip4:34.240.38.188 include:\_spf.google.com include:\_spf.helloretail.com ~all
