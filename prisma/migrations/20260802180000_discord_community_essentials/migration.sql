CREATE TYPE "WelcomeGoodbyeKind" AS ENUM ('welcome', 'goodbye');
CREATE TYPE "CommunityCounterType" AS ENUM ('total-members', 'humans', 'bots', 'online', 'role');
CREATE TYPE "CommunityContentMode" AS ENUM ('redacted', 'when-available');
CREATE TYPE "CustomCommandTriggerMode" AS ENUM ('slash-only', 'exact', 'starts-with', 'contains');
CREATE TYPE "SuggestionStatus" AS ENUM ('submitted', 'under-review', 'approved', 'denied', 'implemented');
CREATE TYPE "StarboardChannelMode" AS ENUM ('allowlist', 'denylist');
CREATE TYPE "StarboardNsfwMode" AS ENUM ('allow', 'block');

CREATE TABLE "welcome_goodbye_configs" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "kind" "WelcomeGoodbyeKind" NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "channel_id" TEXT NOT NULL,
  "message_text" TEXT NOT NULL,
  "embed_enabled" BOOLEAN NOT NULL DEFAULT false,
  "embed_title" TEXT,
  "embed_description" TEXT,
  "embed_color" TEXT,
  "thumbnail_avatar" BOOLEAN NOT NULL DEFAULT true,
  "footer" TEXT,
  "direct_message_enabled" BOOLEAN NOT NULL DEFAULT false,
  "image_url" TEXT,
  "role_mention_id" TEXT,
  "delete_after_seconds" INTEGER,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "welcome_goodbye_configs_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "autorole_configs" (
  "guild_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "delay_seconds" INTEGER NOT NULL DEFAULT 0,
  "include_bots" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "autorole_configs_pkey" PRIMARY KEY ("guild_id")
);

CREATE TABLE "autorole_rules" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "role_id" TEXT NOT NULL,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "autorole_rules_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "rules_configs" (
  "guild_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "channel_id" TEXT NOT NULL,
  "message_text" TEXT NOT NULL,
  "button_label" TEXT NOT NULL,
  "accepted_role_id" TEXT NOT NULL,
  "pending_role_id" TEXT,
  "message_id" TEXT,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "rules_configs_pkey" PRIMARY KEY ("guild_id")
);

CREATE TABLE "community_counters" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "channel_id" TEXT NOT NULL,
  "label_template" TEXT NOT NULL,
  "type" "CommunityCounterType" NOT NULL,
  "role_id" TEXT,
  "interval_seconds" INTEGER NOT NULL,
  "last_value" INTEGER,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "community_counters_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "server_log_configs" (
  "guild_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "events" TEXT[] NOT NULL,
  "destinations" JSONB NOT NULL DEFAULT '{}',
  "ignored_channels" TEXT[] NOT NULL,
  "ignored_roles" TEXT[] NOT NULL,
  "ignored_users" TEXT[] NOT NULL,
  "include_bots" BOOLEAN NOT NULL DEFAULT false,
  "content_mode" "CommunityContentMode" NOT NULL DEFAULT 'redacted',
  "colors" JSONB NOT NULL DEFAULT '{}',
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "server_log_configs_pkey" PRIMARY KEY ("guild_id")
);

CREATE TABLE "embed_templates" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "content" TEXT,
  "title" TEXT,
  "description" TEXT,
  "color" TEXT,
  "author" TEXT,
  "thumbnail_url" TEXT,
  "image_url" TEXT,
  "footer" TEXT,
  "timestamp" BOOLEAN NOT NULL DEFAULT false,
  "fields" JSONB NOT NULL DEFAULT '[]',
  "allowed_role_mentions" TEXT[] NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "embed_templates_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "custom_commands" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "response_text" TEXT NOT NULL,
  "embed_template_id" UUID,
  "enabled" BOOLEAN NOT NULL DEFAULT true,
  "allowed_channels" TEXT[] NOT NULL,
  "denied_channels" TEXT[] NOT NULL,
  "required_roles" TEXT[] NOT NULL,
  "cooldown_seconds" INTEGER NOT NULL,
  "trigger_mode" "CustomCommandTriggerMode" NOT NULL,
  "trigger_phrase" TEXT,
  "delete_triggering_message" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "custom_commands_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "suggestions" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "submitter_id" TEXT NOT NULL,
  "content" TEXT NOT NULL,
  "status" "SuggestionStatus" NOT NULL DEFAULT 'submitted',
  "submission_message_id" TEXT,
  "review_message_id" TEXT,
  "result_message_id" TEXT,
  "reviewer_id" TEXT,
  "staff_note" TEXT,
  "upvotes" INTEGER NOT NULL DEFAULT 0,
  "downvotes" INTEGER NOT NULL DEFAULT 0,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "starboard_configs" (
  "guild_id" UUID NOT NULL,
  "enabled" BOOLEAN NOT NULL DEFAULT false,
  "destination_channel_id" TEXT NOT NULL,
  "emoji" TEXT NOT NULL,
  "threshold" INTEGER NOT NULL,
  "allow_self_star" BOOLEAN NOT NULL DEFAULT false,
  "include_bot_messages" BOOLEAN NOT NULL DEFAULT false,
  "nsfw" "StarboardNsfwMode" NOT NULL DEFAULT 'block',
  "mode" "StarboardChannelMode" NOT NULL DEFAULT 'denylist',
  "channels" TEXT[] NOT NULL,
  "ignored_roles" TEXT[] NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "starboard_configs_pkey" PRIMARY KEY ("guild_id")
);

CREATE TABLE "starboard_entries" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "source_channel_id" TEXT NOT NULL,
  "source_message_id" TEXT NOT NULL,
  "destination_message_id" TEXT,
  "author_id" TEXT NOT NULL,
  "star_count" INTEGER NOT NULL,
  "deleted" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "starboard_entries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "welcome_goodbye_configs_guild_kind_key" ON "welcome_goodbye_configs"("guild_id", "kind");
CREATE UNIQUE INDEX "autorole_rules_guild_role_key" ON "autorole_rules"("guild_id", "role_id");
CREATE UNIQUE INDEX "autorole_rules_guild_position_key" ON "autorole_rules"("guild_id", "position");
CREATE INDEX "community_counters_guild_enabled_idx" ON "community_counters"("guild_id", "enabled");
CREATE UNIQUE INDEX "embed_templates_guild_name_key" ON "embed_templates"("guild_id", "name");
CREATE UNIQUE INDEX "custom_commands_guild_name_key" ON "custom_commands"("guild_id", "name");
CREATE INDEX "suggestions_guild_status_idx" ON "suggestions"("guild_id", "status", "created_at");
CREATE UNIQUE INDEX "starboard_entries_source_key" ON "starboard_entries"("guild_id", "source_message_id");
CREATE INDEX "starboard_entries_guild_deleted_idx" ON "starboard_entries"("guild_id", "deleted");

ALTER TABLE "welcome_goodbye_configs" ADD CONSTRAINT "welcome_goodbye_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "autorole_configs" ADD CONSTRAINT "autorole_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "autorole_rules" ADD CONSTRAINT "autorole_rules_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "rules_configs" ADD CONSTRAINT "rules_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "community_counters" ADD CONSTRAINT "community_counters_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "server_log_configs" ADD CONSTRAINT "server_log_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "embed_templates" ADD CONSTRAINT "embed_templates_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "custom_commands" ADD CONSTRAINT "custom_commands_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "suggestions" ADD CONSTRAINT "suggestions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "starboard_configs" ADD CONSTRAINT "starboard_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "starboard_entries" ADD CONSTRAINT "starboard_entries_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
