---
name: plugin-feedback
description: >
  Send the Hello Retail plugin team a short gap report when the plugin let the operator down —
  a step with no hello-retail MCP tool, a tool that errors or cannot do what the step needs, a task
  no skill covers, or a skill instruction that turned out wrong. Writes the report from the
  conversation (who reported it, which customer, what they were trying to do, what went wrong,
  what to add to the MCP or skill), asks once, and sends it with one API call in the background. Use when the
  plugin's hook or a skill says to offer feedback, or when someone says "send feedback",
  "report this to the plugin team", "tell the team the MCP can't do this", "log this gap",
  "this skill is missing something". Trigger even with no details — the conversation holds them.
  Does NOT answer support tickets (support-debugging) or fix the gap itself.
---

# Plugin feedback

Turns a gap you hit during Hello Retail work into one report the plugin team can act on, and
sends it with one API call — no browser, and the operator never leaves the conversation.

The operator only answers one question. Everything else comes from the conversation. Never name
the tool behind the form to the operator — call it "the plugin team" or "the feedback form".

## When to offer it

Offer it **once per session, at the end of the task** (not mid-step), when any of these happened:

| Gap | Example |
|---|---|
| No MCP tool for a step | No tool writes a recom box's algorithm, so the operator had to do it in the dashboard |
| A tool failed or cannot do what the step needs | `search_updateDesign` returned a 500; a getter does not return the field the step reads |
| No skill covers the task | Operator asked for a Retail Media build and no developer skill exists |
| A skill was wrong | The skill named a field or selector that does not exist; a step had to be skipped |

Do **not** offer it for: the operator's own typo or wrong UUID, the MCP needing `/mcp`
authorization, a browser that is not logged in (that is `browser-login`), or a customer-site
problem that is not the plugin's.

If the operator asked for feedback themselves, skip the question in Step 2 — they already said yes.

## Step 1 — Collect the facts from the conversation

Fill every field below without asking. Write `unknown` rather than guessing.

| Field | Where it comes from |
|---|---|
| Reporter | The user's name or email in the session context. Otherwise run `git config user.name` and `git config user.email`. Ask (free text) only if both are empty. |
| Customer | Domain and website UUID used in this task. If only the UUID is known and the hello-retail MCP works, read the domain with `website_getInfo`. |
| Skill | The `hello-retail:*` skill that was running, or `none`. |
| Goal | One sentence: what the operator was trying to get done. |
| What went wrong | The tool name and the error, quoted, cut to 500 characters. Or the step that had no tool / no skill. |
| What was tried | Retries, workarounds, the dashboard step the operator did by hand. |
| Impact | `blocked` · `workaround used` · `slowed down`. |
| Suggested fix | What to add: an MCP tool (name, inputs, what it returns or writes), a skill step, or a wiki page. One to three lines. |
| Plugin version | `version` in `${CLAUDE_PLUGIN_ROOT}/.claude-plugin/plugin.json`. |

Never put in the report: passwords, tokens, cookies, API keys, shopper personal data (emails,
names, orders), or whole design files. A selector, a field name or 20 lines of code is fine.

Then write the report in exactly this shape:

```text
TOPIC: <skill name, or "no-skill"> - <the gap in at most 10 words>

Reporter: <name / email>
Customer: <domain> (<website UUID>)
Skill: <skill>
Plugin version: <version>
Date: <YYYY-MM-DD>
Impact: <blocked | workaround used | slowed down>
GOAL: <one or two sentences: what the operator was trying to do>
WHAT WENT WRONG: <tool + quoted error, or the missing tool / skill / wrong instruction>
WHAT WAS TRIED: <retries, workaround, manual dashboard step — or "nothing">
SUGGESTED FIX: <MCP tool to add or change: name, inputs, output — or the skill step / wiki page to add>
```

The `TOPIC` line is the form's title field and follows the form's own `Skill-Name - Title`
format, e.g. `recom-developer - no tool to set a box's algorithm`. Everything below it is the
body. The form drops blank lines, so each section starts on its own labelled line.

## Step 2 — Ask once

Skip this step if the operator asked for feedback themselves.

Ask with the `AskUserQuestion` tool, one question:

- question: "This hit a gap in the Hello Retail plugin: <the gap in a few words>. Send a short report to the plugin team?"
- header: `Feedback`
- options:
  1. `Send it (Recommended)` — "Sends the report in the background; you can keep working."
  2. `Show me first` — "Shows the report so you can change it before it is sent."
  3. `Don't send` — "Nothing is sent."

`Show me first` → print the report, apply the operator's edits, then send. `Don't send` → stop,
say nothing more about it this session. If the `AskUserQuestion` tool is missing, ask the same
question in one line of prose.

## Step 3 — Send it with one API call

Send the report with a script from this skill's `scripts/` folder — one HTTPS call, no browser.
Never open the feedback form in a browser yourself. Show its address only in Step 4's *Not sent*
message, when the operator has to add the report by hand.

The scripts sit next to this `SKILL.md`, in `scripts/`. In Claude Code the folder is
`${CLAUDE_PLUGIN_ROOT}/skills/plugin-feedback/scripts/`; anywhere else, use the folder this file
was loaded from. Pass the report exactly as written in Step 1, `TOPIC:` line first. Run it in the
background when the shell tool offers that (`run_in_background: true`), so the operator is not
kept waiting. Pick the first row that fits:

| Shell tool you have | Run |
|---|---|
| `Bash` (macOS, Linux, Windows with Git Bash, a sandbox) | `send-feedback.sh`, report on stdin — first block below |
| Only `PowerShell` (Windows without Git Bash) | `send-feedback.ps1`, report piped in — second block below |
| No shell tool at all (some Claude chat and Cowork sessions) | Skip to Step 4, *Not sent* |

```bash
bash "${CLAUDE_PLUGIN_ROOT}/skills/plugin-feedback/scripts/send-feedback.sh" <<'REPORT'
TOPIC: recom-developer - no tool to set a box's algorithm
Reporter: …
…
REPORT
```

```powershell
@'
TOPIC: recom-developer - no tool to set a box's algorithm
Reporter: …
…
'@ | powershell -NoProfile -ExecutionPolicy Bypass -File "$env:CLAUDE_PLUGIN_ROOT\skills\plugin-feedback\scripts\send-feedback.ps1"
```

Both print one line: `sent`, or `saved to <path>: <reason>`. When they cannot send, they save the
report under `output/feedback/` in the working directory (gitignored). Do not retry.

## Step 4 — Confirm

### Sent

The script printed `sent` → say "Sent to the plugin team — thanks." Nothing else.

### Not sent

Anything else is *Not sent*: no shell tool, the script printed `saved to …`, or the shell runs in a
sandbox that blocks outbound calls — Claude chat (claude.ai and the desktop app's Chat), Cowork,
or any other place the call could not go through. The operator then adds the report by hand, so
give them everything to paste, in exactly this shape:

````markdown
Couldn't send this automatically. Please add it to the [feedback form](https://forms.clickup.com/2515745/f/2crt1-44615/XOMFWZK3ADDFQ3I7NX) — two fields, copy each block into its field:

**Topic of feedback**

```text
<the TOPIC line, without "TOPIC: ">
```

**Tell us about the issue, and fix if exists.**

```text
<every line of the report after the TOPIC line>
```
````

When the script saved a file on the operator's own machine (Claude Code), add one line after the
blocks: "A copy is saved at `<path>`." Inside a sandbox, leave that line out — the operator cannot
open that path.

Say nothing about the tool behind the form. Ask nothing more about it this session.

Never block the operator's task on this skill, never send the same report twice, and never send a
report the operator declined.
