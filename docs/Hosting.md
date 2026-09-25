# Hosting (free)

Qbox runs for free on:

| Part | Service |
| --- | --- |
| Bot, API, and portal | Oracle Cloud "Always Free" Ubuntu server |
| Public HTTPS address | Tailscale Funnel (`https://qbox.<your-tailnet>.ts.net`) |
| Database | Supabase free plan |
| Code, secrets, database updates | GitHub (`Database migrations` workflow) |

## First-time setup

On the server (Ubuntu 24.04), add a read-only deploy key so it can download the private repository:

```text
ssh-keygen -t ed25519 -N "" -f ~/.ssh/id_ed25519
cat ~/.ssh/id_ed25519.pub
```

Add the printed key in GitHub under **Settings > Deploy keys > Add deploy key** (leave write access off). Then:

```text
git clone git@github.com:gholsona171/QboxPlatform.git ~/qbox
bash ~/qbox/ops/oracle/setup.sh
```

The script asks for your Discord values and the Supabase connection string, writes them to `~/qbox/.env` (readable only by you, never committed), builds Qbox, registers slash commands, starts the `qbox-api` and `qbox-bot` services, and publishes the portal with Tailscale Funnel.

Finally, add `https://<portal address>/auth/discord/callback` under **Discord Developer Portal > OAuth2 > Redirects**.

## Updates

`qbox-update.timer` checks GitHub every 5 minutes. When `main` changes, the server pulls it, rebuilds, re-registers slash commands, and restarts. Database changes are applied by the GitHub workflow.

## Moving to a different Discord server

Qbox runs in one Discord server at a time. To move it:

1. Invite the bot to the new server (Discord Developer Portal > OAuth2 > URL Generator, scopes `bot` and `applications.commands`, permission Administrator).
2. On the server, run `bash ~/qbox/ops/oracle/switch-server.sh <new server ID>`.

Settings are stored per Discord server, so the new server starts fresh and the old server's data is kept.

## Checking on it

```text
systemctl status qbox-api qbox-bot
journalctl -u qbox-bot -f
journalctl -u qbox-update -n 50
```
