-- CreateEnum
CREATE TYPE "LevelUpMode" AS ENUM ('current', 'channel', 'dm', 'off');

-- CreateEnum
CREATE TYPE "LevelRewardMode" AS ENUM ('stack', 'highest');

-- CreateTable
CREATE TABLE "level_settings" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "message_xp_min" INTEGER NOT NULL DEFAULT 15,
    "message_xp_max" INTEGER NOT NULL DEFAULT 25,
    "cooldown_seconds" INTEGER NOT NULL DEFAULT 60,
    "voice_xp_per_minute" INTEGER NOT NULL DEFAULT 5,
    "curve_base" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "curve_exponent" DOUBLE PRECISION NOT NULL DEFAULT 2,
    "curve_linear" DOUBLE PRECISION NOT NULL DEFAULT 50,
    "role_multipliers" JSONB NOT NULL DEFAULT '[]',
    "channel_multipliers" JSONB NOT NULL DEFAULT '[]',
    "no_xp_role_ids" TEXT[],
    "no_xp_channel_ids" TEXT[],
    "level_up_mode" "LevelUpMode" NOT NULL DEFAULT 'current',
    "level_up_channel_id" TEXT,
    "level_up_message" TEXT NOT NULL DEFAULT 'GG {user}, you reached level {level}!',
    "rewards" JSONB NOT NULL DEFAULT '[]',
    "reward_mode" "LevelRewardMode" NOT NULL DEFAULT 'stack',
    "remove_rewards_on_reset" BOOLEAN NOT NULL DEFAULT true,
    "max_level" INTEGER NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "level_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "level_members" (
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL DEFAULT '',
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 0,
    "messages" INTEGER NOT NULL DEFAULT 0,
    "voice_minutes" INTEGER NOT NULL DEFAULT 0,
    "last_message_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "level_members_pkey" PRIMARY KEY ("guild_id","user_id")
);

-- CreateIndex
CREATE INDEX "level_members_guild_xp_idx" ON "level_members"("guild_id", "xp" DESC);

