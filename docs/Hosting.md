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

When `main` changes, the **Deploy build** GitHub workflow compiles Qbox and publishes the result to the `deploy` branch (about 3 minutes, within GitHub's free minutes). `qbox-update.timer` checks every 5 minutes; when `deploy` changes, the server downloads it, installs dependencies, re-registers slash commands, and restarts in a minute or two. It never compiles on the small server unless the `deploy` branch is missing. Database changes are applied by the **Database migrations** workflow.

## Moving to a different Discord server

Qbox runs in one Discord server at a time. To move it:

1. Invite the bot to the new server (Discord Developer Portal > OAuth2 > URL Generator, scopes `bot` and `applications.commands`, permission Administrator).
2. In GitHub, edit `ops/discord-server-id` on `main` and put the new server ID in it. Within 5 minutes the server switches, registers slash commands there, and restarts. No SSH needed.

Leave the file empty to keep the server ID chosen during setup. On the server itself, `bash ~/qbox/ops/oracle/switch-server.sh <server ID>` switches immediately (the file in GitHub wins at the next update if it names a different server).

Settings are stored per Discord server, so the new server starts fresh and the old server's data is kept.

## Checking on it

```text
systemctl status qbox-api qbox-bot
journalctl -u qbox-bot -f
journalctl -u qbox-update -n 50
```
