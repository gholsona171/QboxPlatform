# Guildhall (code name Qbox)

Guildhall runs your Discord community from one place. Invite the bot, sign in to the portal with Discord, and manage tickets, moderation, verification, staff, levels, giveaways and more for any server you run. It works for any number of Discord servers at once, the way MEE6 or Dyno do.

"Qbox" is the code name. It stays in package names (`@qbox/*`), environment variables (`QBOX_*`), service names (`qbox-api`, `qbox-bot`), and the repository name. The name people see comes from `packages/shared/src/brand.ts` and `apps/web/public/js/brand.js`.

## What it does

Everything below works from both the web portal and Discord:

- **Support:** tickets, applications, knowledge base (`/faq`, automatic answers, optional AI `/ask`)
- **Safety:** moderation (cases, automod, automatic punishments), verification
- **Team:** staff roster, ranks, strikes, leave, and shifts
- **Community:** levels and rewards, giveaways, polls, birthdays, voice rooms, scheduled messages, stream announcements (Twitch, Kick, and YouTube go-live and new-video posts), music in voice (your uploaded library and playlists, direct audio links, and internet radio, with a now-playing panel and 24/7 mode)
- **Server:** Server Builder (plans and creates roles and channels), Look & Messages (one look for every embed, custom text and embeds per message), and game server integrations (FiveM, Minecraft, Steam games: Rust, ARK, Valheim, Palworld, CS2 and more: live status, player counts, alerts, and player-count channels)
- **Discord bot basics:** role management, role menus, welcome/goodbye, autoroles, rules, counters, logs, embeds, custom commands, suggestions, starboard

Each feature has its own guide in `docs/` (for example `docs/Tickets.md`). `docs/DiscordFeatureParity.md` lists every command, route, and permission. To add a feature, follow `docs/FeatureDevelopment.md`.

## Many servers, one bot

One Guildhall installation serves any number of Discord servers. Invite the bot with `https://discord.com/oauth2/authorize?client_id=<application ID>&scope=bot%20applications.commands&permissions=8`; slash commands are registered globally once, so they work everywhere the bot is. Each server's owner and Discord administrators get full portal access for that server automatically, and after signing in members pick the server they want to manage. Settings and data are kept per server. `DISCORD_GUILD_ID` is optional and only names the default server shown before a member picks one. See `docs/Hosting.md` ("Adding the bot to more servers").

## Quick Start

1. `pnpm install`
2. `cp .env.example .env` and fill in the Discord values.
3. `pnpm db:start` for the temporary development database (see `docs/DevelopmentDatabase.md`), and set `DATABASE_URL` in `.env`.
4. `pnpm build`, then start the bot (`pnpm --filter @qbox/bot start`) and the API (`pnpm --filter @qbox/api start`).
5. Open `API_PUBLIC_BASE_URL` for the portal. The GitHub Pages preview is described in `apps/web/README.md`.

## Design

Guildhall is built from independent modules that talk through a shared core: a Discord bot, a Fastify API, a framework-free portal, and a PostgreSQL database. See `docs/Architecture.md`.

## Why I built it this way

**The problem.** People who run Discord communities end up stacking several bots for tickets,
moderation, staff and events, each with its own settings and its own view of the data. I wanted
one bot and one web portal that handle all of it for any number of servers, with each server's
data kept separate.

**Trade-offs I made:**

- **PostgreSQL, not SQLite.** The bot and the API are separate processes writing at the same time,
  and permission changes need to be atomic with their audit record. Integration tests run against
  a real PostgreSQL in CI, not a stand-in (`docs/DatabaseDecisionRecord.md`).
- **Each server's data is scoped by its Discord server ID, in one place.** Database access goes
  through repositories that take the server explicitly, instead of every route adding its own
  filter. Who can manage a server is checked against Discord (owner and administrators).
- **Migrations are checked, not trusted.** CI validates the Prisma schema, applies every migration
  to a clean database, and fails if the schema and migrations drift apart.
- **Features are modules.** Each feature (tickets, moderation, levels, and so on) is its own module
  with its own routes, commands and tests, so one can change without touching the others. The cost
  is more structure up front than a single-file bot.
- **No front-end framework in the portal.** It is plain JavaScript served by the API, so there is
  one less build to keep working.

**What I'd change next:**

- Add PostgreSQL row-level security as a second check behind the per-server scoping in code.
- Write a backup and restore runbook for the production database and test a restore.
- Move timed jobs (reminders, giveaways, scheduled messages) out of the bot into the worker
  process, which is only a stub today.
- Keep one lockfile (pnpm) and drop `package-lock.json`.

I build with AI coding tools, and the commit history shows it. I set the design, review the diffs,
and CI has to pass (build, typecheck, migrations, unit and database tests) before anything ships.
