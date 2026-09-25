-- CreateEnum
CREATE TYPE "VerificationMode" AS ENUM ('button', 'captcha', 'question');

-- CreateEnum
CREATE TYPE "VerificationAgeAction" AS ENUM ('deny', 'kick', 'flag');

-- CreateEnum
CREATE TYPE "VerificationAttemptResult" AS ENUM ('passed', 'failed', 'denied-age', 'kicked', 'manual', 'revoked');

-- CreateEnum
CREATE TYPE "VerificationAttemptSource" AS ENUM ('discord', 'web', 'automatic');

-- CreateTable
CREATE TABLE "verification_settings" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" "VerificationMode" NOT NULL DEFAULT 'button',
    "verified_role_ids" TEXT[],
    "unverified_role_id" TEXT,
    "channel_id" TEXT,
    "panel_title" TEXT NOT NULL,
    "panel_description" TEXT NOT NULL,
    "panel_color" TEXT NOT NULL DEFAULT '#5865F2',
    "panel_button_label" TEXT NOT NULL DEFAULT 'Verify',
    "panel_channel_id" TEXT,
    "panel_message_id" TEXT,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "log_channel_id" TEXT,
    "min_account_age_days" INTEGER NOT NULL DEFAULT 0,
    "age_action" "VerificationAgeAction" NOT NULL DEFAULT 'deny',
    "kick_unverified_minutes" INTEGER NOT NULL DEFAULT 0,
    "max_attempts" INTEGER NOT NULL DEFAULT 3,
    "cooldown_minutes" INTEGER NOT NULL DEFAULT 10,
    "dm_on_success" BOOLEAN NOT NULL DEFAULT false,
    "success_message" TEXT,
    "welcome_channel_id" TEXT,
    "welcome_message" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "verification_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "verification_attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "result" "VerificationAttemptResult" NOT NULL,
    "reason" TEXT,
    "staff_id" TEXT,
    "staff_name" TEXT,
    "source" "VerificationAttemptSource" NOT NULL DEFAULT 'discord',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_pending_members" (
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "joined_at" TIMESTAMPTZ(3) NOT NULL,
    "flagged" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "verification_pending_members_pkey" PRIMARY KEY ("guild_id","user_id")
);

-- CreateIndex
CREATE INDEX "verification_settings_kick_idx" ON "verification_settings"("enabled", "kick_unverified_minutes");

-- CreateIndex
CREATE INDEX "verification_attempts_guild_created_idx" ON "verification_attempts"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "verification_attempts_guild_user_idx" ON "verification_attempts"("guild_id", "user_id", "result", "created_at");

-- CreateIndex
CREATE INDEX "verification_attempts_guild_result_idx" ON "verification_attempts"("guild_id", "result", "created_at");

-- CreateIndex
CREATE INDEX "verification_pending_members_guild_joined_idx" ON "verification_pending_members"("guild_id", "joined_at");

