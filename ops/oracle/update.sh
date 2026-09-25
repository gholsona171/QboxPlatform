#!/usr/bin/env bash
# Pulls the latest build and restarts Guildhall when something changed.
# Run by qbox-update.timer every 5 minutes; safe to run by hand.
#
# Slash commands are registered globally (once for every server the bot is
# in), so nothing here depends on a particular Discord server.
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

if [ "$(git rev-parse HEAD)" = "$(git rev-parse "$TARGET")" ]; then
  exit 0
fi

echo "Updating to $(git rev-parse --short "$TARGET")"
git reset --hard --quiet "$TARGET"
pnpm install --frozen-lockfile
if [ "$PREBUILT" = 0 ]; then
  pnpm build
  git rev-parse HEAD > .qbox-built-commit
fi

sudo /usr/bin/systemctl restart qbox-api qbox-bot
echo "Updated and restarted"

# Global commands can take a few minutes to appear in Discord after a change.
(cd apps/bot && node dist/deployCommands.js global --confirm-global --confirm-global-removals)

# Older setups registered the commands in one server (DISCORD_GUILD_ID).
# Clear that copy so members do not see every command twice. Not fatal:
# the bot may have left that server.
GUILD_ID="$(sed -n 's/^DISCORD_GUILD_ID=//p' .env)"
if [ -n "$GUILD_ID" ]; then
  (cd apps/bot && node dist/deployCommands.js clear-guild) \
    || echo "Could not clear per-server commands in ${GUILD_ID}; continuing." >&2
fi
echo "Slash commands registered"
