-- CreateEnum
CREATE TYPE "TicketMode" AS ENUM ('channel', 'thread');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('open', 'claimed', 'pending', 'closed');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('low', 'normal', 'high', 'urgent');

-- CreateEnum
CREATE TYPE "TicketPanelStyle" AS ENUM ('buttons', 'select-menu');

-- CreateEnum
CREATE TYPE "TicketMessageSource" AS ENUM ('discord', 'web', 'system');

-- CreateEnum
CREATE TYPE "TicketCloseAction" AS ENUM ('archive', 'delete');

-- CreateTable
CREATE TABLE "ticket_settings" (
    "guild_id" UUID NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "mode" "TicketMode" NOT NULL DEFAULT 'channel',
    "open_category_channel_id" TEXT,
    "closed_category_channel_id" TEXT,
    "thread_parent_channel_id" TEXT,
    "transcript_channel_id" TEXT,
    "log_channel_id" TEXT,
    "support_role_ids" TEXT[],
    "ping_support_on_open" BOOLEAN NOT NULL DEFAULT true,
    "max_open_per_user" INTEGER NOT NULL DEFAULT 1,
    "name_template" TEXT NOT NULL DEFAULT 'ticket-{number}',
    "open_message" TEXT NOT NULL DEFAULT 'Thanks for contacting support, {user}. A team member will be with you shortly.',
    "embed_color" TEXT NOT NULL DEFAULT '#5865F2',
    "allow_user_close" BOOLEAN NOT NULL DEFAULT true,
    "require_close_reason" BOOLEAN NOT NULL DEFAULT false,
    "close_confirmation" BOOLEAN NOT NULL DEFAULT true,
    "close_action" "TicketCloseAction" NOT NULL DEFAULT 'archive',
    "delete_delay_seconds" INTEGER NOT NULL DEFAULT 10,
    "claim_enabled" BOOLEAN NOT NULL DEFAULT true,
    "claim_restricts_replies" BOOLEAN NOT NULL DEFAULT false,
    "transcripts_enabled" BOOLEAN NOT NULL DEFAULT true,
    "transcript_dm_user" BOOLEAN NOT NULL DEFAULT false,
    "feedback_enabled" BOOLEAN NOT NULL DEFAULT true,
    "auto_close_hours" INTEGER NOT NULL DEFAULT 0,
    "auto_close_warning_hours" INTEGER NOT NULL DEFAULT 0,
    "auto_close_exclude_claimed" BOOLEAN NOT NULL DEFAULT true,
    "blocked_user_ids" TEXT[],
    "blocked_role_ids" TEXT[],
    "next_number" INTEGER NOT NULL DEFAULT 1,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "last_operation_source" TEXT NOT NULL DEFAULT 'SYSTEM',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ticket_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "ticket_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "emoji" TEXT,
    "button_style" TEXT NOT NULL DEFAULT 'PRIMARY',
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "position" INTEGER NOT NULL DEFAULT 0,
    "support_role_ids" TEXT[],
    "parent_channel_id" TEXT,
    "name_template" TEXT,
    "open_message" TEXT,
    "default_priority" "TicketPriority" NOT NULL DEFAULT 'normal',
    "questions" JSONB NOT NULL DEFAULT '[]',
    "required_role_ids" TEXT[],
    "max_open_per_user" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_panels" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT '#5865F2',
    "style" "TicketPanelStyle" NOT NULL DEFAULT 'buttons',
    "placeholder" TEXT NOT NULL DEFAULT 'Select a ticket type',
    "image_url" TEXT,
    "footer" TEXT,
    "category_ids" TEXT[],
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "ticket_panels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tickets" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" UUID NOT NULL,
    "number" INTEGER NOT NULL,
    "category_id" UUID,
    "opener_id" TEXT NOT NULL,
    "opener_name" TEXT NOT NULL,
    "channel_id" TEXT,
    "subject" TEXT,
    "answers" JSONB NOT NULL DEFAULT '[]',
    "status" "TicketStatus" NOT NULL DEFAULT 'open',
    "priority" "TicketPriority" NOT NULL DEFAULT 'normal',
    "claimed_by_id" TEXT,
    "participant_ids" TEXT[],
    "tags" TEXT[],
    "closed_by_id" TEXT,
    "close_reason" TEXT,
    "rating" INTEGER,
    "feedback" TEXT,
    "transcript_message_id" TEXT,
    "auto_close_warned_at" TIMESTAMPTZ(3),
    "first_response_at" TIMESTAMPTZ(3),
    "last_activity_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_messages" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "discord_message_id" TEXT,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "attachments" TEXT[],
    "source" "TicketMessageSource" NOT NULL DEFAULT 'discord',
    "internal" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ticket_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "ticket_id" UUID NOT NULL,
    "action" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "details" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ticket_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ticket_categories_guild_position_idx" ON "ticket_categories"("guild_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_categories_guild_name_key" ON "ticket_categories"("guild_id", "name");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_panels_guild_name_key" ON "ticket_panels"("guild_id", "name");

-- CreateIndex
CREATE INDEX "tickets_guild_status_activity_idx" ON "tickets"("guild_id", "status", "last_activity_at");

-- CreateIndex
CREATE INDEX "tickets_guild_opener_status_idx" ON "tickets"("guild_id", "opener_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_guild_number_key" ON "tickets"("guild_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_channel_id_key" ON "tickets"("channel_id");

-- CreateIndex
CREATE INDEX "ticket_messages_ticket_created_idx" ON "ticket_messages"("ticket_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "ticket_messages_discord_message_id_key" ON "ticket_messages"("discord_message_id");

-- CreateIndex
CREATE INDEX "ticket_events_ticket_created_idx" ON "ticket_events"("ticket_id", "created_at");

-- AddForeignKey
ALTER TABLE "ticket_settings" ADD CONSTRAINT "ticket_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ticket_categories" ADD CONSTRAINT "ticket_categories_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ticket_panels" ADD CONSTRAINT "ticket_panels_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "tickets" ADD CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "ticket_categories"("id") ON DELETE SET NULL ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ticket_messages" ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "ticket_events" ADD CONSTRAINT "ticket_events_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "tickets"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

