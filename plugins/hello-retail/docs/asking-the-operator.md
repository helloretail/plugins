# Asking the operator — the `AskUserQuestion` picker

The one way every skill in this plugin puts a question to the operator. Each skill names its own
questions, headers and options; this file is the shared format, and the skill's own line says where
an unanswered question is recorded.

## When to use the picker

- **A finite set of sensible options → the picker.** Pick a page, a design, yes / no, 8 / 10 / 12:
  ask with Claude Code's `AskUserQuestion` tool, never as a prose question.
- **Free text with nothing to suggest → prose.** A URL, a UUID, a heading with no candidates stays a
  plain question in the chat line.
- **Already answered → not asked.** Nothing the prompt, the card or an earlier answer settled is
  asked again; say what you took and from where.

## How to write a question

- **Header:** 12 characters at most.
- **Options:** two to four, each with a one-line description. The recommended one goes first and is
  marked "(Recommended)". *Other* is added automatically for free text.
- **Several may apply:** set `multiSelect: true`.
- **Options come from what you already read** — the live page, the MCP's lists, the card — never
  from guesswork.
- **An approval gate marks no option as recommended.** The choice is the operator's.

## How to batch

- **Up to four independent questions per call.**
- **A question whose options depend on an earlier answer waits for the next call.**
- **Never one question per turn** when several are open and independent.

## When the picker or the operator is missing

- **No `AskUserQuestion` tool in the session** (a subagent, the SDK): ask the same questions in
  prose, the options as a numbered list.
- **No operator to answer at all:** take the recommended option and record the question in the
  section the skill names (its own line beside the pointer to this file says which).
