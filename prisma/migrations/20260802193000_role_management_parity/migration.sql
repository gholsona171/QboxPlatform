ALTER TABLE "role_menus" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "role_menu_options" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "autorole_configs" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "rules_configs" ADD COLUMN "revision" INTEGER NOT NULL DEFAULT 1;

CREATE TABLE "discord_role_audit_events" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "role_id" TEXT,
  "feature" TEXT NOT NULL,
  "operation" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "actor_type" TEXT NOT NULL,
  "actor_id" TEXT NOT NULL,
  "summary" TEXT NOT NULL,
  "result" TEXT NOT NULL,
  "metadata" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "discord_role_audit_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "discord_role_audit_events_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT
);

CREATE INDEX "discord_role_audit_guild_role_created_idx" ON "discord_role_audit_events"("guild_id", "role_id", "created_at");
