CREATE TYPE "RoleMenuPresentationType" AS ENUM ('buttons', 'select-menu', 'reactions');
CREATE TYPE "RoleMenuAssignmentMode" AS ENUM ('toggle', 'add-only', 'remove-only', 'exclusive');
CREATE TYPE "RoleMenuStatus" AS ENUM ('draft', 'published', 'disabled');

CREATE TABLE "role_menus" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "guild_id" UUID NOT NULL,
  "channel_id" TEXT NOT NULL,
  "message_id" TEXT,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "presentation_type" "RoleMenuPresentationType" NOT NULL,
  "assignment_mode" "RoleMenuAssignmentMode" NOT NULL,
  "status" "RoleMenuStatus" NOT NULL DEFAULT 'draft',
  "created_by_discord_user_id" TEXT NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMPTZ(3) NOT NULL,
  CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "role_menus_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "role_menus_channel_snowflake_chk" CHECK ("channel_id" ~ '^[0-9]{17,20}$'),
  CONSTRAINT "role_menus_message_snowflake_chk" CHECK ("message_id" IS NULL OR "message_id" ~ '^[0-9]{17,20}$'),
  CONSTRAINT "role_menus_creator_snowflake_chk" CHECK ("created_by_discord_user_id" ~ '^[0-9]{17,20}$'),
  CONSTRAINT "role_menus_title_length_chk" CHECK (char_length("title") BETWEEN 1 AND 100),
  CONSTRAINT "role_menus_description_length_chk" CHECK ("description" IS NULL OR char_length("description") <= 1000),
  CONSTRAINT "role_menus_published_message_chk" CHECK (("status" <> 'published') OR ("message_id" IS NOT NULL))
);

CREATE TABLE "role_menu_options" (
  "id" UUID NOT NULL DEFAULT gen_random_uuid(),
  "role_menu_id" UUID NOT NULL,
  "role_id" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "description" TEXT,
  "emoji" TEXT,
  "position" INTEGER NOT NULL,
  "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "role_menu_options_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "role_menu_options_role_menu_id_fkey" FOREIGN KEY ("role_menu_id") REFERENCES "role_menus"("id") ON DELETE RESTRICT ON UPDATE RESTRICT,
  CONSTRAINT "role_menu_options_role_snowflake_chk" CHECK ("role_id" ~ '^[0-9]{17,20}$'),
  CONSTRAINT "role_menu_options_label_length_chk" CHECK (char_length("label") BETWEEN 1 AND 80),
  CONSTRAINT "role_menu_options_description_length_chk" CHECK ("description" IS NULL OR char_length("description") <= 100),
  CONSTRAINT "role_menu_options_position_chk" CHECK ("position" >= 0 AND "position" < 25)
);

CREATE INDEX "role_menus_guild_status_idx" ON "role_menus"("guild_id", "status");
CREATE INDEX "role_menus_published_message_idx" ON "role_menus"("guild_id", "channel_id", "message_id");
CREATE UNIQUE INDEX "role_menus_published_message_key" ON "role_menus"("guild_id", "channel_id", "message_id") WHERE "message_id" IS NOT NULL;
CREATE UNIQUE INDEX "role_menu_options_position_key" ON "role_menu_options"("role_menu_id", "position");
CREATE UNIQUE INDEX "role_menu_options_role_key" ON "role_menu_options"("role_menu_id", "role_id");
CREATE INDEX "role_menu_options_role_idx" ON "role_menu_options"("role_id");
