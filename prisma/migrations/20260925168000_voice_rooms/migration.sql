-- CreateTable
CREATE TABLE "voice_settings" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "control_panel" BOOLEAN NOT NULL DEFAULT true,
    "allow_claim" BOOLEAN NOT NULL DEFAULT true,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voice_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "voice_hubs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "channel_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name_template" TEXT NOT NULL,
    "user_limit" INTEGER NOT NULL DEFAULT 0,
    "bitrate_kbps" INTEGER NOT NULL DEFAULT 64,
    "private_by_default" BOOLEAN NOT NULL DEFAULT false,
    "delete_delay_seconds" INTEGER NOT NULL DEFAULT 0,
    "allowed_role_ids" TEXT[],
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voice_hubs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voice_rooms" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "hub_id" UUID,
    "channel_id" TEXT NOT NULL,
    "owner_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "locked" BOOLEAN NOT NULL DEFAULT false,
    "hidden" BOOLEAN NOT NULL DEFAULT false,
    "panel_message_id" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "voice_rooms_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "voice_hubs_guild_channel_key" ON "voice_hubs"("guild_id", "channel_id");

-- CreateIndex
CREATE UNIQUE INDEX "voice_rooms_channel_key" ON "voice_rooms"("channel_id");

-- CreateIndex
CREATE INDEX "voice_rooms_guild_owner_idx" ON "voice_rooms"("guild_id", "owner_id");

-- CreateIndex
CREATE INDEX "voice_rooms_hub_idx" ON "voice_rooms"("hub_id");

-- AddForeignKey
ALTER TABLE "voice_rooms" ADD CONSTRAINT "voice_rooms_hub_id_fkey" FOREIGN KEY ("hub_id") REFERENCES "voice_hubs"("id") ON DELETE SET NULL ON UPDATE CASCADE;

