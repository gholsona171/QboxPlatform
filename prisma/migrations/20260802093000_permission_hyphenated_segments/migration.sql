ALTER TABLE "permission_definitions"
  DROP CONSTRAINT "permission_definitions_key_format_check",
  ADD CONSTRAINT "permission_definitions_key_format_check"
    CHECK ("key" ~ '^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$');

ALTER TABLE "permission_audit_events"
  DROP CONSTRAINT "permission_audit_events_permission_check",
  ADD CONSTRAINT "permission_audit_events_permission_check"
    CHECK (("permission_definition_id" IS NULL AND "permission_key" IS NULL) OR ("permission_definition_id" IS NOT NULL AND "permission_key" ~ '^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$'));
