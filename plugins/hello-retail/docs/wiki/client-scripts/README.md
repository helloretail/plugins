---
source: index
---

# Client Scripts

> A library of one-off scripts and HTML built during onboardings, kept anonymised. Each entry captures **the platform**, **the use case**, **how it worked**, and the actual files — so we can find and reuse them later.

These are real, battle-tested solutions (not always perfect, but they worked). Use them as starting points when a new customer hits a similar problem.

## How it's organized

One folder per script: `client-scripts/<platform>-<usecase>/`

Each folder contains:

- `README.md` — the metadata (see template below)
- the script/HTML file(s) themselves, kept as-is

Naming: kebab-case, `<platform>-<short-usecase>`, e.g. `shopify-stock-sync`, `magento-banner-rotator`; platform-independent scripts use the use case alone (e.g. `generic-cookie-banner`). Never the customer's name or domain.

## Entry README template

Copy [`_TEMPLATE.md`](./_TEMPLATE.md) into each new folder and fill it in.

## Index

<!-- Add a row per script. Keep newest at top. -->

> Entries are anonymised before they land here: no customer name, domain, website UUID or design key, and no per-customer values left in the code. The naming convention above and [`_TEMPLATE.md`](./_TEMPLATE.md) define the shape of an entry.
>
> Where entries come from: the `customer-handoff` skill records every customer's unique cases in the hand-off document (the operator's gitignored `output/handoffs/` folder) and restates the reusable ones with placeholders in its *Learnings for the knowledge base* section. An entry here is that anonymised learning, lifted over with the script it describes.
