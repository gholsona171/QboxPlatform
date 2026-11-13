import type { Permission } from "../catalog/PermissionCatalog.js";
/**
 * Supported authorization principal types for the current domain lifecycle.
 * The closed union prevents adapters from activating unverified identity types;
 * future providers extend this union only with a trusted identity resolver.
 */
export type PermissionPrincipalType = "discord-user" | "discord-role";
/**
 * Stable, provider-qualified identity used during authorization.
 * Discord principals must always carry the guild that owns their external ID.
 * Values are immutable and safe to share within a process; adapters must verify
 * them at ingress. Future principal types extend the discriminator, not the IDs.
 */
export interface PermissionPrincipal {
    readonly type: PermissionPrincipalType;
    readonly externalId: string;
    readonly guildId: string;
}
/**
 * Platform-wide or Discord-guild-specific authorization boundary.
 * Guild IDs are mandatory and become part of repository/cache isolation. The
 * immutable value has no lifecycle; future scope kinds extend this union.
 */
export type PermissionScope = {
    readonly type: "platform";
} | {
    readonly type: "discord-guild";
    readonly guildId: string;
};
/** Current exact permission selector. Its discriminator reserves future groups. */
export interface ExactPermissionSelector {
    readonly type: "permission";
    readonly permission: Permission;
}
/** Reserved group selector shape; authorization rejects it until groups are implemented. */
export interface PermissionGroupSelector {
    readonly type: "group";
    readonly group: `${string}.*`;
}
/** Selector accepted at domain boundaries; only exact selectors are currently executable. */
export type PermissionSelector = ExactPermissionSelector | PermissionGroupSelector;
/** Allow or deny effect applied by an assignment. Deny wins over ordinary grants. */
export type PermissionEffect = "allow" | "deny";
/**
 * Persistable domain record returned by repositories and caches.
 * Records are immutable snapshots: services ignore disabled/expired records and
 * adapters own concurrent update semantics. Selector discrimination reserves
 * group support without allowing wildcard evaluation today.
 */
export interface PermissionAssignment {
    readonly id: string;
    readonly principal: PermissionPrincipal;
    readonly selector: PermissionSelector;
    readonly scope: PermissionScope;
    readonly effect: PermissionEffect;
    readonly enabled: boolean;
    readonly expiresAt?: Date;
}
/** Legacy Discord subject retained for the synchronous compatibility service. */
export interface PermissionSubject {
    readonly userId: string;
    readonly roleIds: readonly string[];
}
/** Legacy in-memory role grant retained until Discord integration Phase 2. */
export interface PermissionGrant {
    readonly roleId: string;
    readonly permissions: readonly Permission[];
}
export type { Permission } from "../catalog/PermissionCatalog.js";
//# sourceMappingURL=Permission.d.ts.map