-- CreateTable
CREATE TABLE "fivem_settings" (
    "guild_id" TEXT NOT NULL,
    "server_address" TEXT,
    "connect_url" TEXT,
    "status_channel_id" TEXT,
    "status_message_id" TEXT,
    "update_interval_seconds" INTEGER NOT NULL DEFAULT 60,
    "alert_channel_id" TEXT,
    "alert_role_id" TEXT,
    "restart_times" TEXT[],
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "restart_warning_minutes" INTEGER[],
    "last_online" BOOLEAN,
    "online_since" TIMESTAMPTZ(3),
    "failure_streak" INTEGER NOT NULL DEFAULT 0,
    "last_polled_at" TIMESTAMPTZ(3),
    "sent_restart_warnings" TEXT[],
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "fivem_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "fivem_status_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "online" BOOLEAN NOT NULL,
    "players" INTEGER NOT NULL,
    "max_players" INTEGER NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fivem_status_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "fivem_status_snapshots_guild_at_idx" ON "fivem_status_snapshots"("guild_id", "at");

