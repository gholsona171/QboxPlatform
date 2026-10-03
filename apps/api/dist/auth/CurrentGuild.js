import { AsyncLocalStorage } from "node:async_hooks";
import { GuildRequiredApiError } from "../errors/ApiError.js";
/** Browser cookie that remembers which server this browser is working in. */
export const GUILD_COOKIE_NAME = "qbox_guild";
/** The cookie lives 30 days. */
export const GUILD_COOKIE_MAX_AGE_SECONDS = 30 * 24 * 60 * 60;
const storage = new AsyncLocalStorage();
/**
 * Runs `operation` in a fresh per-request guild scope. Fastify's hook runner
 * continues the request from inside `operation`, so every later hook and the
 * handler read the same scope even while other requests run concurrently.
 */
export function runInGuildScope(operation) {
    return storage.run({ guildId: undefined }, operation);
}
/** Records the resolved current server for the running request. */
export function setCurrentGuildId(guildId) {
    const scope = storage.getStore();
    if (scope)
        scope.guildId = guildId;
}
/** The current server for the running request, if one was resolved. */
export function currentGuildId() {
    return storage.getStore()?.guildId;
}
/** The current server, or a 409 `GUILD_REQUIRED` when the browser has not picked one. */
export function requireCurrentGuildId() {
    const guildId = currentGuildId();
    if (guildId === undefined)
        throw new GuildRequiredApiError();
    return guildId;
}
//# sourceMappingURL=CurrentGuild.js.map