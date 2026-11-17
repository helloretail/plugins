# Copy of another domain — reading the source's context

Read this only when the build under QA is a copy of another domain (detected per `../SKILL.md`
Step 1.5 → *Copy of another domain*). The domain under QA has its own card; the source's context
comes on top of it, never instead of it, and the own card wins wherever the two disagree.

- **Find the source's context.** The source's own Onboarding card — search ClickUp for the
  source's domain and name and keep the card whose `list.name` is Onboarding — and any brief,
  hand-off document or report for it in the operator's local `QA/` folder. The source may belong
  to the same customer or to another one.
- **Ask the operator first, never adopt it silently.** `AskUserQuestion`, header *Copy source*,
  *"This build is a copy of `<source domain>` (<card title>, list <list name>) — read its
  onboarding to see why the design is as it is?"* — *Yes, read it (Recommended)* / *No, QA this
  domain on its own*.
- **On yes:** run the full two-lane fetch (`../SKILL.md` Step 1.5) on the source's card, read
  the local brief or hand-off, and distil it into the brief under **Copy source: `<source>`**:
  the design decisions this build inherited, what the source had published and what it still
  had open at the copy, and the reasons behind its choices. Then:
  - **Carry over** the source's customer decisions, declined requests, waived / shelved items,
    platform and theme notes and reference site — **only when the source is the same customer**.
    When the source belongs to **another customer**, those are *that customer's* and do not
    carry over; only the build facts do (what the design does and why, known template defects).
  - **Re-verify, never trust:** the source's known-open items and earlier findings are claims to
    check on this domain — a fix the source got may not exist here.
  - **Never inherit:** the QA surface and staging URL, logins, feed URLs and tokens, website
    UUID, placement divs, currency, locale and translated strings. Resolve each from this
    domain's own card, or ask — the same value-by-value rule as the QA surface rule in
    `../SKILL.md` Step 1.5.
  - A behaviour this domain shares with the source is graded against **this domain's own
    card** — if the card is silent, the source's reason explains it, but it stays a WARN +
    operator question, never a PASS (by spec).
- **Feed Copy lineage** (`../SKILL.md` Step 1.5 → brief, *Copy lineage*): the source's context
  is what answers its check (a), whether the source's own fixes were published before the copy,
  instead of guessing from the card.

On **no**, record "copy source declined" in the brief and run the Copy lineage checks from the
card's wording alone.
