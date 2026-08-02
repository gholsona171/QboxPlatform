-- Additive authentication foundation for PostgreSQL.
-- This migration creates no accounts, identities, sessions, credentials, or grants.

CREATE TYPE "PlatformUserStatus" AS ENUM ('active', 'suspended', 'disabled', 'deleted');
CREATE TYPE "PlatformUserStatusReasonCode" AS ENUM ('account-created', 'user-request', 'administrator-action', 'security-response', 'recovery', 'identity-unlinked', 'account-merged');
CREATE TYPE "AuthenticationProvider" AS ENUM ('discord');
CREATE TYPE "BrowserSessionStatus" AS ENUM ('active', 'revoked', 'expired', 'rotated');
CREATE TYPE "BrowserSessionRevocationReason" AS ENUM ('logout', 'global-logout', 'account-status-changed', 'authentication-revision-changed', 'identity-unlinked', 'guild-departure', 'security-response', 'session-limit', 'rotated', 'expired');
CREATE TYPE "OAuthTransactionState" AS ENUM ('pending', 'claimed', 'completed', 'failed', 'cancelled', 'expired');
CREATE TYPE "OAuthTransactionPurpose" AS ENUM ('login', 'link', 'reauthenticate');
CREATE TYPE "OAuthTransactionFailureReason" AS ENUM ('provider-rejected', 'invalid-callback', 'state-mismatch', 'browser-binding-mismatch', 'pkce-mismatch', 'identity-conflict', 'dependency-unavailable', 'cancelled-by-user', 'expired');
CREATE TYPE "OAuthCredentialRevocationReason" AS ENUM ('identity-unlinked', 'account-disabled', 'provider-revoked', 'security-response', 'refresh-failed');
CREATE TYPE "DiscordGuildMembershipStatus" AS ENUM ('present', 'absent', 'unknown');
CREATE TYPE "DiscordGuildMembershipSource" AS ENUM ('discord-bot', 'discord-oauth', 'combined');
CREATE TYPE "AuthenticationAuditAction" AS ENUM ('login-start', 'login-success', 'login-failure', 'oauth-claim', 'oauth-completion', 'oauth-rejection', 'oauth-replay', 'session-creation', 'session-rotation', 'session-expiry', 'session-revocation', 'logout', 'global-logout', 'identity-link', 'identity-unlink', 'account-status-change', 'guild-departure', 'guild-rejoin', 'recovery');
CREATE TYPE "AuthenticationAuditOutcome" AS ENUM ('success', 'failure', 'rejected');
CREATE TYPE "AuthenticationAuditReasonCode" AS ENUM ('requested', 'completed', 'invalid-credential', 'invalid-state', 'expired', 'revoked', 'replay-detected', 'provider-rejected', 'dependency-unavailable', 'account-unavailable', 'identity-conflict', 'guild-membership-changed', 'administrator-action', 'security-response', 'user-action', 'recovery', 'system-maintenance');
CREATE TYPE "AuthenticationAuditActorType" AS ENUM ('platform-user', 'service');

CREATE TABLE "platform_users" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "status" "PlatformUserStatus" NOT NULL DEFAULT 'active',
    "authentication_revision" INTEGER NOT NULL DEFAULT 1,
    "status_reason_code" "PlatformUserStatusReasonCode" NOT NULL DEFAULT 'account-created',
    "suspended_at" TIMESTAMPTZ(3),
    "disabled_at" TIMESTAMPTZ(3),
    "deleted_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "platform_users_authentication_revision_check" CHECK ("authentication_revision" > 0),
    CONSTRAINT "platform_users_status_timestamps_check" CHECK (
      ("status" = 'active' AND "suspended_at" IS NULL AND "disabled_at" IS NULL AND "deleted_at" IS NULL) OR
      ("status" = 'suspended' AND "suspended_at" IS NOT NULL AND "disabled_at" IS NULL AND "deleted_at" IS NULL) OR
      ("status" = 'disabled' AND "suspended_at" IS NULL AND "disabled_at" IS NOT NULL AND "deleted_at" IS NULL) OR
      ("status" = 'deleted' AND "suspended_at" IS NULL AND "disabled_at" IS NULL AND "deleted_at" IS NOT NULL)
    ),
    CONSTRAINT "platform_users_lifecycle_order_check" CHECK (
      "updated_at" >= "created_at" AND
      ("suspended_at" IS NULL OR "suspended_at" >= "created_at") AND
      ("disabled_at" IS NULL OR "disabled_at" >= "created_at") AND
      ("deleted_at" IS NULL OR "deleted_at" >= "created_at")
    )
);

CREATE TABLE "external_identities" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "platform_user_id" UUID NOT NULL,
    "provider" "AuthenticationProvider" NOT NULL,
    "provider_subject_id" TEXT NOT NULL,
    "username" TEXT,
    "global_name" TEXT,
    "avatar" TEXT,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "linked_at" TIMESTAMPTZ(3) NOT NULL,
    "verified_at" TIMESTAMPTZ(3) NOT NULL,
    "last_provider_refresh_at" TIMESTAMPTZ(3),
    "unlinked_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "external_identities_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "external_identities_discord_subject_check" CHECK ("provider" <> 'discord' OR "provider_subject_id" ~ '^[1-9][0-9]{16,19}$'),
    CONSTRAINT "external_identities_enabled_unlinked_check" CHECK (("enabled" AND "unlinked_at" IS NULL) OR (NOT "enabled" AND "unlinked_at" IS NOT NULL)),
    CONSTRAINT "external_identities_lifecycle_order_check" CHECK (
      "linked_at" >= "created_at" AND "verified_at" >= "linked_at" AND "updated_at" >= "created_at" AND
      ("last_provider_refresh_at" IS NULL OR "last_provider_refresh_at" >= "verified_at") AND
      ("unlinked_at" IS NULL OR "unlinked_at" >= "linked_at")
    ),
    CONSTRAINT "external_identities_profile_bounds_check" CHECK (
      ("username" IS NULL OR (length("username") <= 80 AND "username" !~ '[[:cntrl:]]')) AND
      ("global_name" IS NULL OR (length("global_name") <= 80 AND "global_name" !~ '[[:cntrl:]]')) AND
      ("avatar" IS NULL OR (length("avatar") <= 512 AND "avatar" !~ '[[:cntrl:]]'))
    )
);

CREATE TABLE "browser_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "platform_user_id" UUID NOT NULL,
    "login_identity_id" UUID NOT NULL,
    "token_digest" CHAR(64) NOT NULL,
    "token_key_version" INTEGER NOT NULL,
    "csrf_digest" CHAR(64) NOT NULL,
    "csrf_key_version" INTEGER NOT NULL,
    "authentication_revision_at_issue" INTEGER NOT NULL,
    "authenticated_at" TIMESTAMPTZ(3) NOT NULL,
    "last_seen_at" TIMESTAMPTZ(3) NOT NULL,
    "idle_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "absolute_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "status" "BrowserSessionStatus" NOT NULL DEFAULT 'active',
    "revoked_at" TIMESTAMPTZ(3),
    "revocation_reason" "BrowserSessionRevocationReason",
    "rotated_from_session_id" UUID,
    "ip_hmac" CHAR(64),
    "user_agent_hmac" CHAR(64),
    "device_hmac" CHAR(64),
    "metadata_key_version" INTEGER,
    "device_label" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "browser_sessions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "browser_sessions_digest_format_check" CHECK (
      "token_digest" ~ '^[0-9a-f]{64}$' AND "csrf_digest" ~ '^[0-9a-f]{64}$' AND
      ("ip_hmac" IS NULL OR "ip_hmac" ~ '^[0-9a-f]{64}$') AND
      ("user_agent_hmac" IS NULL OR "user_agent_hmac" ~ '^[0-9a-f]{64}$') AND
      ("device_hmac" IS NULL OR "device_hmac" ~ '^[0-9a-f]{64}$')
    ),
    CONSTRAINT "browser_sessions_key_versions_check" CHECK ("token_key_version" > 0 AND "csrf_key_version" > 0 AND "authentication_revision_at_issue" > 0),
    CONSTRAINT "browser_sessions_metadata_key_check" CHECK (
      (("ip_hmac" IS NULL AND "user_agent_hmac" IS NULL AND "device_hmac" IS NULL) AND "metadata_key_version" IS NULL) OR
      (("ip_hmac" IS NOT NULL OR "user_agent_hmac" IS NOT NULL OR "device_hmac" IS NOT NULL) AND "metadata_key_version" > 0)
    ),
    CONSTRAINT "browser_sessions_expiry_order_check" CHECK (
      "authenticated_at" >= "created_at" AND "last_seen_at" >= "authenticated_at" AND
      "idle_expires_at" > "last_seen_at" AND "absolute_expires_at" >= "idle_expires_at" AND "updated_at" >= "created_at"
    ),
    CONSTRAINT "browser_sessions_revocation_state_check" CHECK (
      ("status" = 'active' AND "revoked_at" IS NULL AND "revocation_reason" IS NULL) OR
      ("status" <> 'active' AND "revoked_at" IS NOT NULL AND "revoked_at" >= "created_at" AND "revocation_reason" IS NOT NULL)
    ),
    CONSTRAINT "browser_sessions_terminal_reason_check" CHECK (
      ("status" <> 'rotated' OR "revocation_reason" = 'rotated') AND
      ("status" <> 'expired' OR "revocation_reason" = 'expired')
    ),
    CONSTRAINT "browser_sessions_device_label_check" CHECK ("device_label" IS NULL OR (length("device_label") BETWEEN 1 AND 120 AND "device_label" !~ '[[:cntrl:]]')),
    CONSTRAINT "browser_sessions_rotation_self_check" CHECK ("rotated_from_session_id" IS NULL OR "rotated_from_session_id" <> "id")
);

CREATE TABLE "oauth_transactions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "provider" "AuthenticationProvider" NOT NULL,
    "purpose" "OAuthTransactionPurpose" NOT NULL,
    "state" "OAuthTransactionState" NOT NULL DEFAULT 'pending',
    "state_digest" CHAR(64) NOT NULL,
    "browser_binding_digest" CHAR(64) NOT NULL,
    "platform_user_id" UUID,
    "initiating_session_id" UUID,
    "redirect_key" TEXT NOT NULL,
    "return_target_key" TEXT NOT NULL,
    "pkce_ciphertext" BYTEA,
    "pkce_nonce" BYTEA,
    "pkce_authentication_tag" BYTEA,
    "pkce_key_version" INTEGER,
    "expires_at" TIMESTAMPTZ(3) NOT NULL,
    "claimed_at" TIMESTAMPTZ(3),
    "claim_expires_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),
    "failed_at" TIMESTAMPTZ(3),
    "cancelled_at" TIMESTAMPTZ(3),
    "expired_at" TIMESTAMPTZ(3),
    "failure_reason" "OAuthTransactionFailureReason",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "oauth_transactions_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "oauth_transactions_digest_format_check" CHECK ("state_digest" ~ '^[0-9a-f]{64}$' AND "browser_binding_digest" ~ '^[0-9a-f]{64}$'),
    CONSTRAINT "oauth_transactions_configuration_keys_check" CHECK ("redirect_key" ~ '^[a-z][a-z0-9-]{0,63}$' AND "return_target_key" ~ '^[a-z][a-z0-9-]{0,63}$'),
    CONSTRAINT "oauth_transactions_purpose_binding_check" CHECK (
      ("purpose" = 'login' AND "initiating_session_id" IS NULL) OR
      ("purpose" IN ('link', 'reauthenticate') AND "platform_user_id" IS NOT NULL AND "initiating_session_id" IS NOT NULL)
    ),
    CONSTRAINT "oauth_transactions_pkce_fields_check" CHECK (
      ("pkce_ciphertext" IS NULL AND "pkce_nonce" IS NULL AND "pkce_authentication_tag" IS NULL AND "pkce_key_version" IS NULL) OR
      (octet_length("pkce_ciphertext") > 0 AND octet_length("pkce_nonce") = 12 AND octet_length("pkce_authentication_tag") = 16 AND "pkce_key_version" > 0)
    ),
    CONSTRAINT "oauth_transactions_lifecycle_order_check" CHECK (
      "expires_at" > "created_at" AND "updated_at" >= "created_at" AND
      ("claimed_at" IS NULL OR "claimed_at" >= "created_at") AND
      (("claimed_at" IS NULL AND "claim_expires_at" IS NULL) OR ("claimed_at" IS NOT NULL AND "claim_expires_at" > "claimed_at")) AND
      ("completed_at" IS NULL OR "completed_at" >= "claimed_at") AND
      ("failed_at" IS NULL OR "failed_at" >= "claimed_at") AND
      ("cancelled_at" IS NULL OR "cancelled_at" >= "created_at") AND
      ("expired_at" IS NULL OR "expired_at" >= "expires_at")
    ),
    CONSTRAINT "oauth_transactions_state_timestamps_check" CHECK (
      ("state" = 'pending' AND "claimed_at" IS NULL AND "claim_expires_at" IS NULL AND "completed_at" IS NULL AND "failed_at" IS NULL AND "cancelled_at" IS NULL AND "expired_at" IS NULL AND "failure_reason" IS NULL) OR
      ("state" = 'claimed' AND "claimed_at" IS NOT NULL AND "claim_expires_at" IS NOT NULL AND "completed_at" IS NULL AND "failed_at" IS NULL AND "cancelled_at" IS NULL AND "expired_at" IS NULL AND "failure_reason" IS NULL) OR
      ("state" = 'completed' AND "claimed_at" IS NOT NULL AND "claim_expires_at" IS NOT NULL AND "completed_at" IS NOT NULL AND "failed_at" IS NULL AND "cancelled_at" IS NULL AND "expired_at" IS NULL AND "failure_reason" IS NULL) OR
      ("state" = 'failed' AND "claimed_at" IS NOT NULL AND "claim_expires_at" IS NOT NULL AND "completed_at" IS NULL AND "failed_at" IS NOT NULL AND "cancelled_at" IS NULL AND "expired_at" IS NULL AND "failure_reason" IS NOT NULL AND "failure_reason" NOT IN ('cancelled-by-user', 'expired')) OR
      ("state" = 'cancelled' AND "completed_at" IS NULL AND "failed_at" IS NULL AND "cancelled_at" IS NOT NULL AND "expired_at" IS NULL AND "failure_reason" = 'cancelled-by-user') OR
      ("state" = 'expired' AND "completed_at" IS NULL AND "failed_at" IS NULL AND "cancelled_at" IS NULL AND "expired_at" IS NOT NULL AND "failure_reason" = 'expired')
    )
);

CREATE TABLE "oauth_credentials" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "external_identity_id" UUID NOT NULL,
    "provider" "AuthenticationProvider" NOT NULL,
    "access_token_ciphertext" BYTEA NOT NULL,
    "access_token_nonce" BYTEA NOT NULL,
    "access_token_authentication_tag" BYTEA NOT NULL,
    "access_token_key_version" INTEGER NOT NULL,
    "refresh_token_ciphertext" BYTEA NOT NULL,
    "refresh_token_nonce" BYTEA NOT NULL,
    "refresh_token_authentication_tag" BYTEA NOT NULL,
    "refresh_token_key_version" INTEGER NOT NULL,
    "scopes" TEXT[] NOT NULL,
    "provider_expires_at" TIMESTAMPTZ(3) NOT NULL,
    "refresh_version" INTEGER NOT NULL DEFAULT 1,
    "revoked_at" TIMESTAMPTZ(3),
    "revocation_reason" "OAuthCredentialRevocationReason",
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "oauth_credentials_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "oauth_credentials_encryption_metadata_check" CHECK (
      octet_length("access_token_ciphertext") > 0 AND octet_length("access_token_nonce") = 12 AND octet_length("access_token_authentication_tag") = 16 AND "access_token_key_version" > 0 AND
      octet_length("refresh_token_ciphertext") > 0 AND octet_length("refresh_token_nonce") = 12 AND octet_length("refresh_token_authentication_tag") = 16 AND "refresh_token_key_version" > 0
    ),
    CONSTRAINT "oauth_credentials_refresh_version_check" CHECK ("refresh_version" > 0),
    CONSTRAINT "oauth_credentials_expiry_check" CHECK ("provider_expires_at" > "created_at" AND "updated_at" >= "created_at"),
    CONSTRAINT "oauth_credentials_revocation_check" CHECK (("revoked_at" IS NULL AND "revocation_reason" IS NULL) OR ("revoked_at" >= "created_at" AND "revocation_reason" IS NOT NULL))
);

CREATE TABLE "discord_guild_memberships" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "external_identity_id" UUID NOT NULL,
    "guild_id" UUID NOT NULL,
    "status" "DiscordGuildMembershipStatus" NOT NULL DEFAULT 'unknown',
    "source" "DiscordGuildMembershipSource" NOT NULL,
    "verified_at" TIMESTAMPTZ(3),
    "valid_until" TIMESTAMPTZ(3),
    "departed_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    CONSTRAINT "discord_guild_memberships_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "discord_guild_memberships_status_timestamps_check" CHECK (
      ("status" = 'present' AND "verified_at" IS NOT NULL AND "valid_until" > "verified_at" AND "departed_at" IS NULL) OR
      ("status" = 'absent' AND "verified_at" IS NOT NULL AND "valid_until" IS NULL AND "departed_at" >= "verified_at") OR
      ("status" = 'unknown' AND "verified_at" IS NULL AND "valid_until" IS NULL AND "departed_at" IS NULL)
    ),
    CONSTRAINT "discord_guild_memberships_lifecycle_order_check" CHECK ("updated_at" >= "created_at")
);

CREATE TABLE "discord_guild_membership_roles" (
    "membership_id" UUID NOT NULL,
    "role_id" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "discord_guild_membership_roles_pkey" PRIMARY KEY ("membership_id", "role_id"),
    CONSTRAINT "discord_guild_membership_roles_snowflake_check" CHECK ("role_id" ~ '^[1-9][0-9]{16,19}$')
);

CREATE TABLE "authentication_audit_events" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "action" "AuthenticationAuditAction" NOT NULL,
    "outcome" "AuthenticationAuditOutcome" NOT NULL,
    "reason_code" "AuthenticationAuditReasonCode" NOT NULL,
    "request_id" UUID,
    "correlation_id" UUID NOT NULL,
    "actor_type" "AuthenticationAuditActorType",
    "actor_platform_user_id" UUID,
    "actor_service_identity_id" UUID,
    "target_platform_user_id" UUID,
    "target_external_identity_id" UUID,
    "target_browser_session_id" UUID,
    "target_oauth_transaction_id" UUID,
    "target_oauth_credential_id" UUID,
    "target_guild_membership_id" UUID,
    "provider" "AuthenticationProvider",
    "purpose" "OAuthTransactionPurpose",
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "ip_hmac" CHAR(64),
    "user_agent_hmac" CHAR(64),
    "device_hmac" CHAR(64),
    "metadata_key_version" INTEGER,
    "occurred_at" TIMESTAMPTZ(3) NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "authentication_audit_events_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "authentication_audit_events_actor_check" CHECK (
      ("actor_type" IS NULL AND "actor_platform_user_id" IS NULL AND "actor_service_identity_id" IS NULL) OR
      ("actor_type" = 'platform-user' AND "actor_platform_user_id" IS NOT NULL AND "actor_service_identity_id" IS NULL) OR
      ("actor_type" = 'service' AND "actor_platform_user_id" IS NULL AND "actor_service_identity_id" IS NOT NULL)
    ),
    CONSTRAINT "authentication_audit_events_hmac_format_check" CHECK (
      ("ip_hmac" IS NULL OR "ip_hmac" ~ '^[0-9a-f]{64}$') AND
      ("user_agent_hmac" IS NULL OR "user_agent_hmac" ~ '^[0-9a-f]{64}$') AND
      ("device_hmac" IS NULL OR "device_hmac" ~ '^[0-9a-f]{64}$')
    ),
    CONSTRAINT "authentication_audit_events_metadata_key_check" CHECK (
      (("ip_hmac" IS NULL AND "user_agent_hmac" IS NULL AND "device_hmac" IS NULL) AND "metadata_key_version" IS NULL) OR
      (("ip_hmac" IS NOT NULL OR "user_agent_hmac" IS NOT NULL OR "device_hmac" IS NOT NULL) AND "metadata_key_version" > 0)
    ),
    CONSTRAINT "authentication_audit_events_time_check" CHECK ("created_at" >= "occurred_at")
);

CREATE UNIQUE INDEX "external_identities_provider_subject_key" ON "external_identities"("provider", "provider_subject_id");
CREATE UNIQUE INDEX "external_identities_user_provider_key" ON "external_identities"("platform_user_id", "provider");
CREATE INDEX "external_identities_user_enabled_idx" ON "external_identities"("platform_user_id", "enabled");
CREATE INDEX "platform_users_status_idx" ON "platform_users"("status");
CREATE UNIQUE INDEX "browser_sessions_token_digest_key" ON "browser_sessions"("token_digest");
CREATE UNIQUE INDEX "browser_sessions_csrf_digest_key" ON "browser_sessions"("csrf_digest");
CREATE UNIQUE INDEX "browser_sessions_rotated_from_key" ON "browser_sessions"("rotated_from_session_id");
CREATE INDEX "browser_sessions_user_status_idx" ON "browser_sessions"("platform_user_id", "status");
CREATE INDEX "browser_sessions_idle_expiry_idx" ON "browser_sessions"("idle_expires_at");
CREATE INDEX "browser_sessions_absolute_expiry_idx" ON "browser_sessions"("absolute_expires_at");
CREATE INDEX "browser_sessions_auth_revision_idx" ON "browser_sessions"("authentication_revision_at_issue");
CREATE UNIQUE INDEX "oauth_transactions_state_digest_key" ON "oauth_transactions"("state_digest");
CREATE UNIQUE INDEX "oauth_transactions_browser_binding_digest_key" ON "oauth_transactions"("browser_binding_digest");
CREATE INDEX "oauth_transactions_state_expiry_idx" ON "oauth_transactions"("state", "expires_at");
CREATE INDEX "oauth_transactions_user_purpose_idx" ON "oauth_transactions"("platform_user_id", "purpose");
CREATE UNIQUE INDEX "oauth_credentials_external_identity_key" ON "oauth_credentials"("external_identity_id");
CREATE INDEX "oauth_credentials_provider_expiry_idx" ON "oauth_credentials"("provider_expires_at");
CREATE UNIQUE INDEX "discord_guild_memberships_identity_guild_key" ON "discord_guild_memberships"("external_identity_id", "guild_id");
CREATE INDEX "discord_guild_memberships_guild_status_idx" ON "discord_guild_memberships"("guild_id", "status", "valid_until");
CREATE INDEX "discord_guild_membership_roles_role_idx" ON "discord_guild_membership_roles"("role_id");
CREATE INDEX "authentication_audit_events_correlation_idx" ON "authentication_audit_events"("correlation_id");
CREATE INDEX "authentication_audit_events_actor_time_idx" ON "authentication_audit_events"("actor_platform_user_id", "occurred_at");
CREATE INDEX "authentication_audit_events_target_user_time_idx" ON "authentication_audit_events"("target_platform_user_id", "occurred_at");
CREATE INDEX "authentication_audit_events_action_time_idx" ON "authentication_audit_events"("action", "occurred_at");

ALTER TABLE "external_identities" ADD CONSTRAINT "external_identities_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "browser_sessions" ADD CONSTRAINT "browser_sessions_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "browser_sessions" ADD CONSTRAINT "browser_sessions_login_identity_id_fkey" FOREIGN KEY ("login_identity_id") REFERENCES "external_identities"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "browser_sessions" ADD CONSTRAINT "browser_sessions_rotated_from_session_id_fkey" FOREIGN KEY ("rotated_from_session_id") REFERENCES "browser_sessions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "oauth_transactions" ADD CONSTRAINT "oauth_transactions_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "platform_users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "oauth_transactions" ADD CONSTRAINT "oauth_transactions_initiating_session_id_fkey" FOREIGN KEY ("initiating_session_id") REFERENCES "browser_sessions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "oauth_credentials" ADD CONSTRAINT "oauth_credentials_external_identity_id_fkey" FOREIGN KEY ("external_identity_id") REFERENCES "external_identities"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "discord_guild_memberships" ADD CONSTRAINT "discord_guild_memberships_external_identity_id_fkey" FOREIGN KEY ("external_identity_id") REFERENCES "external_identities"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "discord_guild_memberships" ADD CONSTRAINT "discord_guild_memberships_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "guilds"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "discord_guild_membership_roles" ADD CONSTRAINT "discord_guild_membership_roles_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "discord_guild_memberships"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_actor_platform_user_id_fkey" FOREIGN KEY ("actor_platform_user_id") REFERENCES "platform_users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_target_platform_user_id_fkey" FOREIGN KEY ("target_platform_user_id") REFERENCES "platform_users"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_target_external_identity_id_fkey" FOREIGN KEY ("target_external_identity_id") REFERENCES "external_identities"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_target_browser_session_id_fkey" FOREIGN KEY ("target_browser_session_id") REFERENCES "browser_sessions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_target_oauth_transaction_id_fkey" FOREIGN KEY ("target_oauth_transaction_id") REFERENCES "oauth_transactions"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_target_oauth_credential_id_fkey" FOREIGN KEY ("target_oauth_credential_id") REFERENCES "oauth_credentials"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_target_guild_membership_id_fkey" FOREIGN KEY ("target_guild_membership_id") REFERENCES "discord_guild_memberships"("id") ON DELETE RESTRICT ON UPDATE RESTRICT;

CREATE FUNCTION prevent_authentication_identity_change() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW."id" IS DISTINCT FROM OLD."id" OR NEW."created_at" IS DISTINCT FROM OLD."created_at" THEN
        RAISE EXCEPTION 'authentication record id and created_at are immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "platform_users_identity_immutable" BEFORE UPDATE ON "platform_users" FOR EACH ROW EXECUTE FUNCTION prevent_authentication_identity_change();
CREATE TRIGGER "external_identities_identity_immutable" BEFORE UPDATE ON "external_identities" FOR EACH ROW EXECUTE FUNCTION prevent_authentication_identity_change();
CREATE TRIGGER "browser_sessions_identity_immutable" BEFORE UPDATE ON "browser_sessions" FOR EACH ROW EXECUTE FUNCTION prevent_authentication_identity_change();
CREATE TRIGGER "oauth_transactions_identity_immutable" BEFORE UPDATE ON "oauth_transactions" FOR EACH ROW EXECUTE FUNCTION prevent_authentication_identity_change();
CREATE TRIGGER "oauth_credentials_identity_immutable" BEFORE UPDATE ON "oauth_credentials" FOR EACH ROW EXECUTE FUNCTION prevent_authentication_identity_change();
CREATE TRIGGER "discord_guild_memberships_identity_immutable" BEFORE UPDATE ON "discord_guild_memberships" FOR EACH ROW EXECUTE FUNCTION prevent_authentication_identity_change();

CREATE FUNCTION enforce_external_identity_immutability() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW."platform_user_id" IS DISTINCT FROM OLD."platform_user_id" OR NEW."provider" IS DISTINCT FROM OLD."provider" OR NEW."provider_subject_id" IS DISTINCT FROM OLD."provider_subject_id" OR NEW."linked_at" IS DISTINCT FROM OLD."linked_at" THEN
        RAISE EXCEPTION 'external identity ownership is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "external_identities_ownership_immutable" BEFORE UPDATE ON "external_identities" FOR EACH ROW EXECUTE FUNCTION enforce_external_identity_immutability();

CREATE FUNCTION enforce_browser_session_identity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE identity_owner UUID;
DECLARE predecessor_owner UUID;
DECLARE predecessor_status "BrowserSessionStatus";
DECLARE predecessor_reason "BrowserSessionRevocationReason";
DECLARE predecessor_revoked_at TIMESTAMPTZ(3);
BEGIN
    SELECT "platform_user_id" INTO identity_owner FROM "external_identities" WHERE "id" = NEW."login_identity_id";
    IF identity_owner IS DISTINCT FROM NEW."platform_user_id" THEN
        RAISE EXCEPTION 'browser session login identity must belong to the platform user' USING ERRCODE = '23514';
    END IF;
    IF NEW."rotated_from_session_id" IS NOT NULL THEN
        SELECT "platform_user_id", "status", "revocation_reason", "revoked_at"
          INTO predecessor_owner, predecessor_status, predecessor_reason, predecessor_revoked_at
          FROM "browser_sessions" WHERE "id" = NEW."rotated_from_session_id";
        IF predecessor_owner IS DISTINCT FROM NEW."platform_user_id" OR predecessor_status <> 'rotated' OR predecessor_reason <> 'rotated' OR NEW."created_at" < predecessor_revoked_at THEN
            RAISE EXCEPTION 'browser session rotation predecessor is invalid' USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "browser_sessions_identity_guard" BEFORE INSERT OR UPDATE ON "browser_sessions" FOR EACH ROW EXECUTE FUNCTION enforce_browser_session_identity();

CREATE FUNCTION enforce_oauth_transaction_transition() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW."provider" IS DISTINCT FROM OLD."provider" OR NEW."purpose" IS DISTINCT FROM OLD."purpose" OR NEW."state_digest" IS DISTINCT FROM OLD."state_digest" OR NEW."browser_binding_digest" IS DISTINCT FROM OLD."browser_binding_digest" OR NEW."platform_user_id" IS DISTINCT FROM OLD."platform_user_id" OR NEW."initiating_session_id" IS DISTINCT FROM OLD."initiating_session_id" OR NEW."redirect_key" IS DISTINCT FROM OLD."redirect_key" OR NEW."return_target_key" IS DISTINCT FROM OLD."return_target_key" OR NEW."expires_at" IS DISTINCT FROM OLD."expires_at" OR NEW."pkce_ciphertext" IS DISTINCT FROM OLD."pkce_ciphertext" OR NEW."pkce_nonce" IS DISTINCT FROM OLD."pkce_nonce" OR NEW."pkce_authentication_tag" IS DISTINCT FROM OLD."pkce_authentication_tag" OR NEW."pkce_key_version" IS DISTINCT FROM OLD."pkce_key_version" THEN
        RAISE EXCEPTION 'OAuth transaction security fields are immutable' USING ERRCODE = '23514';
    END IF;
    IF OLD."state" IN ('completed', 'failed', 'cancelled', 'expired') AND NEW."state" IS DISTINCT FROM OLD."state" THEN
        RAISE EXCEPTION 'terminal OAuth transaction cannot transition' USING ERRCODE = '55000';
    END IF;
    IF OLD."state" = 'pending' AND NEW."state" NOT IN ('pending', 'claimed', 'cancelled', 'expired') THEN
        RAISE EXCEPTION 'invalid pending OAuth transaction transition' USING ERRCODE = '55000';
    END IF;
    IF OLD."state" = 'claimed' AND NEW."state" NOT IN ('claimed', 'completed', 'failed', 'cancelled', 'expired') THEN
        RAISE EXCEPTION 'invalid claimed OAuth transaction transition' USING ERRCODE = '55000';
    END IF;
    IF OLD."state" = 'claimed' AND NEW."state" = 'claimed' AND (NEW."claimed_at" IS DISTINCT FROM OLD."claimed_at" OR NEW."claim_expires_at" IS DISTINCT FROM OLD."claim_expires_at") AND OLD."claim_expires_at" > CURRENT_TIMESTAMP THEN
        RAISE EXCEPTION 'OAuth transaction already has an active claim' USING ERRCODE = '55P03';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "oauth_transactions_transition_guard" BEFORE UPDATE ON "oauth_transactions" FOR EACH ROW EXECUTE FUNCTION enforce_oauth_transaction_transition();

CREATE FUNCTION enforce_oauth_transaction_binding() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE session_owner UUID;
BEGIN
    IF NEW."initiating_session_id" IS NOT NULL THEN
        SELECT "platform_user_id" INTO session_owner FROM "browser_sessions" WHERE "id" = NEW."initiating_session_id";
        IF session_owner IS DISTINCT FROM NEW."platform_user_id" THEN
            RAISE EXCEPTION 'OAuth initiating session must belong to the platform user' USING ERRCODE = '23514';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "oauth_transactions_binding_guard" BEFORE INSERT OR UPDATE ON "oauth_transactions" FOR EACH ROW EXECUTE FUNCTION enforce_oauth_transaction_binding();

CREATE FUNCTION enforce_oauth_credential_immutability() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    IF NEW."external_identity_id" IS DISTINCT FROM OLD."external_identity_id" OR NEW."provider" IS DISTINCT FROM OLD."provider" THEN
        RAISE EXCEPTION 'OAuth credential ownership is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "oauth_credentials_ownership_immutable" BEFORE UPDATE ON "oauth_credentials" FOR EACH ROW EXECUTE FUNCTION enforce_oauth_credential_immutability();

CREATE FUNCTION authentication_scopes_are_normalized(scopes TEXT[]) RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
    SELECT cardinality(scopes) > 0
       AND scopes = ARRAY(SELECT scope FROM unnest(scopes) AS scope ORDER BY scope)
       AND cardinality(scopes) = cardinality(ARRAY(SELECT DISTINCT scope FROM unnest(scopes) AS scope))
       AND NOT EXISTS (SELECT 1 FROM unnest(scopes) AS scope WHERE scope !~ '^[a-z][a-z0-9._-]{0,63}$');
$$;

ALTER TABLE "oauth_credentials" ADD CONSTRAINT "oauth_credentials_scopes_normalized_check" CHECK (authentication_scopes_are_normalized("scopes"));

CREATE FUNCTION enforce_membership_identity_provider() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE identity_provider "AuthenticationProvider";
DECLARE guild_external_id TEXT;
BEGIN
    SELECT "provider" INTO identity_provider FROM "external_identities" WHERE "id" = NEW."external_identity_id";
    IF identity_provider IS DISTINCT FROM 'discord' THEN
        RAISE EXCEPTION 'Discord membership requires a Discord external identity' USING ERRCODE = '23514';
    END IF;
    SELECT "discord_guild_id" INTO guild_external_id FROM "guilds" WHERE "id" = NEW."guild_id";
    IF guild_external_id !~ '^[1-9][0-9]{16,19}$' THEN
        RAISE EXCEPTION 'Discord membership requires a valid Discord guild snowflake' USING ERRCODE = '23514';
    END IF;
    IF TG_OP = 'UPDATE' AND NEW."status" <> 'present' AND EXISTS (SELECT 1 FROM "discord_guild_membership_roles" WHERE "membership_id" = NEW."id") THEN
        RAISE EXCEPTION 'non-present Discord membership cannot retain roles' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "discord_guild_memberships_provider_guard" BEFORE INSERT OR UPDATE ON "discord_guild_memberships" FOR EACH ROW EXECUTE FUNCTION enforce_membership_identity_provider();

CREATE FUNCTION enforce_membership_role_integrity() RETURNS trigger LANGUAGE plpgsql AS $$
DECLARE membership_status "DiscordGuildMembershipStatus";
BEGIN
    IF TG_OP = 'UPDATE' AND (NEW."membership_id" IS DISTINCT FROM OLD."membership_id" OR NEW."role_id" IS DISTINCT FROM OLD."role_id" OR NEW."created_at" IS DISTINCT FROM OLD."created_at") THEN
        RAISE EXCEPTION 'Discord membership role identity is immutable' USING ERRCODE = '23514';
    END IF;
    SELECT "status" INTO membership_status FROM "discord_guild_memberships" WHERE "id" = NEW."membership_id";
    IF membership_status IS DISTINCT FROM 'present' THEN
        RAISE EXCEPTION 'only present Discord memberships may contain roles' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER "discord_guild_membership_roles_integrity_guard" BEFORE INSERT OR UPDATE ON "discord_guild_membership_roles" FOR EACH ROW EXECUTE FUNCTION enforce_membership_role_integrity();

CREATE FUNCTION authentication_audit_metadata_is_safe(metadata JSONB) RETURNS BOOLEAN LANGUAGE sql IMMUTABLE AS $$
    SELECT jsonb_typeof(metadata) = 'object'
       AND (SELECT count(*) <= 20 FROM jsonb_each(metadata))
       AND NOT EXISTS (
         SELECT 1 FROM jsonb_each(metadata) AS entry
         WHERE entry.key !~ '^[a-z][a-z0-9]*(?:[._-][a-z0-9]+)*$'
            OR length(entry.key) > 64
            OR entry.key ~* '(authorization|cookie|password|secret|token|digest|oauth[._-]?(code|state)|pkce|request[._-]?body)'
            OR jsonb_typeof(entry.value) NOT IN ('string', 'number', 'boolean', 'null')
            OR (jsonb_typeof(entry.value) = 'string' AND (length(entry.value #>> '{}') > 256 OR (entry.value #>> '{}') ~ '[[:cntrl:]]'))
       );
$$;

ALTER TABLE "authentication_audit_events" ADD CONSTRAINT "authentication_audit_events_metadata_safe_check" CHECK (authentication_audit_metadata_is_safe("metadata"));

CREATE FUNCTION reject_authentication_audit_mutation() RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
    RAISE EXCEPTION 'authentication audit events are append-only' USING ERRCODE = '55000';
END;
$$;

CREATE TRIGGER "authentication_audit_events_append_only" BEFORE UPDATE OR DELETE ON "authentication_audit_events" FOR EACH ROW EXECUTE FUNCTION reject_authentication_audit_mutation();
