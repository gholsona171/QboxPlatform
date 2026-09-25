-- CreateEnum
CREATE TYPE "BuilderRunStatus" AS ENUM ('queued', 'running', 'succeeded', 'failed', 'partial', 'undone');

-- CreateEnum
CREATE TYPE "BuilderRunMode" AS ENUM ('add', 'fresh');

-- CreateEnum
CREATE TYPE "BuilderItemKind" AS ENUM ('role', 'category', 'channel', 'link');

-- CreateEnum
CREATE TYPE "BuilderItemStatus" AS ENUM ('created', 'skipped', 'failed', 'deleted');

-- CreateTable
CREATE TABLE "builder_drafts" (
    "guild_id" TEXT NOT NULL,
    "answers" JSONB NOT NULL,
    "blueprint" JSONB NOT NULL,
    "updated_by_id" TEXT,
    "revision" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "builder_drafts_pkey" PRIMARY KEY ("guild_id")
);

-- CreateTable
CREATE TABLE "builder_runs" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "guild_id" TEXT NOT NULL,
    "status" "BuilderRunStatus" NOT NULL DEFAULT 'queued',
    "mode" "BuilderRunMode" NOT NULL,
    "links" TEXT[],
    "planned" INTEGER NOT NULL DEFAULT 0,
    "done" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "started_by_id" TEXT NOT NULL,
    "started_by_name" TEXT NOT NULL,
    "warnings" TEXT[],
    "error" TEXT,
    "started_at" TIMESTAMPTZ(3),
    "finished_at" TIMESTAMPTZ(3),
    "undone_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "builder_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "builder_run_items" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "run_id" UUID NOT NULL,
    "sequence" SERIAL NOT NULL,
    "kind" "BuilderItemKind" NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "discord_id" TEXT,
    "status" "BuilderItemStatus" NOT NULL,
    "error" TEXT,
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,

    CONSTRAINT "builder_run_items_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "builder_runs_guild_created_idx" ON "builder_runs"("guild_id", "created_at");

-- CreateIndex
CREATE INDEX "builder_runs_status_idx" ON "builder_runs"("status");

-- CreateIndex
CREATE INDEX "builder_run_items_run_sequence_idx" ON "builder_run_items"("run_id", "sequence");

-- AddForeignKey
ALTER TABLE "builder_run_items" ADD CONSTRAINT "builder_run_items_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "builder_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
