#!/usr/bin/env bash
# Pulls the latest main branch and restarts Qbox when something changed.
# Run by qbox-update.timer every 5 minutes; safe to run by hand.
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

git fetch --quiet origin main
if [ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ]; then
  exit 0
fi

echo "Updating to $(git rev-parse --short origin/main)"
git merge --ff-only --quiet origin/main
pnpm install --frozen-lockfile
pnpm build
(cd apps/bot && node dist/deployCommands.js guild)
sudo /usr/bin/systemctl restart qbox-api qbox-bot
echo "Updated and restarted"
