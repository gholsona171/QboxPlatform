ALTER TABLE "guilds" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';
ALTER TABLE "permission_principals" ADD COLUMN "metadata" JSONB NOT NULL DEFAULT '{}';

ALTER TABLE "guilds" ADD CONSTRAINT "guilds_metadata_object_check" CHECK (jsonb_typeof("metadata") = 'object');
ALTER TABLE "permission_principals" ADD CONSTRAINT "permission_principals_metadata_object_check" CHECK (jsonb_typeof("metadata") = 'object');
