-- AlterTable
ALTER TABLE "ticket_categories" ADD COLUMN     "staff_thread" TEXT NOT NULL DEFAULT 'INHERIT';

-- AlterTable
ALTER TABLE "ticket_settings" ADD COLUMN     "retention_months" INTEGER NOT NULL DEFAULT 12,
ADD COLUMN     "staff_thread_enabled" BOOLEAN NOT NULL DEFAULT true,
ALTER COLUMN "transcript_dm_user" SET DEFAULT true;

-- AlterTable
ALTER TABLE "tickets" ADD COLUMN     "staff_thread_id" TEXT;

-- CreateIndex
CREATE INDEX "tickets_guild_status_closed_idx" ON "tickets"("guild_id", "status", "closed_at");

-- CreateIndex
CREATE UNIQUE INDEX "tickets_staff_thread_id_key" ON "tickets"("staff_thread_id");

