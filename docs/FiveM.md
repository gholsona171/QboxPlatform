# FiveM Server

Show your FiveM server's status in Discord and the portal (`/fivem`): an
auto-updating status message, down and back-up alerts, restart warnings, and a
player-count chart.

## Where the code lives

| Part | Location |
| --- | --- |
| Rules, server query, Discord REST adapter | `modules/fivem` (`@qbox/fivem`) |
| Database models | `FivemSettings`, `FivemStatusSnapshot` in `prisma/schema/fivem.prisma` |
| PostgreSQL repository | `packages/database/src/fivem/PrismaFivemRepository.ts` |
| `/fivem` command | `packages/discord/src/commands/Fivem.command.ts` |
| Status timer | `packages/discord/src/fivem/FivemFeature.ts` |
| API | `apps/api/src/fivem/FivemRoutes.ts` |
| Portal | `apps/web/public/js/fivem.js` |

## Permissions

| Permission | Allows |
| --- | --- |
| `fivem.manage` | Change settings and test a server address |

Any signed-in server member can see the status, players, and chart in the
portal, and everyone can use `/fivem`. Discord administrators can do everything.

## Discord commands

- `/fivem status` — online or offline, players, uptime, and a Connect button.
- `/fivem players` — who is online (up to 40 names).
- `/fivem connect` — the cfx.re link and the `connect host:port` command.

## How the status is read

Guildhall asks the server's public HTTP endpoints, `http://host:port/info.json`,
`/players.json`, and `/dynamic.json`, each with a 5 second timeout. The server
counts as online when `info.json` or `dynamic.json` answers. If `players.json`
is blocked, the player count comes from `dynamic.json` and the list stays
empty. Color codes like `^1` are removed from the server name.

## Features

- **Status message:** in the status channel, Guildhall posts one message and edits it at the update interval (default 60 seconds). It shows online or offline, players x/max, the server name, how long it has been up, the player list (up to 40), restart times, and a Connect button. If the message is deleted, a new one is posted.
- **Down and up alerts:** after 2 failed checks in a row the server counts as down, and Guildhall posts in the alert channel and pings the alert role. When it answers again, Guildhall posts that it is back. One slow answer does not trigger an alert.
- **Restart warnings:** list daily restart times (`HH:MM`) and a time zone (for example `Europe/Berlin`). Guildhall posts a warning in the alert channel the chosen number of minutes before each restart (default 15, 5, and 1; `0` means "restarting now"). Each warning is sent once.
- **Player chart:** every check is stored as a snapshot (online, players, max players, time). The portal shows the highest player count per 15 minutes for the last 24 hours, or per 2 hours for the last 7 days, with the peak and the uptime percentage. Snapshots older than 8 days are deleted every hour.
- **Test connection:** the portal's Settings tab checks an address before you save it.

## Setup

1. In your `server.cfg`, keep the HTTP endpoints reachable (they are on by default). If `players.json` is hidden (`sv_requestParanoia`), only the count is shown.
2. In the portal, open **FiveM Server > Settings**, enter the address as `host:port` (for example `123.45.67.89:30120`), and press **Test connection**.
3. Add your cfx.re join link (`https://cfx.re/join/abc123`) for the Connect button.
4. Pick a status channel, an alert channel, and optionally a role to ping.
5. Add restart times and your time zone if the server restarts on a schedule.
6. Grant `fivem.manage` to the staff who manage the server.

## Known limitations

- The status message and alerts only update while the bot is running; the portal's live status comes straight from the server.
- Staff with `fivem.manage` can test any address; the API makes the request from its own network.
- Uptime is measured from when Guildhall first saw the server online, not from the server's real start time.
