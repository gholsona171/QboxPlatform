#!/usr/bin/env bash
# Points Qbox at a different Discord server: updates DISCORD_GUILD_ID in
# .env, registers slash commands there, and restarts the API and bot.
#
# Usage:  bash ops/oracle/switch-server.sh <discord server id>
set -euo pipefail
cd "$(dirname "${BASH_SOURCE[0]}")/../.."

GUILD_ID="${1:-}"
if ! [[ "$GUILD_ID" =~ ^[0-9]{17,20}$ ]]; then
  echo "Give the new Discord server ID, for example: bash ops/oracle/switch-server.sh 123456789012345678" >&2
  exit 1
fi
[ -f .env ] || { echo "No .env found. Run setup.sh first." >&2; exit 1; }

sed -i "s/^DISCORD_GUILD_ID=.*/DISCORD_GUILD_ID=${GUILD_ID}/" .env
(cd apps/bot && node dist/deployCommands.js guild)
sudo /usr/bin/systemctl restart qbox-api qbox-bot
echo "Qbox now runs in server ${GUILD_ID}."
