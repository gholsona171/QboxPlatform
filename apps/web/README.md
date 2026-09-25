# QboxPlatform Web Portal

Static, framework-free portal in `apps/web/public`. It only shows live data from your Discord server: visitors who are not signed in see a "Sign in with Discord" screen. It is hosted in two ways.

## Pages

| Page | Contents |
| --- | --- |
| Overview | API status, open tickets, waiting tickets, average rating, links to features |
| Tickets | Inbox, ticket reasons, panels (with a Discord preview), settings, statistics. See `docs/Tickets.md`. |
| Discord Bot | Welcome and goodbye, autoroles, rules, roles, role menus, counters, logs, embeds, custom commands, suggestions, starboard |
| Account | Signed-in Discord account and service health |

## Live platform (served by the Qbox API)

The API serves the portal from its own origin, so login cookies, CSRF cookies,
and the Discord OAuth callback all stay on one host.

- Start the API (`pnpm --filter @qbox/api start`) and open `API_PUBLIC_BASE_URL`.
- The API looks for `apps/web/public/index.html` next to its build output. Set
  `API_PORTAL_DIRECTORY` to use another directory, or `disabled` to turn portal
  hosting off.
- Paths under `/api`, `/auth`, and `/health` are never served as portal pages.
- Unknown page paths (for example `/tickets`) return `index.html` for
  client-side routing.

Share the public API URL (for example the Tailscale Funnel URL) as the live
platform link. Register this Discord OAuth callback in the Discord Developer
Portal:

```text
<API_PUBLIC_BASE_URL>/auth/discord/callback
```

## GitHub Pages preview

`.github/workflows/pages.yml` publishes the portal to GitHub Pages on every
push to `main` that touches `apps/web`. The Pages copy cannot reach the API, so
it only shows the sign-in screen and a link to the live platform.

- In the repository settings, set **Pages > Source** to **GitHub Actions**.
- Set the repository variable `QBOX_LIVE_URL` to the live platform URL
  (`https://...`). The sign-in button on the Pages site links there.

Build the preview locally with:

```text
BASE_PATH=/QboxPlatform QBOX_LIVE_URL=https://example.ts.net node scripts/build-pages.mjs _site
```
