-- CreateEnum
CREATE TYPE "GiveawayStatus" AS ENUM ('running', 'paused', 'ended', 'cancelled');

-- CreateTable
CREATE TABLE "giveaway_counters" (
    "guild_id" TEXT NOT NULL,
    "next_number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "giveaway_counters_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "giveaways" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "prize" TEXT NOT NULL,
    "description" TEXT,
    "winner_count" INTEGER NOT NULL DEFAULT 1,
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "host_id" TEXT NOT NULL,
    "required_role_ids" TEXT[],
    "blocked_role_ids" TEXT[],
    "min_account_age_days" INTEGER NOT NULL DEFAULT 0,
    "min_server_days" INTEGER NOT NULL DEFAULT 0,
    "bonus_entries" JSONB NOT NULL DEFAULT '[]',
    "ping_role_id" TEXT,
    "dm_winners" BOOLEAN NOT NULL DEFAULT true,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "paused_at" TIMESTAMPTZ(3),
    "status" "GiveawayStatus" NOT NULL DEFAULT 'running',
    "winner_ids" TEXT[],
    "ended_at" TIMESTAMPTZ(3),
    "ended_by_id" TEXT,
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "giveaway_entries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "giveaway_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "entries" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "giveaway_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "giveaways_guild_status_idx" ON "giveaways"("guild_id", "status", "number");

-- CreateIndex
CREATE INDEX "giveaways_status_ends_idx" ON "giveaways"("status", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "giveaways_guild_number_key" ON "giveaways"("guild_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "giveaway_entries_giveaway_user_key" ON "giveaway_entries"("giveaway_id", "user_id");

-- AddForeignKey
ALTER TABLE "giveaway_entries" ADD CONSTRAINT "giveaway_entries_giveaway_id_fkey" FOREIGN KEY ("giveaway_id") REFERENCES "giveaways"("id") ON DELETE CASCADE ON UPDATE CASCADE;

