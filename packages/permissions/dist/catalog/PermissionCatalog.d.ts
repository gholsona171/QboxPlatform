/** Lowercase dot-separated permission identifier syntax. */
export declare const PERMISSION_IDENTIFIER_PATTERN: RegExp;
/** Version of the compiled permission catalog contract. */
export declare const PERMISSION_CATALOG_VERSION: "1.0.0";
/** SHA-256 checksum of the ordered authoritative permission identifiers. */
export declare const PERMISSION_CATALOG_CHECKSUM: "sha256:df0efd01bfbe33d3d650ce41641141afa943c1f675e0d3cdff48be4ccfbf048a";
/**
 * Exact permission identifiers compiled into this application.
 *
 * This tuple is the sole authority for identifiers. Persisted catalog metadata
 * may describe or disable these entries, but cannot add identifiers.
 */
export declare const PERMISSIONS: readonly ["platform.owner", "platform.admin", "moderation.warn", "moderation.kick", "moderation.ban", "moderation.timeout", "moderation.messages", "moderation.view", "moderation.manage", "tickets.manage", "tickets.handle", "applications.review", "applications.manage", "staff.manage", "staff.view", "staff.shifts", "knowledge.manage", "fivem.manage", "streams.manage", "games.manage", "music.manage", "music.dj", "discord.roles.manage", "discord.roles.administrator", "discord.role-menus.manage", "discord.welcome.manage", "discord.autoroles.manage", "discord.rules.manage", "discord.counters.manage", "discord.logs.manage", "discord.embeds.manage", "discord.custom-commands.manage", "discord.suggestions.manage", "discord.starboard.manage", "verification.manage", "verification.members", "polls.create", "polls.manage", "giveaways.manage", "birthdays.manage", "scheduled.manage", "levels.manage", "voice.manage", "builder.manage", "messages.manage"];
/** An exact identifier present in the compiled permission catalog. */
export type Permission = (typeof PERMISSIONS)[number];
/**
 * Read-only compiled catalog supplied to synchronization and diagnostics.
 * It is process-immutable and remains authoritative for the process lifetime;
 * future persistence may attach metadata but cannot extend its identifiers.
 */
export interface PermissionCatalogSnapshot {
    /** Compiled catalog version understood by this process. */
    readonly version: string;
    /** Deterministic checksum of the ordered compiled identifiers. */
    readonly checksum: string;
    /** Exact authoritative permission identifiers. */
    readonly permissions: readonly Permission[];
}
/** Comparison state between compiled and future persisted catalog metadata. */
export type PermissionCatalogSynchronizationState = "persisted-catalog-unavailable" | "synchronized" | "version-mismatch" | "checksum-mismatch";
/**
 * Non-mutating catalog synchronization diagnostic for startup reporting.
 * It is an immutable observation with no resource lifecycle. Future startup
 * synchronizers can consume it without changing authorization consumers.
 */
export interface PermissionCatalogSynchronizationStatus {
    /** Version compiled into the running process. */
    readonly compiledVersion: string;
    /** Checksum compiled into the running process. */
    readonly compiledChecksum: string;
    /** Future persisted version, when a persistence adapter supplies one. */
    readonly persistedVersion?: string;
    /** Future persisted checksum, when supplied by an adapter. */
    readonly persistedChecksum?: string;
    /** Deterministic comparison result; this contract performs no synchronization. */
    readonly state: PermissionCatalogSynchronizationState;
}
/**
 * Future persistence input containing metadata keys but no executable identifiers.
 * Adapters may construct it concurrently from storage, but validation always
 * resolves keys against the immutable compiled catalog before synchronization.
 */
export interface PersistedPermissionCatalogDescriptor {
    /** Catalog version last committed by a future synchronizer. */
    readonly version: string;
    /** Checksum last committed by a future synchronizer. */
    readonly checksum: string;
    /** Persisted metadata keys that must all exist in the compiled catalog. */
    readonly permissionKeys: readonly string[];
}
/** Error reporting every persisted key rejected by the compiled catalog. */
export declare class UnknownPermissionCatalogEntriesError extends Error {
    readonly unknownKeys: readonly string[];
    constructor(unknownKeys: readonly string[]);
}
/** Immutable snapshot of the authoritative compiled catalog. */
export declare const permissionCatalog: PermissionCatalogSnapshot;
/**
 * Tests whether a string follows the exact permission naming convention.
 * Wildcards and group selectors are deliberately invalid exact identifiers.
 */
export declare function isValidPermissionIdentifier(value: string): boolean;
/** Narrows a string to an identifier in the authoritative compiled catalog. */
export declare function isPermission(value: string): value is Permission;
/**
 * Resolves an untrusted identifier through the compiled catalog.
 *
 * @throws Error when syntax is invalid or the identifier is not compiled.
 */
export declare function requirePermission(value: string): Permission;
/** Builds startup synchronization status without accessing persistence. */
export declare function permissionCatalogStatus(persistedVersion?: string, persistedChecksum?: string): PermissionCatalogSynchronizationStatus;
/**
 * Validates future persisted catalog metadata without synchronizing it.
 * Unknown keys are reported together and rejected; missing compiled keys remain
 * a future synchronization concern and cannot reduce the compiled type union.
 */
export declare function validatePersistedPermissionCatalog(descriptor: PersistedPermissionCatalogDescriptor): PermissionCatalogSynchronizationStatus;
//# sourceMappingURL=PermissionCatalog.d.ts.map