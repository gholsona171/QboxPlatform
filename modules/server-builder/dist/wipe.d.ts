import type { BuilderBlueprint, BuilderPermission, WipeSnapshot } from "./types.js";
/** Discord's integer color to a `#RRGGBB` hex string. */
export declare function colorHex(color: number): string;
/** Permission names for a Discord bitfield string. `dropped` is true when bits the builder does not manage were present. */
export declare function permissionNames(bits: string): {
    readonly names: BuilderPermission[];
    readonly dropped: boolean;
};
interface Conversion {
    readonly blueprint: BuilderBlueprint;
    readonly notes: readonly string[];
}
/**
 * Turns a wipe snapshot back into a blueprint so the old layout can be rebuilt.
 * Managed roles and @everyone are left out, member permission overrides are
 * dropped, and permission bits and channel types the builder cannot rebuild are
 * dropped with a note. Messages are never part of a snapshot.
 */
export declare function snapshotToBlueprint(snapshot: WipeSnapshot): Conversion;
export {};
//# sourceMappingURL=wipe.d.ts.map