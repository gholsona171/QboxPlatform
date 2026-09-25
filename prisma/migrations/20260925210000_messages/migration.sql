-- CreateEnum
CREATE TYPE "messages_look_mode" AS ENUM ('fill', 'override');

-- CreateTable
CREATE TABLE "messages_looks" (
    "guild_id" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "accent_color" TEXT,
    "footer_text" TEXT,
    "footer_icon_url" TEXT,
    "author_name" TEXT,
    "author_icon_url" TEXT,
    "thumbnail_url" TEXT,
    "show_timestamp" BOOLEAN NOT NULL DEFAULT false,
    "mode" "messages_look_mode" NOT NULL DEFAULT 'fill',
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "messages_looks_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "messages_templates" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "content" TEXT,
    "embeds" JSONB NOT NULL DEFAULT '[]',
    "updated_by" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "messages_templates_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "messages_templates_guild_key_key" ON "messages_templates"("guild_id", "key");

