#!/usr/bin/env bash
# Temporary file-backed development database (until Supabase is configured).
#
# Runs a local PostgreSQL cluster in .local/postgres (ignored by Git) and keeps
# the shared database contents in data/qbox-dev-database.sql (committed). The
# SQL file is plain PostgreSQL, so it can also be imported into Supabase.
#
# Usage: scripts/dev-database.sh <start|stop|save|reset|status|url>
#   start   Create/start the cluster, load the SQL file, apply migrations.
#   stop    Save the SQL file, then stop the cluster.
#   save    Write the current contents to the SQL file.
#   reset   Drop the local database and reload it from the SQL file.
#   status  Show whether the cluster is running.
#   url     Print the DATABASE_URL for this database.
#
# Authentication secrets (sessions, OAuth credentials and transactions) are
# never written to the SQL file.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
DATA_DIR="${QBOX_DEV_DB_DIR:-$ROOT/.local/postgres}"
SQL_FILE="${QBOX_DEV_DB_FILE:-$ROOT/data/qbox-dev-database.sql}"
PORT="${QBOX_DEV_DB_PORT:-5433}"
DB_NAME="qbox_dev"
DB_USER="qbox"
URL="postgresql://${DB_USER}@127.0.0.1:${PORT}/${DB_NAME}"
EXCLUDED_DATA=(browser_sessions oauth_credentials oauth_transactions)

pg_bin() {
  if command -v pg_config >/dev/null 2>&1 && [ -x "$(pg_config --bindir)/initdb" ]; then
    pg_config --bindir
    return
  fi
  local candidate
  candidate="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | sort -V | tail -n 1 || true)"
  if [ -z "$candidate" ]; then
    echo "PostgreSQL server binaries were not found. Install PostgreSQL 16+ or use Supabase." >&2
    exit 1
  fi
  echo "$candidate"
}

BIN="$(pg_bin)"

as_owner() {
  if [ "$(id -u)" = "0" ]; then
    runuser -u postgres -- "$@"
  else
    "$@"
  fi
}

running() {
  [ -f "$DATA_DIR/PG_VERSION" ] && as_owner "$BIN/pg_ctl" -D "$DATA_DIR" status >/dev/null 2>&1
}

psql_db() {
  "$BIN/psql" -X -q -v ON_ERROR_STOP=1 "$URL" "$@"
}

save() {
  local args=(--no-owner --no-privileges --clean --if-exists --quote-all-identifiers)
  for table in "${EXCLUDED_DATA[@]}"; do args+=("--exclude-table-data=public.${table}"); done
  mkdir -p "$(dirname "$SQL_FILE")"
  "$BIN/pg_dump" "${args[@]}" "$URL" | grep -v -e '^-- Dumped \(from\|by\)' -e '^\\\(un\)\?restrict ' > "$SQL_FILE.tmp"
  mv "$SQL_FILE.tmp" "$SQL_FILE"
  echo "Saved database to ${SQL_FILE#"$ROOT/"}."
}

migrate() {
  DATABASE_URL="$URL" pnpm --dir "$ROOT" --filter @qbox/prisma prisma:migrate:deploy
}

start() {
  mkdir -p "$DATA_DIR"
  if [ "$(id -u)" = "0" ]; then chown -R postgres "$(dirname "$DATA_DIR")" "$DATA_DIR"; fi
  if [ ! -f "$DATA_DIR/PG_VERSION" ]; then
    as_owner "$BIN/initdb" -D "$DATA_DIR" -U "$DB_USER" --auth=trust --encoding=UTF8 --no-locale >/dev/null
    echo "listen_addresses = '127.0.0.1'" >> "$DATA_DIR/postgresql.conf"
    echo "timezone = 'UTC'" >> "$DATA_DIR/postgresql.conf"
  fi
  if ! running; then
    as_owner "$BIN/pg_ctl" -D "$DATA_DIR" -o "-p $PORT -k /tmp" -l "$DATA_DIR/server.log" -w start >/dev/null
  fi
  if ! "$BIN/psql" -X -tA "postgresql://${DB_USER}@127.0.0.1:${PORT}/postgres" -c "select 1 from pg_database where datname = '$DB_NAME'" | grep -q 1; then
    "$BIN/createdb" -h 127.0.0.1 -p "$PORT" -U "$DB_USER" "$DB_NAME"
    if [ -s "$SQL_FILE" ]; then
      psql_db -f "$SQL_FILE" >/dev/null
      echo "Loaded ${SQL_FILE#"$ROOT/"}."
    fi
  fi
  migrate
  echo "Development database is running."
  echo "DATABASE_URL=$URL"
}

case "${1:-}" in
  start) start ;;
  stop)
    if running; then
      save
      as_owner "$BIN/pg_ctl" -D "$DATA_DIR" -m fast -w stop >/dev/null
    fi
    echo "Development database stopped."
    ;;
  save) save ;;
  reset)
    running || start
    "$BIN/dropdb" -h 127.0.0.1 -p "$PORT" -U "$DB_USER" --if-exists "$DB_NAME"
    start
    ;;
  status) if running; then echo "running ($URL)"; else echo "stopped"; fi ;;
  url) echo "$URL" ;;
  *) sed -n '2,17p' "$0"; exit 1 ;;
esac
