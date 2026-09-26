# Hosting (free)

Guildhall runs for free on:

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

The script asks for your Discord values and the Supabase connection string (the Discord server ID is optional; press Enter to skip it), writes them to `~/qbox/.env` (readable only by you, never committed), builds Guildhall, registers the slash commands globally, starts the `qbox-api` and `qbox-bot` services, and publishes the portal with Tailscale Funnel.

Finally, add `https://<portal address>/auth/discord/callback` under **Discord Developer Portal > OAuth2 > Redirects**.

Invite the bot with the link the setup prints (or **OAuth2 > URL Generator** with the `bot` and `applications.commands` scopes and Administrator). The server owner and Discord administrators can use the whole portal right away; no permission setup is needed. See "Adding the bot to more servers" below.

## Updates

When `main` changes, the **Deploy build** GitHub workflow compiles Guildhall and publishes the result to the `deploy` branch (about 3 minutes, within GitHub's free minutes). `qbox-update.timer` checks every 5 minutes; when `deploy` changes, the server downloads it, installs dependencies, re-registers the global slash commands (Discord can take a few minutes to show changes), and restarts in a minute or two. It never compiles on the small server unless the `deploy` branch is missing. Database changes are applied by the **Database migrations** workflow.

## Adding the bot to more servers

One Guildhall installation serves any number of Discord servers, like MEE6 or Dyno. Nothing on the hosting server changes when a new community joins:

1. Open the invite link (the setup prints it; it is `https://discord.com/oauth2/authorize?client_id=<application ID>&scope=bot%20applications.commands&permissions=8`), pick the server, and authorize.
2. The server owner and every member with **Administrator** or **Manage Server** get full portal access for that server automatically; nobody has to grant permissions first.
3. Sign in to the portal and pick the server in the server picker. Every page then applies to that server; switch servers from the same picker at any time.

Slash commands are registered globally once, so they work in every server the bot joins. Discord can take a few minutes to show newly registered global commands.

Settings are stored per Discord server, so each server starts fresh and keeps its own data. `DISCORD_GUILD_ID` in `.env` is optional: when set, it is only the server the portal shows before a member picks one (kept for older single-server setups); leave it empty for a fresh multi-server installation.

## Checking on it

```text
systemctl status qbox-api qbox-bot
journalctl -u qbox-bot -f
journalctl -u qbox-update -n 50
journalctl -u qbox-api | grep api.request.slow
```

Portal requests slower than 800 ms are logged by `qbox-api` as `api.request.slow` with the route, the number of database queries and their time, and the number of Discord calls and their time. Every API response also carries a `Server-Timing` header (browser developer tools > Network > Timing) with the same numbers. See "Portal request speed" in [Architecture](Architecture.md) for the caches the API keeps and how long a sign-out made elsewhere takes to apply (up to 10 seconds).

## Memory

The API runs with `--max-old-space-size=256` (its heap stays under about 100 MB while serving the portal), so a leak or a burst cannot grow it into the 1 GB server's swap. New setups get this from `setup.sh`. A server set up before this change needs it once; `update.sh` prints the reminder until it is done:

```text
sudo sed -i 's| dist/run.js$| --max-old-space-size=256 dist/run.js|' /etc/systemd/system/qbox-api.service
sudo systemctl daemon-reload
sudo systemctl restart qbox-api
```

Putting `NODE_OPTIONS` in `.env` does not work: the services load `.env` from inside Node, after the heap size is fixed. The bot has no cap; its memory was not measured.
