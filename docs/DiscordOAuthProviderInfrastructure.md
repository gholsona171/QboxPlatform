# Discord OAuth Provider Infrastructure

This repository includes Discord OAuth provider infrastructure, but it is not exposed to browser users.

Implemented:

- `apps/api/src/auth/DiscordOAuthConfiguration.ts` validates Discord OAuth client ID, client secret input, redirect URI policy, approved scopes, provider timeout, response-size limit, configured guild ID, API version, prompt policy, token-refresh skew, and explicit PKCE capability.
- `apps/api/src/auth/DiscordOAuthProvider.ts` implements an import-safe native-fetch provider adapter for Discord authorization URL creation, authorization-code exchange, refresh-token exchange, token revocation, current authorization inspection, current identity lookup, and current-user guild-membership lookup.
- `@qbox/authentication` owns transport-independent encrypted OAuth credential lifecycle and Discord guild-membership verification services.
- Provider tokens are encrypted at rest with the existing `OAUTH_ENCRYPTION` key purpose.
- Provider calls run outside PostgreSQL transactions.
- Discord membership-screening pending state is non-authorizing.
- Confirmed guild departure stores `ABSENT` and revokes active browser sessions for the platform account.

Not implemented:

- No login route exists.
- No OAuth callback route exists.
- No cookie is issued.
- No CSRF endpoint exists.
- No authenticated API request actor exists.
- No authorization middleware exists.
- No live Discord OAuth call runs during API startup.

Approved scopes:

- `identify`
- `guilds.members.read`

The implementation deliberately does not request `email`, `connections`, `guilds.join`, `bot`, or `applications.commands`.

PKCE policy:

- Default: `DISABLED_UNVERIFIED`.
- `S256_VERIFIED` must be an explicit configuration decision after controlled provider verification.
- Plain PKCE is forbidden.
- A transaction records its PKCE mode.
- S256 transactions require an encrypted verifier; disabled transactions cannot store a verifier.

Controlled development verification procedure:

1. Register the exact development redirect URI in Discord.
2. Configure a non-production Discord OAuth application with only the approved scopes.
3. Configure `S256_VERIFIED` only for a dedicated test after confirming Discord accepts S256 authorization-code exchange.
4. Generate a one-time OAuth transaction through future operator/test tooling.
5. Build the authorization URL and verify it contains `response_type=code`, the configured client ID, exact redirect URI, approved scopes, state, and, only in S256 mode, `code_challenge_method=S256`.
6. Exchange the returned code once.
7. Verify token response parsing rejects missing or extra-invalid security fields and requires Bearer tokens with the approved scope set.
8. Fetch current authorization and confirm the application/client ID matches configuration.
9. Fetch current identity and confirm the Discord user ID is the only authoritative provider subject.
10. Fetch current membership for the configured guild and confirm `PRESENT`, `ABSENT`, and screening-pending behavior.
11. Refresh the grant and verify refresh-token rotation is persisted through optimistic compare-and-set.
12. Revoke access and refresh tokens best-effort at Discord, then confirm local revocation remains authoritative.

Secrets must not be printed, logged, committed, or stored in documentation.
