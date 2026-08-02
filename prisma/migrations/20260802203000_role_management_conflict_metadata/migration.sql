ALTER TABLE "role_menus"
  ADD COLUMN "last_operation_source" TEXT NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE "role_menu_options"
  ADD COLUMN "last_operation_source" TEXT NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE "autorole_configs"
  ADD COLUMN "last_operation_source" TEXT NOT NULL DEFAULT 'SYSTEM';

ALTER TABLE "rules_configs"
  ADD COLUMN "last_operation_source" TEXT NOT NULL DEFAULT 'SYSTEM';
