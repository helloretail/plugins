### Fixed

- `browser-login` no longer closes the login window about five seconds after it opens. The window now stays open, with no time limit, until Hello Retail accepts the login; before, a leftover session cookie was taken for a finished login.
- `browser-login` recognises the current Hello Retail sign-in page (`/auth/signin`) as "logged out", and so does the login check every QA and builder skill runs first. Refreshing the saved login now reports a session Hello Retail has ended instead of saving it.

### Changed

- `browser-login` now opens the Hello Retail login window itself on a fresh machine, instead of asking you to paste a line into Terminal. You only log in. The terminal line is still printed in the one case it is needed: when the window opens without network and the page cannot load.
- `browser-login` installs a pinned Node (checked against its SHA-256 before unpacking) and pinned Playwright versions instead of whatever is newest. An existing install is left alone; `HR_UPDATE=1` (or `-Update` on Windows) switches it to the pinned versions.
