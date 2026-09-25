# QboxPlatform

## Vision

QboxPlatform is a modular AI-powered management platform built for Discord and FiveM communities.

It is designed around independent modules that communicate through a shared core.

## Initial Goals

- Modular architecture
- AI Knowledge Base
- Ticket System
- Applications
- Moderation
- Staff Management
- FiveM Integration
- Web Dashboard
- Analytics

## Current Status

Working today: the Discord bot (role management, role menus, welcome/goodbye, autoroles, rules, counters, logs, embeds, custom commands, suggestions, starboard, and tickets), the API, and the web portal. See `docs/DiscordFeatureParity.md` for the full feature list and status.

Planned: applications, moderation, staff tools, verification, polls, birthdays, knowledge base, and FiveM integration.

## Quick Start

1. `pnpm install`
2. `cp .env.example .env` and fill in the Discord values.
3. `pnpm db:start` for the temporary development database (see `docs/DevelopmentDatabase.md`), and set `DATABASE_URL` in `.env`.
4. `pnpm build`, then start the bot (`pnpm --filter @qbox/bot start`) and the API (`pnpm --filter @qbox/api start`).
5. Open `API_PUBLIC_BASE_URL` for the portal. The GitHub Pages preview is described in `apps/web/README.md`.