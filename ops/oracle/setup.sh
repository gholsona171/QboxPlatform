#!/usr/bin/env bash
# One-time setup for an Oracle Cloud "Always Free" Ubuntu server.
# Installs Node.js, pnpm, and Tailscale, writes the private .env, builds
# Qbox, registers slash commands, and starts the API and bot as services
# that restart on failure and update themselves from GitHub.
#
# Run from the cloned repository:  bash ops/oracle/setup.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
RUN_USER="$(id -un)"
API_PORT=3000
PNPM_VERSION=10.16.0

say() { printf '\n\033[1;36m==> %s\033[0m\n' "$1"; }
ask() { local prompt="$1" var; read -r -p "$prompt: " var; printf '%s' "$var"; }
ask_secret() { local prompt="$1" var; read -r -s -p "$prompt (hidden): " var; echo >&2; printf '%s' "$var"; }

say "Installing system packages"
sudo apt-get update -y
sudo apt-get install -y ca-certificates curl git jq

if [ "$(free -m | awk '/^Mem:/ {print $2}')" -lt 2000 ] && [ ! -f /swapfile ]; then
  say "Adding 2 GB swap (small server)"
  sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile
  sudo mkswap /swapfile && sudo swapon /swapfile
  echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab >/dev/null
fi

if ! command -v node >/dev/null || [ "$(node -p 'process.versions.node.split(".")[0]')" -lt 22 ]; then
  say "Installing Node.js 22"
  curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
  sudo apt-get install -y nodejs
fi
sudo corepack enable
corepack prepare "pnpm@${PNPM_VERSION}" --activate

if ! command -v tailscale >/dev/null; then
  say "Installing Tailscale"
  curl -fsSL https://tailscale.com/install.sh | sh
fi
if ! tailscale status >/dev/null 2>&1; then
  say "Sign in to Tailscale: open the link below in your browser"
  sudo tailscale up --hostname=qbox
fi
PUBLIC_HOST="$(tailscale status --json | jq -r '.Self.DNSName' | sed 's/\.$//')"
PUBLIC_URL="https://${PUBLIC_HOST}"
say "Your portal address will be ${PUBLIC_URL}"

if [ ! -f "$REPO_DIR/.env" ]; then
  say "Enter your settings (they stay on this server only)"
  DISCORD_APPLICATION_ID="$(ask 'Discord Application ID')"
  DISCORD_TOKEN="$(ask_secret 'Discord bot token')"
  DISCORD_OAUTH_CLIENT_SECRET="$(ask_secret 'Discord OAuth2 client secret')"
  DISCORD_GUILD_ID="$(ask 'Default Discord server ID (Enter to skip; the bot works in every server it is invited to)')"
  ADMIN_ROLE_IDS="$(ask 'Admin role IDs, comma separated (Enter to skip)')"
  DATABASE_URL="$(ask_secret 'Supabase DATABASE_URL (same as the GitHub secret)')"
  MESSAGE_CONTENT="$(ask 'Message Content intent turned on in the Discord portal? (yes/no)')"
  OPENAI_API_KEY="$(ask_secret 'OpenAI API key for /ask (Enter to skip)')"
  key() { node -e 'console.log(require("crypto").randomBytes(32).toString("base64url"))'; }

  umask 077
  cat > "$REPO_DIR/.env" <<ENV
NODE_ENV=production
DISCORD_TOKEN=${DISCORD_TOKEN}
DISCORD_APPLICATION_ID=${DISCORD_APPLICATION_ID}
DISCORD_GUILD_ID=${DISCORD_GUILD_ID}
DISCORD_MESSAGE_CONTENT_INTENT=$([ "${MESSAGE_CONTENT,,}" = "yes" ] && echo true || echo false)
DISCORD_OAUTH_CLIENT_ID=${DISCORD_APPLICATION_ID}
DISCORD_OAUTH_CLIENT_SECRET=${DISCORD_OAUTH_CLIENT_SECRET}
DISCORD_OAUTH_REDIRECT_URI=${PUBLIC_URL}/auth/discord/callback
DATABASE_URL=${DATABASE_URL}
API_HOST=127.0.0.1
API_PORT=${API_PORT}
API_PUBLIC_BASE_URL=${PUBLIC_URL}
API_TRUST_PROXY=127.0.0.1
API_ALLOWED_HOSTS=${PUBLIC_HOST}
AUTH_KEY_VERSION=1
AUTH_SESSION_HMAC_KEY=$(key)
AUTH_CSRF_HMAC_KEY=$(key)
AUTH_METADATA_HMAC_KEY=$(key)
AUTH_OAUTH_ENCRYPTION_KEY=$(key)
ADMIN_ROLE_IDS=${ADMIN_ROLE_IDS}
OPENAI_API_KEY=${OPENAI_API_KEY}
ENV
  umask 022
  say "Saved settings to .env (readable by you only)"
else
  say "Keeping the existing .env"
fi

cd "$REPO_DIR"
BUILT_COMMIT_FILE="$REPO_DIR/.qbox-built-commit"
BUILT_COMMIT="$(cat "$BUILT_COMMIT_FILE" 2>/dev/null || true)"
code_changed() {
  [ -z "$BUILT_COMMIT" ] && return 0
  git cat-file -e "${BUILT_COMMIT}^{commit}" 2>/dev/null || return 0
  git diff --name-only "$BUILT_COMMIT" HEAD | grep -qvE '^(ops/|docs/|\.gitignore$|[^/]*\.md$)'
}
if git fetch --quiet origin deploy 2>/dev/null; then
  say "Downloading the build GitHub made"
  git reset --hard --quiet origin/deploy
  pnpm install --frozen-lockfile
elif ! code_changed; then
  say "Already built for this version, skipping the build"
else
  say "Building Qbox (10-15 minutes on a small server)"
  pnpm install --frozen-lockfile
  pnpm build
  git rev-parse HEAD > "$BUILT_COMMIT_FILE"
fi

APP_ID="$(sed -n 's/^DISCORD_APPLICATION_ID=//p' "$REPO_DIR/.env")"
GUILD_ID="$(sed -n 's/^DISCORD_GUILD_ID=//p' "$REPO_DIR/.env")"
INVITE_URL="https://discord.com/oauth2/authorize?client_id=${APP_ID}&scope=bot%20applications.commands&permissions=8"

# Slash commands are registered once, globally, for every server the bot is
# in. Discord can take a few minutes to show new global commands.
say "Registering slash commands (global, for every server)"
if ! (cd apps/bot && node dist/deployCommands.js global --confirm-global --confirm-global-removals >/dev/null 2>&1); then
  cat >&2 <<HINT

The bot could not register its slash commands. Check DISCORD_TOKEN and
DISCORD_APPLICATION_ID in ${REPO_DIR}/.env, then run this setup again; it skips the build.
HINT
  exit 1
fi
if [ -n "$GUILD_ID" ]; then
  # Older setups registered the commands in one server. Remove that copy so
  # members do not see every command twice. Harmless when there is nothing to remove.
  say "Removing the old per-server copy of the commands from server ${GUILD_ID}"
  (cd apps/bot && node dist/deployCommands.js clear-guild >/dev/null 2>&1) \
    || echo "Could not clear per-server commands in ${GUILD_ID} (is the bot in that server?). Run 'bash ops/oracle/update.sh' after inviting it." >&2
fi

say "Creating services"
NODE_BIN="$(command -v node)"
unit() {
  local name="$1" dir="$2" entry="$3"
  sudo tee "/etc/systemd/system/${name}.service" >/dev/null <<UNIT
[Unit]
Description=${name}
After=network-online.target
Wants=network-online.target

[Service]
User=${RUN_USER}
WorkingDirectory=${REPO_DIR}/${dir}
ExecStart=${NODE_BIN} ${entry}
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
UNIT
}
unit qbox-api apps/api dist/run.js
unit qbox-bot apps/bot dist/index.js

sudo tee /etc/systemd/system/qbox-update.service >/dev/null <<UNIT
[Unit]
Description=Update Qbox from GitHub

[Service]
Type=oneshot
User=${RUN_USER}
ExecStart=/usr/bin/env bash ${REPO_DIR}/ops/oracle/update.sh
UNIT
sudo tee /etc/systemd/system/qbox-update.timer >/dev/null <<UNIT
[Unit]
Description=Check GitHub for Qbox updates every 5 minutes

[Timer]
OnBootSec=2min
OnUnitActiveSec=5min

[Install]
WantedBy=timers.target
UNIT
echo "${RUN_USER} ALL=(root) NOPASSWD: /usr/bin/systemctl restart qbox-api qbox-bot" | sudo tee /etc/sudoers.d/qbox >/dev/null
sudo chmod 440 /etc/sudoers.d/qbox

sudo systemctl daemon-reload
sudo systemctl enable --now qbox-api qbox-bot qbox-update.timer

say "Publishing the portal with Tailscale Funnel"
sudo tailscale funnel --bg "${API_PORT}"

say "Done"
cat <<DONE
Portal:  ${PUBLIC_URL}

Last step: in the Discord Developer Portal > your app > OAuth2 > Redirects,
add exactly:
  ${PUBLIC_URL}/auth/discord/callback

Add the bot to a Discord server (any number of them) with this link:
  ${INVITE_URL}
The server owner and its Discord administrators can use the portal for that
server right away. New global slash commands can take a few minutes to show up.

Useful commands:
  systemctl status qbox-api qbox-bot     (are they running?)
  journalctl -u qbox-bot -f              (live bot log, Ctrl+C to exit)
DONE
