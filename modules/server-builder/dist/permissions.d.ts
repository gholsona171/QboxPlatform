import type { BuilderBlueprint, BuilderCategory, BuilderChannel, BuilderAccess, BuilderOverwrite, BuilderPermission } from "./types.js";
/** Discord bit for each builder permission name. */
export declare const PERMISSION_BITS: Readonly<Record<BuilderPermission, bigint>>;
/** Bitfield string Discord expects for a list of permission names. */
export declare function permissionBits(names: readonly BuilderPermission[]): string;
/**
 * Named overwrite presets so the generator stays readable. Each returns
 * overwrites added on top of the category's.
 */
export declare const PRESETS: {
    /** Anyone who can see the category can read and post. */
    readonly PUBLIC: () => readonly BuilderOverwrite[];
    /** Everyone reads; only staff (and Qbox) post. For rules and announcements. */
    readonly READ_ONLY: (staffKeys: readonly string[]) => readonly BuilderOverwrite[];
    /**
     * Photos only. As a MEDIA channel Discord enforces it; as a TEXT channel
     * members can still type, so attachments and links are allowed and a
     * slowmode keeps it tidy.
     */
    readonly MEDIA_ONLY: (asMediaChannel: boolean) => readonly BuilderOverwrite[];
    /** Hidden from everyone except staff. */
    readonly STAFF_ONLY: (staffKeys: readonly string[]) => readonly BuilderOverwrite[];
    /** Hidden from everyone except one department role, plus any staff ranks given. */
    readonly DEPARTMENT_ONLY: (roleKey: string, staffKeys?: readonly string[]) => readonly BuilderOverwrite[];
    /** Hidden from @everyone until they have the Verified role. */
    readonly VERIFIED_ONLY: (verifiedKey: string) => readonly BuilderOverwrite[];
    /** Staff can read, nobody posts except Qbox. */
    readonly HIDDEN_LOG: (staffKeys: readonly string[]) => readonly BuilderOverwrite[];
};
/**
 * Combines overwrites per target. Later lists win: a permission allowed later
 * is removed from the earlier deny list, and the other way around.
 */
export declare function mergeOverwrites(...lists: readonly (readonly BuilderOverwrite[])[]): readonly BuilderOverwrite[];
/** The overwrites a channel is created with: its category's plus its own. */
export declare function effectiveOverwrites(category: BuilderCategory, channel: BuilderChannel): readonly BuilderOverwrite[];
/**
 * Plain "who can see / who can post" text for every channel, keyed by channel
 * key. Works for any overwrites, including ones edited by hand: a role that
 * is denied a permission shows as "(not Role)".
 */
export declare function describeAccess(blueprint: BuilderBlueprint): Readonly<Record<string, BuilderAccess>>;
//# sourceMappingURL=permissions.d.ts.map