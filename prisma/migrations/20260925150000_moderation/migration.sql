-- CreateEnum
CREATE TYPE "ModerationCaseType" AS ENUM ('warn', 'timeout', 'untimeout', 'kick', 'ban', 'unban', 'softban', 'note');

-- CreateEnum
CREATE TYPE "ModerationCaseSource" AS ENUM ('discord', 'web', 'automod', 'external');

-- CreateTable
CREATE TABLE "moderation_settings" (
    "guild_id" TEXT NOT NULL,
    "log_channel_id" TEXT,
    "dm_on_action" BOOLEAN NOT NULL DEFAULT true,
    "dm_include_moderator" BOOLEAN NOT NULL DEFAULT false,
    "appeal_message" TEXT,
    "require_reason" BOOLEAN NOT NULL DEFAULT false,
    "default_timeout_minutes" INTEGER NOT NULL DEFAULT 60,
    "ban_delete_message_hours" INTEGER NOT NULL DEFAULT 0,
    "warning_expiry_days" INTEGER NOT NULL DEFAULT 0,
    "protected_role_ids" TEXT[],
    "escalation" JSONB NOT NULL DEFAULT '[]',
    "automod" JSONB NOT NULL DEFAULT '{}',
    "record_external_actions" BOOLEAN NOT NULL DEFAULT true,
    "next_case_number" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "moderation_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "moderation_cases" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "type" "ModerationCaseType" NOT NULL,
    "target_id" TEXT NOT NULL,
    "target_name" TEXT NOT NULL,
    "moderator_id" TEXT NOT NULL,
    "moderator_name" TEXT NOT NULL,
    "reason" TEXT,
    "duration_minutes" INTEGER,
    "expires_at" TIMESTAMPTZ(3),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "source" "ModerationCaseSource" NOT NULL DEFAULT 'discord',
    "evidence" TEXT[],
    "dm_delivered" BOOLEAN,
    "log_message_id" TEXT,
    "revoked_at" TIMESTAMPTZ(3),
    "revoked_by_id" TEXT,
    "revoke_reason" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "moderation_cases_guild_target_idx" ON "moderation_cases"("guild_id", "target_id", "created_at");

-- CreateIndex
CREATE INDEX "moderation_cases_guild_type_active_idx" ON "moderation_cases"("guild_id", "type", "active", "expires_at");

-- CreateIndex
CREATE INDEX "moderation_cases_guild_created_idx" ON "moderation_cases"("guild_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "moderation_cases_guild_number_key" ON "moderation_cases"("guild_id", "number");

