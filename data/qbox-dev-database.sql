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

ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_oauth_credential_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_guild_membership_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_external_identity_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_target_browser_session_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_actor_platform_user_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."applications" DROP CONSTRAINT IF EXISTS "applications_form_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."application_votes" DROP CONSTRAINT IF EXISTS "application_votes_application_id_fkey";
ALTER TABLE IF EXISTS ONLY "public"."application_notes" DROP CONSTRAINT IF EXISTS "application_notes_application_id_fkey";
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
DROP INDEX IF EXISTS "public"."voice_rooms_hub_idx";
DROP INDEX IF EXISTS "public"."voice_rooms_guild_owner_idx";
DROP INDEX IF EXISTS "public"."voice_rooms_channel_key";
DROP INDEX IF EXISTS "public"."voice_hubs_guild_channel_key";
DROP INDEX IF EXISTS "public"."verification_settings_kick_idx";
DROP INDEX IF EXISTS "public"."verification_pending_members_guild_joined_idx";
DROP INDEX IF EXISTS "public"."verification_attempts_guild_user_idx";
DROP INDEX IF EXISTS "public"."verification_attempts_guild_result_idx";
DROP INDEX IF EXISTS "public"."verification_attempts_guild_created_idx";
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
DROP INDEX IF EXISTS "public"."streams_subscriptions_guild_creator_key";
DROP INDEX IF EXISTS "public"."streams_subscriptions_active_idx";
DROP INDEX IF EXISTS "public"."starboard_entries_source_key";
DROP INDEX IF EXISTS "public"."starboard_entries_guild_deleted_idx";
DROP INDEX IF EXISTS "public"."staff_strikes_guild_user_idx";
DROP INDEX IF EXISTS "public"."staff_shifts_open_idx";
DROP INDEX IF EXISTS "public"."staff_shifts_guild_user_idx";
DROP INDEX IF EXISTS "public"."staff_shifts_guild_started_idx";
DROP INDEX IF EXISTS "public"."staff_records_guild_user_idx";
DROP INDEX IF EXISTS "public"."staff_records_guild_created_idx";
DROP INDEX IF EXISTS "public"."staff_ranks_guild_position_idx";
DROP INDEX IF EXISTS "public"."staff_ranks_guild_name_key";
DROP INDEX IF EXISTS "public"."staff_members_rank_idx";
DROP INDEX IF EXISTS "public"."staff_members_guild_user_key";
DROP INDEX IF EXISTS "public"."staff_leaves_guild_user_idx";
DROP INDEX IF EXISTS "public"."staff_leaves_guild_status_idx";
DROP INDEX IF EXISTS "public"."staff_leaves_due_idx";
DROP INDEX IF EXISTS "public"."scheduled_messages_guild_name_key";
DROP INDEX IF EXISTS "public"."scheduled_messages_due_idx";
DROP INDEX IF EXISTS "public"."scheduled_message_runs_message_idx";
DROP INDEX IF EXISTS "public"."scheduled_message_runs_guild_idx";
DROP INDEX IF EXISTS "public"."role_menus_published_message_key";
DROP INDEX IF EXISTS "public"."role_menus_published_message_idx";
DROP INDEX IF EXISTS "public"."role_menus_guild_status_idx";
DROP INDEX IF EXISTS "public"."role_menu_options_role_key";
DROP INDEX IF EXISTS "public"."role_menu_options_role_idx";
DROP INDEX IF EXISTS "public"."role_menu_options_position_key";
DROP INDEX IF EXISTS "public"."polls_status_ends_idx";
DROP INDEX IF EXISTS "public"."polls_guild_status_idx";
DROP INDEX IF EXISTS "public"."polls_guild_number_key";
DROP INDEX IF EXISTS "public"."poll_votes_poll_user_key";
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
DROP INDEX IF EXISTS "public"."music_tracks_guild_hash_key";
DROP INDEX IF EXISTS "public"."music_tracks_guild_created_idx";
DROP INDEX IF EXISTS "public"."music_stations_guild_url_key";
DROP INDEX IF EXISTS "public"."music_settings_stay_connected_idx";
DROP INDEX IF EXISTS "public"."music_sessions_state_idx";
DROP INDEX IF EXISTS "public"."music_playlists_guild_name_idx";
DROP INDEX IF EXISTS "public"."music_playlist_tracks_track_idx";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_type_active_idx";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_target_idx";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_number_key";
DROP INDEX IF EXISTS "public"."moderation_cases_guild_created_idx";
DROP INDEX IF EXISTS "public"."messages_templates_guild_key_key";
DROP INDEX IF EXISTS "public"."level_members_guild_xp_idx";
DROP INDEX IF EXISTS "public"."knowledge_categories_guild_order_idx";
DROP INDEX IF EXISTS "public"."knowledge_articles_guild_slug_key";
DROP INDEX IF EXISTS "public"."knowledge_articles_guild_published_idx";
DROP INDEX IF EXISTS "public"."knowledge_articles_category_idx";
DROP INDEX IF EXISTS "public"."guild_discord_guild_id_key";
DROP INDEX IF EXISTS "public"."giveaways_status_ends_idx";
DROP INDEX IF EXISTS "public"."giveaways_guild_status_idx";
DROP INDEX IF EXISTS "public"."giveaways_guild_number_key";
DROP INDEX IF EXISTS "public"."giveaway_entries_giveaway_user_key";
DROP INDEX IF EXISTS "public"."games_status_snapshots_server_at_idx";
DROP INDEX IF EXISTS "public"."games_servers_guild_idx";
DROP INDEX IF EXISTS "public"."fivem_status_snapshots_guild_at_idx";
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
DROP INDEX IF EXISTS "public"."builder_runs_status_idx";
DROP INDEX IF EXISTS "public"."builder_runs_guild_created_idx";
DROP INDEX IF EXISTS "public"."builder_run_items_run_sequence_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_user_status_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_token_digest_key";
DROP INDEX IF EXISTS "public"."browser_sessions_rotated_from_key";
DROP INDEX IF EXISTS "public"."browser_sessions_idle_expiry_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_csrf_digest_key";
DROP INDEX IF EXISTS "public"."browser_sessions_auth_revision_idx";
DROP INDEX IF EXISTS "public"."browser_sessions_absolute_expiry_idx";
DROP INDEX IF EXISTS "public"."birthdays_role_remove_idx";
DROP INDEX IF EXISTS "public"."birthdays_guild_user_key";
DROP INDEX IF EXISTS "public"."birthdays_guild_date_idx";
DROP INDEX IF EXISTS "public"."birthday_settings_enabled_idx";
DROP INDEX IF EXISTS "public"."autorole_rules_guild_role_key";
DROP INDEX IF EXISTS "public"."autorole_rules_guild_position_key";
DROP INDEX IF EXISTS "public"."authentication_audit_events_target_user_time_idx";
DROP INDEX IF EXISTS "public"."authentication_audit_events_correlation_idx";
DROP INDEX IF EXISTS "public"."authentication_audit_events_actor_time_idx";
DROP INDEX IF EXISTS "public"."authentication_audit_events_action_time_idx";
DROP INDEX IF EXISTS "public"."applications_guild_status_idx";
DROP INDEX IF EXISTS "public"."applications_guild_number_key";
DROP INDEX IF EXISTS "public"."applications_guild_form_applicant_idx";
DROP INDEX IF EXISTS "public"."applications_guild_applicant_idx";
DROP INDEX IF EXISTS "public"."application_panels_guild_idx";
DROP INDEX IF EXISTS "public"."application_notes_application_idx";
DROP INDEX IF EXISTS "public"."application_forms_guild_position_idx";
ALTER TABLE IF EXISTS ONLY "public"."welcome_goodbye_configs" DROP CONSTRAINT IF EXISTS "welcome_goodbye_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."voice_settings" DROP CONSTRAINT IF EXISTS "voice_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."voice_rooms" DROP CONSTRAINT IF EXISTS "voice_rooms_pkey";
ALTER TABLE IF EXISTS ONLY "public"."voice_hubs" DROP CONSTRAINT IF EXISTS "voice_hubs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."verification_settings" DROP CONSTRAINT IF EXISTS "verification_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."verification_pending_members" DROP CONSTRAINT IF EXISTS "verification_pending_members_pkey";
ALTER TABLE IF EXISTS ONLY "public"."verification_attempts" DROP CONSTRAINT IF EXISTS "verification_attempts_pkey";
ALTER TABLE IF EXISTS ONLY "public"."tickets" DROP CONSTRAINT IF EXISTS "tickets_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_settings" DROP CONSTRAINT IF EXISTS "ticket_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_panels" DROP CONSTRAINT IF EXISTS "ticket_panels_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_messages" DROP CONSTRAINT IF EXISTS "ticket_messages_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_events" DROP CONSTRAINT IF EXISTS "ticket_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."ticket_categories" DROP CONSTRAINT IF EXISTS "ticket_categories_pkey";
ALTER TABLE IF EXISTS ONLY "public"."suggestions" DROP CONSTRAINT IF EXISTS "suggestions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."streams_subscriptions" DROP CONSTRAINT IF EXISTS "streams_subscriptions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."streams_settings" DROP CONSTRAINT IF EXISTS "streams_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."starboard_entries" DROP CONSTRAINT IF EXISTS "starboard_entries_pkey";
ALTER TABLE IF EXISTS ONLY "public"."starboard_configs" DROP CONSTRAINT IF EXISTS "starboard_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_strikes" DROP CONSTRAINT IF EXISTS "staff_strikes_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_shifts" DROP CONSTRAINT IF EXISTS "staff_shifts_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_settings" DROP CONSTRAINT IF EXISTS "staff_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_records" DROP CONSTRAINT IF EXISTS "staff_records_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_ranks" DROP CONSTRAINT IF EXISTS "staff_ranks_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_members" DROP CONSTRAINT IF EXISTS "staff_members_pkey";
ALTER TABLE IF EXISTS ONLY "public"."staff_leaves" DROP CONSTRAINT IF EXISTS "staff_leaves_pkey";
ALTER TABLE IF EXISTS ONLY "public"."server_log_configs" DROP CONSTRAINT IF EXISTS "server_log_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."scheduled_messages" DROP CONSTRAINT IF EXISTS "scheduled_messages_pkey";
ALTER TABLE IF EXISTS ONLY "public"."scheduled_message_runs" DROP CONSTRAINT IF EXISTS "scheduled_message_runs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."rules_configs" DROP CONSTRAINT IF EXISTS "rules_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."role_menus" DROP CONSTRAINT IF EXISTS "role_menus_pkey";
ALTER TABLE IF EXISTS ONLY "public"."role_menu_options" DROP CONSTRAINT IF EXISTS "role_menu_options_pkey";
ALTER TABLE IF EXISTS ONLY "public"."polls" DROP CONSTRAINT IF EXISTS "polls_pkey";
ALTER TABLE IF EXISTS ONLY "public"."poll_votes" DROP CONSTRAINT IF EXISTS "poll_votes_pkey";
ALTER TABLE IF EXISTS ONLY "public"."poll_counters" DROP CONSTRAINT IF EXISTS "poll_counters_pkey";
ALTER TABLE IF EXISTS ONLY "public"."platform_users" DROP CONSTRAINT IF EXISTS "platform_users_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_principals" DROP CONSTRAINT IF EXISTS "permission_principals_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_definitions" DROP CONSTRAINT IF EXISTS "permission_definitions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_catalog_state" DROP CONSTRAINT IF EXISTS "permission_catalog_state_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_audit_events" DROP CONSTRAINT IF EXISTS "permission_audit_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."permission_assignments" DROP CONSTRAINT IF EXISTS "permission_assignments_pkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_transactions" DROP CONSTRAINT IF EXISTS "oauth_transactions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."oauth_credentials" DROP CONSTRAINT IF EXISTS "oauth_credentials_pkey";
ALTER TABLE IF EXISTS ONLY "public"."music_tracks" DROP CONSTRAINT IF EXISTS "music_tracks_pkey";
ALTER TABLE IF EXISTS ONLY "public"."music_stations" DROP CONSTRAINT IF EXISTS "music_stations_pkey";
ALTER TABLE IF EXISTS ONLY "public"."music_settings" DROP CONSTRAINT IF EXISTS "music_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."music_sessions" DROP CONSTRAINT IF EXISTS "music_sessions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."music_playlists" DROP CONSTRAINT IF EXISTS "music_playlists_pkey";
ALTER TABLE IF EXISTS ONLY "public"."music_playlist_tracks" DROP CONSTRAINT IF EXISTS "music_playlist_tracks_pkey";
ALTER TABLE IF EXISTS ONLY "public"."moderation_settings" DROP CONSTRAINT IF EXISTS "moderation_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."moderation_cases" DROP CONSTRAINT IF EXISTS "moderation_cases_pkey";
ALTER TABLE IF EXISTS ONLY "public"."messages_templates" DROP CONSTRAINT IF EXISTS "messages_templates_pkey";
ALTER TABLE IF EXISTS ONLY "public"."messages_looks" DROP CONSTRAINT IF EXISTS "messages_looks_pkey";
ALTER TABLE IF EXISTS ONLY "public"."level_settings" DROP CONSTRAINT IF EXISTS "level_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."level_members" DROP CONSTRAINT IF EXISTS "level_members_pkey";
ALTER TABLE IF EXISTS ONLY "public"."knowledge_settings" DROP CONSTRAINT IF EXISTS "knowledge_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."knowledge_categories" DROP CONSTRAINT IF EXISTS "knowledge_categories_pkey";
ALTER TABLE IF EXISTS ONLY "public"."knowledge_articles" DROP CONSTRAINT IF EXISTS "knowledge_articles_pkey";
ALTER TABLE IF EXISTS ONLY "public"."guilds" DROP CONSTRAINT IF EXISTS "guilds_pkey";
ALTER TABLE IF EXISTS ONLY "public"."giveaways" DROP CONSTRAINT IF EXISTS "giveaways_pkey";
ALTER TABLE IF EXISTS ONLY "public"."giveaway_entries" DROP CONSTRAINT IF EXISTS "giveaway_entries_pkey";
ALTER TABLE IF EXISTS ONLY "public"."giveaway_counters" DROP CONSTRAINT IF EXISTS "giveaway_counters_pkey";
ALTER TABLE IF EXISTS ONLY "public"."games_status_snapshots" DROP CONSTRAINT IF EXISTS "games_status_snapshots_pkey";
ALTER TABLE IF EXISTS ONLY "public"."games_settings" DROP CONSTRAINT IF EXISTS "games_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."games_servers" DROP CONSTRAINT IF EXISTS "games_servers_pkey";
ALTER TABLE IF EXISTS ONLY "public"."fivem_status_snapshots" DROP CONSTRAINT IF EXISTS "fivem_status_snapshots_pkey";
ALTER TABLE IF EXISTS ONLY "public"."fivem_settings" DROP CONSTRAINT IF EXISTS "fivem_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."external_identities" DROP CONSTRAINT IF EXISTS "external_identities_pkey";
ALTER TABLE IF EXISTS ONLY "public"."embed_templates" DROP CONSTRAINT IF EXISTS "embed_templates_pkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_role_audit_events" DROP CONSTRAINT IF EXISTS "discord_role_audit_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_memberships" DROP CONSTRAINT IF EXISTS "discord_guild_memberships_pkey";
ALTER TABLE IF EXISTS ONLY "public"."discord_guild_membership_roles" DROP CONSTRAINT IF EXISTS "discord_guild_membership_roles_pkey";
ALTER TABLE IF EXISTS ONLY "public"."custom_commands" DROP CONSTRAINT IF EXISTS "custom_commands_pkey";
ALTER TABLE IF EXISTS ONLY "public"."community_counters" DROP CONSTRAINT IF EXISTS "community_counters_pkey";
ALTER TABLE IF EXISTS ONLY "public"."builder_runs" DROP CONSTRAINT IF EXISTS "builder_runs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."builder_run_items" DROP CONSTRAINT IF EXISTS "builder_run_items_pkey";
ALTER TABLE IF EXISTS ONLY "public"."builder_drafts" DROP CONSTRAINT IF EXISTS "builder_drafts_pkey";
ALTER TABLE IF EXISTS ONLY "public"."browser_sessions" DROP CONSTRAINT IF EXISTS "browser_sessions_pkey";
ALTER TABLE IF EXISTS ONLY "public"."birthdays" DROP CONSTRAINT IF EXISTS "birthdays_pkey";
ALTER TABLE IF EXISTS ONLY "public"."birthday_settings" DROP CONSTRAINT IF EXISTS "birthday_settings_pkey";
ALTER TABLE IF EXISTS ONLY "public"."autorole_rules" DROP CONSTRAINT IF EXISTS "autorole_rules_pkey";
ALTER TABLE IF EXISTS ONLY "public"."autorole_configs" DROP CONSTRAINT IF EXISTS "autorole_configs_pkey";
ALTER TABLE IF EXISTS ONLY "public"."authentication_audit_events" DROP CONSTRAINT IF EXISTS "authentication_audit_events_pkey";
ALTER TABLE IF EXISTS ONLY "public"."applications" DROP CONSTRAINT IF EXISTS "applications_pkey";
ALTER TABLE IF EXISTS ONLY "public"."application_votes" DROP CONSTRAINT IF EXISTS "application_votes_pkey";
ALTER TABLE IF EXISTS ONLY "public"."application_panels" DROP CONSTRAINT IF EXISTS "application_panels_pkey";
ALTER TABLE IF EXISTS ONLY "public"."application_notes" DROP CONSTRAINT IF EXISTS "application_notes_pkey";
ALTER TABLE IF EXISTS ONLY "public"."application_forms" DROP CONSTRAINT IF EXISTS "application_forms_pkey";
ALTER TABLE IF EXISTS ONLY "public"."application_counters" DROP CONSTRAINT IF EXISTS "application_counters_pkey";
ALTER TABLE IF EXISTS ONLY "public"."_prisma_migrations" DROP CONSTRAINT IF EXISTS "_prisma_migrations_pkey";
ALTER TABLE IF EXISTS "public"."builder_run_items" ALTER COLUMN "sequence" DROP DEFAULT;
DROP TABLE IF EXISTS "public"."welcome_goodbye_configs";
DROP TABLE IF EXISTS "public"."voice_settings";
DROP TABLE IF EXISTS "public"."voice_rooms";
DROP TABLE IF EXISTS "public"."voice_hubs";
DROP TABLE IF EXISTS "public"."verification_settings";
DROP TABLE IF EXISTS "public"."verification_pending_members";
DROP TABLE IF EXISTS "public"."verification_attempts";
DROP TABLE IF EXISTS "public"."tickets";
DROP TABLE IF EXISTS "public"."ticket_settings";
DROP TABLE IF EXISTS "public"."ticket_panels";
DROP TABLE IF EXISTS "public"."ticket_messages";
DROP TABLE IF EXISTS "public"."ticket_events";
DROP TABLE IF EXISTS "public"."ticket_categories";
DROP TABLE IF EXISTS "public"."suggestions";
DROP TABLE IF EXISTS "public"."streams_subscriptions";
DROP TABLE IF EXISTS "public"."streams_settings";
DROP TABLE IF EXISTS "public"."starboard_entries";
DROP TABLE IF EXISTS "public"."starboard_configs";
DROP TABLE IF EXISTS "public"."staff_strikes";
DROP TABLE IF EXISTS "public"."staff_shifts";
DROP TABLE IF EXISTS "public"."staff_settings";
DROP TABLE IF EXISTS "public"."staff_records";
DROP TABLE IF EXISTS "public"."staff_ranks";
DROP TABLE IF EXISTS "public"."staff_members";
DROP TABLE IF EXISTS "public"."staff_leaves";
DROP TABLE IF EXISTS "public"."server_log_configs";
DROP TABLE IF EXISTS "public"."scheduled_messages";
DROP TABLE IF EXISTS "public"."scheduled_message_runs";
DROP TABLE IF EXISTS "public"."rules_configs";
DROP TABLE IF EXISTS "public"."role_menus";
DROP TABLE IF EXISTS "public"."role_menu_options";
DROP TABLE IF EXISTS "public"."polls";
DROP TABLE IF EXISTS "public"."poll_votes";
DROP TABLE IF EXISTS "public"."poll_counters";
DROP TABLE IF EXISTS "public"."platform_users";
DROP TABLE IF EXISTS "public"."permission_principals";
DROP TABLE IF EXISTS "public"."permission_definitions";
DROP TABLE IF EXISTS "public"."permission_catalog_state";
DROP TABLE IF EXISTS "public"."permission_audit_events";
DROP TABLE IF EXISTS "public"."permission_assignments";
DROP TABLE IF EXISTS "public"."oauth_transactions";
DROP TABLE IF EXISTS "public"."oauth_credentials";
DROP TABLE IF EXISTS "public"."music_tracks";
DROP TABLE IF EXISTS "public"."music_stations";
DROP TABLE IF EXISTS "public"."music_settings";
DROP TABLE IF EXISTS "public"."music_sessions";
DROP TABLE IF EXISTS "public"."music_playlists";
DROP TABLE IF EXISTS "public"."music_playlist_tracks";
DROP TABLE IF EXISTS "public"."moderation_settings";
DROP TABLE IF EXISTS "public"."moderation_cases";
DROP TABLE IF EXISTS "public"."messages_templates";
DROP TABLE IF EXISTS "public"."messages_looks";
DROP TABLE IF EXISTS "public"."level_settings";
DROP TABLE IF EXISTS "public"."level_members";
DROP TABLE IF EXISTS "public"."knowledge_settings";
DROP TABLE IF EXISTS "public"."knowledge_categories";
DROP TABLE IF EXISTS "public"."knowledge_articles";
DROP TABLE IF EXISTS "public"."guilds";
DROP TABLE IF EXISTS "public"."giveaways";
DROP TABLE IF EXISTS "public"."giveaway_entries";
DROP TABLE IF EXISTS "public"."giveaway_counters";
DROP TABLE IF EXISTS "public"."games_status_snapshots";
DROP TABLE IF EXISTS "public"."games_settings";
DROP TABLE IF EXISTS "public"."games_servers";
DROP TABLE IF EXISTS "public"."fivem_status_snapshots";
DROP TABLE IF EXISTS "public"."fivem_settings";
DROP TABLE IF EXISTS "public"."external_identities";
DROP TABLE IF EXISTS "public"."embed_templates";
DROP TABLE IF EXISTS "public"."discord_role_audit_events";
DROP TABLE IF EXISTS "public"."discord_guild_memberships";
DROP TABLE IF EXISTS "public"."discord_guild_membership_roles";
DROP TABLE IF EXISTS "public"."custom_commands";
DROP TABLE IF EXISTS "public"."community_counters";
DROP TABLE IF EXISTS "public"."builder_runs";
DROP SEQUENCE IF EXISTS "public"."builder_run_items_sequence_seq";
DROP TABLE IF EXISTS "public"."builder_run_items";
DROP TABLE IF EXISTS "public"."builder_drafts";
DROP TABLE IF EXISTS "public"."browser_sessions";
DROP TABLE IF EXISTS "public"."birthdays";
DROP TABLE IF EXISTS "public"."birthday_settings";
DROP TABLE IF EXISTS "public"."autorole_rules";
DROP TABLE IF EXISTS "public"."autorole_configs";
DROP TABLE IF EXISTS "public"."authentication_audit_events";
DROP TABLE IF EXISTS "public"."applications";
DROP TABLE IF EXISTS "public"."application_votes";
DROP TABLE IF EXISTS "public"."application_panels";
DROP TABLE IF EXISTS "public"."application_notes";
DROP TABLE IF EXISTS "public"."application_forms";
DROP TABLE IF EXISTS "public"."application_counters";
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
DROP TYPE IF EXISTS "public"."messages_look_mode";
DROP TYPE IF EXISTS "public"."WelcomeGoodbyeKind";
DROP TYPE IF EXISTS "public"."VerificationMode";
DROP TYPE IF EXISTS "public"."VerificationAttemptSource";
DROP TYPE IF EXISTS "public"."VerificationAttemptResult";
DROP TYPE IF EXISTS "public"."VerificationAgeAction";
DROP TYPE IF EXISTS "public"."TicketStatus";
DROP TYPE IF EXISTS "public"."TicketPriority";
DROP TYPE IF EXISTS "public"."TicketPanelStyle";
DROP TYPE IF EXISTS "public"."TicketMode";
DROP TYPE IF EXISTS "public"."TicketMessageSource";
DROP TYPE IF EXISTS "public"."TicketCloseAction";
DROP TYPE IF EXISTS "public"."SuggestionStatus";
DROP TYPE IF EXISTS "public"."StreamsPlatform";
DROP TYPE IF EXISTS "public"."StreamsEndedBehavior";
DROP TYPE IF EXISTS "public"."StarboardNsfwMode";
DROP TYPE IF EXISTS "public"."StarboardChannelMode";
DROP TYPE IF EXISTS "public"."StaffRecordType";
DROP TYPE IF EXISTS "public"."StaffMemberStatus";
DROP TYPE IF EXISTS "public"."StaffLeaveStatus";
DROP TYPE IF EXISTS "public"."ScheduledMessageType";
DROP TYPE IF EXISTS "public"."RoleMenuStatus";
DROP TYPE IF EXISTS "public"."RoleMenuPresentationType";
DROP TYPE IF EXISTS "public"."RoleMenuAssignmentMode";
DROP TYPE IF EXISTS "public"."PollStatus";
DROP TYPE IF EXISTS "public"."PollResultsVisibility";
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
DROP TYPE IF EXISTS "public"."MusicPlayerState";
DROP TYPE IF EXISTS "public"."MusicLoopMode";
DROP TYPE IF EXISTS "public"."ModerationCaseType";
DROP TYPE IF EXISTS "public"."ModerationCaseSource";
DROP TYPE IF EXISTS "public"."LevelUpMode";
DROP TYPE IF EXISTS "public"."LevelRewardMode";
DROP TYPE IF EXISTS "public"."GiveawayStatus";
DROP TYPE IF EXISTS "public"."GamesServerKind";
DROP TYPE IF EXISTS "public"."DiscordGuildMembershipStatus";
DROP TYPE IF EXISTS "public"."DiscordGuildMembershipSource";
DROP TYPE IF EXISTS "public"."CustomCommandTriggerMode";
DROP TYPE IF EXISTS "public"."CommunityCounterType";
DROP TYPE IF EXISTS "public"."CommunityContentMode";
DROP TYPE IF EXISTS "public"."BuilderRunStatus";
DROP TYPE IF EXISTS "public"."BuilderRunMode";
DROP TYPE IF EXISTS "public"."BuilderItemStatus";
DROP TYPE IF EXISTS "public"."BuilderItemKind";
DROP TYPE IF EXISTS "public"."BrowserSessionStatus";
DROP TYPE IF EXISTS "public"."BrowserSessionRevocationReason";
DROP TYPE IF EXISTS "public"."AuthenticationProvider";
DROP TYPE IF EXISTS "public"."AuthenticationAuditReasonCode";
DROP TYPE IF EXISTS "public"."AuthenticationAuditOutcome";
DROP TYPE IF EXISTS "public"."AuthenticationAuditActorType";
DROP TYPE IF EXISTS "public"."AuthenticationAuditAction";
DROP TYPE IF EXISTS "public"."ApplicationVoteType";
DROP TYPE IF EXISTS "public"."ApplicationStatus";
DROP TYPE IF EXISTS "public"."ApplicationSource";
DROP TYPE IF EXISTS "public"."ApplicationButtonStyle";
--
-- Name: SCHEMA "public"; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA "public" IS 'standard public schema';


--
-- Name: ApplicationButtonStyle; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ApplicationButtonStyle" AS ENUM (
    'primary',
    'secondary',
    'success',
    'danger'
);


--
-- Name: ApplicationSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ApplicationSource" AS ENUM (
    'discord',
    'web'
);


--
-- Name: ApplicationStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ApplicationStatus" AS ENUM (
    'pending',
    'accepted',
    'denied',
    'withdrawn'
);


--
-- Name: ApplicationVoteType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ApplicationVoteType" AS ENUM (
    'up',
    'down'
);


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
-- Name: BuilderItemKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."BuilderItemKind" AS ENUM (
    'role',
    'category',
    'channel',
    'link',
    'emoji',
    'sticker'
);


--
-- Name: BuilderItemStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."BuilderItemStatus" AS ENUM (
    'created',
    'skipped',
    'failed',
    'deleted',
    'kept'
);


--
-- Name: BuilderRunMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."BuilderRunMode" AS ENUM (
    'add',
    'fresh',
    'wipe',
    'wipe_and_build'
);


--
-- Name: BuilderRunStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."BuilderRunStatus" AS ENUM (
    'queued',
    'running',
    'succeeded',
    'failed',
    'partial',
    'undone'
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
-- Name: GamesServerKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."GamesServerKind" AS ENUM (
    'minecraft-java',
    'minecraft-bedrock',
    'steam'
);


--
-- Name: GiveawayStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."GiveawayStatus" AS ENUM (
    'running',
    'paused',
    'ended',
    'cancelled'
);


--
-- Name: LevelRewardMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."LevelRewardMode" AS ENUM (
    'stack',
    'highest'
);


--
-- Name: LevelUpMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."LevelUpMode" AS ENUM (
    'current',
    'channel',
    'dm',
    'off'
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
-- Name: MusicLoopMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."MusicLoopMode" AS ENUM (
    'off',
    'track',
    'queue'
);


--
-- Name: MusicPlayerState; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."MusicPlayerState" AS ENUM (
    'idle',
    'playing',
    'paused',
    'buffering'
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
-- Name: PollResultsVisibility; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PollResultsVisibility" AS ENUM (
    'live',
    'after-close'
);


--
-- Name: PollStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."PollStatus" AS ENUM (
    'open',
    'closed'
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
-- Name: ScheduledMessageType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."ScheduledMessageType" AS ENUM (
    'once',
    'interval',
    'daily',
    'weekly',
    'monthly'
);


--
-- Name: StaffLeaveStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StaffLeaveStatus" AS ENUM (
    'pending',
    'approved',
    'active',
    'ended',
    'denied',
    'cancelled'
);


--
-- Name: StaffMemberStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StaffMemberStatus" AS ENUM (
    'active',
    'loa',
    'suspended',
    'retired'
);


--
-- Name: StaffRecordType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StaffRecordType" AS ENUM (
    'hire',
    'promote',
    'demote',
    'fire',
    'loa-start',
    'loa-end',
    'note',
    'strike'
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
-- Name: StreamsEndedBehavior; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StreamsEndedBehavior" AS ENUM (
    'keep',
    'edit',
    'delete'
);


--
-- Name: StreamsPlatform; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."StreamsPlatform" AS ENUM (
    'twitch',
    'kick',
    'youtube'
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
-- Name: VerificationAgeAction; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."VerificationAgeAction" AS ENUM (
    'deny',
    'kick',
    'flag'
);


--
-- Name: VerificationAttemptResult; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."VerificationAttemptResult" AS ENUM (
    'passed',
    'failed',
    'denied-age',
    'kicked',
    'manual',
    'revoked'
);


--
-- Name: VerificationAttemptSource; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."VerificationAttemptSource" AS ENUM (
    'discord',
    'web',
    'automatic'
);


--
-- Name: VerificationMode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."VerificationMode" AS ENUM (
    'button',
    'captcha',
    'question'
);


--
-- Name: WelcomeGoodbyeKind; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."WelcomeGoodbyeKind" AS ENUM (
    'welcome',
    'goodbye'
);


--
-- Name: messages_look_mode; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE "public"."messages_look_mode" AS ENUM (
    'fill',
    'override'
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
-- Name: application_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_counters" (
    "guild_id" "text" NOT NULL,
    "next_number" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: application_forms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_forms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "cooldown_days" integer DEFAULT 0 NOT NULL,
    "one_pending" boolean DEFAULT true NOT NULL,
    "required_role_ids" "text"[],
    "blocked_role_ids" "text"[],
    "min_account_age_days" integer,
    "review_channel_id" "text",
    "reviewer_role_ids" "text"[],
    "ping_member_ids" "text"[],
    "accept_role_ids" "text"[],
    "remove_role_ids" "text"[],
    "accept_message" "text",
    "deny_message" "text",
    "discussion_channel_id" "text",
    "button_label" "text",
    "button_emoji" "text",
    "button_style" "public"."ApplicationButtonStyle" DEFAULT 'primary'::"public"."ApplicationButtonStyle" NOT NULL,
    "position" integer DEFAULT 0 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: application_notes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_notes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "application_id" "uuid" NOT NULL,
    "author_id" "text" NOT NULL,
    "author_name" "text" NOT NULL,
    "body" "text" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: application_panels; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_panels" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "channel_id" "text" NOT NULL,
    "message_id" "text",
    "title" "text" NOT NULL,
    "description" "text" NOT NULL,
    "color" "text" DEFAULT '#5865F2'::"text" NOT NULL,
    "form_ids" "text"[],
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: application_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."application_votes" (
    "application_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "vote" "public"."ApplicationVoteType" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: applications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."applications" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "number" integer NOT NULL,
    "form_id" "uuid",
    "form_name" "text" NOT NULL,
    "applicant_id" "text" NOT NULL,
    "applicant_name" "text" NOT NULL,
    "status" "public"."ApplicationStatus" DEFAULT 'pending'::"public"."ApplicationStatus" NOT NULL,
    "source" "public"."ApplicationSource" DEFAULT 'discord'::"public"."ApplicationSource" NOT NULL,
    "answers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "review_channel_id" "text",
    "review_message_id" "text",
    "thread_id" "text",
    "decided_by_id" "text",
    "decided_by_name" "text",
    "decision_reason" "text",
    "decided_at" timestamp(3) with time zone,
    "dm_delivered" boolean,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
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
-- Name: birthday_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."birthday_settings" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "channel_id" "text",
    "message" "text" NOT NULL,
    "embed_color" "text" DEFAULT '#F47FFF'::"text" NOT NULL,
    "role_id" "text",
    "announce_hour" integer DEFAULT 9 NOT NULL,
    "ping_role_id" "text",
    "allow_year" boolean DEFAULT true NOT NULL,
    "require_confirmation" boolean DEFAULT false NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: birthdays; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."birthdays" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "month" integer NOT NULL,
    "day" integer NOT NULL,
    "year" integer,
    "show_age" boolean DEFAULT false NOT NULL,
    "time_zone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "last_announced_year" integer,
    "granted_role_id" "text",
    "role_remove_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
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
-- Name: builder_drafts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."builder_drafts" (
    "guild_id" "text" NOT NULL,
    "answers" "jsonb" NOT NULL,
    "blueprint" "jsonb" NOT NULL,
    "updated_by_id" "text",
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: builder_run_items; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."builder_run_items" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "run_id" "uuid" NOT NULL,
    "sequence" integer NOT NULL,
    "kind" "public"."BuilderItemKind" NOT NULL,
    "key" "text" NOT NULL,
    "name" "text" NOT NULL,
    "discord_id" "text",
    "status" "public"."BuilderItemStatus" NOT NULL,
    "error" "text",
    "note" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: builder_run_items_sequence_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE "public"."builder_run_items_sequence_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: builder_run_items_sequence_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE "public"."builder_run_items_sequence_seq" OWNED BY "public"."builder_run_items"."sequence";


--
-- Name: builder_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."builder_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "status" "public"."BuilderRunStatus" DEFAULT 'queued'::"public"."BuilderRunStatus" NOT NULL,
    "mode" "public"."BuilderRunMode" NOT NULL,
    "links" "text"[],
    "planned" integer DEFAULT 0 NOT NULL,
    "done" integer DEFAULT 0 NOT NULL,
    "skipped" integer DEFAULT 0 NOT NULL,
    "failed" integer DEFAULT 0 NOT NULL,
    "started_by_id" "text" NOT NULL,
    "started_by_name" "text" NOT NULL,
    "warnings" "text"[],
    "error" "text",
    "started_at" timestamp(3) with time zone,
    "finished_at" timestamp(3) with time zone,
    "undone_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL,
    "snapshot" "jsonb"
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
-- Name: fivem_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fivem_settings" (
    "guild_id" "text" NOT NULL,
    "server_address" "text",
    "connect_url" "text",
    "status_channel_id" "text",
    "status_message_id" "text",
    "update_interval_seconds" integer DEFAULT 60 NOT NULL,
    "alert_channel_id" "text",
    "alert_role_id" "text",
    "restart_times" "text"[],
    "time_zone" "text" DEFAULT 'UTC'::"text" NOT NULL,
    "restart_warning_minutes" integer[],
    "last_online" boolean,
    "online_since" timestamp(3) with time zone,
    "failure_streak" integer DEFAULT 0 NOT NULL,
    "last_polled_at" timestamp(3) with time zone,
    "sent_restart_warnings" "text"[],
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: fivem_status_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."fivem_status_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "online" boolean NOT NULL,
    "players" integer NOT NULL,
    "max_players" integer NOT NULL,
    "at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: games_servers; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."games_servers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "kind" "public"."GamesServerKind" NOT NULL,
    "address" "text" NOT NULL,
    "game" "text",
    "connect_url" "text",
    "status_channel_id" "text",
    "status_message_id" "text",
    "update_interval_seconds" integer DEFAULT 60 NOT NULL,
    "player_count_channel_id" "text",
    "alert_channel_id" "text",
    "alert_role_id" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "last_online" boolean,
    "online_since" timestamp(3) with time zone,
    "offline_since" timestamp(3) with time zone,
    "failure_streak" integer DEFAULT 0 NOT NULL,
    "last_polled_at" timestamp(3) with time zone,
    "last_error" "text",
    "last_player_count" integer DEFAULT 0 NOT NULL,
    "last_max_players" integer DEFAULT 0 NOT NULL,
    "last_renamed_at" timestamp(3) with time zone,
    "last_channel_name" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: games_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."games_settings" (
    "guild_id" "text" NOT NULL,
    "player_count_template" "text" DEFAULT '🎮 {online}/{max} online'::"text" NOT NULL,
    "player_count_offline_template" "text" DEFAULT '🔴 Offline'::"text" NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: games_status_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."games_status_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "server_id" "uuid" NOT NULL,
    "online" boolean NOT NULL,
    "players" integer NOT NULL,
    "max_players" integer NOT NULL,
    "at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: giveaway_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."giveaway_counters" (
    "guild_id" "text" NOT NULL,
    "next_number" integer DEFAULT 1 NOT NULL
);


--
-- Name: giveaway_entries; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."giveaway_entries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "giveaway_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "entries" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: giveaways; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."giveaways" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "number" integer NOT NULL,
    "prize" "text" NOT NULL,
    "description" "text",
    "winner_count" integer DEFAULT 1 NOT NULL,
    "channel_id" "text" NOT NULL,
    "message_id" "text",
    "host_id" "text" NOT NULL,
    "required_role_ids" "text"[],
    "blocked_role_ids" "text"[],
    "min_account_age_days" integer DEFAULT 0 NOT NULL,
    "min_server_days" integer DEFAULT 0 NOT NULL,
    "bonus_entries" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "ping_role_id" "text",
    "dm_winners" boolean DEFAULT true NOT NULL,
    "ends_at" timestamp(3) with time zone NOT NULL,
    "paused_at" timestamp(3) with time zone,
    "status" "public"."GiveawayStatus" DEFAULT 'running'::"public"."GiveawayStatus" NOT NULL,
    "winner_ids" "text"[],
    "ended_at" timestamp(3) with time zone,
    "ended_by_id" "text",
    "created_by_id" "text" NOT NULL,
    "created_by_name" "text" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
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
-- Name: knowledge_articles; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."knowledge_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "category_id" "uuid",
    "title" "text" NOT NULL,
    "slug" "text" NOT NULL,
    "body" "text" NOT NULL,
    "tags" "text"[],
    "published" boolean DEFAULT false NOT NULL,
    "pinned" boolean DEFAULT false NOT NULL,
    "views" integer DEFAULT 0 NOT NULL,
    "author_id" "text" NOT NULL,
    "author_name" "text" NOT NULL,
    "updated_by_id" "text",
    "updated_by_name" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: knowledge_categories; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."knowledge_categories" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "emoji" "text",
    "order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: knowledge_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."knowledge_settings" (
    "guild_id" "text" NOT NULL,
    "auto_answer_enabled" boolean DEFAULT false NOT NULL,
    "auto_answer_channel_ids" "text"[],
    "auto_answer_threshold" integer DEFAULT 70 NOT NULL,
    "auto_answer_cooldown_seconds" integer DEFAULT 300 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: level_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."level_members" (
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "display_name" "text" DEFAULT ''::"text" NOT NULL,
    "xp" integer DEFAULT 0 NOT NULL,
    "level" integer DEFAULT 0 NOT NULL,
    "messages" integer DEFAULT 0 NOT NULL,
    "voice_minutes" integer DEFAULT 0 NOT NULL,
    "last_message_at" timestamp(3) with time zone,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: level_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."level_settings" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "message_xp_min" integer DEFAULT 15 NOT NULL,
    "message_xp_max" integer DEFAULT 25 NOT NULL,
    "cooldown_seconds" integer DEFAULT 60 NOT NULL,
    "voice_xp_per_minute" integer DEFAULT 5 NOT NULL,
    "curve_base" double precision DEFAULT 50 NOT NULL,
    "curve_exponent" double precision DEFAULT 2 NOT NULL,
    "curve_linear" double precision DEFAULT 50 NOT NULL,
    "role_multipliers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "channel_multipliers" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "no_xp_role_ids" "text"[],
    "no_xp_channel_ids" "text"[],
    "level_up_mode" "public"."LevelUpMode" DEFAULT 'current'::"public"."LevelUpMode" NOT NULL,
    "level_up_channel_id" "text",
    "level_up_message" "text" DEFAULT 'GG {user}, you reached level {level}!'::"text" NOT NULL,
    "rewards" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "reward_mode" "public"."LevelRewardMode" DEFAULT 'stack'::"public"."LevelRewardMode" NOT NULL,
    "remove_rewards_on_reset" boolean DEFAULT true NOT NULL,
    "max_level" integer DEFAULT 0 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: messages_looks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."messages_looks" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "accent_color" "text",
    "footer_text" "text",
    "footer_icon_url" "text",
    "author_name" "text",
    "author_icon_url" "text",
    "thumbnail_url" "text",
    "show_timestamp" boolean DEFAULT false NOT NULL,
    "mode" "public"."messages_look_mode" DEFAULT 'fill'::"public"."messages_look_mode" NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: messages_templates; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."messages_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "key" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "content" "text",
    "embeds" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "updated_by" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
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
-- Name: music_playlist_tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."music_playlist_tracks" (
    "playlist_id" "uuid" NOT NULL,
    "position" integer NOT NULL,
    "track_id" "uuid" NOT NULL
);


--
-- Name: music_playlists; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."music_playlists" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: music_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."music_sessions" (
    "guild_id" "text" NOT NULL,
    "channel_id" "text",
    "text_channel_id" "text",
    "panel_channel_id" "text",
    "panel_message_id" "text",
    "queue" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "index" integer DEFAULT 0 NOT NULL,
    "position_seconds" integer DEFAULT 0 NOT NULL,
    "state" "public"."MusicPlayerState" DEFAULT 'idle'::"public"."MusicPlayerState" NOT NULL,
    "loop" "public"."MusicLoopMode" DEFAULT 'off'::"public"."MusicLoopMode" NOT NULL,
    "shuffle" boolean DEFAULT false NOT NULL,
    "volume" integer DEFAULT 60 NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: music_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."music_settings" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "dj_role_ids" "text"[] DEFAULT ARRAY[]::"text"[],
    "default_volume" integer DEFAULT 60 NOT NULL,
    "max_queue" integer DEFAULT 100 NOT NULL,
    "announce_channel_id" "text",
    "now_playing_panel" boolean DEFAULT true NOT NULL,
    "stay_connected_247" boolean DEFAULT false NOT NULL,
    "home_channel_id" "text",
    "auto_leave_minutes" integer DEFAULT 5 NOT NULL,
    "idle_radio_station_id" "uuid",
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: music_stations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."music_stations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "favicon_url" "text",
    "tags" "text"[] DEFAULT ARRAY[]::"text"[],
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: music_tracks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."music_tracks" (
    "id" "uuid" NOT NULL,
    "guild_id" "text" NOT NULL,
    "title" "text" NOT NULL,
    "artist" "text",
    "album" "text",
    "track_number" integer,
    "duration_seconds" integer,
    "file_name" "text" NOT NULL,
    "cover_file_name" "text",
    "content_type" "text" NOT NULL,
    "size_bytes" integer NOT NULL,
    "sha256" "text" NOT NULL,
    "original_name" "text" NOT NULL,
    "uploaded_by" "text",
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
-- Name: poll_counters; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."poll_counters" (
    "guild_id" "text" NOT NULL,
    "next_number" integer DEFAULT 1 NOT NULL
);


--
-- Name: poll_votes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."poll_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "poll_id" "uuid" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "option_ids" "text"[],
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: polls; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."polls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "number" integer NOT NULL,
    "question" "text" NOT NULL,
    "options" "jsonb" NOT NULL,
    "max_choices" integer DEFAULT 1 NOT NULL,
    "anonymous" boolean DEFAULT false NOT NULL,
    "results_visibility" "public"."PollResultsVisibility" DEFAULT 'live'::"public"."PollResultsVisibility" NOT NULL,
    "allow_vote_change" boolean DEFAULT true NOT NULL,
    "allowed_role_ids" "text"[],
    "channel_id" "text" NOT NULL,
    "message_id" "text",
    "ping_role_id" "text",
    "ends_at" timestamp(3) with time zone,
    "status" "public"."PollStatus" DEFAULT 'open'::"public"."PollStatus" NOT NULL,
    "created_by_id" "text" NOT NULL,
    "created_by_name" "text" NOT NULL,
    "closed_at" timestamp(3) with time zone,
    "closed_by_id" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
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
-- Name: scheduled_message_runs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."scheduled_message_runs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "message_id" "uuid" NOT NULL,
    "guild_id" "text" NOT NULL,
    "success" boolean NOT NULL,
    "discord_message_id" "text",
    "error" "text",
    "manual" boolean DEFAULT false NOT NULL,
    "ran_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: scheduled_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."scheduled_messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "channel_id" "text" NOT NULL,
    "content" "text",
    "embed" "jsonb",
    "ping_role_ids" "text"[],
    "schedule_type" "public"."ScheduledMessageType" NOT NULL,
    "time_zone" "text" NOT NULL,
    "run_at" "text",
    "interval_minutes" integer,
    "time" "text",
    "weekdays" integer[],
    "day_of_month" integer,
    "start_date" "text",
    "end_date" "text",
    "enabled" boolean DEFAULT true NOT NULL,
    "delete_previous" boolean DEFAULT false NOT NULL,
    "pin" boolean DEFAULT false NOT NULL,
    "max_runs" integer,
    "run_count" integer DEFAULT 0 NOT NULL,
    "last_run_at" timestamp(3) with time zone,
    "last_message_id" "text",
    "next_run_at" timestamp(3) with time zone,
    "created_by_id" "text" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
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
-- Name: staff_leaves; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_leaves" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "starts_at" timestamp(3) with time zone NOT NULL,
    "ends_at" timestamp(3) with time zone NOT NULL,
    "reason" "text" NOT NULL,
    "status" "public"."StaffLeaveStatus" DEFAULT 'pending'::"public"."StaffLeaveStatus" NOT NULL,
    "reviewer_id" "text",
    "reviewer_name" "text",
    "review_note" "text",
    "reviewed_at" timestamp(3) with time zone,
    "message_id" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: staff_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_members" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "rank_id" "uuid" NOT NULL,
    "callsign" "text",
    "joined_at" timestamp(3) with time zone NOT NULL,
    "status" "public"."StaffMemberStatus" DEFAULT 'active'::"public"."StaffMemberStatus" NOT NULL,
    "notes" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: staff_ranks; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_ranks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "role_id" "text",
    "color" "text" DEFAULT '#5865F2'::"text" NOT NULL,
    "description" "text",
    "position" integer NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: staff_records; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_records" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "type" "public"."StaffRecordType" NOT NULL,
    "actor_id" "text" NOT NULL,
    "actor_name" "text" NOT NULL,
    "reason" "text",
    "from_rank" "text",
    "to_rank" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: staff_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_settings" (
    "guild_id" "text" NOT NULL,
    "log_channel_id" "text",
    "roster_channel_id" "text",
    "roster_message_id" "text",
    "loa_role_id" "text",
    "auto_clock_out_hours" integer DEFAULT 12 NOT NULL,
    "max_leave_days" integer DEFAULT 60 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: staff_shifts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_shifts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "started_at" timestamp(3) with time zone NOT NULL,
    "ended_at" timestamp(3) with time zone,
    "duration_seconds" integer,
    "auto_ended" boolean DEFAULT false NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: staff_strikes; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."staff_strikes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "reason" "text" NOT NULL,
    "actor_id" "text" NOT NULL,
    "actor_name" "text" NOT NULL,
    "expires_at" timestamp(3) with time zone,
    "revoked_at" timestamp(3) with time zone,
    "revoked_by_id" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
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
-- Name: streams_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."streams_settings" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "default_channel_id" "text",
    "ended_behavior" "public"."StreamsEndedBehavior" DEFAULT 'edit'::"public"."StreamsEndedBehavior" NOT NULL,
    "check_interval_seconds" integer DEFAULT 90 NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: streams_subscriptions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."streams_subscriptions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "platform" "public"."StreamsPlatform" NOT NULL,
    "handle" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "avatar_url" "text",
    "platform_id" "text" NOT NULL,
    "announce_channel_id" "text",
    "ping_role_id" "text",
    "message_text" "text",
    "announce_videos" boolean DEFAULT false NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "last_stream_id" "text",
    "live_since" timestamp(3) with time zone,
    "last_announcement_channel_id" "text",
    "last_announcement_message_id" "text",
    "last_video_id" "text",
    "last_checked_at" timestamp(3) with time zone,
    "offline_streak" integer DEFAULT 0 NOT NULL,
    "failure_streak" integer DEFAULT 0 NOT NULL,
    "last_error" "text",
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
    "alert_user_ids" "text"[],
    "next_number" integer DEFAULT 1 NOT NULL
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
    "updated_at" timestamp(3) with time zone NOT NULL,
    "button_rows" "jsonb"
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
    "updated_at" timestamp(3) with time zone NOT NULL,
    "category_number" integer
);


--
-- Name: verification_attempts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."verification_attempts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "user_name" "text" NOT NULL,
    "result" "public"."VerificationAttemptResult" NOT NULL,
    "reason" "text",
    "staff_id" "text",
    "staff_name" "text",
    "source" "public"."VerificationAttemptSource" DEFAULT 'discord'::"public"."VerificationAttemptSource" NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: verification_pending_members; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."verification_pending_members" (
    "guild_id" "text" NOT NULL,
    "user_id" "text" NOT NULL,
    "joined_at" timestamp(3) with time zone NOT NULL,
    "flagged" boolean DEFAULT false NOT NULL
);


--
-- Name: verification_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."verification_settings" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT false NOT NULL,
    "mode" "public"."VerificationMode" DEFAULT 'button'::"public"."VerificationMode" NOT NULL,
    "verified_role_ids" "text"[],
    "unverified_role_id" "text",
    "channel_id" "text",
    "panel_title" "text" NOT NULL,
    "panel_description" "text" NOT NULL,
    "panel_color" "text" DEFAULT '#5865F2'::"text" NOT NULL,
    "panel_button_label" "text" DEFAULT 'Verify'::"text" NOT NULL,
    "panel_channel_id" "text",
    "panel_message_id" "text",
    "questions" "jsonb" DEFAULT '[]'::"jsonb" NOT NULL,
    "log_channel_id" "text",
    "min_account_age_days" integer DEFAULT 0 NOT NULL,
    "age_action" "public"."VerificationAgeAction" DEFAULT 'deny'::"public"."VerificationAgeAction" NOT NULL,
    "kick_unverified_minutes" integer DEFAULT 0 NOT NULL,
    "max_attempts" integer DEFAULT 3 NOT NULL,
    "cooldown_minutes" integer DEFAULT 10 NOT NULL,
    "dm_on_success" boolean DEFAULT false NOT NULL,
    "success_message" "text",
    "welcome_channel_id" "text",
    "welcome_message" "text",
    "revision" integer DEFAULT 1 NOT NULL,
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: voice_hubs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."voice_hubs" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "channel_id" "text" NOT NULL,
    "category_id" "text",
    "name_template" "text" NOT NULL,
    "user_limit" integer DEFAULT 0 NOT NULL,
    "bitrate_kbps" integer DEFAULT 64 NOT NULL,
    "private_by_default" boolean DEFAULT false NOT NULL,
    "delete_delay_seconds" integer DEFAULT 0 NOT NULL,
    "allowed_role_ids" "text"[],
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: voice_rooms; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."voice_rooms" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "guild_id" "text" NOT NULL,
    "hub_id" "uuid",
    "channel_id" "text" NOT NULL,
    "owner_id" "text" NOT NULL,
    "name" "text" NOT NULL,
    "locked" boolean DEFAULT false NOT NULL,
    "hidden" boolean DEFAULT false NOT NULL,
    "panel_message_id" "text",
    "created_at" timestamp(3) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updated_at" timestamp(3) with time zone NOT NULL
);


--
-- Name: voice_settings; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE "public"."voice_settings" (
    "guild_id" "text" NOT NULL,
    "enabled" boolean DEFAULT true NOT NULL,
    "control_panel" boolean DEFAULT true NOT NULL,
    "allow_claim" boolean DEFAULT true NOT NULL,
    "revision" integer DEFAULT 1 NOT NULL,
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
-- Name: builder_run_items sequence; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."builder_run_items" ALTER COLUMN "sequence" SET DEFAULT "nextval"('"public"."builder_run_items_sequence_seq"'::"regclass");


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
2f7a8734-7f97-499e-90fb-7310d9fb338a	1ba342be19852a9619db62c16ee89bf82f785a9ce5b0e8dcb8e6ed886871eccf	2026-09-25 07:42:04.672059+00	20260925166000_scheduled_messages	\N	\N	2026-09-25 07:42:04.659814+00	1
421843d3-4d53-49e5-8351-9e6a70293487	50842d0e1245f24e5cc484c5f591254bd8406884a88936df31bd2fc5b82af3f9	2026-09-25 05:10:59.204373+00	20260925090000_ticket_system	\N	\N	2026-09-25 05:10:59.167464+00	1
f3526aac-fb47-4a86-b0cf-29d1f27bbfd2	e5f57fef98683b928643458d7375b07aa98a594e406604ec994146a8333563ac	2026-09-25 05:26:24.773511+00	20260925120000_ticket_alert_members	\N	\N	2026-09-25 05:26:24.770336+00	1
fd370971-7d10-4420-a989-60ff74983849	f1aecc609fbe0a55f6f2079220ad90e1675e3fd6be2a9b3376d497dbcf7b0af1	2026-09-25 22:00:27.015335+00	20260925200000_ticket_reason_numbers	\N	\N	2026-09-25 22:00:26.999043+00	1
5e4bec6e-101b-4577-9655-86c954a921dd	49afba377429152bab6293811a1303cbe84468679746f77b6f15a02051ec8a88	2026-09-25 07:01:32.660207+00	20260925150000_moderation	\N	\N	2026-09-25 07:01:32.632979+00	1
9568dff0-ac70-4009-b8cf-0f5333b3c7b1	8d141ff4f46111b43769712ec605cd5027ac1aaed1d5afd7360b95c3ffea2e38	2026-09-25 07:42:04.681509+00	20260925167000_levels	\N	\N	2026-09-25 07:42:04.672624+00	1
8ac6f77f-ac86-4ef9-9ea8-b4818b5a5960	0f58039eaa951051f243a7c2150f6f1f2638823740559f7b070315669ca90d43	2026-09-25 07:30:55.674063+00	20260925160000_applications	\N	\N	2026-09-25 07:30:55.591903+00	1
da7ce312-cdad-4306-9a30-a4bef765bb02	44978aae6e8f87770a99e5171243ded02b0b0b9ab0b59286cdc8aa167422f93e	2026-09-25 07:30:55.716311+00	20260925161000_verification	\N	\N	2026-09-25 07:30:55.675165+00	1
4e7520a3-dd8f-42a1-95a8-76d63baa31e6	ad85556772b53881368fc6d7b0896a3c03b91da621e1fba5ff67a89a19d5b043	2026-09-25 07:30:55.834733+00	20260925162000_staff	\N	\N	2026-09-25 07:30:55.722292+00	1
843c8946-0b37-4a6c-880d-fcd74b6d558e	e19280bd9284443cbfb91456de506d2f9334783f02a12dc2550367766d4e2a6c	2026-09-25 07:42:04.697357+00	20260925168000_voice_rooms	\N	\N	2026-09-25 07:42:04.681984+00	1
2e765162-1010-40f0-a08b-4dfe03eca212	b40b68c977037a7a44aa4e0911451f13b1f69bb3d6b825ab41347da9d7a07b94	2026-09-25 07:42:04.627499+00	20260925163000_polls	\N	\N	2026-09-25 07:42:04.605943+00	1
f91c97f0-865b-4829-b57c-69f4e96365d0	455372482d8b81715b4ea5c0d609fff873a84dbbed3a890775ee284fa63d2929	2026-09-25 07:42:04.647395+00	20260925164000_giveaways	\N	\N	2026-09-25 07:42:04.628418+00	1
7c358a9a-ac5b-4c95-9ef5-49750d88862f	639b27446f091919d7d9c757d98e2d3bf3a199ee016f5127fcc63c3e416b1d84	2026-09-26 07:49:47.465366+00	20260926030000_music	\N	\N	2026-09-26 07:49:47.264612+00	1
9fe8cf79-532f-4ca5-b62b-c4952a1c283e	00f4cce54802da9352ef607578e84450fd476d6397b852ffa1d694bb602c9f52	2026-09-25 07:42:04.658922+00	20260925165000_birthdays	\N	\N	2026-09-25 07:42:04.647941+00	1
9875bd80-dfdc-4631-9742-81bfe5dbb771	f8ae2ed6b899c9c275865a5488a8b556ac1859d62b31efb8e7002bf43599c39d	2026-09-25 22:44:14.377054+00	20260925205000_messages	\N	\N	2026-09-25 22:44:14.35872+00	1
1e804714-dc58-43a6-8d41-c4a7c187986c	3eba4a12e252d7ffd258c4b79f13a9fcb5575421c1c589b87ed4312883a44fd0	2026-09-25 07:42:04.71291+00	20260925169000_knowledge_base	\N	\N	2026-09-25 07:42:04.698097+00	1
51247960-fd61-4055-aa9f-95e96be6c45f	307a135d5b688fd524951a4f5541f9fee6d8a4ee929a1f1890aa7241ac8cae63	2026-09-25 07:42:04.722688+00	20260925170000_fivem	\N	\N	2026-09-25 07:42:04.713943+00	1
41dc8833-4765-450f-9552-198e68947c00	9e39f3479ce16199453aa68b3a54bd306959b87b5bc2b3333ec48767db69ff91	2026-09-25 20:10:28.93473+00	20260925180000_server_builder	\N	\N	2026-09-25 20:10:28.905477+00	1
83621368-162d-480f-90c4-60103f4ed08a	f547136dec58f9520a0bbf7ba2b1d227ed33156e42a3ae34055489ba70a24843	2026-09-25 22:44:14.390756+00	20260925210000_streams	\N	\N	2026-09-25 22:44:14.377505+00	1
9eb9d356-141e-4309-bf34-9f8a1d56f646	0ddfd72be5ffadcefde88a70aa8f800fe24cace46d91fecfbbe72a6d9a44b968	2026-09-25 22:44:14.405316+00	20260925220000_games	\N	\N	2026-09-25 22:44:14.391443+00	1
54b08213-bec5-4adb-8d18-9afd4e24a6d5	0b4a704351426af0f7bd5ff75c79f44a0fab56a1da51aa5382efa35dd1a8cd3e	2026-09-26 18:54:13.566878+00	20260926090500_ticket_panel_rows	\N	\N	2026-09-26 18:54:13.562399+00	1
d4d6d970-78c0-4510-97cd-3d0f0a81a6c6	afc641c6412ee758a111cf524d31d54c418996040df7b1186cddef63939126f7	2026-09-26 19:12:41.661899+00	20260926091000_builder_wipe	\N	\N	2026-09-26 19:12:41.654687+00	1
\.


--
-- Data for Name: application_counters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."application_counters" ("guild_id", "next_number", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: application_forms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."application_forms" ("id", "guild_id", "name", "description", "enabled", "questions", "cooldown_days", "one_pending", "required_role_ids", "blocked_role_ids", "min_account_age_days", "review_channel_id", "reviewer_role_ids", "ping_member_ids", "accept_role_ids", "remove_role_ids", "accept_message", "deny_message", "discussion_channel_id", "button_label", "button_emoji", "button_style", "position", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: application_notes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."application_notes" ("id", "application_id", "author_id", "author_name", "body", "created_at") FROM stdin;
\.


--
-- Data for Name: application_panels; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."application_panels" ("id", "guild_id", "channel_id", "message_id", "title", "description", "color", "form_ids", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: application_votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."application_votes" ("application_id", "user_id", "vote", "created_at") FROM stdin;
\.


--
-- Data for Name: applications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."applications" ("id", "guild_id", "number", "form_id", "form_name", "applicant_id", "applicant_name", "status", "source", "answers", "review_channel_id", "review_message_id", "thread_id", "decided_by_id", "decided_by_name", "decision_reason", "decided_at", "dm_delivered", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: authentication_audit_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."authentication_audit_events" ("id", "action", "outcome", "reason_code", "request_id", "correlation_id", "actor_type", "actor_platform_user_id", "actor_service_identity_id", "target_platform_user_id", "target_external_identity_id", "target_browser_session_id", "target_oauth_transaction_id", "target_oauth_credential_id", "target_guild_membership_id", "provider", "purpose", "metadata", "ip_hmac", "user_agent_hmac", "device_hmac", "metadata_key_version", "occurred_at", "created_at") FROM stdin;
08e63f51-3813-4ce5-b1b5-2533ac6048cf	login-start	success	requested	2e7e44c5-1d3e-4459-8843-963f75a3efef	4383e257-a9ce-43f0-9541-911ae217d765	\N	\N	\N	\N	\N	\N	ed5cd573-44dd-4753-9f98-0465355005f2	\N	\N	discord	login	{"route": "/auth/discord/start"}	\N	\N	\N	\N	2026-09-25 20:10:08.855+00	2026-09-25 20:10:08.855+00
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
-- Data for Name: birthday_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."birthday_settings" ("guild_id", "enabled", "channel_id", "message", "embed_color", "role_id", "announce_hour", "ping_role_id", "allow_year", "require_confirmation", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: birthdays; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."birthdays" ("id", "guild_id", "user_id", "display_name", "month", "day", "year", "show_age", "time_zone", "last_announced_year", "granted_role_id", "role_remove_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: builder_drafts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."builder_drafts" ("guild_id", "answers", "blueprint", "updated_by_id", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: builder_run_items; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."builder_run_items" ("id", "run_id", "sequence", "kind", "key", "name", "discord_id", "status", "error", "note", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: builder_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."builder_runs" ("id", "guild_id", "status", "mode", "links", "planned", "done", "skipped", "failed", "started_by_id", "started_by_name", "warnings", "error", "started_at", "finished_at", "undone_at", "created_at", "updated_at", "snapshot") FROM stdin;
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
-- Data for Name: fivem_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."fivem_settings" ("guild_id", "server_address", "connect_url", "status_channel_id", "status_message_id", "update_interval_seconds", "alert_channel_id", "alert_role_id", "restart_times", "time_zone", "restart_warning_minutes", "last_online", "online_since", "failure_streak", "last_polled_at", "sent_restart_warnings", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: fivem_status_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."fivem_status_snapshots" ("id", "guild_id", "online", "players", "max_players", "at") FROM stdin;
\.


--
-- Data for Name: games_servers; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."games_servers" ("id", "guild_id", "name", "kind", "address", "game", "connect_url", "status_channel_id", "status_message_id", "update_interval_seconds", "player_count_channel_id", "alert_channel_id", "alert_role_id", "enabled", "last_online", "online_since", "offline_since", "failure_streak", "last_polled_at", "last_error", "last_player_count", "last_max_players", "last_renamed_at", "last_channel_name", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: games_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."games_settings" ("guild_id", "player_count_template", "player_count_offline_template", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: games_status_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."games_status_snapshots" ("id", "server_id", "online", "players", "max_players", "at") FROM stdin;
\.


--
-- Data for Name: giveaway_counters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."giveaway_counters" ("guild_id", "next_number") FROM stdin;
\.


--
-- Data for Name: giveaway_entries; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."giveaway_entries" ("id", "giveaway_id", "user_id", "user_name", "entries", "created_at") FROM stdin;
\.


--
-- Data for Name: giveaways; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."giveaways" ("id", "guild_id", "number", "prize", "description", "winner_count", "channel_id", "message_id", "host_id", "required_role_ids", "blocked_role_ids", "min_account_age_days", "min_server_days", "bonus_entries", "ping_role_id", "dm_winners", "ends_at", "paused_at", "status", "winner_ids", "ended_at", "ended_by_id", "created_by_id", "created_by_name", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: guilds; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."guilds" ("id", "discord_guild_id", "enabled", "disabled_at", "created_at", "updated_at", "metadata") FROM stdin;
\.


--
-- Data for Name: knowledge_articles; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."knowledge_articles" ("id", "guild_id", "category_id", "title", "slug", "body", "tags", "published", "pinned", "views", "author_id", "author_name", "updated_by_id", "updated_by_name", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: knowledge_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."knowledge_categories" ("id", "guild_id", "name", "emoji", "order", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: knowledge_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."knowledge_settings" ("guild_id", "auto_answer_enabled", "auto_answer_channel_ids", "auto_answer_threshold", "auto_answer_cooldown_seconds", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: level_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."level_members" ("guild_id", "user_id", "display_name", "xp", "level", "messages", "voice_minutes", "last_message_at", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: level_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."level_settings" ("guild_id", "enabled", "message_xp_min", "message_xp_max", "cooldown_seconds", "voice_xp_per_minute", "curve_base", "curve_exponent", "curve_linear", "role_multipliers", "channel_multipliers", "no_xp_role_ids", "no_xp_channel_ids", "level_up_mode", "level_up_channel_id", "level_up_message", "rewards", "reward_mode", "remove_rewards_on_reset", "max_level", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: messages_looks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."messages_looks" ("guild_id", "enabled", "accent_color", "footer_text", "footer_icon_url", "author_name", "author_icon_url", "thumbnail_url", "show_timestamp", "mode", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: messages_templates; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."messages_templates" ("id", "guild_id", "key", "enabled", "content", "embeds", "updated_by", "created_at", "updated_at") FROM stdin;
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
-- Data for Name: music_playlist_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."music_playlist_tracks" ("playlist_id", "position", "track_id") FROM stdin;
\.


--
-- Data for Name: music_playlists; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."music_playlists" ("id", "guild_id", "name", "description", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: music_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."music_sessions" ("guild_id", "channel_id", "text_channel_id", "panel_channel_id", "panel_message_id", "queue", "index", "position_seconds", "state", "loop", "shuffle", "volume", "updated_at") FROM stdin;
\.


--
-- Data for Name: music_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."music_settings" ("guild_id", "enabled", "dj_role_ids", "default_volume", "max_queue", "announce_channel_id", "now_playing_panel", "stay_connected_247", "home_channel_id", "auto_leave_minutes", "idle_radio_station_id", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: music_stations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."music_stations" ("id", "guild_id", "name", "url", "favicon_url", "tags", "created_at") FROM stdin;
\.


--
-- Data for Name: music_tracks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."music_tracks" ("id", "guild_id", "title", "artist", "album", "track_number", "duration_seconds", "file_name", "cover_file_name", "content_type", "size_bytes", "sha256", "original_name", "uploaded_by", "created_at", "updated_at") FROM stdin;
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
compiled-permission-catalog	1.0.0	sha256:25ed86a3d782176b251cc8ac3b54cf507ca9ba245cb7d6ef3a7be6d296cb0613	2026-09-25 20:09:51.763+00	2026-09-25 20:08:20.478+00	2026-09-25 20:09:51.838+00
\.


--
-- Data for Name: permission_definitions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."permission_definitions" ("id", "key", "description", "category", "enabled", "disabled_at", "created_at", "updated_at") FROM stdin;
0ca43aaf-ddb0-4b85-b6d1-d90542443de2	platform.owner	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
f62440bd-9804-417b-acd1-e97978297873	platform.admin	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
acfa6b80-082d-45c6-a003-bae74221834b	moderation.warn	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
04e01126-8b82-4153-b091-d4121c268603	moderation.kick	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
4526432f-49b0-4896-9ec1-6206b8391b16	moderation.ban	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
08579e2b-ca2c-48ee-8ac5-41976b5aea44	moderation.timeout	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
cba84937-6b18-40c0-9035-c2bd13d3476d	moderation.messages	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
d5e6f128-dac6-4edb-9dab-6949a75cfae0	moderation.view	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
5a700cdc-b3b3-4f0c-adc9-6f2538e81e5b	moderation.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
f50c6195-b136-49ff-b376-aeaaddbf9a50	tickets.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
dcd21558-9656-473b-8ce5-639bab7f2425	tickets.handle	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
9dc50695-b62b-4b5a-ad4e-ff6309ce534a	applications.review	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
a04f6a5d-7021-4b17-8262-67ff5b899171	applications.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
f43c3a88-5eb0-43f4-8ca7-8de9e2071d99	staff.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
963edeed-1d2c-4077-a478-cd0718d2417e	staff.view	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
f2b52c15-675a-424f-8f39-4bf1a966ae53	staff.shifts	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
db08deda-19e4-4680-bef0-f62adf46b48f	knowledge.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
1643ad9f-a281-4b1d-9daf-62c0707b4147	fivem.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
34c9b7eb-241d-4813-a310-980529fc3f95	discord.roles.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
13311220-6dd3-41d6-bf85-01fbbd32778b	discord.roles.administrator	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
6d94ff93-8db9-4177-9551-4c29233d45fd	discord.role-menus.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
6615d20a-466a-4a7c-bec9-a5fb3b4936bd	discord.welcome.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
918f703c-d3c2-46b3-9ea0-2034691fb693	discord.autoroles.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
d02889ca-096c-4d68-902b-017d30fcdea1	discord.rules.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
0aafd8b8-f218-44e3-9865-5b24182c4547	discord.counters.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
693f09d9-9b8c-40b9-b3ff-8c177eeea9cf	discord.logs.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
569ed55e-9d2b-4a68-8a93-d70525f3c58a	discord.embeds.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
8b0695c9-3082-4b7b-b32b-46c07167673d	discord.custom-commands.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
d789a9b7-8bd8-4e32-a4d4-689347bf9939	discord.suggestions.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
7eb74a9e-d899-4c3c-9764-bb95574697c1	discord.starboard.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
ffc685e0-ef72-4250-aa80-47d640a16c93	verification.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
b39273f0-2e2a-4e14-89d1-1bf99b8c1e94	verification.members	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
a740d63e-7ac4-498f-bdc1-6dd09a1568a9	polls.create	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
d663a0ea-5043-494f-9b7d-a65869f03d11	polls.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
a312d253-ec94-4505-8aa0-23d78ff314be	giveaways.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
6e8f45f0-64de-4ad1-b1f1-095f0ef889b3	birthdays.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
7b6f76b9-37a0-4ccc-8ca8-4ce24a40616d	scheduled.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
02f7c17d-26e3-49e3-855a-72f263364d77	levels.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
8c7751f0-d3ea-4e83-8486-8994c3be0ffa	voice.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
3c62d0e3-16d9-416f-b74c-a2bd198bdfbd	builder.manage	\N	\N	t	\N	2026-09-25 20:08:20.455+00	2026-09-25 20:08:20.455+00
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
-- Data for Name: poll_counters; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."poll_counters" ("guild_id", "next_number") FROM stdin;
\.


--
-- Data for Name: poll_votes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."poll_votes" ("id", "poll_id", "user_id", "user_name", "option_ids", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: polls; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."polls" ("id", "guild_id", "number", "question", "options", "max_choices", "anonymous", "results_visibility", "allow_vote_change", "allowed_role_ids", "channel_id", "message_id", "ping_role_id", "ends_at", "status", "created_by_id", "created_by_name", "closed_at", "closed_by_id", "created_at", "updated_at") FROM stdin;
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
-- Data for Name: scheduled_message_runs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."scheduled_message_runs" ("id", "message_id", "guild_id", "success", "discord_message_id", "error", "manual", "ran_at") FROM stdin;
\.


--
-- Data for Name: scheduled_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."scheduled_messages" ("id", "guild_id", "name", "channel_id", "content", "embed", "ping_role_ids", "schedule_type", "time_zone", "run_at", "interval_minutes", "time", "weekdays", "day_of_month", "start_date", "end_date", "enabled", "delete_previous", "pin", "max_runs", "run_count", "last_run_at", "last_message_id", "next_run_at", "created_by_id", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: server_log_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."server_log_configs" ("guild_id", "enabled", "events", "destinations", "ignored_channels", "ignored_roles", "ignored_users", "include_bots", "content_mode", "colors", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: staff_leaves; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_leaves" ("id", "guild_id", "user_id", "user_name", "starts_at", "ends_at", "reason", "status", "reviewer_id", "reviewer_name", "review_note", "reviewed_at", "message_id", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: staff_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_members" ("id", "guild_id", "user_id", "display_name", "rank_id", "callsign", "joined_at", "status", "notes", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: staff_ranks; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_ranks" ("id", "guild_id", "name", "role_id", "color", "description", "position", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: staff_records; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_records" ("id", "guild_id", "user_id", "user_name", "type", "actor_id", "actor_name", "reason", "from_rank", "to_rank", "created_at") FROM stdin;
\.


--
-- Data for Name: staff_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_settings" ("guild_id", "log_channel_id", "roster_channel_id", "roster_message_id", "loa_role_id", "auto_clock_out_hours", "max_leave_days", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: staff_shifts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_shifts" ("id", "guild_id", "user_id", "user_name", "started_at", "ended_at", "duration_seconds", "auto_ended", "created_at") FROM stdin;
\.


--
-- Data for Name: staff_strikes; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."staff_strikes" ("id", "guild_id", "user_id", "user_name", "reason", "actor_id", "actor_name", "expires_at", "revoked_at", "revoked_by_id", "created_at") FROM stdin;
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
-- Data for Name: streams_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."streams_settings" ("guild_id", "enabled", "default_channel_id", "ended_behavior", "check_interval_seconds", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: streams_subscriptions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."streams_subscriptions" ("id", "guild_id", "platform", "handle", "display_name", "avatar_url", "platform_id", "announce_channel_id", "ping_role_id", "message_text", "announce_videos", "enabled", "last_stream_id", "live_since", "last_announcement_channel_id", "last_announcement_message_id", "last_video_id", "last_checked_at", "offline_streak", "failure_streak", "last_error", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: suggestions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."suggestions" ("id", "guild_id", "submitter_id", "content", "status", "submission_message_id", "review_message_id", "result_message_id", "reviewer_id", "staff_note", "upvotes", "downvotes", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: ticket_categories; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_categories" ("id", "guild_id", "name", "description", "emoji", "button_style", "enabled", "position", "support_role_ids", "parent_channel_id", "name_template", "open_message", "default_priority", "questions", "required_role_ids", "max_open_per_user", "created_at", "updated_at", "alert_user_ids", "next_number") FROM stdin;
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

COPY "public"."ticket_panels" ("id", "guild_id", "name", "channel_id", "message_id", "title", "description", "color", "style", "placeholder", "image_url", "footer", "category_ids", "published_at", "created_at", "updated_at", "button_rows") FROM stdin;
\.


--
-- Data for Name: ticket_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."ticket_settings" ("guild_id", "enabled", "mode", "open_category_channel_id", "closed_category_channel_id", "thread_parent_channel_id", "transcript_channel_id", "log_channel_id", "support_role_ids", "ping_support_on_open", "max_open_per_user", "name_template", "open_message", "embed_color", "allow_user_close", "require_close_reason", "close_confirmation", "close_action", "delete_delay_seconds", "claim_enabled", "claim_restricts_replies", "transcripts_enabled", "transcript_dm_user", "feedback_enabled", "auto_close_hours", "auto_close_warning_hours", "auto_close_exclude_claimed", "blocked_user_ids", "blocked_role_ids", "next_number", "revision", "last_operation_source", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."tickets" ("id", "guild_id", "number", "category_id", "opener_id", "opener_name", "channel_id", "subject", "answers", "status", "priority", "claimed_by_id", "participant_ids", "tags", "closed_by_id", "close_reason", "rating", "feedback", "transcript_message_id", "auto_close_warned_at", "first_response_at", "last_activity_at", "closed_at", "created_at", "updated_at", "category_number") FROM stdin;
\.


--
-- Data for Name: verification_attempts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."verification_attempts" ("id", "guild_id", "user_id", "user_name", "result", "reason", "staff_id", "staff_name", "source", "created_at") FROM stdin;
\.


--
-- Data for Name: verification_pending_members; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."verification_pending_members" ("guild_id", "user_id", "joined_at", "flagged") FROM stdin;
\.


--
-- Data for Name: verification_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."verification_settings" ("guild_id", "enabled", "mode", "verified_role_ids", "unverified_role_id", "channel_id", "panel_title", "panel_description", "panel_color", "panel_button_label", "panel_channel_id", "panel_message_id", "questions", "log_channel_id", "min_account_age_days", "age_action", "kick_unverified_minutes", "max_attempts", "cooldown_minutes", "dm_on_success", "success_message", "welcome_channel_id", "welcome_message", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: voice_hubs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."voice_hubs" ("id", "guild_id", "name", "enabled", "channel_id", "category_id", "name_template", "user_limit", "bitrate_kbps", "private_by_default", "delete_delay_seconds", "allowed_role_ids", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: voice_rooms; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."voice_rooms" ("id", "guild_id", "hub_id", "channel_id", "owner_id", "name", "locked", "hidden", "panel_message_id", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: voice_settings; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."voice_settings" ("guild_id", "enabled", "control_panel", "allow_claim", "revision", "created_at", "updated_at") FROM stdin;
\.


--
-- Data for Name: welcome_goodbye_configs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY "public"."welcome_goodbye_configs" ("id", "guild_id", "kind", "enabled", "channel_id", "message_text", "embed_enabled", "embed_title", "embed_description", "embed_color", "thumbnail_avatar", "footer", "direct_message_enabled", "image_url", "role_mention_id", "delete_after_seconds", "created_at", "updated_at") FROM stdin;
\.


--
-- Name: builder_run_items_sequence_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('"public"."builder_run_items_sequence_seq"', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."_prisma_migrations"
    ADD CONSTRAINT "_prisma_migrations_pkey" PRIMARY KEY ("id");


--
-- Name: application_counters application_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_counters"
    ADD CONSTRAINT "application_counters_pkey" PRIMARY KEY ("guild_id");


--
-- Name: application_forms application_forms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_forms"
    ADD CONSTRAINT "application_forms_pkey" PRIMARY KEY ("id");


--
-- Name: application_notes application_notes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_notes"
    ADD CONSTRAINT "application_notes_pkey" PRIMARY KEY ("id");


--
-- Name: application_panels application_panels_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_panels"
    ADD CONSTRAINT "application_panels_pkey" PRIMARY KEY ("id");


--
-- Name: application_votes application_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_votes"
    ADD CONSTRAINT "application_votes_pkey" PRIMARY KEY ("application_id", "user_id");


--
-- Name: applications applications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_pkey" PRIMARY KEY ("id");


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
-- Name: birthday_settings birthday_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."birthday_settings"
    ADD CONSTRAINT "birthday_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: birthdays birthdays_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."birthdays"
    ADD CONSTRAINT "birthdays_pkey" PRIMARY KEY ("id");


--
-- Name: browser_sessions browser_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."browser_sessions"
    ADD CONSTRAINT "browser_sessions_pkey" PRIMARY KEY ("id");


--
-- Name: builder_drafts builder_drafts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."builder_drafts"
    ADD CONSTRAINT "builder_drafts_pkey" PRIMARY KEY ("guild_id");


--
-- Name: builder_run_items builder_run_items_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."builder_run_items"
    ADD CONSTRAINT "builder_run_items_pkey" PRIMARY KEY ("id");


--
-- Name: builder_runs builder_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."builder_runs"
    ADD CONSTRAINT "builder_runs_pkey" PRIMARY KEY ("id");


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
-- Name: fivem_settings fivem_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fivem_settings"
    ADD CONSTRAINT "fivem_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: fivem_status_snapshots fivem_status_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."fivem_status_snapshots"
    ADD CONSTRAINT "fivem_status_snapshots_pkey" PRIMARY KEY ("id");


--
-- Name: games_servers games_servers_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."games_servers"
    ADD CONSTRAINT "games_servers_pkey" PRIMARY KEY ("id");


--
-- Name: games_settings games_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."games_settings"
    ADD CONSTRAINT "games_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: games_status_snapshots games_status_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."games_status_snapshots"
    ADD CONSTRAINT "games_status_snapshots_pkey" PRIMARY KEY ("id");


--
-- Name: giveaway_counters giveaway_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."giveaway_counters"
    ADD CONSTRAINT "giveaway_counters_pkey" PRIMARY KEY ("guild_id");


--
-- Name: giveaway_entries giveaway_entries_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."giveaway_entries"
    ADD CONSTRAINT "giveaway_entries_pkey" PRIMARY KEY ("id");


--
-- Name: giveaways giveaways_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."giveaways"
    ADD CONSTRAINT "giveaways_pkey" PRIMARY KEY ("id");


--
-- Name: guilds guilds_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."guilds"
    ADD CONSTRAINT "guilds_pkey" PRIMARY KEY ("id");


--
-- Name: knowledge_articles knowledge_articles_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."knowledge_articles"
    ADD CONSTRAINT "knowledge_articles_pkey" PRIMARY KEY ("id");


--
-- Name: knowledge_categories knowledge_categories_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."knowledge_categories"
    ADD CONSTRAINT "knowledge_categories_pkey" PRIMARY KEY ("id");


--
-- Name: knowledge_settings knowledge_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."knowledge_settings"
    ADD CONSTRAINT "knowledge_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: level_members level_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."level_members"
    ADD CONSTRAINT "level_members_pkey" PRIMARY KEY ("guild_id", "user_id");


--
-- Name: level_settings level_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."level_settings"
    ADD CONSTRAINT "level_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: messages_looks messages_looks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."messages_looks"
    ADD CONSTRAINT "messages_looks_pkey" PRIMARY KEY ("guild_id");


--
-- Name: messages_templates messages_templates_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."messages_templates"
    ADD CONSTRAINT "messages_templates_pkey" PRIMARY KEY ("id");


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
-- Name: music_playlist_tracks music_playlist_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."music_playlist_tracks"
    ADD CONSTRAINT "music_playlist_tracks_pkey" PRIMARY KEY ("playlist_id", "position");


--
-- Name: music_playlists music_playlists_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."music_playlists"
    ADD CONSTRAINT "music_playlists_pkey" PRIMARY KEY ("id");


--
-- Name: music_sessions music_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."music_sessions"
    ADD CONSTRAINT "music_sessions_pkey" PRIMARY KEY ("guild_id");


--
-- Name: music_settings music_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."music_settings"
    ADD CONSTRAINT "music_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: music_stations music_stations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."music_stations"
    ADD CONSTRAINT "music_stations_pkey" PRIMARY KEY ("id");


--
-- Name: music_tracks music_tracks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."music_tracks"
    ADD CONSTRAINT "music_tracks_pkey" PRIMARY KEY ("id");


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
-- Name: poll_counters poll_counters_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."poll_counters"
    ADD CONSTRAINT "poll_counters_pkey" PRIMARY KEY ("guild_id");


--
-- Name: poll_votes poll_votes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."poll_votes"
    ADD CONSTRAINT "poll_votes_pkey" PRIMARY KEY ("id");


--
-- Name: polls polls_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."polls"
    ADD CONSTRAINT "polls_pkey" PRIMARY KEY ("id");


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
-- Name: scheduled_message_runs scheduled_message_runs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."scheduled_message_runs"
    ADD CONSTRAINT "scheduled_message_runs_pkey" PRIMARY KEY ("id");


--
-- Name: scheduled_messages scheduled_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."scheduled_messages"
    ADD CONSTRAINT "scheduled_messages_pkey" PRIMARY KEY ("id");


--
-- Name: server_log_configs server_log_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."server_log_configs"
    ADD CONSTRAINT "server_log_configs_pkey" PRIMARY KEY ("guild_id");


--
-- Name: staff_leaves staff_leaves_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_leaves"
    ADD CONSTRAINT "staff_leaves_pkey" PRIMARY KEY ("id");


--
-- Name: staff_members staff_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_members"
    ADD CONSTRAINT "staff_members_pkey" PRIMARY KEY ("id");


--
-- Name: staff_ranks staff_ranks_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_ranks"
    ADD CONSTRAINT "staff_ranks_pkey" PRIMARY KEY ("id");


--
-- Name: staff_records staff_records_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_records"
    ADD CONSTRAINT "staff_records_pkey" PRIMARY KEY ("id");


--
-- Name: staff_settings staff_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_settings"
    ADD CONSTRAINT "staff_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: staff_shifts staff_shifts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_shifts"
    ADD CONSTRAINT "staff_shifts_pkey" PRIMARY KEY ("id");


--
-- Name: staff_strikes staff_strikes_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."staff_strikes"
    ADD CONSTRAINT "staff_strikes_pkey" PRIMARY KEY ("id");


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
-- Name: streams_settings streams_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."streams_settings"
    ADD CONSTRAINT "streams_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: streams_subscriptions streams_subscriptions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."streams_subscriptions"
    ADD CONSTRAINT "streams_subscriptions_pkey" PRIMARY KEY ("id");


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
-- Name: verification_attempts verification_attempts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."verification_attempts"
    ADD CONSTRAINT "verification_attempts_pkey" PRIMARY KEY ("id");


--
-- Name: verification_pending_members verification_pending_members_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."verification_pending_members"
    ADD CONSTRAINT "verification_pending_members_pkey" PRIMARY KEY ("guild_id", "user_id");


--
-- Name: verification_settings verification_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."verification_settings"
    ADD CONSTRAINT "verification_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: voice_hubs voice_hubs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."voice_hubs"
    ADD CONSTRAINT "voice_hubs_pkey" PRIMARY KEY ("id");


--
-- Name: voice_rooms voice_rooms_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."voice_rooms"
    ADD CONSTRAINT "voice_rooms_pkey" PRIMARY KEY ("id");


--
-- Name: voice_settings voice_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."voice_settings"
    ADD CONSTRAINT "voice_settings_pkey" PRIMARY KEY ("guild_id");


--
-- Name: welcome_goodbye_configs welcome_goodbye_configs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."welcome_goodbye_configs"
    ADD CONSTRAINT "welcome_goodbye_configs_pkey" PRIMARY KEY ("id");


--
-- Name: application_forms_guild_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "application_forms_guild_position_idx" ON "public"."application_forms" USING "btree" ("guild_id", "position");


--
-- Name: application_notes_application_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "application_notes_application_idx" ON "public"."application_notes" USING "btree" ("application_id", "created_at");


--
-- Name: application_panels_guild_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "application_panels_guild_idx" ON "public"."application_panels" USING "btree" ("guild_id");


--
-- Name: applications_guild_applicant_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "applications_guild_applicant_idx" ON "public"."applications" USING "btree" ("guild_id", "applicant_id");


--
-- Name: applications_guild_form_applicant_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "applications_guild_form_applicant_idx" ON "public"."applications" USING "btree" ("guild_id", "form_id", "applicant_id");


--
-- Name: applications_guild_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "applications_guild_number_key" ON "public"."applications" USING "btree" ("guild_id", "number");


--
-- Name: applications_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "applications_guild_status_idx" ON "public"."applications" USING "btree" ("guild_id", "status", "created_at");


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
-- Name: birthday_settings_enabled_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "birthday_settings_enabled_idx" ON "public"."birthday_settings" USING "btree" ("enabled");


--
-- Name: birthdays_guild_date_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "birthdays_guild_date_idx" ON "public"."birthdays" USING "btree" ("guild_id", "month", "day");


--
-- Name: birthdays_guild_user_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "birthdays_guild_user_key" ON "public"."birthdays" USING "btree" ("guild_id", "user_id");


--
-- Name: birthdays_role_remove_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "birthdays_role_remove_idx" ON "public"."birthdays" USING "btree" ("role_remove_at");


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
-- Name: builder_run_items_run_sequence_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "builder_run_items_run_sequence_idx" ON "public"."builder_run_items" USING "btree" ("run_id", "sequence");


--
-- Name: builder_runs_guild_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "builder_runs_guild_created_idx" ON "public"."builder_runs" USING "btree" ("guild_id", "created_at");


--
-- Name: builder_runs_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "builder_runs_status_idx" ON "public"."builder_runs" USING "btree" ("status");


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
-- Name: fivem_status_snapshots_guild_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "fivem_status_snapshots_guild_at_idx" ON "public"."fivem_status_snapshots" USING "btree" ("guild_id", "at");


--
-- Name: games_servers_guild_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "games_servers_guild_idx" ON "public"."games_servers" USING "btree" ("guild_id");


--
-- Name: games_status_snapshots_server_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "games_status_snapshots_server_at_idx" ON "public"."games_status_snapshots" USING "btree" ("server_id", "at");


--
-- Name: giveaway_entries_giveaway_user_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "giveaway_entries_giveaway_user_key" ON "public"."giveaway_entries" USING "btree" ("giveaway_id", "user_id");


--
-- Name: giveaways_guild_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "giveaways_guild_number_key" ON "public"."giveaways" USING "btree" ("guild_id", "number");


--
-- Name: giveaways_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "giveaways_guild_status_idx" ON "public"."giveaways" USING "btree" ("guild_id", "status", "number");


--
-- Name: giveaways_status_ends_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "giveaways_status_ends_idx" ON "public"."giveaways" USING "btree" ("status", "ends_at");


--
-- Name: guild_discord_guild_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "guild_discord_guild_id_key" ON "public"."guilds" USING "btree" ("discord_guild_id");


--
-- Name: knowledge_articles_category_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "knowledge_articles_category_idx" ON "public"."knowledge_articles" USING "btree" ("category_id");


--
-- Name: knowledge_articles_guild_published_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "knowledge_articles_guild_published_idx" ON "public"."knowledge_articles" USING "btree" ("guild_id", "published", "updated_at");


--
-- Name: knowledge_articles_guild_slug_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "knowledge_articles_guild_slug_key" ON "public"."knowledge_articles" USING "btree" ("guild_id", "slug");


--
-- Name: knowledge_categories_guild_order_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "knowledge_categories_guild_order_idx" ON "public"."knowledge_categories" USING "btree" ("guild_id", "order");


--
-- Name: level_members_guild_xp_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "level_members_guild_xp_idx" ON "public"."level_members" USING "btree" ("guild_id", "xp" DESC);


--
-- Name: messages_templates_guild_key_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "messages_templates_guild_key_key" ON "public"."messages_templates" USING "btree" ("guild_id", "key");


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
-- Name: music_playlist_tracks_track_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "music_playlist_tracks_track_idx" ON "public"."music_playlist_tracks" USING "btree" ("track_id");


--
-- Name: music_playlists_guild_name_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "music_playlists_guild_name_idx" ON "public"."music_playlists" USING "btree" ("guild_id", "name");


--
-- Name: music_sessions_state_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "music_sessions_state_idx" ON "public"."music_sessions" USING "btree" ("state");


--
-- Name: music_settings_stay_connected_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "music_settings_stay_connected_idx" ON "public"."music_settings" USING "btree" ("stay_connected_247", "enabled");


--
-- Name: music_stations_guild_url_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "music_stations_guild_url_key" ON "public"."music_stations" USING "btree" ("guild_id", "url");


--
-- Name: music_tracks_guild_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "music_tracks_guild_created_idx" ON "public"."music_tracks" USING "btree" ("guild_id", "created_at");


--
-- Name: music_tracks_guild_hash_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "music_tracks_guild_hash_key" ON "public"."music_tracks" USING "btree" ("guild_id", "sha256");


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
-- Name: poll_votes_poll_user_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "poll_votes_poll_user_key" ON "public"."poll_votes" USING "btree" ("poll_id", "user_id");


--
-- Name: polls_guild_number_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "polls_guild_number_key" ON "public"."polls" USING "btree" ("guild_id", "number");


--
-- Name: polls_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "polls_guild_status_idx" ON "public"."polls" USING "btree" ("guild_id", "status", "number");


--
-- Name: polls_status_ends_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "polls_status_ends_idx" ON "public"."polls" USING "btree" ("status", "ends_at");


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
-- Name: scheduled_message_runs_guild_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "scheduled_message_runs_guild_idx" ON "public"."scheduled_message_runs" USING "btree" ("guild_id", "ran_at");


--
-- Name: scheduled_message_runs_message_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "scheduled_message_runs_message_idx" ON "public"."scheduled_message_runs" USING "btree" ("message_id", "ran_at");


--
-- Name: scheduled_messages_due_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "scheduled_messages_due_idx" ON "public"."scheduled_messages" USING "btree" ("enabled", "next_run_at");


--
-- Name: scheduled_messages_guild_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "scheduled_messages_guild_name_key" ON "public"."scheduled_messages" USING "btree" ("guild_id", "name");


--
-- Name: staff_leaves_due_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_leaves_due_idx" ON "public"."staff_leaves" USING "btree" ("status", "starts_at", "ends_at");


--
-- Name: staff_leaves_guild_status_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_leaves_guild_status_idx" ON "public"."staff_leaves" USING "btree" ("guild_id", "status", "starts_at");


--
-- Name: staff_leaves_guild_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_leaves_guild_user_idx" ON "public"."staff_leaves" USING "btree" ("guild_id", "user_id", "created_at");


--
-- Name: staff_members_guild_user_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "staff_members_guild_user_key" ON "public"."staff_members" USING "btree" ("guild_id", "user_id");


--
-- Name: staff_members_rank_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_members_rank_idx" ON "public"."staff_members" USING "btree" ("rank_id");


--
-- Name: staff_ranks_guild_name_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "staff_ranks_guild_name_key" ON "public"."staff_ranks" USING "btree" ("guild_id", "name");


--
-- Name: staff_ranks_guild_position_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_ranks_guild_position_idx" ON "public"."staff_ranks" USING "btree" ("guild_id", "position");


--
-- Name: staff_records_guild_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_records_guild_created_idx" ON "public"."staff_records" USING "btree" ("guild_id", "created_at");


--
-- Name: staff_records_guild_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_records_guild_user_idx" ON "public"."staff_records" USING "btree" ("guild_id", "user_id", "created_at");


--
-- Name: staff_shifts_guild_started_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_shifts_guild_started_idx" ON "public"."staff_shifts" USING "btree" ("guild_id", "started_at");


--
-- Name: staff_shifts_guild_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_shifts_guild_user_idx" ON "public"."staff_shifts" USING "btree" ("guild_id", "user_id", "started_at");


--
-- Name: staff_shifts_open_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_shifts_open_idx" ON "public"."staff_shifts" USING "btree" ("ended_at");


--
-- Name: staff_strikes_guild_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "staff_strikes_guild_user_idx" ON "public"."staff_strikes" USING "btree" ("guild_id", "user_id", "created_at");


--
-- Name: starboard_entries_guild_deleted_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "starboard_entries_guild_deleted_idx" ON "public"."starboard_entries" USING "btree" ("guild_id", "deleted");


--
-- Name: starboard_entries_source_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "starboard_entries_source_key" ON "public"."starboard_entries" USING "btree" ("guild_id", "source_message_id");


--
-- Name: streams_subscriptions_active_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "streams_subscriptions_active_idx" ON "public"."streams_subscriptions" USING "btree" ("enabled", "guild_id");


--
-- Name: streams_subscriptions_guild_creator_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "streams_subscriptions_guild_creator_key" ON "public"."streams_subscriptions" USING "btree" ("guild_id", "platform", "platform_id");


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
-- Name: verification_attempts_guild_created_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "verification_attempts_guild_created_idx" ON "public"."verification_attempts" USING "btree" ("guild_id", "created_at");


--
-- Name: verification_attempts_guild_result_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "verification_attempts_guild_result_idx" ON "public"."verification_attempts" USING "btree" ("guild_id", "result", "created_at");


--
-- Name: verification_attempts_guild_user_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "verification_attempts_guild_user_idx" ON "public"."verification_attempts" USING "btree" ("guild_id", "user_id", "result", "created_at");


--
-- Name: verification_pending_members_guild_joined_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "verification_pending_members_guild_joined_idx" ON "public"."verification_pending_members" USING "btree" ("guild_id", "joined_at");


--
-- Name: verification_settings_kick_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "verification_settings_kick_idx" ON "public"."verification_settings" USING "btree" ("enabled", "kick_unverified_minutes");


--
-- Name: voice_hubs_guild_channel_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "voice_hubs_guild_channel_key" ON "public"."voice_hubs" USING "btree" ("guild_id", "channel_id");


--
-- Name: voice_rooms_channel_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX "voice_rooms_channel_key" ON "public"."voice_rooms" USING "btree" ("channel_id");


--
-- Name: voice_rooms_guild_owner_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "voice_rooms_guild_owner_idx" ON "public"."voice_rooms" USING "btree" ("guild_id", "owner_id");


--
-- Name: voice_rooms_hub_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX "voice_rooms_hub_idx" ON "public"."voice_rooms" USING "btree" ("hub_id");


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
-- Name: application_notes application_notes_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_notes"
    ADD CONSTRAINT "application_notes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: application_votes application_votes_application_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."application_votes"
    ADD CONSTRAINT "application_votes_application_id_fkey" FOREIGN KEY ("application_id") REFERENCES "public"."applications"("id") ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: applications applications_form_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY "public"."applications"
    ADD CONSTRAINT "applications_form_id_fkey" FOREIGN KEY ("form_id") REFERENCES "public"."application_forms"("id") ON UPDATE CASCADE ON DELETE SET NULL;


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
-- PostgreSQL database dump complete
--


