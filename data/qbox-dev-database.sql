--
-- PostgreSQL database dump
--



SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE IF EXISTS ONLY "public"."welcome_goodbye_configs" DROP CONSTRAINT IF EXISTS "welcome_goodbye_configs_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."tickets" DROP CONSTRAINT IF EXISTS "tickets_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."tickets" DROP CONSTRAINT IF EXISTS "tickets_category_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_settings" DROP CONSTRAINT IF EXISTS "ticket_settings_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_panels" DROP CONSTRAINT IF EXISTS "ticket_panels_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_messages" DROP CONSTRAINT IF EXISTS "ticket_messages_ticket_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_events" DROP CONSTRAINT IF EXISTS "ticket_events_ticket_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_categories" DROP CONSTRAINT IF EXISTS "ticket_categories_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."suggestions" DROP CONSTRAINT IF EXISTS "suggestions_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."starboard_entries" DROP CONSTRAINT IF EXISTS "starboard_entries_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."starboard_configs" DROP CONSTRAINT IF EXISTS "starboard_configs_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."server_log_configs" DROP CONSTRAINT IF EXISTS "server_log_configs_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."rules_configs" DROP CONSTRAINT IF EXISTS "rules_configs_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."role_menus" DROP CONSTRAINT IF EXISTS "role_menus_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."role_menu_options" DROP CONSTRAINT IF EXISTS "role_menu_options_role_menu_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_principals" DROP CONSTRAINT IF EXISTS "permission_principals_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_target_principal_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_scope_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_permission_definition_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_assignment_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_actor_principal_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_assignments" DROP CONSTRAINT IF EXISTS "permission_assignments_principal_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_assignments" DROP CONSTRAINT IF EXISTS "permission_assignments_permission_definition_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_assignments" DROP CONSTRAINT IF EXISTS "permission_assignments_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_transactions" DROP CONSTRAINT IF EXISTS "oauth_transactions_platform_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_transactions" DROP CONSTRAINT IF EXISTS "oauth_transactions_initiating_session_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_credentials" DROP CONSTRAINT IF EXISTS "oauth_credentials_external_identity_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."external_identities" DROP CONSTRAINT IF EXISTS "external_identities_platform_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."embed_templates" DROP CONSTRAINT IF EXISTS "embed_templates_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_role_audit_events" DROP CONSTRAINT IF EXISTS "discord_role_audit_events_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_memberships" DROP CONSTRAINT IF EXISTS "discord_guild_memberships_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_memberships" DROP CONSTRAINT IF EXISTS "discord_guild_memberships_external_identity_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_membership_roles" DROP CONSTRAINT IF EXISTS "discord_guild_membership_roles_membership_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."custom_commands" DROP CONSTRAINT IF EXISTS "custom_commands_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."community_counters" DROP CONSTRAINT IF EXISTS "community_counters_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."browser_sessions" DROP CONSTRAINT IF EXISTS "browser_sessions_rotated_from_session_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."browser_sessions" DROP CONSTRAINT IF EXISTS "browser_sessions_platform_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."browser_sessions" DROP CONSTRAINT IF EXISTS "browser_sessions_login_identity_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."autorole_rules" DROP CONSTRAINT IF EXISTS "autorole_rules_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."autorole_configs" DROP CONSTRAINT IF EXISTS "autorole_configs_guild_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_platform_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_oauth_transaction_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_oauth_credential_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_guild_membership_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_external_identity_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_browser_session_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_actor_platform_user_id_fkey";
DROP TRIGGER IF EXISTS "platform_users_identity_immutable" ON "public"."platform_users";
DROP TRIGGER IF EXISTS "permission_principals_created_at_immutable" ON "public"."permission_principals";
DROP TRIGGER IF EXISTS "permission_definitions_created_at_immutable" ON "public"."permission_definitions";
DROP TRIGGER IF EXISTS "permission_catalog_state_created_at_immutable" ON "public"."permission_catalog_state";
DROP TRIGGER IF EXISTS "permission_audit_events_append_only" ON "public"."permission_audit_events";
DROP TRIGGER IF EXISTS "permission_assignments_guild_guard" ON "public"."permission_assignments";
DROP TRIGGER IF EXISTS "permission_assignments_created_at_immutable" ON "public"."permission_assignments";
DROP TRIGGER IF EXISTS "oauth_transactions_transition_guard" ON "public"."oauth_transactions";
DROP TRIGGER IF EXISTS "oauth_transactions_identity_immutable" ON "public"."oauth_transactions";
DROP TRIGGER IF EXISTS "oauth_transactions_binding_guard" ON "public"."oauth_transactions";
DROP TRIGGER IF EXISTS "oauth_credentials_ownership_immutable" ON "public"."oauth_credentials";
DROP TRIGGER IF EXISTS "oauth_credentials_identity_immutable" ON "public"."oauth_credentials";
DROP TRIGGER IF EXISTS "guilds_created_at_immutable" ON "public"."guilds";
DROP TRIGGER IF EXISTS "external_identities_ownership_immutable" ON "public"."external_identities";
DROP TRIGGER IF EXISTS "external_identities_identity_immutable" ON "public"."external_identities";
DROP TRIGGER IF EXISTS "discord_guild_memberships_provider_guard" ON "public"."discord_guild_memberships";
DROP TRIGGER IF EXISTS "discord_guild_memberships_identity_immutable" ON "public"."discord_guild_memberships";
DROP TRIGGER IF EXISTS "discord_guild_membership_roles_integrity_guard" ON "public"."discord_guild_membership_roles";
DROP TRIGGER IF EXISTS "browser_sessions_identity_immutable" ON "public"."browser_sessions";
DROP TRIGGER IF EXISTS "browser_sessions_identity_guard" ON "public"."browser_sessions";
DROP TRIGGER IF EXISTS "authentication_audit_events_append_only" ON "public"."authentication_audit_events";
DROP INDEX IF EXISTS "public"."welcome_goodbye_configs_guild_kind_key";
DROP INDEX IF EXISTS "public"."tickets_guild_status_activity_idx";
DROP INDEX IF EXISTS "public"."tickets_guild_opener_status_idx";
DROP INDEX IF EXISTS "public"."tickets_guild_number_key";
DROP INDEX IF EXISTS "public"."tickets_channel_id_key";
DROP INDEX IF EXISTS "public"."ticket_panels_guild_name_key";
DROP INDEX IF EXISTS "public"."ticket_messages_ticket_created_idx";
DROP INDEX IF EXISTS "public"."ticket_messages_discord_message_id_key";
DROP INDEX IF EXISTS "public"."ticket_events_ticket_created_idx";
DROP INDEX IF EXISTS "public"."ticket_categories_guild_position_idx";
DROP INDEX IF EXISTS "public"."ticket_categories_guild_name_key";
DROP INDEX IF EXISTS "public"."suggestions_guild_status_idx";
DROP INDEX IF EXISTS "public"."starboard_entries_source_key";
DROP INDEX IF EXISTS "public"."starboard_entries_guild_deleted_idx";
DROP INDEX IF EXISTS "public"."role_menus_published_message_key";
DROP INDEX IF EXISTS "public"."role_menus_published_message_idx";
DROP INDEX IF EXISTS "public"."role_menus_guild_status_idx";
DROP INDEX IF EXISTS "public"."role_menu_options_role_key";
DROP INDEX IF EXISTS "public"."role_menu_options_role_idx";
DROP INDEX IF EXISTS "public"."role_menu_options_position_key";
DROP INDEX IF EXISTS "public"."platform_users_status_idx";
DROP INDEX IF EXISTS "public"."permission_principals_identity_key";
DROP INDEX IF EXISTS "public"."permission_principals_guild_enabled_idx";
DROP INDEX IF EXISTS "public"."permission_definitions_key_key";
DROP INDEX IF EXISTS "public"."permission_definitions_enabled_idx";
DROP INDEX IF EXISTS "public"."permission_audit_events_target_idx";
DROP INDEX IF EXISTS "public"."permission_audit_events_scope_time_idx";
DROP INDEX IF EXISTS "public"."permission_audit_events_permission_idx";
DROP INDEX IF EXISTS "public"."permission_audit_events_correlation_idx";
DROP INDEX IF EXISTS "public"."permission_audit_events_assignment_idx";
DROP INDEX IF EXISTS "public"."permission_audit_events_actor_idx";
DROP INDEX IF EXISTS "public"."permission_assignments_permission_idx";
DROP INDEX IF EXISTS "public"."permission_assignments_lookup_idx";
DROP INDEX IF EXISTS "public"."permission_assignments_guild_idx";
DROP INDEX IF EXISTS "public"."permission_assignments_active_platform_key";
DROP INDEX IF EXISTS "public"."permission_assignments_active_guild_key";
DROP INDEX IF EXISTS "public"."oauth_transactions_user_purpose_idx";
DROP INDEX IF EXISTS "public"."oauth_transactions_state_expiry_idx";
DROP INDEX IF EXISTS "public"."oauth_transactions_state_digest_key";
DROP INDEX IF EXISTS "public"."oauth_transactions_browser_binding_digest_key";
DROP INDEX IF EXISTS "public"."oauth_credentials_provider_expiry_idx";
DROP INDEX IF EXISTS "public"."oauth_credentials_external_identity_key";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_type_active_idx";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_target_idx";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_number_key";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_created_idx";
DROP INDEX IF EXISTS "public"."guild_discord_guild_id_key";
DROP INDEX IF EXISTS "public"."external_identities_user_provider_key";
DROP INDEX IF EXISTS "public"."external_identities_user_enabled_idx";
DROP INDEX IF EXISTS "public"."external_identities_provider_subject_key";
DROP INDEX IF EXISTS "public"."embed_templates_guild_name_key";
DROP INDEX IF EXISTS "public"."discord_role_audit_guild_role_created_idx";
DROP INDEX IF EXISTS "public"."discord_guild_memberships_identity_guild_key";
DROP INDEX IF EXISTS "public"."discord_guild_memberships_guild_status_idx";
DROP INDEX IF EXISTS "public"."discord_guild_membership_roles_role_idx";
DROP INDEX IF EXISTS "public"."custom_commands_guild_name_key";
DROP INDEX IF EXISTS "public"."community_counters_guild_enabled_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_user_status_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_token_digest_key";
DROP INDEX IF EXISTS "public"."browser_sessions_rotated_from_key";
DROP INDEX IF EXISTS "public"."browser_sessions_idle_expiry_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_csrf_digest_key";
DROP INDEX IF EXISTS "public"."browser_sessions_auth_revision_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_absolute_expiry_idx";
DROP INDEX IF EXISTS "public"."autorole_rules_guild_role_key";
DROP INDEX IF EXISTS "public"."autorole_rules_guild_position_key";
DROP INDEX IF EXISTS "public"."authentication_audit_events_target_user_time_idx";
DROP INDEX IF EXISTS "public"."authentication_audit_events_correlation_idx";
DROP INDEX IF EXISTS "public"."authentication_audit_events_actor_time_idx";
DROP INDEX IF EXISTS "public"."authentication_audit_events_action_time_idx";
ALTER TABLE IF EXISTS ONLY "public"."welcome_goodbye_configs" DROP CONSTRAINT IF EXISTS "welcome_goodbye_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."tickets" DROP CONSTRAINT IF EXISTS "tickets_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_settings" DROP CONSTRAINT IF EXISTS "ticket_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_panels" DROP CONSTRAINT IF EXISTS "ticket_panels_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_messages" DROP CONSTRAINT IF EXISTS "ticket_messages_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_events" DROP CONSTRAINT IF EXISTS "ticket_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_categories" DROP CONSTRAINT IF EXISTS "ticket_categories_pkey";
ALTER TABLE IF EXISTS ONLY "public"."suggestions" DROP CONSTRAINT IF EXISTS "suggestions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."starboard_entries" DROP CONSTRAINT IF EXISTS "starboard_entries_pkey";
ALTER TABLE IF EXISTS ONLY "public"."starboard_configs" DROP CONSTRAINT IF EXISTS "starboard_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."server_log_configs" DROP CONSTRAINT IF EXISTS "server_log_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."rules_configs" DROP CONSTRAINT IF EXISTS "rules_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."role_menus" DROP CONSTRAINT IF EXISTS "role_menus_pkey";
ALTER TABLE IF EXISTS ONLY "public"."role_menu_options" DROP CONSTRAINT IF EXISTS "role_menu_options_pkey";
ALTER TABLE IF EXISTS ONLY "public"."platform_users" DROP CONSTRAINT IF EXISTS "platform_users_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_principals" DROP CONSTRAINT IF EXISTS "permission_principals_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_definitions" DROP CONSTRAINT IF EXISTS "permission_definitions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_catalog_state" DROP CONSTRAINT IF EXISTS "permission_catalog_state_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_assignments" DROP CONSTRAINT IF EXISTS "permission_assignments_pkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_transactions" DROP CONSTRAINT IF EXISTS "oauth_transactions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_credentials" DROP CONSTRAINT IF EXISTS "oauth_credentials_pkey";
ALTER TABLE IF EXISTS ONLY "public"."moderation_settings" DROP CONSTRAINT IF EXISTS "moderation_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."moderation_cases" DROP CONSTRAINT IF EXISTS "moderation_cases_pkey";
ALTER TABLE IF EXISTS ONLY "public"."guilds" DROP CONSTRAINT IF EXISTS "guilds_pkey";
ALTER TABLE IF EXISTS ONLY "public"."external_identities" DROP CONSTRAINT IF EXISTS "external_identities_pkey";
ALTER TABLE IF EXISTS ONLY "public"."embed_templates" DROP CONSTRAINT IF EXISTS "embed_templates_pkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_role_audit_events" DROP CONSTRAINT IF EXISTS "discord_role_audit_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_memberships" DROP CONSTRAINT IF EXISTS "discord_guild_memberships_pkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_membership_roles" DROP CONSTRAINT IF EXISTS "discord_guild_membership_roles_pkey";
ALTER TABLE IF EXISTS ONLY "public"."custom_commands" DROP CONSTRAINT IF EXISTS "custom_commands_pkey";
ALTER TABLE IF EXISTS ONLY "public"."community_counters" DROP CONSTRAINT IF EXISTS "community_counters_pkey";
ALTER TABLE IF EXISTS ONLY "public"."browser_sessions" DROP CONSTRAINT IF EXISTS "browser_sessions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."autorole_rules" DROP CONSTRAINT IF EXISTS "autorole_rules_pkey";
ALTER TABLE IF EXISTS ONLY "public"."autorole_configs" DROP CONSTRAINT IF EXISTS "autorole_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."_prisma_migrations" DROP CONSTRAINT IF EXISTS "_prisma_migrations_pkey";
DROP TABLE IF EXISTS "public"."welcome_goodbye_configs";
DROP TABLE IF EXISTS "public"."tickets";
DROP TABLE IF EXISTS "public"."ticket_settings";
DROP TABLE IF EXISTS "public"."ticket_panels";
DROP TABLE IF EXISTS "public"."ticket_messages";
DROP TABLE IF EXISTS "public"."ticket_events";
DROP TABLE IF EXISTS "public"."ticket_categories";
DROP TABLE IF EXISTS "public"."suggestions";
DROP TABLE IF EXISTS "public"."starboard_entries";
DROP TABLE IF EXISTS "public"."starboard_configs";
DROP TABLE IF EXISTS "public"."server_log_configs";
DROP TABLE IF EXISTS "public"."rules_configs";
DROP TABLE IF EXISTS "public"."role_menus";
DROP TABLE IF EXISTS "public"."role_menu_options";
DROP TABLE IF EXISTS "public"."platform_users";
DROP TABLE IF EXISTS "public"."permission_principals";
DROP TABLE IF EXISTS "public"."permission_definitions";
DROP TABLE IF EXISTS "public"."permission_catalog_state";
DROP TABLE IF EXISTS "public"."permission_audit_events";
DROP TABLE IF EXISTS "public"."permission_assignments";
DROP TABLE IF EXISTS "public"."oauth_transactions";
DROP TABLE IF EXISTS "public"."oauth_credentials";
DROP TABLE IF EXISTS "public"."moderation_settings";
DROP TABLE IF EXISTS "public"."moderation_cases";
DROP TABLE IF EXISTS "public"."guilds";
DROP TABLE IF EXISTS "public"."external_identities";
DROP TABLE IF EXISTS "public"."embed_templates";
DROP TABLE IF EXISTS "public"."discord_role_audit_events";
DROP TABLE IF EXISTS "public"."discord_guild_memberships";
DROP TABLE IF EXISTS "public"."discord_guild_membership_roles";
DROP TABLE IF EXISTS "public"."custom_commands";
DROP TABLE IF EXISTS "public"."community_counters";
DROP TABLE IF EXISTS "public"."browser_sessions";
DROP TABLE IF EXISTS "public"."autorole_rules";
DROP TABLE IF EXISTS "public"."autorole_configs";
DROP TABLE IF EXISTS "public"."authentication_audit_events";
DROP TABLE IF EXISTS "public"."_prisma_migrations";
DROP FUNCTION IF EXISTS "public"."reject_permission_audit_mutation"();
DROP FUNCTION IF EXISTS "public"."reject_authentication_audit_mutation"();
DROP FUNCTION IF EXISTS "public"."prevent_created_at_change"();
DROP FUNCTION IF EXISTS "public"."prevent_authentication_identity_change"();
DROP FUNCTION IF EXISTS "public"."enforce_permission_assignment_guild"();
DROP FUNCTION IF EXISTS "public"."enforce_oauth_transaction_transition"();
DROP FUNCTION IF EXISTS "public"."enforce_oauth_transaction_binding"();
DROP FUNCTION IF EXISTS "public"."enforce_oauth_credential_immutability"();
DROP FUNCTION IF EXISTS "public"."enforce_membership_role_integrity"();
DROP FUNCTION IF EXISTS "public"."enforce_membership_identity_provider"();
DROP FUNCTION IF EXISTS "public"."enforce_external_identity_immutability"();
DROP FUNCTION IF EXISTS "public"."enforce_browser_session_identity"();
DROP FUNCTION IF EXISTS "public"."authentication_scopes_are_normalized"("scopes" "text"[]);
DROP FUNCTION IF EXISTS "public"."authentication_audit_metadata_is_safe"("metadata" "jsonb");
DROP TYPE IF EXISTS "public"."WelcomeGoodbyeKind";
DROP TYPE IF EXISTS "public"."TicketStatus";
DROP TYPE IF EXISTS "public"."TicketPriority";
DROP TYPE IF EXISTS "public"."TicketPanelStyle";
DROP TYPE IF EXISTS "public"."TicketMode";
DROP TYPE IF EXISTS "public"."TicketMessageSource";
DROP TYPE IF EXISTS "public"."TicketCloseAction";
DROP TYPE IF EXISTS "public"."SuggestionStatus";
DROP TYPE IF EXISTS "public"."StarboardNsfwMode";
DROP TYPE IF EXISTS "public"."StarboardChannelMode";
DROP TYPE IF EXISTS "public"."RoleMenuStatus";
DROP TYPE IF EXISTS "public"."RoleMenuPresentationType";
DROP TYPE IF EXISTS "public"."RoleMenuAssignmentMode";
DROP TYPE IF EXISTS "public"."PlatformUserStatusReasonCode";
DROP TYPE IF EXISTS "public"."PlatformUserStatus";
DROP TYPE IF EXISTS "public"."PermissionScopeType";
DROP TYPE IF EXISTS "public"."PermissionPrincipalType";
DROP TYPE IF EXISTS "public"."PermissionMutationReasonCode";
DROP TYPE IF EXISTS "public"."PermissionAuditActorType";
DROP TYPE IF EXISTS "public"."PermissionAuditAction";
DROP TYPE IF EXISTS "public"."PermissionAssignmentEffect";
DROP TYPE IF EXISTS "public"."OAuthTransactionState";
DROP TYPE IF EXISTS "public"."OAuthTransactionPurpose";
DROP TYPE IF EXISTS "public"."OAuthTransactionFailureReason";
DROP TYPE IF EXISTS "public"."OAuthPkceMode";
DROP TYPE IF EXISTS "public"."OAuthCredentialRevocationReason";
DROP TYPE IF EXISTS "public"."ModerationCaseType";
DROP TYPE IF EXISTS "public"."ModerationCaseSource";
DROP TYPE IF EXISTS "public"."DiscordGuildMembershipStatus";
DROP TYPE IF EXISTS "public"."DiscordGuildMembershipSource";
DROP TYPE IF EXISTS "public"."CustomCommandTriggerMode";
DROP TYPE IF EXISTS "public"."CommunityCounterType";
DROP TYPE IF EXISTS "public"."CommunityContentMode";
DROP TYPE IF EXISTS "public"."BrowserSessionStatus";
DROP TYPE IF EXISTS "public"."BrowserSessionRevocationReason";
DROP TYPE IF EXISTS "public"."AuthenticationProvider";
DROP TYPE IF EXISTS "public"."AuthenticationAuditReasonCode";
DROP TYPE IF EXISTS "public"."AuthenticationAuditOutcome";
DROP TYPE IF EXISTS "public"."AuthenticationAuditActorType";
DROP TYPE IF EXISTS "public"."AuthenticationAuditAction";
--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: AuthenticationAuditAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."AuthenticationAuditAction" AS ENUM (
    'login-start',
    'login-success',
    'login-failure',
    'oauth-claim',
    'oauth-completion',
    'oauth-rejection',
    'oauth-replay',
    'session-creation',
    'session-rotation',
    'session-expiry',
    'session-revocation',
    'logout',
    'global-logout',
    'identity-link',
    'identity-unlink',
    'account-status-change',
    'guild-departure',
    'guild-rejoin',
    'recovery'
);


--
-- Name: AuthenticationAuditActorType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."AuthenticationAuditActorType" AS ENUM (
    'platform-user',
    'service'
);


--
-- Name: AuthenticationAuditOutcome; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."AuthenticationAuditOutcome" AS ENUM (
    'success',
    'failure',
    'rejected'
);


--
-- Name: AuthenticationAuditReasonCode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."AuthenticationAuditReasonCode" AS ENUM (
    'requested',
    'completed',
    'invalid-credential',
    'invalid-state',
    'expired',
    'revoked',
    'replay-detected',
    'provider-rejected',
    'dependency-unavailable',
    'account-unavailable',
    'identity-conflict',
    'guild-membership-changed',
    'administrator-action',
    'security-response',
    'user-action',
    'recovery',
    'system-maintenance'
);


--
-- Name: AuthenticationProvider; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."AuthenticationProvider" AS ENUM (
    'discord'
);


--
-- Name: BrowserSessionRevocationReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."BrowserSessionRevocationReason" AS ENUM (
    'logout',
    'global-logout',
    'account-status-changed',
    'authentication-revision-changed',
    'identity-unlinked',
    'guild-departure',
    'security-response',
    'session-limit',
    'rotated',
    'expired'
);


--
-- Name: BrowserSessionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."BrowserSessionStatus" AS ENUM (
    'active',
    'revoked',
    'expired',
    'rotated'
);


--
-- Name: CommunityContentMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."CommunityContentMode" AS ENUM (
    'redacted',
    'when-available'
);


--
-- Name: CommunityCounterType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."CommunityCounterType" AS ENUM (
    'total-members',
    'humans',
    'bots',
    'online',
    'role'
);


--
-- Name: CustomCommandTriggerMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."CustomCommandTriggerMode" AS ENUM (
    'slash-only',
    'exact',
    'starts-with',
    'contains'
);


--
-- Name: DiscordGuildMembershipSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."DiscordGuildMembershipSource" AS ENUM (
    'discord-bot',
    'discord-oauth',
    'combined'
);


--
-- Name: DiscordGuildMembershipStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."DiscordGuildMembershipStatus" AS ENUM (
    'present',
    'absent',
    'unknown'
);


--
-- Name: ModerationCaseSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ModerationCaseSource" AS ENUM (
    'discord',
    'web',
    'automod',
    'external'
);


--
-- Name: ModerationCaseType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ModerationCaseType" AS ENUM (
    'warn',
    'timeout',
    'untimeout',
    'kick',
    'ban',
    'unban',
    'softban',
    'note'
);


--
-- Name: OAuthCredentialRevocationReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."OAuthCredentialRevocationReason" AS ENUM (
    'identity-unlinked',
    'account-disabled',
    'provider-revoked',
    'security-response',
    'refresh-failed'
);


--
-- Name: OAuthPkceMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."OAuthPkceMode" AS ENUM (
    'disabled-unverified',
    's256-verified'
);


--
-- Name: OAuthTransactionFailureReason; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."OAuthTransactionFailureReason" AS ENUM (
    'provider-rejected',
    'invalid-callback',
    'state-mismatch',
    'browser-binding-mismatch',
    'pkce-mismatch',
    'identity-conflict',
    'dependency-unavailable',
    'cancelled-by-user',
    'expired'
);


--
-- Name: OAuthTransactionPurpose; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."OAuthTransactionPurpose" AS ENUM (
    'login',
    'link',
    'reauthenticate'
);


--
-- Name: OAuthTransactionState; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."OAuthTransactionState" AS ENUM (
    'pending',
    'claimed',
    'completed',
    'failed',
    'cancelled',
    'expired'
);


--
-- Name: PermissionAssignmentEffect; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PermissionAssignmentEffect" AS ENUM (
    'allow',
    'deny'
);


--
-- Name: PermissionAuditAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PermissionAuditAction" AS ENUM (
    'set-assignment',
    'revoke-assignment',
    'disable-assignment',
    'enable-assignment',
    'expire-assignment',
    'disable-principal',
    'enable-principal',
    'disable-guild',
    'enable-guild',
    'disable-definition',
    'enable-definition',
    'owner-protection-rejection'
);


--
-- Name: PermissionAuditActorType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PermissionAuditActorType" AS ENUM (
    'principal',
    'system'
);


--
-- Name: PermissionMutationReasonCode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PermissionMutationReasonCode" AS ENUM (
    'bootstrap',
    'administrator-action',
    'security-response',
    'role-synchronization',
    'migration',
    'expiration',
    'system-maintenance'
);


--
-- Name: PermissionPrincipalType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PermissionPrincipalType" AS ENUM (
    'discord-user',
    'discord-role'
);


--
-- Name: PermissionScopeType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PermissionScopeType" AS ENUM (
    'platform',
    'discord-guild'
);


--
-- Name: PlatformUserStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PlatformUserStatus" AS ENUM (
    'active',
    'suspended',
    'disabled',
    'deleted'
);


--
-- Name: PlatformUserStatusReasonCode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PlatformUserStatusReasonCode" AS ENUM (
    'account-created',
    'user-request',
    'administrator-action',
    'security-response',
    'recovery',
    'identity-unlinked',
    'account-merged'
);


--
-- Name: RoleMenuAssignmentMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."RoleMenuAssignmentMode" AS ENUM (
    'toggle',
    'add-only',
    'remove-only',
    'exclusive'
);


--
-- Name: RoleMenuPresentationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."RoleMenuPresentationType" AS ENUM (
    'buttons',
    'select-menu',
    'reactions'
);


--
-- Name: RoleMenuStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."RoleMenuStatus" AS ENUM (
    'draft',
    'published',
    'disabled'
);


--
-- Name: StarboardChannelMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StarboardChannelMode" AS ENUM (
    'allowlist',
    'denylist'
);


--
-- Name: StarboardNsfwMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StarboardNsfwMode" AS ENUM (
    'allow',
    'block'
);


--
-- Name: SuggestionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."SuggestionStatus" AS ENUM (
    'submitted',
    'under-review',
    'approved',
    'denied',
    'implemented'
);


--
-- Name: TicketCloseAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."TicketCloseAction" AS ENUM (
    'archive',
    'delete'
);


--
-- Name: TicketMessageSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."TicketMessageSource" AS ENUM (
    'discord',
    'web',
    'system'
);


--
-- Name: TicketMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."TicketMode" AS ENUM (
    'channel',
    'thread'
);


--
-- Name: TicketPanelStyle; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."TicketPanelStyle" AS ENUM (
    'buttons',
    'select-menu'
);


--
-- Name: TicketPriority; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."TicketPriority" AS ENUM (
    'low',
    'normal',
    'high',
    'urgent'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."TicketStatus" AS ENUM (
    'open',
    'claimed',
    'pending',
    'closed'
);


--
-- Name: WelcomeGoodbyeKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."WelcomeGoodbyeKind" AS ENUM (
    'welcome',
    'goodbye'
);


--
-- Name: authentication_audit_metadata_is_safe("jsonb"); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."authentication_audit_metadata_is_safe"("metadata" "jsonb") RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    AS $_$
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
$_$;


--
-- Name: authentication_scopes_are_normalized("text"[]); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."authentication_scopes_are_normalized"("scopes" "text"[]) RETURNS boolean
    LANGUAGE "sql" IMMUTABLE
    AS $_$
    SELECT cardinality(scopes) > 0
       AND scopes = ARRAY(SELECT scope FROM unnest(scopes) AS scope ORDER BY scope)
       AND cardinality(scopes) = cardinality(ARRAY(SELECT DISTINCT scope FROM unnest(scopes) AS scope))
       AND NOT EXISTS (SELECT 1 FROM unnest(scopes) AS scope WHERE scope !~ '^[a-z][a-z0-9._-]{0,63}$');
$_$;


--
-- Name: enforce_browser_session_identity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_browser_session_identity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


--
-- Name: enforce_external_identity_immutability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_external_identity_immutability"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW."platform_user_id" IS DISTINCT FROM OLD."platform_user_id" OR NEW."provider" IS DISTINCT FROM OLD."provider" OR NEW."provider_subject_id" IS DISTINCT FROM OLD."provider_subject_id" OR NEW."linked_at" IS DISTINCT FROM OLD."linked_at" THEN
        RAISE EXCEPTION 'external identity ownership is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: enforce_membership_identity_provider(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_membership_identity_provider"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $_$
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
$_$;


--
-- Name: enforce_membership_role_integrity(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_membership_role_integrity"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


--
-- Name: enforce_oauth_credential_immutability(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_oauth_credential_immutability"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW."external_identity_id" IS DISTINCT FROM OLD."external_identity_id" OR NEW."provider" IS DISTINCT FROM OLD."provider" THEN
        RAISE EXCEPTION 'OAuth credential ownership is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: enforce_oauth_transaction_binding(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_oauth_transaction_binding"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


--
-- Name: enforce_oauth_transaction_transition(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_oauth_transaction_transition"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
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


--
-- Name: enforce_permission_assignment_guild(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."enforce_permission_assignment_guild"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
DECLARE principal_guild_id UUID;
BEGIN
    SELECT "guild_id" INTO principal_guild_id FROM "permission_principals" WHERE "id" = NEW."principal_id";
    IF NEW."scope" = 'discord-guild' AND NEW."guild_id" IS DISTINCT FROM principal_guild_id THEN
        RAISE EXCEPTION 'Discord-guild assignment must use the principal guild' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: prevent_authentication_identity_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."prevent_authentication_identity_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW."id" IS DISTINCT FROM OLD."id" OR NEW."created_at" IS DISTINCT FROM OLD."created_at" THEN
        RAISE EXCEPTION 'authentication record id and created_at are immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: prevent_created_at_change(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."prevent_created_at_change"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    IF NEW."created_at" IS DISTINCT FROM OLD."created_at" THEN
        RAISE EXCEPTION 'created_at is immutable' USING ERRCODE = '23514';
    END IF;
    RETURN NEW;
END;
$$;


--
-- Name: reject_authentication_audit_mutation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."reject_authentication_audit_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RAISE EXCEPTION 'authentication audit events are append-only' USING ERRCODE = '55000';
END;
$$;


--
-- Name: reject_permission_audit_mutation(); Type: FUNCTION; Schema: public; Owner: -
--

CREATE FUNCTION "public"."reject_permission_audit_mutation"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    RAISE EXCEPTION 'permission audit events are append-only' USING ERRCODE = '55000';
END;
$$;


SET default_tablespace = '';

SET default_table_access_method = "heap";

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."_prisma_migrations" (
    "id" character varying(36) NOT NULL,
    "checksum" character varying(64) NOT NULL,
    "finished_at" timestamp with time zone,
    "migration_name" character varying(255) NOT NULL,
    "logs" "text",
    "rolled_back_at" timestamp with time zone,
    "started_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "applied_steps_count" integer DEFAULT 0 NOT NULL
);


--
-- Name: authentication_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."authentication_audit_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "public"."AuthenticationAuditAction" NOT NULL,
    "outcome" "public"."AuthenticationAuditOutcome" NOT NULL,
    "reason_code" "public"."AuthenticationAuditReasonCode" NOT NULL,
    "request_id" "uuid",
    "correlation_id" "uuid" NOT NULL,
    "actor_type" "public"."AuthenticationAuditActorType",
    "actor_platform_user_id" "uuid",
    "actor_service_identity_id" "uuid",
    "target_platform_user_id" "uuid",
    "target_external_identity_id" "uuid",
    "target_browser_session_id" "uuid",
    "target_oauth_transaction_id" "uuid",
    "target_oauth_credential_id" "uuid",
    "target_guild_membership_id" "uuid",
    "provider" "public"."AuthenticationProvider",
    "purpose" "public"."OAuthTransactionPurpose",
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ip_hmac" character(64),
    "user_agent_hmac" character(64),
    "device_hmac" character(64),
    "metadata_key_version" integer,
    "occurred_at" timestamp(3) with time zone NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "authentication_audit_events_actor_check" CHECK (((("actor_type" IS NULL) AND ("actor_platform_user_id" IS NULL) AND ("actor_service_identity_id" IS NULL)) OR (("actor_type" = 'platform-user'::"public"."AuthenticationAuditActorType") AND ("actor_platform_user_id" IS NOT NULL) AND ("actor_service_identity_id" IS NULL)) OR (("actor_type" = 'service'::"public"."AuthenticationAuditActorType") AND ("actor_platform_user_id" IS NULL) AND ("actor_service_identity_id" IS NOT NULL)))),
    CONSTRAINT "authentication_audit_events_hmac_format_check" CHECK (((("ip_hmac" IS NULL) OR ("ip_hmac" ~ '^[0-9a-f]{64}$'::"text")) AND (("user_agent_hmac" IS NULL) OR ("user_agent_hmac" ~ '^[0-9a-f]{64}$'::"text")) AND (("device_hmac" IS NULL) OR ("device_hmac" ~ '^[0-9a-f]{64}$'::"text")))),
    CONSTRAINT "authentication_audit_events_metadata_key_check" CHECK (((("ip_hmac" IS NULL) AND ("user_agent_hmac" IS NULL) AND ("device_hmac" IS NULL) AND ("metadata_key_version" IS NULL)) OR ((("ip_hmac" IS NOT NULL) OR ("user_agent_hmac" IS NOT NULL) OR ("device_hmac" IS NOT NULL)) AND ("metadata_key_version" > 0)))),
    CONSTRAINT "authentication_audit_events_metadata_safe_check" CHECK ("public"."authentication_audit_metadata_is_safe"("metadata")),
    CONSTRAINT "authentication_audit_events_time_check" CHECK (("created_at" >= "occurred_at"))
);


--
-- Name: autorole_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."autorole_configs" (
    "guild_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "delay_seconds" integer DEFAULT 0 NOT NULL,
    "include_bots" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "last_operation_source" "text" DEFAULT 'SYSTEM'::"text" NOT NULL
);


--
-- Name: autorole_rules; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."autorole_rules" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "role_id" "text" NOT NULL,
    "position" integer NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: browser_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."browser_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "platform_user_id" "uuid" NOT NULL,
    "login_identity_id" "uuid" NOT NULL,
    "token_digest" character(64) NOT NULL,
    "token_key_version" integer NOT NULL,
    "csrf_digest" character(64) NOT NULL,
    "csrf_key_version" integer NOT NULL,
    "authentication_revision_at_issue" integer NOT NULL,
    "authenticated_at" timestamp(3) with time zone NOT NULL,
    "last_seen_at" timestamp(3) with time zone NOT NULL,
    "idle_expires_at" timestamp(3) with time zone NOT NULL,
    "absolute_expires_at" timestamp(3) with time zone NOT NULL,
    "status" "public"."BrowserSessionStatus" DEFAULT 'active'::"public"."BrowserSessionStatus" NOT NULL,
    "revoked_at" timestamp(3) with time zone,
    "revocation_reason" "public"."BrowserSessionRevocationReason",
    "rotated_from_session_id" "uuid",
    "ip_hmac" character(64),
    "user_agent_hmac" character(64),
    "device_hmac" character(64),
    "metadata_key_version" integer,
    "device_label" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "browser_sessions_device_label_check" CHECK ((("device_label" IS NULL) OR (("length"("device_label") >= 1) AND ("length"("device_label") <= 120) AND ("device_label" !~ '[[:cntrl:]]'::"text")))),
    CONSTRAINT "browser_sessions_digest_format_check" CHECK ((("token_digest" ~ '^[0-9a-f]{64}$'::"text") AND ("csrf_digest" ~ '^[0-9a-f]{64}$'::"text") AND (("ip_hmac" IS NULL) OR ("ip_hmac" ~ '^[0-9a-f]{64}$'::"text")) AND (("user_agent_hmac" IS NULL) OR ("user_agent_hmac" ~ '^[0-9a-f]{64}$'::"text")) AND (("device_hmac" IS NULL) OR ("device_hmac" ~ '^[0-9a-f]{64}$'::"text")))),
    CONSTRAINT "browser_sessions_expiry_order_check" CHECK ((("authenticated_at" >= "created_at") AND ("last_seen_at" >= "authenticated_at") AND ("idle_expires_at" > "last_seen_at") AND ("absolute_expires_at" >= "idle_expires_at") AND ("updated_at" >= "created_at"))),
    CONSTRAINT "browser_sessions_key_versions_check" CHECK ((("token_key_version" > 0) AND ("csrf_key_version" > 0) AND ("authentication_revision_at_issue" > 0))),
    CONSTRAINT "browser_sessions_metadata_key_check" CHECK (((("ip_hmac" IS NULL) AND ("user_agent_hmac" IS NULL) AND ("device_hmac" IS NULL) AND ("metadata_key_version" IS NULL)) OR ((("ip_hmac" IS NOT NULL) OR ("user_agent_hmac" IS NOT NULL) OR ("device_hmac" IS NOT NULL)) AND ("metadata_key_version" > 0)))),
    CONSTRAINT "browser_sessions_revocation_state_check" CHECK (((("status" = 'active'::"public"."BrowserSessionStatus") AND ("revoked_at" IS NULL) AND ("revocation_reason" IS NULL)) OR (("status" <> 'active'::"public"."BrowserSessionStatus") AND ("revoked_at" IS NOT NULL) AND ("revoked_at" >= "created_at") AND ("revocation_reason" IS NOT NULL)))),
    CONSTRAINT "browser_sessions_rotation_self_check" CHECK ((("rotated_from_session_id" IS NULL) OR ("rotated_from_session_id" <> "id"))),
    CONSTRAINT "browser_sessions_terminal_reason_check" CHECK (((("status" <> 'rotated'::"public"."BrowserSessionStatus") OR ("revocation_reason" = 'rotated'::"public"."BrowserSessionRevocationReason")) AND (("status" <> 'expired'::"public"."BrowserSessionStatus") OR ("revocation_reason" = 'expired'::"public"."BrowserSessionRevocationReason"))))
);


--
-- Name: community_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."community_counters" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "channel_id" "text" NOT NULL,
    "label_template" "text" NOT NULL,
    "type" "public"."CommunityCounterType" NOT NULL,
    "role_id" "text",
    "interval_seconds" integer NOT NULL,
    "last_value" integer,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: custom_commands; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."custom_commands" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text" NOT NULL,
    "response_text" "text" NOT NULL,
    "embed_template_id" "uuid",
    "enabled" boolean DEFAULT true NOT NULL,
    "allowed_channels" "text"[] NOT NULL,
    "denied_channels" "text"[] NOT NULL,
    "required_roles" "text"[] NOT NULL,
    "cooldown_seconds" integer NOT NULL,
    "trigger_mode" "public"."CustomCommandTriggerMode" NOT NULL,
    "trigger_phrase" "text",
    "delete_triggering_message" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: discord_guild_membership_roles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."discord_guild_membership_roles" (
    "membership_id" "uuid" NOT NULL,
    "role_id" "text" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "discord_guild_membership_roles_snowflake_check" CHECK (("role_id" ~ '^[1-9][0-9]{16,19}$'::"text"))
);


--
-- Name: discord_guild_memberships; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."discord_guild_memberships" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "external_identity_id" "uuid" NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "status" "public"."DiscordGuildMembershipStatus" DEFAULT 'unknown'::"public"."DiscordGuildMembershipStatus" NOT NULL,
    "source" "public"."DiscordGuildMembershipSource" NOT NULL,
    "verified_at" timestamp(3) with time zone,
    "valid_until" timestamp(3) with time zone,
    "departed_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "discord_guild_memberships_lifecycle_order_check" CHECK (("updated_at" >= "created_at")),
    CONSTRAINT "discord_guild_memberships_status_timestamps_check" CHECK (((("status" = 'present'::"public"."DiscordGuildMembershipStatus") AND ("verified_at" IS NOT NULL) AND ("valid_until" > "verified_at") AND ("departed_at" IS NULL)) OR (("status" = 'absent'::"public"."DiscordGuildMembershipStatus") AND ("verified_at" IS NOT NULL) AND ("valid_until" IS NULL) AND ("departed_at" >= "verified_at")) OR (("status" = 'unknown'::"public"."DiscordGuildMembershipStatus") AND ("verified_at" IS NULL) AND ("valid_until" IS NULL) AND ("departed_at" IS NULL))))
);


--
-- Name: discord_role_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."discord_role_audit_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "role_id" "text",
    "feature" "text" NOT NULL,
    "operation" "text" NOT NULL,
    "source" "text" NOT NULL,
    "actor_type" "text" NOT NULL,
    "actor_id" "text" NOT NULL,
    "summary" "text" NOT NULL,
    "result" "text" NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: embed_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."embed_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "content" "text",
    "title" "text",
    "description" "text",
    "color" "text",
    "author" "text",
    "thumbnail_url" "text",
    "image_url" "text",
    "footer" "text",
    "timestamp" boolean DEFAULT false NOT NULL,
    "fields" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "allowed_role_mentions" "text"[] NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: external_identities; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."external_identities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "platform_user_id" "uuid" NOT NULL,
    "provider" "public"."AuthenticationProvider" NOT NULL,
    "provider_subject_id" "text" NOT NULL,
    "username" "text",
    "global_name" "text",
    "avatar" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "linked_at" timestamp(3) with time zone NOT NULL,
    "verified_at" timestamp(3) with time zone NOT NULL,
    "last_provider_refresh_at" timestamp(3) with time zone,
    "unlinked_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "external_identities_discord_subject_check" CHECK ((("provider" <> 'discord'::"public"."AuthenticationProvider") OR ("provider_subject_id" ~ '^[1-9][0-9]{16,19}$'::"text"))),
    CONSTRAINT "external_identities_enabled_unlinked_check" CHECK ((("enabled" AND ("unlinked_at" IS NULL)) OR ((NOT "enabled") AND ("unlinked_at" IS NOT NULL)))),
    CONSTRAINT "external_identities_lifecycle_order_check" CHECK ((("linked_at" >= "created_at") AND ("verified_at" >= "linked_at") AND ("updated_at" >= "created_at") AND (("last_provider_refresh_at" IS NULL) OR ("last_provider_refresh_at" >= "verified_at")) AND (("unlinked_at" IS NULL) OR ("unlinked_at" >= "linked_at")))),
    CONSTRAINT "external_identities_profile_bounds_check" CHECK (((("username" IS NULL) OR (("length"("username") <= 80) AND ("username" !~ '[[:cntrl:]]'::"text"))) AND (("global_name" IS NULL) OR (("length"("global_name") <= 80) AND ("global_name" !~ '[[:cntrl:]]'::"text"))) AND (("avatar" IS NULL) OR (("length"("avatar") <= 512) AND ("avatar" !~ '[[:cntrl:]]'::"text")))))
);


--
-- Name: guilds; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."guilds" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "discord_guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "disabled_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "guilds_enabled_state_check" CHECK ((("enabled" AND ("disabled_at" IS NULL)) OR ((NOT "enabled") AND ("disabled_at" IS NOT NULL)))),
    CONSTRAINT "guilds_metadata_object_check" CHECK (("jsonb_typeof"("metadata") = 'object'::"text"))
);


--
-- Name: moderation_cases; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."moderation_cases" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "number" integer NOT NULL,
    "type" "public"."ModerationCaseType" NOT NULL,
    "target_id" "text" NOT NULL,
    "target_name" "text" NOT NULL,
    "moderator_id" "text" NOT NULL,
    "moderator_name" "text" NOT NULL,
    "reason" "text",
    "duration_minutes" integer,
    "expires_at" timestamp(3) with time zone,
    "active" boolean DEFAULT true NOT NULL,
    "source" "public"."ModerationCaseSource" DEFAULT 'discord'::"public"."ModerationCaseSource" NOT NULL,
    "evidence" "text"[],
    "dm_delivered" boolean,
    "log_message_id" "text",
    "revoked_at" timestamp(3) with time zone,
    "revoked_by_id" "text",
    "revoke_reason" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: moderation_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."moderation_settings" (
    "guild_id" "text" NOT NULL,
    "log_channel_id" "text",
    "dm_on_action" boolean DEFAULT true NOT NULL,
    "dm_include_moderator" boolean DEFAULT false NOT NULL,
    "appeal_message" "text",
    "require_reason" boolean DEFAULT false NOT NULL,
    "default_timeout_minutes" integer DEFAULT 60 NOT NULL,
    "ban_delete_message_hours" integer DEFAULT 0 NOT NULL,
    "warning_expiry_days" integer DEFAULT 0 NOT NULL,
    "protected_role_ids" "text"[],
    "escalation" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "automod" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "record_external_actions" boolean DEFAULT true NOT NULL,
    "next_case_number" integer DEFAULT 1 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: oauth_credentials; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."oauth_credentials" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "external_identity_id" "uuid" NOT NULL,
    "provider" "public"."AuthenticationProvider" NOT NULL,
    "access_token_ciphertext" "bytea" NOT NULL,
    "access_token_nonce" "bytea" NOT NULL,
    "access_token_authentication_tag" "bytea" NOT NULL,
    "access_token_key_version" integer NOT NULL,
    "refresh_token_ciphertext" "bytea" NOT NULL,
    "refresh_token_nonce" "bytea" NOT NULL,
    "refresh_token_authentication_tag" "bytea" NOT NULL,
    "refresh_token_key_version" integer NOT NULL,
    "scopes" "text"[] NOT NULL,
    "provider_expires_at" timestamp(3) with time zone NOT NULL,
    "refresh_version" integer DEFAULT 1 NOT NULL,
    "revoked_at" timestamp(3) with time zone,
    "revocation_reason" "public"."OAuthCredentialRevocationReason",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "oauth_credentials_encryption_metadata_check" CHECK ((("octet_length"("access_token_ciphertext") > 0) AND ("octet_length"("access_token_nonce") = 12) AND ("octet_length"("access_token_authentication_tag") = 16) AND ("access_token_key_version" > 0) AND ("octet_length"("refresh_token_ciphertext") > 0) AND ("octet_length"("refresh_token_nonce") = 12) AND ("octet_length"("refresh_token_authentication_tag") = 16) AND ("refresh_token_key_version" > 0))),
    CONSTRAINT "oauth_credentials_expiry_check" CHECK ((("provider_expires_at" > "created_at") AND ("updated_at" >= "created_at"))),
    CONSTRAINT "oauth_credentials_refresh_version_check" CHECK (("refresh_version" > 0)),
    CONSTRAINT "oauth_credentials_revocation_check" CHECK (((("revoked_at" IS NULL) AND ("revocation_reason" IS NULL)) OR (("revoked_at" >= "created_at") AND ("revocation_reason" IS NOT NULL)))),
    CONSTRAINT "oauth_credentials_scopes_normalized_check" CHECK ("public"."authentication_scopes_are_normalized"("scopes"))
);


--
-- Name: oauth_transactions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."oauth_transactions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "provider" "public"."AuthenticationProvider" NOT NULL,
    "purpose" "public"."OAuthTransactionPurpose" NOT NULL,
    "state" "public"."OAuthTransactionState" DEFAULT 'pending'::"public"."OAuthTransactionState" NOT NULL,
    "state_digest" character(64) NOT NULL,
    "browser_binding_digest" character(64) NOT NULL,
    "platform_user_id" "uuid",
    "initiating_session_id" "uuid",
    "redirect_key" "text" NOT NULL,
    "return_target_key" "text" NOT NULL,
    "pkce_ciphertext" "bytea",
    "pkce_nonce" "bytea",
    "pkce_authentication_tag" "bytea",
    "pkce_key_version" integer,
    "expires_at" timestamp(3) with time zone NOT NULL,
    "claimed_at" timestamp(3) with time zone,
    "claim_expires_at" timestamp(3) with time zone,
    "completed_at" timestamp(3) with time zone,
    "failed_at" timestamp(3) with time zone,
    "cancelled_at" timestamp(3) with time zone,
    "expired_at" timestamp(3) with time zone,
    "failure_reason" "public"."OAuthTransactionFailureReason",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "pkce_mode" "public"."OAuthPkceMode" DEFAULT 'disabled-unverified'::"public"."OAuthPkceMode" NOT NULL,
    CONSTRAINT "oauth_transactions_configuration_keys_check" CHECK ((("redirect_key" ~ '^[a-z][a-z0-9-]{0,63}$'::"text") AND ("return_target_key" ~ '^[a-z][a-z0-9-]{0,63}$'::"text"))),
    CONSTRAINT "oauth_transactions_digest_format_check" CHECK ((("state_digest" ~ '^[0-9a-f]{64}$'::"text") AND ("browser_binding_digest" ~ '^[0-9a-f]{64}$'::"text"))),
    CONSTRAINT "oauth_transactions_lifecycle_order_check" CHECK ((("expires_at" > "created_at") AND ("updated_at" >= "created_at") AND (("claimed_at" IS NULL) OR ("claimed_at" >= "created_at")) AND ((("claimed_at" IS NULL) AND ("claim_expires_at" IS NULL)) OR (("claimed_at" IS NOT NULL) AND ("claim_expires_at" > "claimed_at"))) AND (("completed_at" IS NULL) OR ("completed_at" >= "claimed_at")) AND (("failed_at" IS NULL) OR ("failed_at" >= "claimed_at")) AND (("cancelled_at" IS NULL) OR ("cancelled_at" >= "created_at")) AND (("expired_at" IS NULL) OR ("expired_at" >= "expires_at")))),
    CONSTRAINT "oauth_transactions_pkce_fields_check" CHECK (((("pkce_ciphertext" IS NULL) AND ("pkce_nonce" IS NULL) AND ("pkce_authentication_tag" IS NULL) AND ("pkce_key_version" IS NULL)) OR (("octet_length"("pkce_ciphertext") > 0) AND ("octet_length"("pkce_nonce") = 12) AND ("octet_length"("pkce_authentication_tag") = 16) AND ("pkce_key_version" > 0)))),
    CONSTRAINT "oauth_transactions_pkce_mode_metadata_check" CHECK (((("pkce_mode" = 'disabled-unverified'::"public"."OAuthPkceMode") AND ("pkce_ciphertext" IS NULL) AND ("pkce_nonce" IS NULL) AND ("pkce_authentication_tag" IS NULL) AND ("pkce_key_version" IS NULL)) OR (("pkce_mode" = 's256-verified'::"public"."OAuthPkceMode") AND ("pkce_ciphertext" IS NOT NULL) AND ("pkce_nonce" IS NOT NULL) AND ("pkce_authentication_tag" IS NOT NULL) AND ("pkce_key_version" IS NOT NULL)))),
    CONSTRAINT "oauth_transactions_purpose_binding_check" CHECK (((("purpose" = 'login'::"public"."OAuthTransactionPurpose") AND ("initiating_session_id" IS NULL)) OR (("purpose" = ANY (ARRAY['link'::"public"."OAuthTransactionPurpose", 'reauthenticate'::"public"."OAuthTransactionPurpose"])) AND ("platform_user_id" IS NOT NULL) AND ("initiating_session_id" IS NOT NULL)))),
    CONSTRAINT "oauth_transactions_state_timestamps_check" CHECK (((("state" = 'pending'::"public"."OAuthTransactionState") AND ("claimed_at" IS NULL) AND ("claim_expires_at" IS NULL) AND ("completed_at" IS NULL) AND ("failed_at" IS NULL) AND ("cancelled_at" IS NULL) AND ("expired_at" IS NULL) AND ("failure_reason" IS NULL)) OR (("state" = 'claimed'::"public"."OAuthTransactionState") AND ("claimed_at" IS NOT NULL) AND ("claim_expires_at" IS NOT NULL) AND ("completed_at" IS NULL) AND ("failed_at" IS NULL) AND ("cancelled_at" IS NULL) AND ("expired_at" IS NULL) AND ("failure_reason" IS NULL)) OR (("state" = 'completed'::"public"."OAuthTransactionState") AND ("claimed_at" IS NOT NULL) AND ("claim_expires_at" IS NOT NULL) AND ("completed_at" IS NOT NULL) AND ("failed_at" IS NULL) AND ("cancelled_at" IS NULL) AND ("expired_at" IS NULL) AND ("failure_reason" IS NULL)) OR (("state" = 'failed'::"public"."OAuthTransactionState") AND ("claimed_at" IS NOT NULL) AND ("claim_expires_at" IS NOT NULL) AND ("completed_at" IS NULL) AND ("failed_at" IS NOT NULL) AND ("cancelled_at" IS NULL) AND ("expired_at" IS NULL) AND ("failure_reason" IS NOT NULL) AND ("failure_reason" <> ALL (ARRAY['cancelled-by-user'::"public"."OAuthTransactionFailureReason", 'expired'::"public"."OAuthTransactionFailureReason"]))) OR (("state" = 'cancelled'::"public"."OAuthTransactionState") AND ("completed_at" IS NULL) AND ("failed_at" IS NULL) AND ("cancelled_at" IS NOT NULL) AND ("expired_at" IS NULL) AND ("failure_reason" = 'cancelled-by-user'::"public"."OAuthTransactionFailureReason")) OR (("state" = 'expired'::"public"."OAuthTransactionState") AND ("completed_at" IS NULL) AND ("failed_at" IS NULL) AND ("cancelled_at" IS NULL) AND ("expired_at" IS NOT NULL) AND ("failure_reason" = 'expired'::"public"."OAuthTransactionFailureReason"))))
);


--
-- Name: permission_assignments; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."permission_assignments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "principal_id" "uuid" NOT NULL,
    "permission_definition_id" "uuid" NOT NULL,
    "scope" "public"."PermissionScopeType" NOT NULL,
    "guild_id" "uuid",
    "effect" "public"."PermissionAssignmentEffect" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "expires_at" timestamp(3) with time zone,
    "revoked_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "permission_assignments_expiration_check" CHECK ((("expires_at" IS NULL) OR ("expires_at" > "created_at"))),
    CONSTRAINT "permission_assignments_revocation_check" CHECK ((("enabled" AND ("revoked_at" IS NULL)) OR ((NOT "enabled") AND ("revoked_at" IS NOT NULL) AND ("revoked_at" >= "created_at")))),
    CONSTRAINT "permission_assignments_scope_guild_check" CHECK (((("scope" = 'platform'::"public"."PermissionScopeType") AND ("guild_id" IS NULL)) OR (("scope" = 'discord-guild'::"public"."PermissionScopeType") AND ("guild_id" IS NOT NULL))))
);


--
-- Name: permission_audit_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."permission_audit_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "action" "public"."PermissionAuditAction" NOT NULL,
    "actor_type" "public"."PermissionAuditActorType" NOT NULL,
    "actor_principal_id" "uuid",
    "actor_principal_type" "public"."PermissionPrincipalType",
    "actor_external_id" "text",
    "actor_guild_discord_id" "text",
    "actor_service" "text",
    "target_principal_id" "uuid",
    "target_principal_type" "public"."PermissionPrincipalType",
    "target_external_id" "text",
    "target_guild_discord_id" "text",
    "scope" "public"."PermissionScopeType",
    "scope_guild_id" "uuid",
    "scope_guild_discord_id" "text",
    "permission_definition_id" "uuid",
    "permission_key" "text",
    "assignment_id" "uuid",
    "reason_code" "public"."PermissionMutationReasonCode" NOT NULL,
    "reason" "text",
    "correlation_id" "uuid" NOT NULL,
    "before_snapshot" "jsonb",
    "after_snapshot" "jsonb",
    "occurred_at" timestamp(3) with time zone NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT "permission_audit_events_actor_check" CHECK (((("actor_type" = 'principal'::"public"."PermissionAuditActorType") AND ("actor_principal_id" IS NOT NULL) AND ("actor_principal_type" IS NOT NULL) AND ("actor_external_id" IS NOT NULL) AND ("actor_guild_discord_id" IS NOT NULL) AND ("actor_service" IS NULL)) OR (("actor_type" = 'system'::"public"."PermissionAuditActorType") AND ("actor_principal_id" IS NULL) AND ("actor_principal_type" IS NULL) AND ("actor_external_id" IS NULL) AND ("actor_guild_discord_id" IS NULL) AND ("length"("btrim"("actor_service")) > 0)))),
    CONSTRAINT "permission_audit_events_permission_check" CHECK (((("permission_definition_id" IS NULL) AND ("permission_key" IS NULL)) OR (("permission_definition_id" IS NOT NULL) AND ("permission_key" ~ '^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$'::"text")))),
    CONSTRAINT "permission_audit_events_reason_check" CHECK ((("reason" IS NULL) OR ("length"("btrim"("reason")) > 0))),
    CONSTRAINT "permission_audit_events_scope_check" CHECK (((("scope" IS NULL) AND ("scope_guild_id" IS NULL) AND ("scope_guild_discord_id" IS NULL)) OR (("scope" = 'platform'::"public"."PermissionScopeType") AND ("scope_guild_id" IS NULL) AND ("scope_guild_discord_id" IS NULL)) OR (("scope" = 'discord-guild'::"public"."PermissionScopeType") AND ("scope_guild_id" IS NOT NULL) AND ("scope_guild_discord_id" IS NOT NULL)))),
    CONSTRAINT "permission_audit_events_target_check" CHECK (((("target_principal_id" IS NULL) AND ("target_principal_type" IS NULL) AND ("target_external_id" IS NULL) AND ("target_guild_discord_id" IS NULL)) OR (("target_principal_id" IS NOT NULL) AND ("target_principal_type" IS NOT NULL) AND ("target_external_id" IS NOT NULL) AND ("target_guild_discord_id" IS NOT NULL))))
);


--
-- Name: permission_catalog_state; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."permission_catalog_state" (
    "id" "text" NOT NULL,
    "version" "text" NOT NULL,
    "checksum" "text" NOT NULL,
    "synced_at" timestamp(3) with time zone NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "permission_catalog_state_checksum_check" CHECK (("checksum" ~ '^sha256:[0-9a-f]{64}$'::"text")),
    CONSTRAINT "permission_catalog_state_singleton_check" CHECK (("id" = 'compiled-permission-catalog'::"text")),
    CONSTRAINT "permission_catalog_state_version_check" CHECK (("length"("btrim"("version")) > 0))
);


--
-- Name: permission_definitions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."permission_definitions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "description" "text",
    "category" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "disabled_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "permission_definitions_enabled_state_check" CHECK ((("enabled" AND ("disabled_at" IS NULL)) OR ((NOT "enabled") AND ("disabled_at" IS NOT NULL)))),
    CONSTRAINT "permission_definitions_key_format_check" CHECK (("key" ~ '^[a-z][a-z0-9-]*(\.[a-z][a-z0-9-]*)+$'::"text"))
);


--
-- Name: permission_principals; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."permission_principals" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "public"."PermissionPrincipalType" NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "external_id" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "disabled_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "metadata" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    CONSTRAINT "permission_principals_enabled_state_check" CHECK ((("enabled" AND ("disabled_at" IS NULL)) OR ((NOT "enabled") AND ("disabled_at" IS NOT NULL)))),
    CONSTRAINT "permission_principals_external_id_check" CHECK (("length"("btrim"("external_id")) > 0)),
    CONSTRAINT "permission_principals_metadata_object_check" CHECK (("jsonb_typeof"("metadata") = 'object'::"text"))
);


--
-- Name: platform_users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."platform_users" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "status" "public"."PlatformUserStatus" DEFAULT 'active'::"public"."PlatformUserStatus" NOT NULL,
    "authentication_revision" integer DEFAULT 1 NOT NULL,
    "status_reason_code" "public"."PlatformUserStatusReasonCode" DEFAULT 'account-created'::"public"."PlatformUserStatusReasonCode" NOT NULL,
    "suspended_at" timestamp(3) with time zone,
    "disabled_at" timestamp(3) with time zone,
    "deleted_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    CONSTRAINT "platform_users_authentication_revision_check" CHECK (("authentication_revision" > 0)),
    CONSTRAINT "platform_users_lifecycle_order_check" CHECK ((("updated_at" >= "created_at") AND (("suspended_at" IS NULL) OR ("suspended_at" >= "created_at")) AND (("disabled_at" IS NULL) OR ("disabled_at" >= "created_at")) AND (("deleted_at" IS NULL) OR ("deleted_at" >= "created_at")))),
    CONSTRAINT "platform_users_status_timestamps_check" CHECK (((("status" = 'active'::"public"."PlatformUserStatus") AND ("suspended_at" IS NULL) AND ("disabled_at" IS NULL) AND ("deleted_at" IS NULL)) OR (("status" = 'suspended'::"public"."PlatformUserStatus") AND ("suspended_at" IS NOT NULL) AND ("disabled_at" IS NULL) AND ("deleted_at" IS NULL)) OR (("status" = 'disabled'::"public"."PlatformUserStatus") AND ("suspended_at" IS NULL) AND ("disabled_at" IS NOT NULL) AND ("deleted_at" IS NULL)) OR (("status" = 'deleted'::"public"."PlatformUserStatus") AND ("suspended_at" IS NULL) AND ("disabled_at" IS NULL) AND ("deleted_at" IS NOT NULL))))
);


--
-- Name: role_menu_options; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."role_menu_options" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "role_menu_id" "uuid" NOT NULL,
    "role_id" "text" NOT NULL,
    "label" "text" NOT NULL,
    "description" "text",
    "emoji" "text",
    "position" integer NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "last_operation_source" "text" DEFAULT 'SYSTEM'::"text" NOT NULL,
    CONSTRAINT "role_menu_options_description_length_chk" CHECK ((("description" IS NULL) OR ("char_length"("description") <= 100))),
    CONSTRAINT "role_menu_options_label_length_chk" CHECK ((("char_length"("label") >= 1) AND ("char_length"("label") <= 80))),
    CONSTRAINT "role_menu_options_position_chk" CHECK ((("position" >= 0) AND ("position" < 25))),
    CONSTRAINT "role_menu_options_role_snowflake_chk" CHECK (("role_id" ~ '^[0-9]{17,20}$'::"text"))
);


--
-- Name: role_menus; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."role_menus" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "channel_id" "text" NOT NULL,
    "message_id" "text",
    "title" "text" NOT NULL,
    "description" "text",
    "presentation_type" "public"."RoleMenuPresentationType" NOT NULL,
    "assignment_mode" "public"."RoleMenuAssignmentMode" NOT NULL,
    "status" "public"."RoleMenuStatus" DEFAULT 'draft'::"public"."RoleMenuStatus" NOT NULL,
    "created_by_discord_user_id" "text" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "last_operation_source" "text" DEFAULT 'SYSTEM'::"text" NOT NULL,
    CONSTRAINT "role_menus_channel_snowflake_chk" CHECK (("channel_id" ~ '^[0-9]{17,20}$'::"text")),
    CONSTRAINT "role_menus_creator_snowflake_chk" CHECK (("created_by_discord_user_id" ~ '^[0-9]{17,20}$'::"text")),
    CONSTRAINT "role_menus_description_length_chk" CHECK ((("description" IS NULL) OR ("char_length"("description") <= 1000))),
    CONSTRAINT "role_menus_message_snowflake_chk" CHECK ((("message_id" IS NULL) OR ("message_id" ~ '^[0-9]{17,20}$'::"text"))),
    CONSTRAINT "role_menus_published_message_chk" CHECK ((("status" <> 'published'::"public"."RoleMenuStatus") OR ("message_id" IS NOT NULL))),
    CONSTRAINT "role_menus_title_length_chk" CHECK ((("char_length"("title") >= 1) AND ("char_length"("title") <= 100)))
);


--
-- Name: rules_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."rules_configs" (
    "guild_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "channel_id" "text" NOT NULL,
    "message_text" "text" NOT NULL,
    "button_label" "text" NOT NULL,
    "accepted_role_id" "text" NOT NULL,
    "pending_role_id" "text",
    "message_id" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "last_operation_source" "text" DEFAULT 'SYSTEM'::"text" NOT NULL
);


--
-- Name: server_log_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."server_log_configs" (
    "guild_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "events" "text"[] NOT NULL,
    "destinations" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "ignored_channels" "text"[] NOT NULL,
    "ignored_roles" "text"[] NOT NULL,
    "ignored_users" "text"[] NOT NULL,
    "include_bots" boolean DEFAULT false NOT NULL,
    "content_mode" "public"."CommunityContentMode" DEFAULT 'redacted'::"public"."CommunityContentMode" NOT NULL,
    "colors" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: starboard_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."starboard_configs" (
    "guild_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "destination_channel_id" "text" NOT NULL,
    "emoji" "text" NOT NULL,
    "threshold" integer NOT NULL,
    "allow_self_star" boolean DEFAULT false NOT NULL,
    "include_bot_messages" boolean DEFAULT false NOT NULL,
    "nsfw" "public"."StarboardNsfwMode" DEFAULT 'block'::"public"."StarboardNsfwMode" NOT NULL,
    "mode" "public"."StarboardChannelMode" DEFAULT 'denylist'::"public"."StarboardChannelMode" NOT NULL,
    "channels" "text"[] NOT NULL,
    "ignored_roles" "text"[] NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: starboard_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."starboard_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "source_channel_id" "text" NOT NULL,
    "source_message_id" "text" NOT NULL,
    "destination_message_id" "text",
    "author_id" "text" NOT NULL,
    "star_count" integer NOT NULL,
    "deleted" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: suggestions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."suggestions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "submitter_id" "text" NOT NULL,
    "content" "text" NOT NULL,
    "status" "public"."SuggestionStatus" DEFAULT 'submitted'::"public"."SuggestionStatus" NOT NULL,
    "submission_message_id" "text",
    "review_message_id" "text",
    "result_message_id" "text",
    "reviewer_id" "text",
    "staff_note" "text",
    "upvotes" integer DEFAULT 0 NOT NULL,
    "downvotes" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: ticket_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."ticket_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "emoji" "text",
    "button_style" "text" DEFAULT 'PRIMARY'::"text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "support_role_ids" "text"[],
    "parent_channel_id" "text",
    "name_template" "text",
    "open_message" "text",
    "default_priority" "public"."TicketPriority" DEFAULT 'normal'::"public"."TicketPriority" NOT NULL,
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "required_role_ids" "text"[],
    "max_open_per_user" integer,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "alert_user_ids" "text"[]
);


--
-- Name: ticket_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."ticket_events" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "action" "text" NOT NULL,
    "actor_id" "text" NOT NULL,
    "source" "text" NOT NULL,
    "details" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."ticket_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "ticket_id" "uuid" NOT NULL,
    "discord_message_id" "text",
    "author_id" "text" NOT NULL,
    "author_name" "text" NOT NULL,
    "content" "text" NOT NULL,
    "attachments" "text"[],
    "source" "public"."TicketMessageSource" DEFAULT 'discord'::"public"."TicketMessageSource" NOT NULL,
    "internal" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ticket_panels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."ticket_panels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "channel_id" "text" NOT NULL,
    "message_id" "text",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "color" "text" DEFAULT '#5865F2'::"text" NOT NULL,
    "style" "public"."TicketPanelStyle" DEFAULT 'buttons'::"public"."TicketPanelStyle" NOT NULL,
    "placeholder" "text" DEFAULT 'Select a ticket type'::"text" NOT NULL,
    "image_url" "text",
    "footer" "text",
    "category_ids" "text"[],
    "published_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: ticket_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."ticket_settings" (
    "guild_id" "uuid" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "mode" "public"."TicketMode" DEFAULT 'channel'::"public"."TicketMode" NOT NULL,
    "open_category_channel_id" "text",
    "closed_category_channel_id" "text",
    "thread_parent_channel_id" "text",
    "transcript_channel_id" "text",
    "log_channel_id" "text",
    "support_role_ids" "text"[],
    "ping_support_on_open" boolean DEFAULT true NOT NULL,
    "max_open_per_user" integer DEFAULT 1 NOT NULL,
    "name_template" "text" DEFAULT 'ticket-{number}'::"text" NOT NULL,
    "open_message" "text" DEFAULT 'Thanks for contacting support, {user}. A team member will be with you shortly.'::"text" NOT NULL,
    "embed_color" "text" DEFAULT '#5865F2'::"text" NOT NULL,
    "allow_user_close" boolean DEFAULT true NOT NULL,
    "require_close_reason" boolean DEFAULT false NOT NULL,
    "close_confirmation" boolean DEFAULT true NOT NULL,
    "close_action" "public"."TicketCloseAction" DEFAULT 'archive'::"public"."TicketCloseAction" NOT NULL,
    "delete_delay_seconds" integer DEFAULT 10 NOT NULL,
    "claim_enabled" boolean DEFAULT true NOT NULL,
    "claim_restricts_replies" boolean DEFAULT false NOT NULL,
    "transcripts_enabled" boolean DEFAULT true NOT NULL,
    "transcript_dm_user" boolean DEFAULT false NOT NULL,
    "feedback_enabled" boolean DEFAULT true NOT NULL,
    "auto_close_hours" integer DEFAULT 0 NOT NULL,
    "auto_close_warning_hours" integer DEFAULT 0 NOT NULL,
    "auto_close_exclude_claimed" boolean DEFAULT true NOT NULL,
    "blocked_user_ids" "text"[],
    "blocked_role_ids" "text"[],
    "next_number" integer DEFAULT 1 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "last_operation_source" "text" DEFAULT 'SYSTEM'::"text" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."tickets" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "number" integer NOT NULL,
    "category_id" "uuid",
    "opener_id" "text" NOT NULL,
    "opener_name" "text" NOT NULL,
    "channel_id" "text",
    "subject" "text",
    "answers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "status" "public"."TicketStatus" DEFAULT 'open'::"public"."TicketStatus" NOT NULL,
    "priority" "public"."TicketPriority" DEFAULT 'normal'::"public"."TicketPriority" NOT NULL,
    "claimed_by_id" "text",
    "participant_ids" "text"[],
    "tags" "text"[],
    "closed_by_id" "text",
    "close_reason" "text",
    "rating" integer,
    "feedback" "text",
    "transcript_message_id" "text",
    "auto_close_warned_at" timestamp(3) with time zone,
    "first_response_at" timestamp(3) with time zone,
    "last_activity_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "closed_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: welcome_goodbye_configs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."welcome_goodbye_configs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "uuid" NOT NULL,
    "kind" "public"."WelcomeGoodbyeKind" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "channel_id" "text" NOT NULL,
    "message_text" "text" NOT NULL,
    "embed_enabled" boolean DEFAULT false NOT NULL,
    "embed_title" "text",
    "embed_description" "text",
    "embed_color" "text",
    "thumbnail_avatar" boolean DEFAULT true NOT NULL,
    "footer" "text",
    "direct_message_enabled" boolean DEFAULT false NOT NULL,
    "image_url" "text",
    "role_mention_id" "text",
    "delete_after_seconds" integer,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."_prisma_migrations" ("id", "checksum", "finished_at", "migration_name", "logs", "rolled_back_at", "started_at", "applied_steps_count") FROM stdin;
0a280021-11fa-4013-9714-75118a003ed1	42abfe31d53a7e51082682f76c872d745eabfa06a4e5fb5493a9bf3591a6fa91	2026-09-25 04:41:44.074352+00	20260731000000_permission_foundation	\N	\N	2026-09-25 04:41:44.024938+00	1
33849e7a-a6bd-48f7-8e11-b5796f9065b7	0b3bad7aa3af8c4895e8463b3ce7d29f43cd41a51afb55ad895030fac214ede8	2026-09-25 04:41:44.078946+00	20260731230000_permission_repository_metadata	\N	\N	2026-09-25 04:41:44.074859+00	1
8819eb38-137f-4cb2-aca8-c426357fbe2f	06a67934a36e9f72a3a9db2752b728712701c746265b0f8214394773c72e3cc2	2026-09-25 04:41:44.081452+00	20260731233000_permission_assignment_lifecycle_actions	\N	\N	2026-09-25 04:41:44.079438+00	1
b97eb872-b5c5-4e66-b855-d00bd128a6c9	48259e26642445c51c8c58bdf3a5d01cbbe400cddb8bc3de6276276dcc1f8816	2026-09-25 04:41:44.084988+00	20260731234500_owner_protection_audit_actions	\N	\N	2026-09-25 04:41:44.081929+00	1
369d7ac8-ff7e-4f0f-ad43-3200faccc230	2399741ace5b66ebf91f80a3a583795b463cfd424737a7b0970c0b4ba0236e50	2026-09-25 04:41:44.173851+00	20260801000000_authentication_foundation	\N	\N	2026-09-25 04:41:44.085922+00	1
edb482af-598a-486e-9157-72842f4825f1	4bbeb3e7f0c4b16e3a8ae540e3df7457300c797f35d46cc59e2a64a7e43ab8be	2026-09-25 04:41:44.178239+00	20260801030000_oauth_pkce_mode	\N	\N	2026-09-25 04:41:44.174754+00	1
daf4f787-5e30-469d-8801-82810121cf13	62512b9df8c3d9ca7a19a40d12a96d7c25a0d2eda60c40b3bec5947514e152ba	2026-09-25 04:41:44.194128+00	20260802090000_role_menus	\N	\N	2026-09-25 04:41:44.178764+00	1
166c7430-88d0-4672-aad2-7b6b6944d46f	273cb55b4995f9b30e52bd6c50fe1d3303868feb711d6c334c2688394dfc00f0	2026-09-25 04:41:44.198614+00	20260802093000_permission_hyphenated_segments	\N	\N	2026-09-25 04:41:44.194596+00	1
775b79e8-f53c-4f8b-a596-ca2e4cc7d6c0	98acb651e11a6a9b6ed25fa51d62de6d5dfdc98fdcc863d3c6ebe0d9a561791c	2026-09-25 04:41:44.242522+00	20260802180000_discord_community_essentials	\N	\N	2026-09-25 04:41:44.199292+00	1
485dcfae-dc82-4c10-8764-ecc864dc304e	63506ee3814fedbd52f753893ca90ed6b44ae86b8bb9ebd604ea1e9ae71e1754	2026-09-25 04:41:44.24965+00	20260802193000_role_management_parity	\N	\N	2026-09-25 04:41:44.243407+00	1
b15e2d92-e740-4f8b-80f9-d057036999ee	679bfaa0e2e88b46e38d0244afb92df1ff7ff5dda829c0f1ce26447cf60f4511	2026-09-25 04:41:44.254412+00	20260802203000_role_management_conflict_metadata	\N	\N	2026-09-25 04:41:44.250132+00	1
421843d3-4d53-49e5-8351-9e6a70293487	50842d0e1245f24e5cc484c5f591254bd8406884a88936df31bd2fc5b82af3f9	2026-09-25 05:10:59.204373+00	20260925090000_ticket_system	\N	\N	2026-09-25 05:10:59.167464+00	1
f3526aac-fb47-4a86-b0cf-29d1f27bbfd2	e5f57fef98683b928643458d7375b07aa98a594e406604ec994146a8333563ac	2026-09-25 05:26:24.773511+00	20260925120000_ticket_alert_members	\N	\N	2026-09-25 05:26:24.770336+00	1
5e4bec6e-101b-4577-9655-86c954a921dd	49afba377429152bab6293811a1303cbe84468679746f77b6f15a02051ec8a88	2026-09-25 07:01:32.660207+00	20260925150000_moderation	\N	\N	2026-09-25 07:01:32.632979+00	1
\.


--
-- Data for Name: authentication_audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."authentication_audit_events" ("id", "action", "outcome", "reason_code", "request_id", "correlation_id", "actor_type", "actor_platform_user_id", "actor_service_identity_id", "target_platform_user_id", "target_external_identity_id", "target_browser_session_id", "target_oauth_transaction_id", "target_oauth_credential_id", "target_guild_membership_id", "provider", "purpose", "metadata", "ip_hmac", "user_agent_hmac", "device_hmac", "metadata_key_version", "occurred_at", "created_at") FROM stdin;
\.


--
-- Data for Name: autorole_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."autorole_configs" ("guild_id", "enabled", "delay_seconds", "include_bots", "created_at", "updated_at", "revision", "last_operation_source") FROM stdin;
\.


--
-- Data for Name: autorole_rules; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."autorole_rules" ("id", "guild_id", "role_id", "position", "created_at") FROM stdin;
\.


--
-- Data for Name: community_counters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."community_counters" ("id", "guild_id", "enabled", "channel_id", "label_template", "type", "role_id", "interval_seconds", "last_value", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: custom_commands; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."custom_commands" ("id", "guild_id", "name", "description", "response_text", "embed_template_id", "enabled", "allowed_channels", "denied_channels", "required_roles", "cooldown_seconds", "trigger_mode", "trigger_phrase", "delete_triggering_message", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: discord_guild_membership_roles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."discord_guild_membership_roles" ("membership_id", "role_id", "created_at") FROM stdin;
\.


--
-- Data for Name: discord_guild_memberships; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."discord_guild_memberships" ("id", "external_identity_id", "guild_id", "status", "source", "verified_at", "valid_until", "departed_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: discord_role_audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."discord_role_audit_events" ("id", "guild_id", "role_id", "feature", "operation", "source", "actor_type", "actor_id", "summary", "result", "metadata", "created_at") FROM stdin;
\.


--
-- Data for Name: embed_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."embed_templates" ("id", "guild_id", "name", "content", "title", "description", "color", "author", "thumbnail_url", "image_url", "footer", "timestamp", "fields", "allowed_role_mentions", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: external_identities; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."external_identities" ("id", "platform_user_id", "provider", "provider_subject_id", "username", "global_name", "avatar", "enabled", "linked_at", "verified_at", "last_provider_refresh_at", "unlinked_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: guilds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."guilds" ("id", "discord_guild_id", "enabled", "disabled_at", "created_at", "updated_at", "metadata") FROM stdin;
\.


--
-- Data for Name: moderation_cases; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."moderation_cases" ("id", "guild_id", "number", "type", "target_id", "target_name", "moderator_id", "moderator_name", "reason", "duration_minutes", "expires_at", "active", "source", "evidence", "dm_delivered", "log_message_id", "revoked_at", "revoked_by_id", "revoke_reason", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: moderation_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."moderation_settings" ("guild_id", "log_channel_id", "dm_on_action", "dm_include_moderator", "appeal_message", "require_reason", "default_timeout_minutes", "ban_delete_message_hours", "warning_expiry_days", "protected_role_ids", "escalation", "automod", "record_external_actions", "next_case_number", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: permission_assignments; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."permission_assignments" ("id", "principal_id", "permission_definition_id", "scope", "guild_id", "effect", "enabled", "expires_at", "revoked_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: permission_audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."permission_audit_events" ("id", "action", "actor_type", "actor_principal_id", "actor_principal_type", "actor_external_id", "actor_guild_discord_id", "actor_service", "target_principal_id", "target_principal_type", "target_external_id", "target_guild_discord_id", "scope", "scope_guild_id", "scope_guild_discord_id", "permission_definition_id", "permission_key", "assignment_id", "reason_code", "reason", "correlation_id", "before_snapshot", "after_snapshot", "occurred_at", "created_at") FROM stdin;
\.


--
-- Data for Name: permission_catalog_state; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."permission_catalog_state" ("id", "version", "checksum", "synced_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: permission_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."permission_definitions" ("id", "key", "description", "category", "enabled", "disabled_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: permission_principals; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."permission_principals" ("id", "type", "guild_id", "external_id", "enabled", "disabled_at", "created_at", "updated_at", "metadata") FROM stdin;
\.


--
-- Data for Name: platform_users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."platform_users" ("id", "status", "authentication_revision", "status_reason_code", "suspended_at", "disabled_at", "deleted_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: role_menu_options; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."role_menu_options" ("id", "role_menu_id", "role_id", "label", "description", "emoji", "position", "created_at", "revision", "last_operation_source") FROM stdin;
\.


--
-- Data for Name: role_menus; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."role_menus" ("id", "guild_id", "channel_id", "message_id", "title", "description", "presentation_type", "assignment_mode", "status", "created_by_discord_user_id", "created_at", "updated_at", "revision", "last_operation_source") FROM stdin;
\.


--
-- Data for Name: rules_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."rules_configs" ("guild_id", "enabled", "channel_id", "message_text", "button_label", "accepted_role_id", "pending_role_id", "message_id", "created_at", "updated_at", "revision", "last_operation_source") FROM stdin;
\.


--
-- Data for Name: server_log_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."server_log_configs" ("guild_id", "enabled", "events", "destinations", "ignored_channels", "ignored_roles", "ignored_users", "include_bots", "content_mode", "colors", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: starboard_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."starboard_configs" ("guild_id", "enabled", "destination_channel_id", "emoji", "threshold", "allow_self_star", "include_bot_messages", "nsfw", "mode", "channels", "ignored_roles", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: starboard_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."starboard_entries" ("id", "guild_id", "source_channel_id", "source_message_id", "destination_message_id", "author_id", "star_count", "deleted", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."suggestions" ("id", "guild_id", "submitter_id", "content", "status", "submission_message_id", "review_message_id", "result_message_id", "reviewer_id", "staff_note", "upvotes", "downvotes", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: ticket_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_categories" ("id", "guild_id", "name", "description", "emoji", "button_style", "enabled", "position", "support_role_ids", "parent_channel_id", "name_template", "open_message", "default_priority", "questions", "required_role_ids", "max_open_per_user", "created_at", "updated_at", "alert_user_ids") FROM stdin;
\.


--
-- Data for Name: ticket_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_events" ("id", "ticket_id", "action", "actor_id", "source", "details", "created_at") FROM stdin;
\.


--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_messages" ("id", "ticket_id", "discord_message_id", "author_id", "author_name", "content", "attachments", "source", "internal", "created_at") FROM stdin;
\.


--
-- Data for Name: ticket_panels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_panels" ("id", "guild_id", "name", "channel_id", "message_id", "title", "description", "color", "style", "placeholder", "image_url", "footer", "category_ids", "published_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: ticket_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_settings" ("guild_id", "enabled", "mode", "open_category_channel_id", "closed_category_channel_id", "thread_parent_channel_id", "transcript_channel_id", "log_channel_id", "support_role_ids", "ping_support_on_open", "max_open_per_user", "name_template", "open_message", "embed_color", "allow_user_close", "require_close_reason", "close_confirmation", "close_action", "delete_delay_seconds", "claim_enabled", "claim_restricts_replies", "transcripts_enabled", "transcript_dm_user", "feedback_enabled", "auto_close_hours", "auto_close_warning_hours", "auto_close_exclude_claimed", "blocked_user_ids", "blocked_role_ids", "next_number", "revision", "last_operation_source", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."tickets" ("id", "guild_id", "number", "category_id", "opener_id", "opener_name", "channel_id", "subject", "answers", "status", "priority", "claimed_by_id", "participant_ids", "tags", "closed_by_id", "close_reason", "rating", "feedback", "transcript_message_id", "auto_close_warned_at", "first_response_at", "last_activity_at", "closed_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: welcome_goodbye_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."welcome_goodbye_configs" ("id", "guild_id", "kind", "enabled", "channel_id", "message_text", "embed_enabled", "embed_title", "embed_description", "embed_color", "thumbnail_avatar", "footer", "direct_message_enabled", "image_url", "role_mention_id", "delete_after_seconds", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: authentication_audit_events authentication_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_pkey" PRIMARY KEY ("id");


--
-- Name: autorole_configs autorole_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."autorole_configs"
    ADD CONSTRAINT "autorole_configs_pkey" PRIMARY KEY ("guild_id");


--
-- Name: autorole_rules autorole_rules_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."autorole_rules"
    ADD CONSTRAINT "autorole_rules_pkey" PRIMARY KEY ("id");


--
-- Name: browser_sessions browser_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."browser_sessions"
    ADD CONSTRAINT "browser_sessions_pkey" PRIMARY KEY ("id");


--
-- Name: community_counters community_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."community_counters"
    ADD CONSTRAINT "community_counters_pkey" PRIMARY KEY ("id");


--
-- Name: custom_commands custom_commands_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."custom_commands"
    ADD CONSTRAINT "custom_commands_pkey" PRIMARY KEY ("id");


--
-- Name: discord_guild_membership_roles discord_guild_membership_roles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_guild_membership_roles"
    ADD CONSTRAINT "discord_guild_membership_roles_pkey" PRIMARY KEY ("membership_id", "role_id");


--
-- Name: discord_guild_memberships discord_guild_memberships_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_guild_memberships"
    ADD CONSTRAINT "discord_guild_memberships_pkey" PRIMARY KEY ("id");


--
-- Name: discord_role_audit_events discord_role_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_role_audit_events"
    ADD CONSTRAINT "discord_role_audit_events_pkey" PRIMARY KEY ("id");


--
-- Name: embed_templates embed_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."embed_templates"
    ADD CONSTRAINT "embed_templates_pkey" PRIMARY KEY ("id");


--
-- Name: external_identities external_identities_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."external_identities"
    ADD CONSTRAINT "external_identities_pkey" PRIMARY KEY ("id");


--
-- Name: guilds guilds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."guilds"
    ADD CONSTRAINT "guilds_pkey" PRIMARY KEY ("id");


--
-- Name: moderation_cases moderation_cases_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."moderation_cases"
    ADD CONSTRAINT "moderation_cases_pkey" PRIMARY KEY ("id");


--
-- Name: moderation_settings moderation_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."moderation_settings"
    ADD CONSTRAINT "moderation_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: oauth_credentials oauth_credentials_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."oauth_credentials"
    ADD CONSTRAINT "oauth_credentials_pkey" PRIMARY KEY ("id");


--
-- Name: oauth_transactions oauth_transactions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."oauth_transactions"
    ADD CONSTRAINT "oauth_transactions_pkey" PRIMARY KEY ("id");


--
-- Name: permission_assignments permission_assignments_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_assignments"
    ADD CONSTRAINT "permission_assignments_pkey" PRIMARY KEY ("id");


--
-- Name: permission_audit_events permission_audit_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_audit_events"
    ADD CONSTRAINT "permission_audit_events_pkey" PRIMARY KEY ("id");


--
-- Name: permission_catalog_state permission_catalog_state_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_catalog_state"
    ADD CONSTRAINT "permission_catalog_state_pkey" PRIMARY KEY ("id");


--
-- Name: permission_definitions permission_definitions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_definitions"
    ADD CONSTRAINT "permission_definitions_pkey" PRIMARY KEY ("id");


--
-- Name: permission_principals permission_principals_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_principals"
    ADD CONSTRAINT "permission_principals_pkey" PRIMARY KEY ("id");


--
-- Name: platform_users platform_users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."platform_users"
    ADD CONSTRAINT "platform_users_pkey" PRIMARY KEY ("id");


--
-- Name: role_menu_options role_menu_options_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."role_menu_options"
    ADD CONSTRAINT "role_menu_options_pkey" PRIMARY KEY ("id");


--
-- Name: role_menus role_menus_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."role_menus"
    ADD CONSTRAINT "role_menus_pkey" PRIMARY KEY ("id");


--
-- Name: rules_configs rules_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rules_configs"
    ADD CONSTRAINT "rules_configs_pkey" PRIMARY KEY ("guild_id");


--
-- Name: server_log_configs server_log_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."server_log_configs"
    ADD CONSTRAINT "server_log_configs_pkey" PRIMARY KEY ("guild_id");


--
-- Name: starboard_configs starboard_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."starboard_configs"
    ADD CONSTRAINT "starboard_configs_pkey" PRIMARY KEY ("guild_id");


--
-- Name: starboard_entries starboard_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."starboard_entries"
    ADD CONSTRAINT "starboard_entries_pkey" PRIMARY KEY ("id");


--
-- Name: suggestions suggestions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."suggestions"
    ADD CONSTRAINT "suggestions_pkey" PRIMARY KEY ("id");


--
-- Name: ticket_categories ticket_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_categories"
    ADD CONSTRAINT "ticket_categories_pkey" PRIMARY KEY ("id");


--
-- Name: ticket_events ticket_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_events"
    ADD CONSTRAINT "ticket_events_pkey" PRIMARY KEY ("id");


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_pkey" PRIMARY KEY ("id");


--
-- Name: ticket_panels ticket_panels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_panels"
    ADD CONSTRAINT "ticket_panels_pkey" PRIMARY KEY ("id");


--
-- Name: ticket_settings ticket_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_settings"
    ADD CONSTRAINT "ticket_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_pkey" PRIMARY KEY ("id");


--
-- Name: welcome_goodbye_configs welcome_goodbye_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."welcome_goodbye_configs"
    ADD CONSTRAINT "welcome_goodbye_configs_pkey" PRIMARY KEY ("id");


--
-- Name: authentication_audit_events_action_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "authentication_audit_events_action_time_idx" ON "public"."authentication_audit_events" USING "btree" ("action", "occurred_at");


--
-- Name: authentication_audit_events_actor_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "authentication_audit_events_actor_time_idx" ON "public"."authentication_audit_events" USING "btree" ("actor_platform_user_id", "occurred_at");


--
-- Name: authentication_audit_events_correlation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "authentication_audit_events_correlation_idx" ON "public"."authentication_audit_events" USING "btree" ("correlation_id");


--
-- Name: authentication_audit_events_target_user_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "authentication_audit_events_target_user_time_idx" ON "public"."authentication_audit_events" USING "btree" ("target_platform_user_id", "occurred_at");


--
-- Name: autorole_rules_guild_position_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "autorole_rules_guild_position_key" ON "public"."autorole_rules" USING "btree" ("guild_id", "position");


--
-- Name: autorole_rules_guild_role_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "autorole_rules_guild_role_key" ON "public"."autorole_rules" USING "btree" ("guild_id", "role_id");


--
-- Name: browser_sessions_absolute_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "browser_sessions_absolute_expiry_idx" ON "public"."browser_sessions" USING "btree" ("absolute_expires_at");


--
-- Name: browser_sessions_auth_revision_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "browser_sessions_auth_revision_idx" ON "public"."browser_sessions" USING "btree" ("authentication_revision_at_issue");


--
-- Name: browser_sessions_csrf_digest_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "browser_sessions_csrf_digest_key" ON "public"."browser_sessions" USING "btree" ("csrf_digest");


--
-- Name: browser_sessions_idle_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "browser_sessions_idle_expiry_idx" ON "public"."browser_sessions" USING "btree" ("idle_expires_at");


--
-- Name: browser_sessions_rotated_from_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "browser_sessions_rotated_from_key" ON "public"."browser_sessions" USING "btree" ("rotated_from_session_id");


--
-- Name: browser_sessions_token_digest_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "browser_sessions_token_digest_key" ON "public"."browser_sessions" USING "btree" ("token_digest");


--
-- Name: browser_sessions_user_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "browser_sessions_user_status_idx" ON "public"."browser_sessions" USING "btree" ("platform_user_id", "status");


--
-- Name: community_counters_guild_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "community_counters_guild_enabled_idx" ON "public"."community_counters" USING "btree" ("guild_id", "enabled");


--
-- Name: custom_commands_guild_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "custom_commands_guild_name_key" ON "public"."custom_commands" USING "btree" ("guild_id", "name");


--
-- Name: discord_guild_membership_roles_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "discord_guild_membership_roles_role_idx" ON "public"."discord_guild_membership_roles" USING "btree" ("role_id");


--
-- Name: discord_guild_memberships_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "discord_guild_memberships_guild_status_idx" ON "public"."discord_guild_memberships" USING "btree" ("guild_id", "status", "valid_until");


--
-- Name: discord_guild_memberships_identity_guild_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "discord_guild_memberships_identity_guild_key" ON "public"."discord_guild_memberships" USING "btree" ("external_identity_id", "guild_id");


--
-- Name: discord_role_audit_guild_role_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "discord_role_audit_guild_role_created_idx" ON "public"."discord_role_audit_events" USING "btree" ("guild_id", "role_id", "created_at");


--
-- Name: embed_templates_guild_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "embed_templates_guild_name_key" ON "public"."embed_templates" USING "btree" ("guild_id", "name");


--
-- Name: external_identities_provider_subject_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "external_identities_provider_subject_key" ON "public"."external_identities" USING "btree" ("provider", "provider_subject_id");


--
-- Name: external_identities_user_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "external_identities_user_enabled_idx" ON "public"."external_identities" USING "btree" ("platform_user_id", "enabled");


--
-- Name: external_identities_user_provider_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "external_identities_user_provider_key" ON "public"."external_identities" USING "btree" ("platform_user_id", "provider");


--
-- Name: guild_discord_guild_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "guild_discord_guild_id_key" ON "public"."guilds" USING "btree" ("discord_guild_id");


--
-- Name: moderation_cases_guild_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "moderation_cases_guild_created_idx" ON "public"."moderation_cases" USING "btree" ("guild_id", "created_at");


--
-- Name: moderation_cases_guild_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "moderation_cases_guild_number_key" ON "public"."moderation_cases" USING "btree" ("guild_id", "number");


--
-- Name: moderation_cases_guild_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "moderation_cases_guild_target_idx" ON "public"."moderation_cases" USING "btree" ("guild_id", "target_id", "created_at");


--
-- Name: moderation_cases_guild_type_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "moderation_cases_guild_type_active_idx" ON "public"."moderation_cases" USING "btree" ("guild_id", "type", "active", "expires_at");


--
-- Name: oauth_credentials_external_identity_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "oauth_credentials_external_identity_key" ON "public"."oauth_credentials" USING "btree" ("external_identity_id");


--
-- Name: oauth_credentials_provider_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "oauth_credentials_provider_expiry_idx" ON "public"."oauth_credentials" USING "btree" ("provider_expires_at");


--
-- Name: oauth_transactions_browser_binding_digest_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "oauth_transactions_browser_binding_digest_key" ON "public"."oauth_transactions" USING "btree" ("browser_binding_digest");


--
-- Name: oauth_transactions_state_digest_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "oauth_transactions_state_digest_key" ON "public"."oauth_transactions" USING "btree" ("state_digest");


--
-- Name: oauth_transactions_state_expiry_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "oauth_transactions_state_expiry_idx" ON "public"."oauth_transactions" USING "btree" ("state", "expires_at");


--
-- Name: oauth_transactions_user_purpose_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "oauth_transactions_user_purpose_idx" ON "public"."oauth_transactions" USING "btree" ("platform_user_id", "purpose");


--
-- Name: permission_assignments_active_guild_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "permission_assignments_active_guild_key" ON "public"."permission_assignments" USING "btree" ("principal_id", "permission_definition_id", "effect", "guild_id") WHERE (("scope" = 'discord-guild'::"public"."PermissionScopeType") AND "enabled" AND ("revoked_at" IS NULL));


--
-- Name: permission_assignments_active_platform_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "permission_assignments_active_platform_key" ON "public"."permission_assignments" USING "btree" ("principal_id", "permission_definition_id", "effect") WHERE (("scope" = 'platform'::"public"."PermissionScopeType") AND "enabled" AND ("revoked_at" IS NULL));


--
-- Name: permission_assignments_guild_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_assignments_guild_idx" ON "public"."permission_assignments" USING "btree" ("guild_id");


--
-- Name: permission_assignments_lookup_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_assignments_lookup_idx" ON "public"."permission_assignments" USING "btree" ("principal_id", "scope", "guild_id", "enabled");


--
-- Name: permission_assignments_permission_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_assignments_permission_idx" ON "public"."permission_assignments" USING "btree" ("permission_definition_id");


--
-- Name: permission_audit_events_actor_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_audit_events_actor_idx" ON "public"."permission_audit_events" USING "btree" ("actor_principal_id");


--
-- Name: permission_audit_events_assignment_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_audit_events_assignment_idx" ON "public"."permission_audit_events" USING "btree" ("assignment_id");


--
-- Name: permission_audit_events_correlation_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_audit_events_correlation_idx" ON "public"."permission_audit_events" USING "btree" ("correlation_id");


--
-- Name: permission_audit_events_permission_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_audit_events_permission_idx" ON "public"."permission_audit_events" USING "btree" ("permission_definition_id");


--
-- Name: permission_audit_events_scope_time_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_audit_events_scope_time_idx" ON "public"."permission_audit_events" USING "btree" ("scope", "scope_guild_id", "occurred_at");


--
-- Name: permission_audit_events_target_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_audit_events_target_idx" ON "public"."permission_audit_events" USING "btree" ("target_principal_id");


--
-- Name: permission_definitions_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_definitions_enabled_idx" ON "public"."permission_definitions" USING "btree" ("enabled");


--
-- Name: permission_definitions_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "permission_definitions_key_key" ON "public"."permission_definitions" USING "btree" ("key");


--
-- Name: permission_principals_guild_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "permission_principals_guild_enabled_idx" ON "public"."permission_principals" USING "btree" ("guild_id", "enabled");


--
-- Name: permission_principals_identity_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "permission_principals_identity_key" ON "public"."permission_principals" USING "btree" ("type", "guild_id", "external_id");


--
-- Name: platform_users_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "platform_users_status_idx" ON "public"."platform_users" USING "btree" ("status");


--
-- Name: role_menu_options_position_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "role_menu_options_position_key" ON "public"."role_menu_options" USING "btree" ("role_menu_id", "position");


--
-- Name: role_menu_options_role_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "role_menu_options_role_idx" ON "public"."role_menu_options" USING "btree" ("role_id");


--
-- Name: role_menu_options_role_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "role_menu_options_role_key" ON "public"."role_menu_options" USING "btree" ("role_menu_id", "role_id");


--
-- Name: role_menus_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "role_menus_guild_status_idx" ON "public"."role_menus" USING "btree" ("guild_id", "status");


--
-- Name: role_menus_published_message_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "role_menus_published_message_idx" ON "public"."role_menus" USING "btree" ("guild_id", "channel_id", "message_id");


--
-- Name: role_menus_published_message_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "role_menus_published_message_key" ON "public"."role_menus" USING "btree" ("guild_id", "channel_id", "message_id") WHERE ("message_id" IS NOT NULL);


--
-- Name: starboard_entries_guild_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "starboard_entries_guild_deleted_idx" ON "public"."starboard_entries" USING "btree" ("guild_id", "deleted");


--
-- Name: starboard_entries_source_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "starboard_entries_source_key" ON "public"."starboard_entries" USING "btree" ("guild_id", "source_message_id");


--
-- Name: suggestions_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "suggestions_guild_status_idx" ON "public"."suggestions" USING "btree" ("guild_id", "status", "created_at");


--
-- Name: ticket_categories_guild_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ticket_categories_guild_name_key" ON "public"."ticket_categories" USING "btree" ("guild_id", "name");


--
-- Name: ticket_categories_guild_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ticket_categories_guild_position_idx" ON "public"."ticket_categories" USING "btree" ("guild_id", "position");


--
-- Name: ticket_events_ticket_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ticket_events_ticket_created_idx" ON "public"."ticket_events" USING "btree" ("ticket_id", "created_at");


--
-- Name: ticket_messages_discord_message_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ticket_messages_discord_message_id_key" ON "public"."ticket_messages" USING "btree" ("discord_message_id");


--
-- Name: ticket_messages_ticket_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "ticket_messages_ticket_created_idx" ON "public"."ticket_messages" USING "btree" ("ticket_id", "created_at");


--
-- Name: ticket_panels_guild_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "ticket_panels_guild_name_key" ON "public"."ticket_panels" USING "btree" ("guild_id", "name");


--
-- Name: tickets_channel_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tickets_channel_id_key" ON "public"."tickets" USING "btree" ("channel_id");


--
-- Name: tickets_guild_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "tickets_guild_number_key" ON "public"."tickets" USING "btree" ("guild_id", "number");


--
-- Name: tickets_guild_opener_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tickets_guild_opener_status_idx" ON "public"."tickets" USING "btree" ("guild_id", "opener_id", "status");


--
-- Name: tickets_guild_status_activity_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "tickets_guild_status_activity_idx" ON "public"."tickets" USING "btree" ("guild_id", "status", "last_activity_at");


--
-- Name: welcome_goodbye_configs_guild_kind_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "welcome_goodbye_configs_guild_kind_key" ON "public"."welcome_goodbye_configs" USING "btree" ("guild_id", "kind");


--
-- Name: authentication_audit_events authentication_audit_events_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "authentication_audit_events_append_only" BEFORE DELETE OR UPDATE ON "public"."authentication_audit_events" FOR EACH ROW EXECUTE FUNCTION "public"."reject_authentication_audit_mutation"();


--
-- Name: browser_sessions browser_sessions_identity_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "browser_sessions_identity_guard" BEFORE INSERT OR UPDATE ON "public"."browser_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_browser_session_identity"();


--
-- Name: browser_sessions browser_sessions_identity_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "browser_sessions_identity_immutable" BEFORE UPDATE ON "public"."browser_sessions" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_authentication_identity_change"();


--
-- Name: discord_guild_membership_roles discord_guild_membership_roles_integrity_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "discord_guild_membership_roles_integrity_guard" BEFORE INSERT OR UPDATE ON "public"."discord_guild_membership_roles" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_membership_role_integrity"();


--
-- Name: discord_guild_memberships discord_guild_memberships_identity_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "discord_guild_memberships_identity_immutable" BEFORE UPDATE ON "public"."discord_guild_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_authentication_identity_change"();


--
-- Name: discord_guild_memberships discord_guild_memberships_provider_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "discord_guild_memberships_provider_guard" BEFORE INSERT OR UPDATE ON "public"."discord_guild_memberships" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_membership_identity_provider"();


--
-- Name: external_identities external_identities_identity_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "external_identities_identity_immutable" BEFORE UPDATE ON "public"."external_identities" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_authentication_identity_change"();


--
-- Name: external_identities external_identities_ownership_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "external_identities_ownership_immutable" BEFORE UPDATE ON "public"."external_identities" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_external_identity_immutability"();


--
-- Name: guilds guilds_created_at_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "guilds_created_at_immutable" BEFORE UPDATE ON "public"."guilds" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_created_at_change"();


--
-- Name: oauth_credentials oauth_credentials_identity_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "oauth_credentials_identity_immutable" BEFORE UPDATE ON "public"."oauth_credentials" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_authentication_identity_change"();


--
-- Name: oauth_credentials oauth_credentials_ownership_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "oauth_credentials_ownership_immutable" BEFORE UPDATE ON "public"."oauth_credentials" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_oauth_credential_immutability"();


--
-- Name: oauth_transactions oauth_transactions_binding_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "oauth_transactions_binding_guard" BEFORE INSERT OR UPDATE ON "public"."oauth_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_oauth_transaction_binding"();


--
-- Name: oauth_transactions oauth_transactions_identity_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "oauth_transactions_identity_immutable" BEFORE UPDATE ON "public"."oauth_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_authentication_identity_change"();


--
-- Name: oauth_transactions oauth_transactions_transition_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "oauth_transactions_transition_guard" BEFORE UPDATE ON "public"."oauth_transactions" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_oauth_transaction_transition"();


--
-- Name: permission_assignments permission_assignments_created_at_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "permission_assignments_created_at_immutable" BEFORE UPDATE ON "public"."permission_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_created_at_change"();


--
-- Name: permission_assignments permission_assignments_guild_guard; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "permission_assignments_guild_guard" BEFORE INSERT OR UPDATE ON "public"."permission_assignments" FOR EACH ROW EXECUTE FUNCTION "public"."enforce_permission_assignment_guild"();


--
-- Name: permission_audit_events permission_audit_events_append_only; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "permission_audit_events_append_only" BEFORE DELETE OR UPDATE ON "public"."permission_audit_events" FOR EACH ROW EXECUTE FUNCTION "public"."reject_permission_audit_mutation"();


--
-- Name: permission_catalog_state permission_catalog_state_created_at_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "permission_catalog_state_created_at_immutable" BEFORE UPDATE ON "public"."permission_catalog_state" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_created_at_change"();


--
-- Name: permission_definitions permission_definitions_created_at_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "permission_definitions_created_at_immutable" BEFORE UPDATE ON "public"."permission_definitions" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_created_at_change"();


--
-- Name: permission_principals permission_principals_created_at_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "permission_principals_created_at_immutable" BEFORE UPDATE ON "public"."permission_principals" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_created_at_change"();


--
-- Name: platform_users platform_users_identity_immutable; Type: TRIGGER; Schema: public; Owner: -
--

CREATE TRIGGER "platform_users_identity_immutable" BEFORE UPDATE ON "public"."platform_users" FOR EACH ROW EXECUTE FUNCTION "public"."prevent_authentication_identity_change"();


--
-- Name: authentication_audit_events authentication_audit_events_actor_platform_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_actor_platform_user_id_fkey" FOREIGN KEY ("actor_platform_user_id") REFERENCES "public"."platform_users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: authentication_audit_events authentication_audit_events_target_browser_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_target_browser_session_id_fkey" FOREIGN KEY ("target_browser_session_id") REFERENCES "public"."browser_sessions"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: authentication_audit_events authentication_audit_events_target_external_identity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_target_external_identity_id_fkey" FOREIGN KEY ("target_external_identity_id") REFERENCES "public"."external_identities"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: authentication_audit_events authentication_audit_events_target_guild_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_target_guild_membership_id_fkey" FOREIGN KEY ("target_guild_membership_id") REFERENCES "public"."discord_guild_memberships"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: authentication_audit_events authentication_audit_events_target_oauth_credential_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_target_oauth_credential_id_fkey" FOREIGN KEY ("target_oauth_credential_id") REFERENCES "public"."oauth_credentials"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: authentication_audit_events authentication_audit_events_target_oauth_transaction_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_target_oauth_transaction_id_fkey" FOREIGN KEY ("target_oauth_transaction_id") REFERENCES "public"."oauth_transactions"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: authentication_audit_events authentication_audit_events_target_platform_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."authentication_audit_events"
    ADD CONSTRAINT "authentication_audit_events_target_platform_user_id_fkey" FOREIGN KEY ("target_platform_user_id") REFERENCES "public"."platform_users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: autorole_configs autorole_configs_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."autorole_configs"
    ADD CONSTRAINT "autorole_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: autorole_rules autorole_rules_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."autorole_rules"
    ADD CONSTRAINT "autorole_rules_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: browser_sessions browser_sessions_login_identity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."browser_sessions"
    ADD CONSTRAINT "browser_sessions_login_identity_id_fkey" FOREIGN KEY ("login_identity_id") REFERENCES "public"."external_identities"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: browser_sessions browser_sessions_platform_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."browser_sessions"
    ADD CONSTRAINT "browser_sessions_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "public"."platform_users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: browser_sessions browser_sessions_rotated_from_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."browser_sessions"
    ADD CONSTRAINT "browser_sessions_rotated_from_session_id_fkey" FOREIGN KEY ("rotated_from_session_id") REFERENCES "public"."browser_sessions"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: community_counters community_counters_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."community_counters"
    ADD CONSTRAINT "community_counters_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: custom_commands custom_commands_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."custom_commands"
    ADD CONSTRAINT "custom_commands_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: discord_guild_membership_roles discord_guild_membership_roles_membership_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_guild_membership_roles"
    ADD CONSTRAINT "discord_guild_membership_roles_membership_id_fkey" FOREIGN KEY ("membership_id") REFERENCES "public"."discord_guild_memberships"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: discord_guild_memberships discord_guild_memberships_external_identity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_guild_memberships"
    ADD CONSTRAINT "discord_guild_memberships_external_identity_id_fkey" FOREIGN KEY ("external_identity_id") REFERENCES "public"."external_identities"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: discord_guild_memberships discord_guild_memberships_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_guild_memberships"
    ADD CONSTRAINT "discord_guild_memberships_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: discord_role_audit_events discord_role_audit_events_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."discord_role_audit_events"
    ADD CONSTRAINT "discord_role_audit_events_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: embed_templates embed_templates_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."embed_templates"
    ADD CONSTRAINT "embed_templates_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: external_identities external_identities_platform_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."external_identities"
    ADD CONSTRAINT "external_identities_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "public"."platform_users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: oauth_credentials oauth_credentials_external_identity_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."oauth_credentials"
    ADD CONSTRAINT "oauth_credentials_external_identity_id_fkey" FOREIGN KEY ("external_identity_id") REFERENCES "public"."external_identities"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: oauth_transactions oauth_transactions_initiating_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."oauth_transactions"
    ADD CONSTRAINT "oauth_transactions_initiating_session_id_fkey" FOREIGN KEY ("initiating_session_id") REFERENCES "public"."browser_sessions"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: oauth_transactions oauth_transactions_platform_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."oauth_transactions"
    ADD CONSTRAINT "oauth_transactions_platform_user_id_fkey" FOREIGN KEY ("platform_user_id") REFERENCES "public"."platform_users"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_assignments permission_assignments_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_assignments"
    ADD CONSTRAINT "permission_assignments_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_assignments permission_assignments_permission_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_assignments"
    ADD CONSTRAINT "permission_assignments_permission_definition_id_fkey" FOREIGN KEY ("permission_definition_id") REFERENCES "public"."permission_definitions"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_assignments permission_assignments_principal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_assignments"
    ADD CONSTRAINT "permission_assignments_principal_id_fkey" FOREIGN KEY ("principal_id") REFERENCES "public"."permission_principals"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_audit_events permission_audit_events_actor_principal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_audit_events"
    ADD CONSTRAINT "permission_audit_events_actor_principal_id_fkey" FOREIGN KEY ("actor_principal_id") REFERENCES "public"."permission_principals"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_audit_events permission_audit_events_assignment_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_audit_events"
    ADD CONSTRAINT "permission_audit_events_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "public"."permission_assignments"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_audit_events permission_audit_events_permission_definition_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_audit_events"
    ADD CONSTRAINT "permission_audit_events_permission_definition_id_fkey" FOREIGN KEY ("permission_definition_id") REFERENCES "public"."permission_definitions"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_audit_events permission_audit_events_scope_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_audit_events"
    ADD CONSTRAINT "permission_audit_events_scope_guild_id_fkey" FOREIGN KEY ("scope_guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_audit_events permission_audit_events_target_principal_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_audit_events"
    ADD CONSTRAINT "permission_audit_events_target_principal_id_fkey" FOREIGN KEY ("target_principal_id") REFERENCES "public"."permission_principals"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: permission_principals permission_principals_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."permission_principals"
    ADD CONSTRAINT "permission_principals_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: role_menu_options role_menu_options_role_menu_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."role_menu_options"
    ADD CONSTRAINT "role_menu_options_role_menu_id_fkey" FOREIGN KEY ("role_menu_id") REFERENCES "public"."role_menus"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: role_menus role_menus_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."role_menus"
    ADD CONSTRAINT "role_menus_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: rules_configs rules_configs_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."rules_configs"
    ADD CONSTRAINT "rules_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: server_log_configs server_log_configs_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."server_log_configs"
    ADD CONSTRAINT "server_log_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: starboard_configs starboard_configs_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."starboard_configs"
    ADD CONSTRAINT "starboard_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: starboard_entries starboard_entries_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."starboard_entries"
    ADD CONSTRAINT "starboard_entries_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: suggestions suggestions_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."suggestions"
    ADD CONSTRAINT "suggestions_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: ticket_categories ticket_categories_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_categories"
    ADD CONSTRAINT "ticket_categories_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: ticket_events ticket_events_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_events"
    ADD CONSTRAINT "ticket_events_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_messages"
    ADD CONSTRAINT "ticket_messages_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "public"."tickets"("id") ON UPDATE RESTRICT ON DELETE CASCADE;


--
-- Name: ticket_panels ticket_panels_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_panels"
    ADD CONSTRAINT "ticket_panels_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: ticket_settings ticket_settings_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."ticket_settings"
    ADD CONSTRAINT "ticket_settings_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: tickets tickets_category_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "public"."ticket_categories"("id") ON UPDATE RESTRICT ON DELETE SET NULL;


--
-- Name: tickets tickets_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."tickets"
    ADD CONSTRAINT "tickets_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- Name: welcome_goodbye_configs welcome_goodbye_configs_guild_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."welcome_goodbye_configs"
    ADD CONSTRAINT "welcome_goodbye_configs_guild_id_fkey" FOREIGN KEY ("guild_id") REFERENCES "public"."guilds"("id") ON UPDATE RESTRICT ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--


