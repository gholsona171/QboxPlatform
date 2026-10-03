/** Browser cookie that remembers which server this browser is working in. */
export declare const GUILD_COOKIE_NAME = "qbox_guild";
/** The cookie lives 30 days. */
export declare const GUILD_COOKIE_MAX_AGE_SECONDS: number;
/**
 * Runs `operation` in a fresh per-request guild scope. Fastify's hook runner
 * continues the request from inside `operation`, so every later hook and the
 * handler read the same scope even while other requests run concurrently.
 */
export declare function runInGuildScope<T>(operation: () => T): T;
/** Records the resolved current server for the running request. */
export declare function setCurrentGuildId(guildId: string | undefined): void;
/** The current server for the running request, if one was resolved. */
export declare function currentGuildId(): string | undefined;
/** The current server, or a 409 `GUILD_REQUIRED` when the browser has not picked one. */
export declare function requireCurrentGuildId(): string;
//# sourceMappingURL=CurrentGuild.d.ts.map