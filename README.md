# Guildhall (code name Qbox)

Guildhall runs your Discord community from one place. Invite the bot, sign in to the portal with Discord, and manage tickets, moderation, verification, staff, levels, giveaways and more for any server you run. It works for any number of Discord servers at once, the way MEE6 or Dyno do.

"Qbox" is the code name. It stays in package names (`@qbox/*`), environment variables (`QBOX_*`), service names (`qbox-api`, `qbox-bot`), and the repository name. The name people see comes from `packages/shared/src/brand.ts` and `apps/web/public/js/brand.js`.

## What it does

Everything below works from both the web portal and Discord:

- **Support:** tickets, applications, knowledge base (`/faq`, automatic answers, optional AI `/ask`)
- **Safety:** moderation (cases, automod, automatic punishments), verification
- **Team:** staff roster, ranks, strikes, leave, and shifts
- **Community:** levels and rewards, giveaways, polls, birthdays, voice rooms, scheduled messages
- **Server:** Server Builder (plans and creates roles and channels), and game server integrations (FiveM, Minecraft, Steam games: Rust, ARK, Valheim, Palworld, CS2 and more — live status, player counts, alerts, and player-count channels)
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
