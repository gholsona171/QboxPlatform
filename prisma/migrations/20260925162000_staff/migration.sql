-- CreateEnum
CREATE TYPE "StaffMemberStatus" AS ENUM ('active', 'loa', 'suspended', 'retired');

-- CreateEnum
CREATE TYPE "StaffRecordType" AS ENUM ('hire', 'promote', 'demote', 'fire', 'loa-start', 'loa-end', 'note', 'strike');

-- CreateEnum
CREATE TYPE "StaffLeaveStatus" AS ENUM ('pending', 'approved', 'active', 'ended', 'denied', 'cancelled');

-- CreateTable
CREATE TABLE "staff_settings" (
    "guild_id" TEXT NOT NULL,
    "log_channel_id" TEXT,
    "roster_channel_id" TEXT,
    "roster_message_id" TEXT,
    "loa_role_id" TEXT,
    "auto_clock_out_hours" INTEGER NOT NULL DEFAULT 12,
    "max_leave_days" INTEGER NOT NULL DEFAULT 60,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "staff_ranks" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role_id" TEXT,
    "color" TEXT NOT NULL DEFAULT '#5865F2',
    "description" TEXT,
    "position" INTEGER NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_ranks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_members" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "rank_id" UUID NOT NULL,
    "callsign" TEXT,
    "joined_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "StaffMemberStatus" NOT NULL DEFAULT 'active',
    "notes" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_records" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "type" "StaffRecordType" NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "reason" TEXT,
    "from_rank" TEXT,
    "to_rank" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_strikes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "actor_id" TEXT NOT NULL,
    "actor_name" TEXT NOT NULL,
    "expires_at" TIMESTAMPTZ(3),
    "revoked_at" TIMESTAMPTZ(3),
    "revoked_by_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_strikes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_leaves" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "starts_at" TIMESTAMPTZ(3) NOT NULL,
    "ends_at" TIMESTAMPTZ(3) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "StaffLeaveStatus" NOT NULL DEFAULT 'pending',
    "reviewer_id" TEXT,
    "reviewer_name" TEXT,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "message_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "staff_leaves_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_shifts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "started_at" TIMESTAMPTZ(3) NOT NULL,
    "ended_at" TIMESTAMPTZ(3),
    "duration_seconds" INTEGER,
    "auto_ended" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "staff_shifts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "staff_ranks_guild_position_idx" ON "staff_ranks"("guild_id", "position");

-- CreateIndex
CREATE UNIQUE INDEX "staff_ranks_guild_name_key" ON "staff_ranks"("guild_id", "name");

-- CreateIndex
CREATE INDEX "staff_members_rank_idx" ON "staff_members"("rank_id");

-- CreateIndex
CREATE UNIQUE INDEX "staff_members_guild_user_key" ON "staff_members"("guild_id", "user_id");

-- CreateIndex
CREATE INDEX "staff_records_guild_user_idx" ON "staff_records"("guild_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "staff_records_guild_created_idx" ON "staff_records"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "staff_strikes_guild_user_idx" ON "staff_strikes"("guild_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "staff_leaves_guild_status_idx" ON "staff_leaves"("guild_id", "status", "starts_at");

-- CreateIndex
CREATE INDEX "staff_leaves_guild_user_idx" ON "staff_leaves"("guild_id", "user_id", "created_at");

-- CreateIndex
CREATE INDEX "staff_leaves_due_idx" ON "staff_leaves"("status", "starts_at", "ends_at");

-- CreateIndex
CREATE INDEX "staff_shifts_guild_user_idx" ON "staff_shifts"("guild_id", "user_id", "started_at");

-- CreateIndex
CREATE INDEX "staff_shifts_guild_started_idx" ON "staff_shifts"("guild_id", "started_at");

-- CreateIndex
CREATE INDEX "staff_shifts_open_idx" ON "staff_shifts"("ended_at");

-- AddForeignKey
ALTER TABLE "staff_members" ADD CONSTRAINT "staff_members_rank_id_fkey" FOREIGN KEY ("rank_id") REFERENCES "staff_ranks"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

