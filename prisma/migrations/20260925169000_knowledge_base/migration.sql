-- CreateTable
CREATE TABLE "knowledge_settings" (
    "guild_id" TEXT NOT NULL,
    "auto_answer_enabled" BOOLEAN NOT NULL DEFAULT false,
    "auto_answer_channel_ids" TEXT[],
    "auto_answer_threshold" INTEGER NOT NULL DEFAULT 70,
    "auto_answer_cooldown_seconds" INTEGER NOT NULL DEFAULT 300,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "knowledge_settings_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "knowledge_categories" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "knowledge_articles" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "category_id" UUID,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "tags" TEXT[],
    "published" BOOLEAN NOT NULL DEFAULT false,
    "pinned" BOOLEAN NOT NULL DEFAULT false,
    "views" INTEGER NOT NULL DEFAULT 0,
    "author_id" TEXT NOT NULL,
    "author_name" TEXT NOT NULL,
    "updated_by_id" TEXT,
    "updated_by_name" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "knowledge_categories_guild_order_idx" ON "knowledge_categories"("guild_id", "order");

-- CreateIndex
CREATE INDEX "knowledge_articles_guild_published_idx" ON "knowledge_articles"("guild_id", "published", "updated_at");

-- CreateIndex
CREATE INDEX "knowledge_articles_category_idx" ON "knowledge_articles"("category_id");

-- CreateIndex
CREATE UNIQUE INDEX "knowledge_articles_guild_slug_key" ON "knowledge_articles"("guild_id", "slug");

-- AddForeignKey
ALTER TABLE "knowledge_articles" ADD CONSTRAINT "knowledge_articles_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "knowledge_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

