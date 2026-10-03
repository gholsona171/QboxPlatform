import { type Permission } from "@qbox/permissions";
import type { REST } from "discord.js";
import type { ApiFeature } from "../features/ApiFeature.js";
interface ApiChannel {
    readonly id: string;
    readonly name?: string;
    readonly type: number;
    readonly parent_id?: string | null;
    readonly position?: number;
}
interface ApiRole {
    readonly id: string;
    readonly name: string;
    readonly color: number;
    readonly position: number;
    readonly managed: boolean;
}
/** Anyone who can manage a feature can see the server's channels, roles, and members. */
export declare const DIRECTORY_PERMISSIONS: readonly Permission[];
/** Channel and role lists are reused for this long per server. */
export declare const DIRECTORY_CACHE_MS = 15000;
interface DirectoryData {
    readonly channels: readonly ApiChannel[];
    readonly roles: readonly ApiRole[];
}
/**
 * Per-server cache of the Discord channel and role lists behind the portal
 * pickers. Builder and wipe runs call `forget` when they finish, and the
 * portal's refresh buttons ask for `?refresh=1`.
 */
export declare class DirectoryCache {
    private readonly cache;
    constructor(options?: {
        readonly ttlMs?: number;
        readonly now?: () => number;
    });
    load(guildId: string, read: () => Promise<DirectoryData>, options?: {
        readonly refresh?: boolean;
    }): Promise<DirectoryData>;
    /** Drops one server's lists (after its channels or roles changed). */
    forget(guildId: string): void;
}
/**
 * Discord server directory for portal pickers:
 * `GET /api/v1/directory` (channels, roles) and
 * `GET /api/v1/directory/members?query=` or `?ids=a,b`.
 */
export declare function directoryApiFeature(rest: REST | undefined, cache?: DirectoryCache): ApiFeature;
export {};
//# sourceMappingURL=DirectoryRoutes.d.ts.map