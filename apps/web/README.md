# QboxPlatform Web Portal

Static, framework-free portal in `apps/web/public`. It is hosted in two ways.

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

`.github/workflows/pages.yml` publishes a Demo Mode preview of the portal to
GitHub Pages on every push to `main` that touches `apps/web`.

- In the repository settings, set **Pages > Source** to **GitHub Actions**.
- Optionally set the repository variable `QBOX_LIVE_URL` to the live platform
  URL (`https://...`). The preview's login button and Settings page link there.
- The preview cannot call the API. GitHub Pages only serves static files, so
  live Discord management happens on the live platform link.

Build the preview locally with:

```text
BASE_PATH=/QboxPlatform QBOX_LIVE_URL=https://example.ts.net node scripts/build-pages.mjs _site
```
