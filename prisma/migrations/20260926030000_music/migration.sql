-- CreateEnum
CREATE TYPE "MusicLoopMode" AS ENUM ('off', 'track', 'queue');

-- CreateEnum
CREATE TYPE "MusicPlayerState" AS ENUM ('idle', 'playing', 'paused', 'buffering');

-- CreateTable
CREATE TABLE "music_settings" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "dj_role_ids" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "default_volume" INTEGER NOT NULL DEFAULT 60,
    "max_queue" INTEGER NOT NULL DEFAULT 100,
    "announce_channel_id" TEXT,
    "now_playing_panel" BOOLEAN NOT NULL DEFAULT true,
    "stay_connected_247" BOOLEAN NOT NULL DEFAULT false,
    "home_channel_id" TEXT,
    "auto_leave_minutes" INTEGER NOT NULL DEFAULT 5,
    "idle_radio_station_id" UUID,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "music_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "music_tracks" (
    "id" UUID NOT NULL,
    "guild_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "artist" TEXT,
    "album" TEXT,
    "track_number" INTEGER,
    "duration_seconds" INTEGER,
    "file_name" TEXT NOT NULL,
    "cover_file_name" TEXT,
    "content_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "sha256" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "uploaded_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_playlists" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "music_playlists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_playlist_tracks" (
    "playlist_id" UUID NOT NULL,
    "position" INTEGER NOT NULL,
    "track_id" UUID NOT NULL,

    CONSTRAINT "music_playlist_tracks_pkey" PRIMARY KEY ("playlist_id","position")
);

-- CreateTable
CREATE TABLE "music_stations" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "favicon_url" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "music_stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "music_sessions" (
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT,
    "text_channel_id" TEXT,
    "panel_channel_id" TEXT,
    "panel_message_id" TEXT,
    "queue" JSONB NOT NULL DEFAULT '[]',
    "index" INTEGER NOT NULL DEFAULT 0,
    "position_seconds" INTEGER NOT NULL DEFAULT 0,
    "state" "MusicPlayerState" NOT NULL DEFAULT 'idle',
    "loop" "MusicLoopMode" NOT NULL DEFAULT 'off',
    "shuffle" BOOLEAN NOT NULL DEFAULT false,
    "volume" INTEGER NOT NULL DEFAULT 60,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "music_sessions_pkey" PRIMARY KEY ("guild_id")
);

-- CreateIndex
CREATE INDEX "music_settings_stay_connected_idx" ON "music_settings"("stay_connected_247", "enabled");

-- CreateIndex
CREATE INDEX "music_tracks_guild_created_idx" ON "music_tracks"("guild_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "music_tracks_guild_hash_key" ON "music_tracks"("guild_id", "sha256");

-- CreateIndex
CREATE INDEX "music_playlists_guild_name_idx" ON "music_playlists"("guild_id", "name");

-- CreateIndex
CREATE INDEX "music_playlist_tracks_track_idx" ON "music_playlist_tracks"("track_id");

-- CreateIndex
CREATE UNIQUE INDEX "music_stations_guild_url_key" ON "music_stations"("guild_id", "url");

-- CreateIndex
CREATE INDEX "music_sessions_state_idx" ON "music_sessions"("state");

-- AddForeignKey
ALTER TABLE "music_playlist_tracks" ADD CONSTRAINT "music_playlist_tracks_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "music_playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "music_playlist_tracks" ADD CONSTRAINT "music_playlist_tracks_track_id_fkey" FOREIGN KEY ("track_id") REFERENCES "music_tracks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

