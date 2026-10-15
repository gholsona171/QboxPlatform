# FiveM Server

Show your FiveM server's status in Discord and the portal (`/fivem`): an
auto-updating status message with a 24-hour player graph, restart warnings,
"Restarting now", "Server is down", and "Back online" posts, the player count in
the bot's presence, and a player-count chart.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, state machine, server query, Discord REST adapter | `modules/fivem` (`@qbox/fivem`) |
| Player graph (PNG) | `modules/fivem/src/playerGraph.ts` |
| Database models | `FivemSettings`, `FivemStatusSnapshot` in `prisma/schema/fivem.prisma` |
| PostgreSQL repository | `packages/database/src/fivem/PrismaFivemRepository.ts` |
| `/fivem` command | `packages/discord/src/commands/Fivem.command.ts` |
| Status timer, bot presence | `packages/discord/src/fivem/FivemFeature.ts` |
| API | `apps/api/src/fivem/FivemRoutes.ts` |
| Portal | `apps/web/public/js/fivem.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `fivem.manage` | Change settings and test a server address |

Any signed-in server member can see the status, players, and chart in the
portal, and everyone can use `/fivem`. Discord administrators can do everything.

## Discord commands

- `/fivem status` — the same view as the status message (state, players, uptime, next restart, how to join, the player graph) and a Connect button.
- `/fivem players` — who is online (up to 40 names).
- `/fivem connect` — the Connect button and the F8 `connect` command in a code block.

## How the status is read

Guildhall asks the server's public HTTP endpoints, `http://host:port/info.json`,
`/players.json`, and `/dynamic.json`, each with a 5 second timeout, **every 15
seconds** (whatever the status message interval), so a short txAdmin restart
is not missed. The server answers when `info.json` or `dynamic.json` answers; it
answers only *partly* when one of the two fails or it reports no slots. If
`players.json` is blocked, the player count comes from `dynamic.json` and the
list stays empty. Color codes like `^1` are removed from the server name.

## Online, Restarting, Starting up, Offline

| State | Colour | When |
| --- | --- | --- |
| Online | green | The server answers. |
| Restarting | yellow | It stopped answering: inside a scheduled restart window, or for less than **Count as down after** (default 3 minutes). Shown from the first failed check. |
| Starting up | yellow | It answers again but only partly (coming back from Restarting or Offline). After 3 minutes of partial answers it counts as Online anyway. |
| Offline | red | Not answering for longer than **Count as down after**, outside a restart window: a real outage. |

The **restart window** opens with the first restart warning (between 2 and 15
minutes before the scheduled time) and closes 15 minutes after it. A server that
goes down inside the window is Restarting and never triggers the "down" alert or
the role ping. Still down when the window closes = Offline, with the alert.

Posts in the alert channel (the status message is edited in place as well):

| Post | When | Role ping |
| --- | --- | --- |
| ⚠️ Restarting in 15 minutes / 5 minutes | Before each scheduled restart (the warning minutes) | No |
| 🔄 Restarting now | Once per scheduled restart: the server goes down in the window, or warning minute `0` | No |
| 🔴 Server is down | Once per outage (see Offline above) | Yes |
| 🟢 Back online | It answers fully again after Restarting, Starting up, or Offline; or it reports a newer start time (it restarted between two checks) | Only after a real outage |

Every failed check counts: if the server stops answering even once, the uptime
starts again from when it answers fully and "Back online" is posted (a planned
or unplanned restart). A single network hiccup can therefore post "Back
online"; that is the price of never missing a short restart.

**Uptime** is the time since the server's last (re)start. When the server shares
an uptime in its vars (`SetConvarServerInfo("Uptime", "2h 05m")`, as many uptime
scripts do; formats like `2h 05m`, `1d 3h`, `125 minutes`, `01:02:03`), Guildhall
uses it. Otherwise it is the time since Guildhall saw the server come back after
a restart or outage; when Guildhall first meets an already-running server, it
counts from that moment.

## Features

- **Status message:** in the status channel, Guildhall posts one message and edits it at the update interval (default 60 seconds) and right away when the state changes. It shows the state and colour, players x/max, uptime, the next restart as a Discord relative time ("in 2 hours"), how to join (the F8 `connect` command in a code block), one Connect button for the cfx.re link, and the player graph. The server's `banner_detail` image (when it is an `https://` link) is the thumbnail. Player names are hidden by default; turn on **List player names in the status message** to show up to 40 (cut with "…and N more"). If the message is deleted, a new one is posted; any other failed edit (a rate limit, a Discord hiccup) is logged and retried on the next check, so the message is never duplicated.
- **Player graph:** a PNG of the players online over the last 24 hours (highest count per 15 minutes, red ticks where the server was down, the axis up to the server's slots), drawn by Guildhall itself (no outside service, no native libraries), attached to the status message and to `/fivem status`, and redrawn every 10 minutes. It uses the same snapshots as the portal chart.
- **Restart warnings and posts:** see the table above. Warnings are each sent once.
- **Presence:** when exactly one FiveM server is set up across every Discord server the bot is in, the bot shows "Watching 12/64 on Cloud Nine RP" (or "…: restarting" / "…: offline"). With several, it shows nothing, because one line cannot speak for several servers.
- **Player chart:** a snapshot (online, players, max players, time) is stored at the update interval. The portal shows the highest player count per 15 minutes for the last 24 hours, or per 2 hours for the last 7 days, with the peak and the uptime percentage. Snapshots older than 8 days are deleted every hour.
- **Debug:** turn on **Debug** in Settings and every check is logged with what the server answered, the state before and after, and why (for example "not answering inside a scheduled restart window: down alert suppressed"), plus which posts were sent or held back. It takes effect at the next check, no restart. Off by default.
- **Test connection:** the portal's Settings tab checks an address before you save it.

## Setup

1. In your `server.cfg`, keep the HTTP endpoints reachable (they are on by default). If `players.json` is hidden (`sv_requestParanoia`), only the count is shown.
2. In the portal, open **FiveM Server > Settings**, enter the address as `host:port` (for example `123.45.67.89:30120`), and press **Test connection**.
3. Add your cfx.re join link (`https://cfx.re/join/abc123`) for the Connect button.
4. Pick a status channel, an alert channel, and optionally a role to ping.
5. Add restart times and your time zone if the server restarts on a schedule. Example (Cloud Nine RP): `00:00, 08:00, 16:00` in `America/Los_Angeles`, warnings `15, 5`. Use the server's real restart times; nothing is built in.
6. Optionally change **Count as down after** (minutes, default 3) and **List player names in the status message**.
7. Grant `fivem.manage` to the staff who manage the server.

The bot needs **Send Messages**, **Embed Links**, and **Attach Files** (for the
graph) in the status channel.

## Known limitations

- The status message and alerts only update while the bot is running; the portal's live status comes straight from the server.
- Staff with `fivem.manage` can test any address; the API makes the request from its own network.
- Without an `Uptime` server var, uptime counts from the restart Guildhall saw, or from when it first met the server.
- A restart that starts and finishes between two checks (under 15 seconds) is only spotted when the server shares an uptime.
