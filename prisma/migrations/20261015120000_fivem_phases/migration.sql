-- AlterTable
ALTER TABLE "fivem_settings" ADD COLUMN     "debug" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "down_after_minutes" INTEGER NOT NULL DEFAULT 3,
ADD COLUMN     "down_alert_sent" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "down_since" TIMESTAMPTZ(3),
ADD COLUMN     "last_message_at" TIMESTAMPTZ(3),
ADD COLUMN     "last_snapshot_at" TIMESTAMPTZ(3),
ADD COLUMN     "phase" TEXT,
ADD COLUMN     "phase_since" TIMESTAMPTZ(3),
ADD COLUMN     "show_player_names" BOOLEAN NOT NULL DEFAULT false;
