-- CreateEnum
CREATE TYPE "ScheduledMessageType" AS ENUM ('once', 'interval', 'daily', 'weekly', 'monthly');

-- CreateTable
CREATE TABLE "scheduled_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "content" TEXT,
    "embed" JSONB,
    "ping_role_ids" TEXT[],
    "schedule_type" "ScheduledMessageType" NOT NULL,
    "time_zone" TEXT NOT NULL,
    "run_at" TEXT,
    "interval_minutes" INTEGER,
    "time" TEXT,
    "weekdays" INTEGER[],
    "day_of_month" INTEGER,
    "start_date" TEXT,
    "end_date" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "delete_previous" BOOLEAN NOT NULL DEFAULT false,
    "pin" BOOLEAN NOT NULL DEFAULT false,
    "max_runs" INTEGER,
    "run_count" INTEGER NOT NULL DEFAULT 0,
    "last_run_at" TIMESTAMPTZ(3),
    "last_message_id" TEXT,
    "next_run_at" TIMESTAMPTZ(3),
    "created_by_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "scheduled_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scheduled_message_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "message_id" UUID NOT NULL,
    "guild_id" TEXT NOT NULL,
    "success" BOOLEAN NOT NULL,
    "discord_message_id" TEXT,
    "error" TEXT,
    "manual" BOOLEAN NOT NULL DEFAULT false,
    "ran_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheduled_message_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "scheduled_messages_due_idx" ON "scheduled_messages"("enabled", "next_run_at");

-- CreateIndex
CREATE UNIQUE INDEX "scheduled_messages_guild_name_key" ON "scheduled_messages"("guild_id", "name");

-- CreateIndex
CREATE INDEX "scheduled_message_runs_guild_idx" ON "scheduled_message_runs"("guild_id", "ran_at");

-- CreateIndex
CREATE INDEX "scheduled_message_runs_message_idx" ON "scheduled_message_runs"("message_id", "ran_at");

-- AddForeignKey
ALTER TABLE "scheduled_message_runs" ADD CONSTRAINT "scheduled_message_runs_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "scheduled_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

