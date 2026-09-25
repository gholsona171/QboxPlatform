-- CreateEnum
CREATE TYPE "ApplicationStatus" AS ENUM ('pending', 'accepted', 'denied', 'withdrawn');

-- CreateEnum
CREATE TYPE "ApplicationSource" AS ENUM ('discord', 'web');

-- CreateEnum
CREATE TYPE "ApplicationVoteType" AS ENUM ('up', 'down');

-- CreateEnum
CREATE TYPE "ApplicationButtonStyle" AS ENUM ('primary', 'secondary', 'success', 'danger');

-- CreateTable
CREATE TABLE "application_counters" (
    "guild_id" TEXT NOT NULL,
    "next_number" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "application_counters_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "application_forms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "questions" JSONB NOT NULL DEFAULT '[]',
    "cooldown_days" INTEGER NOT NULL DEFAULT 0,
    "one_pending" BOOLEAN NOT NULL DEFAULT true,
    "required_role_ids" TEXT[],
    "blocked_role_ids" TEXT[],
    "min_account_age_days" INTEGER,
    "review_channel_id" TEXT,
    "reviewer_role_ids" TEXT[],
    "ping_member_ids" TEXT[],
    "accept_role_ids" TEXT[],
    "remove_role_ids" TEXT[],
    "accept_message" TEXT,
    "deny_message" TEXT,
    "discussion_channel_id" TEXT,
    "button_label" TEXT,
    "button_emoji" TEXT,
    "button_style" "ApplicationButtonStyle" NOT NULL DEFAULT 'primary',
    "position" INTEGER NOT NULL DEFAULT 0,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "application_forms_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_panels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#5865F2',
    "form_ids" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "application_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "form_id" UUID,
    "form_name" TEXT NOT NULL,
    "applicant_id" TEXT NOT NULL,
    "applicant_name" TEXT NOT NULL,
    "status" "ApplicationStatus" NOT NULL DEFAULT 'pending',
    "source" "ApplicationSource" NOT NULL DEFAULT 'discord',
    "answers" JSONB NOT NULL DEFAULT '[]',
    "review_channel_id" TEXT,
    "review_message_id" TEXT,
    "thread_id" TEXT,
    "decided_by_id" TEXT,
    "decided_by_name" TEXT,
    "decision_reason" TEXT,
    "decided_at" TIMESTAMPTZ(3),
    "dm_delivered" BOOLEAN,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_votes" (
    "application_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "vote" "ApplicationVoteType" NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_votes_pkey" PRIMARY KEY ("application_id","user_id")
);

-- CreateTable
CREATE TABLE "application_notes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "application_id" UUID NOT NULL,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "application_forms_guild_position_idx" ON "application_forms"("guild_id", "position");

-- CreateIndex
CREATE INDEX "application_panels_guild_idx" ON "application_panels"("guild_id");

-- CreateIndex
CREATE INDEX "applications_guild_status_idx" ON "applications"("guild_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "applications_guild_form_applicant_idx" ON "applications"("guild_id", "form_id", "applicant_id");

-- CreateIndex
CREATE INDEX "applications_guild_applicant_idx" ON "applications"("guild_id", "applicant_id");

-- CreateIndex
CREATE UNIQUE INDEX "applications_guild_number_key" ON "applications"("guild_id", "number");

-- CreateIndex
CREATE INDEX "application_notes_application_idx" ON "application_notes"("application_id", "created_at");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "application_forms"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_votes" ADD CONSTRAINT "application_votes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "application_notes" ADD CONSTRAINT "application_notes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "applications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

