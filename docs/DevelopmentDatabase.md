# Development Database

QboxPlatform uses PostgreSQL through Prisma. Until the Supabase project is set
up, a temporary file-backed database is kept in the repository.

## How it works

- `data/qbox-dev-database.sql` is the committed database file. It is a plain
  PostgreSQL dump (schema, migration history, and data).
- `scripts/dev-database.sh` runs a local PostgreSQL 16+ cluster in
  `.local/postgres` (ignored by Git), loads the SQL file into it, and applies any
  new Prisma migrations.
- Saving writes the current contents back to the SQL file so they can be
  committed and shared.

Data from `browser_sessions`, `oauth_credentials`, and `oauth_transactions` is
never written to the SQL file. Login sessions and Discord tokens stay local.

## Commands

| Command | Effect |
| --- | --- |
| `pnpm db:start` | Create or start the local cluster, load the SQL file, apply migrations, print `DATABASE_URL`. |
| `pnpm db:save` | Write the current database to `data/qbox-dev-database.sql`. |
| `pnpm db:stop` | Save, then stop the cluster. |
| `pnpm db:reset` | Drop the local database and reload it from the SQL file. |

The connection string is `postgresql://qbox@127.0.0.1:5433/qbox_dev`. Set it
as `DATABASE_URL` in your local `.env`.

## Requirements and limits

- Requires PostgreSQL server binaries (`initdb`, `pg_ctl`, `pg_dump`) and Bash.
  The Claude Code cloud environment has them. On Windows, use WSL or point
  `DATABASE_URL` at Supabase.
- Authentication is `trust` on `127.0.0.1` only. Do not expose the port.
- This database is for development and testing. Do not store real member data
  you would not want in the repository.

## Moving to Supabase

1. Create the Supabase project and copy its PostgreSQL connection string.
2. Import the data, if wanted: `psql "<supabase-url>" -f data/qbox-dev-database.sql`.
   Alternatively, run `pnpm --filter @qbox/prisma prisma:migrate:deploy` on an
   empty database.
3. Set `DATABASE_URL` to the Supabase URL (with `sslmode=require`).
