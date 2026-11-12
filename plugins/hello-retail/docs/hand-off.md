# Handing a build off

**The rule: a build ends with a hand-off the operator can act on and a record that outlives the
chat. Chat is not a record.**

Shared by the developer skills. The stage name and what each product adds (dashboard fields to
fill, placement divs, capture-back) are in the skill's own hand-off step.

## In the hand-off message

1. **MISSING DATA again**, when the list is not empty — yours and everything the tile skill
   flagged.
2. **What is a draft and who publishes it.** Name the design and every box, page or config that
   is in REVIEW / DRAFT, and say that the operator publishes it in the My Hello Retail
   dashboard. Neither the MCP nor you can.
3. **A provenance line for every workaround** you wrote or ported: its root cause and the
   condition for removing it ("price-sync JS works around the feed pinning one market — delete
   once the feed is corrected"). Operators may ask for code comments to be stripped, so this is
   where that knowledge survives.
4. **A short build retro**, two to four bullets, in chat only: how many diff / approval rounds
   it took, what the operator corrected (categories, not quotes), and whether anything landed in
   `${CLAUDE_PLUGIN_ROOT}/docs/wiki/cheat-sheets/` as a result.

## The record — `customer-handoff`

Run `customer-handoff` (`../skills/customer-handoff/SKILL.md`) in **record mode**, with the stage
the skill names. It is mandatory: do not ask whether to, and do not skip it. The provenance
lines, MISSING DATA, the keys and every customer-specific decision go into the customer's living
hand-off document under `output/handoffs/` (local for now).

## Then

- **Offer self-QA on the draft straight away** — do not wait for publish. The skill's own step
  names the QA skill and the two passes (rendered and code). Fixes go through the same diff →
  approval → draft loop (`design-writes.md` in this folder); at most **two** fix rounds, then
  report the rest as operator items.
- **Close the browser last** — `browser-login.md` in this folder → *Close the browser when the
  work is done*. Also when the build stopped midway.
