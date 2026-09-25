-- CreateEnum
CREATE TYPE "PollStatus" AS ENUM ('open', 'closed');

-- CreateEnum
CREATE TYPE "PollResultsVisibility" AS ENUM ('live', 'after-close');

-- CreateTable
CREATE TABLE "poll_counters" (
    "guild_id" TEXT NOT NULL,
    "next_number" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "poll_counters_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "polls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "options" JSONB NOT NULL,
    "max_choices" INTEGER NOT NULL DEFAULT 1,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "results_visibility" "PollResultsVisibility" NOT NULL DEFAULT 'live',
    "allow_vote_change" BOOLEAN NOT NULL DEFAULT true,
    "allowed_role_ids" TEXT[],
    "channel_id" TEXT NOT NULL,
    "message_id" TEXT,
    "ping_role_id" TEXT,
    "ends_at" TIMESTAMPTZ(3),
    "status" "PollStatus" NOT NULL DEFAULT 'open',
    "created_by_id" TEXT NOT NULL,
    "created_by_name" TEXT NOT NULL,
    "closed_at" TIMESTAMPTZ(3),
    "closed_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "polls_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "poll_votes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "poll_id" UUID NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "option_ids" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "polls_guild_status_idx" ON "polls"("guild_id", "status", "number");

-- CreateIndex
CREATE INDEX "polls_status_ends_idx" ON "polls"("status", "ends_at");

-- CreateIndex
CREATE UNIQUE INDEX "polls_guild_number_key" ON "polls"("guild_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "poll_votes_poll_user_key" ON "poll_votes"("poll_id", "user_id");

-- AddForeignKey
ALTER TABLE "poll_votes" ADD CONSTRAINT "poll_votes_poll_id_fkey" FOREIGN KEY ("poll_id") REFERENCES "polls"("id") ON DELETE CASCADE ON UPDATE CASCADE;

