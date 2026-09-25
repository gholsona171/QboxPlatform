#!/usr/bin/env bash
# Pulls the latest main branch and restarts Qbox when something changed,
# including a new Discord server ID in ops/discord-server-id.
# Run by qbox-update.timer every 5 minutes; safe to run by hand.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

# GitHub builds main and publishes the result to the "deploy" branch
# (.github/workflows/deploy-build.yml), so the server only downloads and
# restarts. Without that branch it falls back to building main here.
if git fetch --quiet origin main deploy 2>/dev/null; then
  TARGET=origin/deploy PREBUILT=1
else
  git fetch --quiet origin main
  TARGET=origin/main PREBUILT=0
fi

if [ "$(git rev-parse HEAD)" != "$(git rev-parse "$TARGET")" ]; then
  CHANGED="$(git diff --name-only HEAD "$TARGET")"
  echo "Updating to $(git rev-parse --short "$TARGET")"
  git reset --hard --quiet "$TARGET"
  if [ "$CHANGED" != "ops/discord-server-id" ]; then
    pnpm install --frozen-lockfile
    if [ "$PREBUILT" = 0 ]; then
      pnpm build
      git rev-parse HEAD > .qbox-built-commit
    fi
  fi
fi

# ops/discord-server-id in GitHub chooses the Discord server. When it names a
# different server than .env, switch to it; otherwise restart only after code changes.
WANTED="$(tr -d '[:space:]' < ops/discord-server-id 2>/dev/null || true)"
CURRENT="$(sed -n 's/^DISCORD_GUILD_ID=//p' .env)"
if [[ "$WANTED" =~ ^[0-9]{17,20}$ ]] && [ "$WANTED" != "$CURRENT" ]; then
  echo "Switching Discord server to ${WANTED}"
  sed -i "s/^DISCORD_GUILD_ID=.*/DISCORD_GUILD_ID=${WANTED}/" .env
elif [ -z "${CHANGED:-}" ]; then
  exit 0
fi

(cd apps/bot && node dist/deployCommands.js guild)
sudo /usr/bin/systemctl restart qbox-api qbox-bot
echo "Updated and restarted"
