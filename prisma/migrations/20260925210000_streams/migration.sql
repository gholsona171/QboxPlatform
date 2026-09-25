-- CreateEnum
CREATE TYPE "StreamsPlatform" AS ENUM ('twitch', 'kick', 'youtube');

-- CreateEnum
CREATE TYPE "StreamsEndedBehavior" AS ENUM ('keep', 'edit', 'delete');

-- CreateTable
CREATE TABLE "streams_settings" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "default_channel_id" TEXT,
    "ended_behavior" "StreamsEndedBehavior" NOT NULL DEFAULT 'edit',
    "check_interval_seconds" INTEGER NOT NULL DEFAULT 90,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "streams_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "streams_subscriptions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "platform" "StreamsPlatform" NOT NULL,
    "handle" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "avatar_url" TEXT,
    "platform_id" TEXT NOT NULL,
    "announce_channel_id" TEXT,
    "ping_role_id" TEXT,
    "message_text" TEXT,
    "announce_videos" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "last_stream_id" TEXT,
    "live_since" TIMESTAMPTZ(3),
    "last_announcement_channel_id" TEXT,
    "last_announcement_message_id" TEXT,
    "last_video_id" TEXT,
    "last_checked_at" TIMESTAMPTZ(3),
    "offline_streak" INTEGER NOT NULL DEFAULT 0,
    "failure_streak" INTEGER NOT NULL DEFAULT 0,
    "last_error" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "streams_subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "streams_subscriptions_active_idx" ON "streams_subscriptions"("enabled", "guild_id");

-- CreateIndex
CREATE UNIQUE INDEX "streams_subscriptions_guild_creator_key" ON "streams_subscriptions"("guild_id", "platform", "platform_id");

