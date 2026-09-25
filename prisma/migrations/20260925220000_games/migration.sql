-- CreateEnum
CREATE TYPE "GamesServerKind" AS ENUM ('minecraft-java', 'minecraft-bedrock', 'steam');

-- CreateTable
CREATE TABLE "games_settings" (
    "guild_id" TEXT NOT NULL,
    "player_count_template" TEXT NOT NULL DEFAULT '🎮 {online}/{max} online',
    "player_count_offline_template" TEXT NOT NULL DEFAULT '🔴 Offline',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "games_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "games_servers" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "GamesServerKind" NOT NULL,
    "address" TEXT NOT NULL,
    "game" TEXT,
    "connect_url" TEXT,
    "status_channel_id" TEXT,
    "status_message_id" TEXT,
    "update_interval_seconds" INTEGER NOT NULL DEFAULT 60,
    "player_count_channel_id" TEXT,
    "alert_channel_id" TEXT,
    "alert_role_id" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_online" BOOLEAN,
    "online_since" TIMESTAMPTZ(3),
    "offline_since" TIMESTAMPTZ(3),
    "failure_streak" INTEGER NOT NULL DEFAULT 0,
    "last_polled_at" TIMESTAMPTZ(3),
    "last_error" TEXT,
    "last_player_count" INTEGER NOT NULL DEFAULT 0,
    "last_max_players" INTEGER NOT NULL DEFAULT 0,
    "last_renamed_at" TIMESTAMPTZ(3),
    "last_channel_name" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "games_servers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games_status_snapshots" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "server_id" UUID NOT NULL,
    "online" BOOLEAN NOT NULL,
    "players" INTEGER NOT NULL,
    "max_players" INTEGER NOT NULL,
    "at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_status_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "games_servers_guild_idx" ON "games_servers"("guild_id");

-- CreateIndex
CREATE INDEX "games_status_snapshots_server_at_idx" ON "games_status_snapshots"("server_id", "at");

-- AddForeignKey
ALTER TABLE "games_status_snapshots" ADD CONSTRAINT "games_status_snapshots_server_id_fkey" FOREIGN KEY ("server_id") REFERENCES "games_servers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

