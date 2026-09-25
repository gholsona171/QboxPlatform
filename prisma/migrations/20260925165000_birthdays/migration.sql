-- CreateTable
CREATE TABLE "birthday_settings" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "channel_id" TEXT,
    "message" TEXT NOT NULL,
    "embed_color" TEXT NOT NULL DEFAULT '#F47FFF',
    "role_id" TEXT,
    "announce_hour" INTEGER NOT NULL DEFAULT 9,
    "ping_role_id" TEXT,
    "allow_year" BOOLEAN NOT NULL DEFAULT true,
    "require_confirmation" BOOLEAN NOT NULL DEFAULT false,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "birthday_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "birthdays" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "month" INTEGER NOT NULL,
    "day" INTEGER NOT NULL,
    "year" INTEGER,
    "show_age" BOOLEAN NOT NULL DEFAULT false,
    "time_zone" TEXT NOT NULL DEFAULT 'UTC',
    "last_announced_year" INTEGER,
    "granted_role_id" TEXT,
    "role_remove_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "birthdays_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "birthday_settings_enabled_idx" ON "birthday_settings"("enabled");

-- CreateIndex
CREATE INDEX "birthdays_guild_date_idx" ON "birthdays"("guild_id", "month", "day");

-- CreateIndex
CREATE INDEX "birthdays_role_remove_idx" ON "birthdays"("role_remove_at");

-- CreateIndex
CREATE UNIQUE INDEX "birthdays_guild_user_key" ON "birthdays"("guild_id", "user_id");

