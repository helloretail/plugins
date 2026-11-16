# shellcheck shell=bash
# Shared helpers for the browser-login scripts. Sourced, never executed.
#
# Guarantees a modern Node and a resolvable Playwright + @playwright/mcp, both under ~/.hr-*
# so nothing is installed system-wide and no admin rights are needed. The plugin's .mcp.json
# launches every playwright server from exactly these paths:
#   ~/.hr-node/bin/node  ~/.hr-pw/node_modules/@playwright/mcp/cli.js  --config ~/.hr-pw/hr-mcp-config.json

HR_NODE="$HOME/.hr-node"
HR_PW="$HOME/.hr-pw"

# Everything this setup downloads is pinned. Nothing is fetched as "latest": the same plugin
# version installs the same Node and the same Playwright on every machine. To move a pin,
# change it here and in setup-hr-browsers.ps1 (the Node checksums come from
# https://nodejs.org/dist/<version>/SHASUMS256.txt).
NODE_VERSION="v22.14.0"
PLAYWRIGHT_VERSION="1.61.1"
PLAYWRIGHT_MCP_VERSION="0.0.78"

# SHA-256 of the official Node $NODE_VERSION tarball for one "<os>-<arch>".
node_sha256() {
  case "$1" in
    darwin-arm64) echo e9404633bc02a5162c5c573b1e2490f5fb44648345d64a958b17e325729a5e42 ;;
    darwin-x64) echo 6698587713ab565a94a360e091df9f6d91c8fadda6d00f0cf6526e9b40bed250 ;;
    linux-arm64) echo 8cf30ff7250f9463b53c18f89c6c606dfda70378215b2c905d0a9a8b08bd45e0 ;;
    linux-x64) echo 9d942932535988091034dc94cc5f42b6dc8784d6366df3a36c4c9ccb3996f0c2 ;;
    *) return 1 ;;
  esac
}

sha256_of() {
  if command -v shasum >/dev/null 2>&1; then
    shasum -a 256 "$1" | cut -d' ' -f1
  else
    sha256sum "$1" | cut -d' ' -f1
  fi
}

# Download the pinned Node for "<os>-<arch>" into ~/.hr-node. The tarball is checked against
# its pinned SHA-256 BEFORE anything is unpacked; a mismatch stops the setup.
download_node() {
  local target="$1" tarball want got
  want="$(node_sha256 "$target")" || { echo "No pinned Node checksum for '$target'." >&2; exit 1; }
  mkdir -p "$HR_NODE"
  tarball="$(mktemp "${TMPDIR:-/tmp}/hr-node.XXXXXX")"
  echo "Downloading portable Node $NODE_VERSION ($target) into $HR_NODE (~50 MB)…" >&2
  curl -fsSL "https://nodejs.org/dist/$NODE_VERSION/node-$NODE_VERSION-$target.tar.gz" -o "$tarball" \
    || { rm -f "$tarball"; echo "Node download failed — check your network and re-run." >&2; exit 1; }
  got="$(sha256_of "$tarball")"
  if [ "$got" != "$want" ]; then
    rm -f "$tarball"
    echo "Node download does not match its pinned checksum — nothing was installed. Re-run; if it happens again, report it." >&2
    exit 1
  fi
  tar -xzf "$tarball" -C "$HR_NODE" --strip-components=1
  rm -f "$tarball"
}

node_ok() {
  [ -n "${1:-}" ] && [ -x "$1" ] || return 1
  local major
  major="$("$1" -v 2>/dev/null | sed 's/^v//' | cut -d. -f1)" || return 1
  [ -n "$major" ] && [ "$major" -ge 18 ]
}

# Put an existing Node on PATH without installing anything. Returns 1 when none is usable.
have_node() {
  if node_ok "$HR_NODE/bin/node"; then
    export PATH="$HR_NODE/bin:$PATH"
    return 0
  fi
  node_ok "$(command -v node || true)"
}

# Ensure ~/.hr-node/bin/{node,npm,npx} exist: symlink a Node >= 18 already on the machine,
# otherwise download the pinned portable copy (~50 MB, no admin, checksum-verified). Needs
# network only for the download.
ensure_node() {
  if ! node_ok "$HR_NODE/bin/node"; then
    mkdir -p "$HR_NODE/bin"
    local cand bin
    for cand in "$(command -v node || true)" \
                "$HOME"/.nvm/versions/node/v2[0-9]*/bin/node \
                "$HOME"/.nvm/versions/node/v1[89]*/bin/node \
                /opt/homebrew/bin/node /usr/local/bin/node; do
      if node_ok "$cand"; then
        bin="$(cd "$(dirname "$cand")" && pwd)"
        ln -sf "$bin/node" "$bin/npm" "$bin/npx" "$HR_NODE/bin/"
        echo "Reusing existing Node $("$cand" -v) from $bin" >&2
        break
      fi
    done
  fi
  if ! node_ok "$HR_NODE/bin/node"; then
    local os arch
    case "$(uname -s)" in
      Darwin) os=darwin ;;
      Linux) os=linux ;;
      *) echo "Unsupported OS '$(uname -s)' — on Windows run scripts/setup-hr-browsers.ps1, or use WSL." >&2; exit 1 ;;
    esac
    case "$(uname -m)" in
      arm64|aarch64) arch=arm64 ;;
      x86_64) arch=x64 ;;
      *) echo "Unsupported CPU '$(uname -m)'" >&2; exit 1 ;;
    esac
    download_node "$os-$arch"
  fi
  # ~/.hr-node/bin must LEAD PATH — npm/npx find `node` via /usr/bin/env.
  export PATH="$HR_NODE/bin:$PATH"
  echo "Node $(node -v)" >&2
}

# The headed + desktop-viewport config every server passes with --config. Rewritten on every
# run so an old file never pins stale settings. Windows was observed launching headless
# without the explicit launchOption; 1440x900 is the desktop QA viewport (Playwright's own
# default, 1280x720, lands in tablet breakpoints).
write_mcp_config() {
  mkdir -p "$HR_PW"
  printf '{ "browser": { "launchOptions": { "headless": false }, "contextOptions": { "viewport": { "width": 1440, "height": 900 } } } }\n' \
    > "$HR_PW/hr-mcp-config.json"
}

# Version of an npm package installed under ~/.hr-pw; empty when it is not there.
pw_installed_version() {
  node -p "require('$HR_PW/node_modules/$1/package.json').version" 2>/dev/null || true
}

# Install the pinned Playwright library and @playwright/mcp under ~/.hr-pw when they are
# missing; HR_UPDATE=1 reinstalls them at the pinned versions. The bundled-browser download is
# skipped: the servers drive the installed Google Chrome. Needs network for the install itself.
#
# An existing install at another version is left alone and reported: reinstalling swaps the
# files running playwright servers were started from, so it happens only when asked for.
ensure_playwright() {
  if [ "${HR_UPDATE:-0}" = 1 ] \
     || [ ! -d "$HR_PW/node_modules/playwright" ] \
     || [ ! -f "$HR_PW/node_modules/@playwright/mcp/cli.js" ]; then
    mkdir -p "$HR_PW"
    # `npm init -y` rejects the folder name (leading dot) — write the manifest directly.
    [ -f "$HR_PW/package.json" ] \
      || printf '{ "name": "hr-pw-workspace", "private": true }\n' > "$HR_PW/package.json"
    echo "Installing Playwright + @playwright/mcp into ${HR_PW}…" >&2
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm i --prefix "$HR_PW" --save-exact \
      "playwright@$PLAYWRIGHT_VERSION" "@playwright/mcp@$PLAYWRIGHT_MCP_VERSION" >/dev/null 2>&1 \
      || { echo "Playwright install failed — check your network and re-run." >&2; exit 1; }
  fi
  echo "playwright $(pw_installed_version playwright), @playwright/mcp $(pw_installed_version @playwright/mcp)" >&2
  pw_version_note >&2
  write_mcp_config
}

# One line when the installed versions are not the pinned ones; nothing when they match.
pw_version_note() {
  local pw mcp
  pw="$(pw_installed_version playwright)"
  mcp="$(pw_installed_version @playwright/mcp)"
  if [ "$pw" != "$PLAYWRIGHT_VERSION" ] || [ "$mcp" != "$PLAYWRIGHT_MCP_VERSION" ]; then
    echo "Note: this plugin is tested with playwright $PLAYWRIGHT_VERSION and @playwright/mcp $PLAYWRIGHT_MCP_VERSION. To switch, close Claude Code and run: HR_UPDATE=1 bash setup-hr-browsers"
  fi
}

# Playwright is present but must not be installed here (offline paths such as refresh-hr-auth).
require_playwright() {
  [ -f "$HR_PW/node_modules/@playwright/mcp/cli.js" ] && [ -d "$HR_PW/node_modules/playwright" ] \
    || { echo "Playwright is not installed under $HR_PW — run setup-hr-browsers first." >&2; exit 2; }
  [ -f "$HR_PW/hr-mcp-config.json" ] || write_mcp_config
}

check_chrome() {
  [ -d "/Applications/Google Chrome.app" ] \
    || command -v google-chrome >/dev/null 2>&1 \
    || command -v google-chrome-stable >/dev/null 2>&1 \
    || { echo "Google Chrome is required but not found — install it from https://google.com/chrome and re-run." >&2; exit 1; }
}
