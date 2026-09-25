/** Lowercase dot-separated permission identifier syntax. */
export const PERMISSION_IDENTIFIER_PATTERN =
  /^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/;

/** Version of the compiled permission catalog contract. */
export const PERMISSION_CATALOG_VERSION = "1.0.0" as const;

/** SHA-256 checksum of the ordered authoritative permission identifiers. */
export const PERMISSION_CATALOG_CHECKSUM =
  "sha256:e083df03549d9479df158db3805282b3cc8c2c667bbcbab65e8fc0ead7100030" as const;

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
  "staff.manage",
  "knowledge.manage",
  "fivem.manage",
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
] as const;

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
export type PermissionCatalogSynchronizationState =
  | "persisted-catalog-unavailable"
  | "synchronized"
  | "version-mismatch"
  | "checksum-mismatch";

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
export class UnknownPermissionCatalogEntriesError extends Error {
  public constructor(public readonly unknownKeys: readonly string[]) {
    super(
      `Persisted permission catalog contains unknown keys: ${unknownKeys.join(", ")}.`,
    );
    this.name = "UnknownPermissionCatalogEntriesError";
  }
}

const knownPermissions = new Set<string>(PERMISSIONS);

/** Immutable snapshot of the authoritative compiled catalog. */
export const permissionCatalog: PermissionCatalogSnapshot = Object.freeze({
  version: PERMISSION_CATALOG_VERSION,
  checksum: PERMISSION_CATALOG_CHECKSUM,
  permissions: PERMISSIONS,
});

/**
 * Tests whether a string follows the exact permission naming convention.
 * Wildcards and group selectors are deliberately invalid exact identifiers.
 */
export function isValidPermissionIdentifier(value: string): boolean {
  return PERMISSION_IDENTIFIER_PATTERN.test(value);
}

/** Narrows a string to an identifier in the authoritative compiled catalog. */
export function isPermission(value: string): value is Permission {
  return isValidPermissionIdentifier(value) && knownPermissions.has(value);
}

/**
 * Resolves an untrusted identifier through the compiled catalog.
 *
 * @throws Error when syntax is invalid or the identifier is not compiled.
 */
export function requirePermission(value: string): Permission {
  if (!isValidPermissionIdentifier(value)) {
    throw new Error(
      `Permission identifier '${value}' must be lowercase and dot-separated.`,
    );
  }
  if (!isPermission(value)) {
    throw new Error(
      `Permission identifier '${value}' is not present in catalog ${PERMISSION_CATALOG_VERSION}.`,
    );
  }
  return value;
}

/** Builds startup synchronization status without accessing persistence. */
export function permissionCatalogStatus(
  persistedVersion?: string,
  persistedChecksum?: string,
): PermissionCatalogSynchronizationStatus {
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
    state:
      persistedVersion !== PERMISSION_CATALOG_VERSION
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
export function validatePersistedPermissionCatalog(
  descriptor: PersistedPermissionCatalogDescriptor,
): PermissionCatalogSynchronizationStatus {
  const unknownKeys = [
    ...new Set(descriptor.permissionKeys.filter((key) => !isPermission(key))),
  ].sort();
  if (unknownKeys.length > 0)
    throw new UnknownPermissionCatalogEntriesError(unknownKeys);
  return permissionCatalogStatus(descriptor.version, descriptor.checksum);
}
