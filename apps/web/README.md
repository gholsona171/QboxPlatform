# QboxPlatform Web Dashboard

This workspace is the Vercel-deployable public Qbox dashboard.

Vercel project settings:

- Project Name: `qbox-platform`
- Framework Preset: `Other`
- Root Directory: `apps/web`
- Production Branch: `main`
- Build Command: `pnpm build`
- Output Directory: `public`
- Install Command: empty

Required Vercel environment variable:

- `QBOX_API_ORIGIN` - public HTTPS origin of the Qbox VPS API, for example `https://api.example.com`

The browser application uses only same-origin paths:

- `/auth/discord/start`
- `/auth/discord/callback`
- `/auth/logout`
- `/api/v1/me`
- `/api/v1/admin-check`
- `/health/live`
- `/health/ready`

The Vercel function proxy forwards `/api/*`, `/auth/*`, and `/health/*` to
`QBOX_API_ORIGIN`. The browser never receives or calls the VPS API origin
directly.

Static files are served from `apps/web/public`. Feature-page URLs are handled by
client-side routing and direct refreshes return the same application shell.

After Vercel assigns the final production domain, register this Discord OAuth
callback URL in the Discord Developer Portal:

```text
https://<VERCEL_PRODUCTION_DOMAIN>/auth/discord/callback
```

Do not hardcode `qbox-platform.vercel.app` until Vercel confirms that domain.
