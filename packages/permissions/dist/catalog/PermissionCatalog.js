/** Lowercase dot-separated permission identifier syntax. */
export const PERMISSION_IDENTIFIER_PATTERN = /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;
/** Version of the compiled permission catalog contract. */
export const PERMISSION_CATALOG_VERSION = "1.0.0";
/** SHA-256 checksum of the ordered authoritative permission identifiers. */
export const PERMISSION_CATALOG_CHECKSUM = "sha256:df0efd01bfbe33d3d650ce41641141afa943c1f675e0d3cdff48be4ccfbf048a";
/**
 * Exact permission identifiers compiled into this application.
 *
 * This tuple is the sole authority for identifiers. Persisted catalog metadata
 * may describe or disable these entries, but cannot add identifiers.
 */
export const PERMISSIONS = [
    "platform.owner",
    "platform.admin",
    "moderation.warn",
    "moderation.kick",
    "moderation.ban",
    "moderation.timeout",
    "moderation.messages",
    "moderation.view",
    "moderation.manage",
    "tickets.manage",
    "tickets.handle",
    "applications.review",
    "applications.manage",
    "staff.manage",
    "staff.view",
    "staff.shifts",
    "knowledge.manage",
    "fivem.manage",
    "streams.manage",
    "games.manage",
    "music.manage",
    "music.dj",
    "discord.roles.manage",
    "discord.roles.administrator",
    "discord.role-menus.manage",
    "discord.welcome.manage",
    "discord.autoroles.manage",
    "discord.rules.manage",
    "discord.counters.manage",
    "discord.logs.manage",
    "discord.embeds.manage",
    "discord.custom-commands.manage",
    "discord.suggestions.manage",
    "discord.starboard.manage",
    "verification.manage",
    "verification.members",
    "polls.create",
    "polls.manage",
    "giveaways.manage",
    "birthdays.manage",
    "scheduled.manage",
    "levels.manage",
    "voice.manage",
    "builder.manage",
    "messages.manage",
];
/** Error reporting every persisted key rejected by the compiled catalog. */
export class UnknownPermissionCatalogEntriesError extends Error {
    unknownKeys;
    constructor(unknownKeys) {
        super(`Persisted permission catalog contains unknown keys: ${unknownKeys.join(", ")}.`);
        this.unknownKeys = unknownKeys;
        this.name = "UnknownPermissionCatalogEntriesError";
    }
}
const knownPermissions = new Set(PERMISSIONS);
/** Immutable snapshot of the authoritative compiled catalog. */
export const permissionCatalog = Object.freeze({
    version: PERMISSION_CATALOG_VERSION,
    checksum: PERMISSION_CATALOG_CHECKSUM,
    permissions: PERMISSIONS,
});
/**
 * Tests whether a string follows the exact permission naming convention.
 * Wildcards and group selectors are deliberately invalid exact identifiers.
 */
export function isValidPermissionIdentifier(value) {
    return PERMISSION_IDENTIFIER_PATTERN.test(value);
}
/** Narrows a string to an identifier in the authoritative compiled catalog. */
export function isPermission(value) {
    return isValidPermissionIdentifier(value) && knownPermissions.has(value);
}
/**
 * Resolves an untrusted identifier through the compiled catalog.
 *
 * @throws Error when syntax is invalid or the identifier is not compiled.
 */
export function requirePermission(value) {
    if (!isValidPermissionIdentifier(value)) {
        throw new Error(`Permission identifier '${value}' must be lowercase and dot-separated.`);
    }
    if (!isPermission(value)) {
        throw new Error(`Permission identifier '${value}' is not present in catalog ${PERMISSION_CATALOG_VERSION}.`);
    }
    return value;
}
/** Builds startup synchronization status without accessing persistence. */
export function permissionCatalogStatus(persistedVersion, persistedChecksum) {
    if (persistedVersion === undefined) {
        return {
            compiledVersion: PERMISSION_CATALOG_VERSION,
            compiledChecksum: PERMISSION_CATALOG_CHECKSUM,
            state: "persisted-catalog-unavailable",
        };
    }
    return {
        compiledVersion: PERMISSION_CATALOG_VERSION,
        compiledChecksum: PERMISSION_CATALOG_CHECKSUM,
        persistedVersion,
        ...(persistedChecksum === undefined ? {} : { persistedChecksum }),
        state: persistedVersion !== PERMISSION_CATALOG_VERSION
            ? "version-mismatch"
            : persistedChecksum !== PERMISSION_CATALOG_CHECKSUM
                ? "checksum-mismatch"
                : "synchronized",
    };
}
/**
 * Validates future persisted catalog metadata without synchronizing it.
 * Unknown keys are reported together and rejected; missing compiled keys remain
 * a future synchronization concern and cannot reduce the compiled type union.
 */
export function validatePersistedPermissionCatalog(descriptor) {
    const unknownKeys = [
        ...new Set(descriptor.permissionKeys.filter((key) => !isPermission(key))),
    ].sort();
    if (unknownKeys.length > 0)
        throw new UnknownPermissionCatalogEntriesError(unknownKeys);
    return permissionCatalogStatus(descriptor.version, descriptor.checksum);
}
//# sourceMappingURL=PermissionCatalog.js.map