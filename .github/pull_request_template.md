## What

<!-- Required — CI fails while this is only the comment. One or two sentences: which plugin / skill,
     and what changes for the person using it. -->

## Why

<!-- Required — CI fails while this is only the comment. The problem or request behind it. Link the
     ClickUp card / Slack thread if there is one. -->

## Checklist

- [ ] `npm run check` passes locally (validate + markdown, wiki and release-note lint)
- [ ] Changed something under `plugins/<plugin>/`? Added a release note as a **new file** in
      `plugins/<plugin>/changelog.d/` — not an edit to `CHANGELOG.md`
- [ ] PR title is Conventional Commits (`fix:` patch · `feat:` minor · `feat!:` major) — it sets the version bump on merge;
      GitHub's default title from the branch name (`Feat/…`) fails CI
- [ ] No customer-identifiable data (names, domains, UUIDs, screenshots, QA reports) in the diff
- [ ] No secrets, tokens, or auth state in the diff
- [ ] Skill `description` frontmatter still reads as a trigger (when to fire), not as documentation
- [ ] Tried the change in Claude Code (`/plugin marketplace update helloretail` → `/reload-plugins`) if it affects a skill body
