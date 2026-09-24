# Browser backends — Playwright default, Claude in Chrome fallback

Read this before any step that touches the live storefront. It is the full text of the browser
policy the `../SKILL.md` BROWSER section summarises.

All live-site inspection goes through a real browser MCP. **Playwright is the default; Claude in
Chrome is the fallback** when no `playwright*` server exposes tools. This is the team's standing
decision and it is the same in every skill.

- **Playwright (default)** — the plugin ships the servers in `.mcp.json`: `playwright` (use this
  one), `playwright-01` … `playwright-10` (parallel workers) and `playwright-profile` (login only).
  Their tools are named `mcp__plugin_hello-retail_playwright__browser_*` (workers:
  `mcp__plugin_hello-retail_playwright-NN__browser_*`). Each runs an isolated session seeded from
  the saved Hello Retail login; `browser_resize` gives real mobile viewports; `browser_evaluate`
  returns URLs unrestricted. If the tools are missing or the session is logged out, ask the
  operator to log in in the Playwright window (the `browser-login` skill covers setup) — never
  type credentials yourself.
- **Claude in Chrome (fallback)** — tools are named `mcp__claude-in-chrome__*`. It drives the
  operator's own Chrome (macOS only, needs the extension). Its `javascript_tool` blocks output
  containing URLs — the `collect()` snippet in `survey-snippets.md` already works around that.
  Mobile: ask the operator to open the device Emulator; never resize that browser window.

| Task | Playwright (default) | Claude in Chrome (fallback) |
|---|---|---|
| Load the homepage / category page | `browser_navigate` | `navigate` |
| Read the rendered DOM | `browser_snapshot` | `get_page_text` / `read_page` |
| Locate tile / element selectors | `browser_snapshot` / `browser_evaluate` | `find` |
| Run extraction / survey / hover-CSS snippets | `browser_evaluate` | `javascript_tool` |
| Hover a tile for hover-only elements | `browser_hover` | `computer` |
| Real (trusted) click | `browser_click` | `computer` |
| Mobile viewport | `browser_resize` | operator opens the device Emulator |

**Never** read the storefront with WebFetch, curl, or any HTTP client — tiles are client-rendered and
only the real browser sees the final DOM, so a static fetch returns an incomplete or empty tile.

## When neither browser MCP is connected

Do not fetch the page yourself. Ask the operator to either:

1. **Enable a browser MCP** — Playwright: the `playwright*` servers need the one-time
   `browser-login` setup (`${CLAUDE_PLUGIN_ROOT}/docs/browser-login.md`); Claude in Chrome:
   install the extension and run `/chrome` (macOS only). Preferred, so the skill can survey every
   tile state itself; or
2. **Paste the raw tile HTML** from a category page (one full product card; ideally a couple of
   variants — a normal tile and a sale / sold-out tile). Then build from the pasted markup.

When working from pasted HTML you cannot survey the live page, so explicitly ask the operator for any
states you can't see (sale, sold-out, badges, ratings, swatches, hover image) — specifically ask
for one tile copied from the **New/New Arrivals** page and one from the **Sale/Offers/Outlet**
page, since those pages carry the label types a single category page hides — and flag in your
response anything you had to assume. Never substitute a WebFetch / curl fetch for either path.

## Off-limits pages

Only ever drive the customer's public storefront — never any my.helloretail.com page:
the Supervisors UI is banned by **the no-dashboard-automation rule**, and the `/company/…` dashboard is
banned by team policy (dashboard data comes via the `hello-retail` MCP; the only sanctioned
my.helloretail.com navigation is the login preflight's read-only root-URL probe).
