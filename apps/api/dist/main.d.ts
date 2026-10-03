import type { ApiConfigurationInput } from "./config/ApiConfiguration.js";
/** Raw values read only by the executable composition boundary. */
export interface ApiProcessEnvironment {
    readonly NODE_ENV?: string | undefined;
    readonly DATABASE_URL?: string | undefined;
    readonly API_HOST?: string | undefined;
    readonly API_PORT?: string | undefined;
    readonly API_BODY_SIZE_LIMIT_BYTES?: string | undefined;
    readonly API_HEADER_SIZE_LIMIT_BYTES?: string | undefined;
    readonly API_USER_AGENT_LIMIT_CHARS?: string | undefined;
    readonly API_REQUEST_TIMEOUT_MS?: string | undefined;
    readonly API_KEEP_ALIVE_TIMEOUT_MS?: string | undefined;
    readonly API_SHUTDOWN_TIMEOUT_MS?: string | undefined;
    readonly API_TRUST_PROXY?: string | undefined;
    readonly API_ALLOWED_HOSTS?: string | undefined;
    readonly API_PUBLIC_BASE_URL?: string | undefined;
    readonly API_PORTAL_DIRECTORY?: string | undefined;
    readonly LOG_LEVEL?: string | undefined;
    readonly QBOX_BUILD_VERSION?: string | undefined;
    readonly DISCORD_OAUTH_CLIENT_ID?: string | undefined;
    readonly DISCORD_OAUTH_CLIENT_SECRET?: string | undefined;
    readonly DISCORD_OAUTH_REDIRECT_URI?: string | undefined;
    readonly DISCORD_GUILD_ID?: string | undefined;
    readonly DISCORD_TOKEN?: string | undefined;
    readonly DISCORD_APPLICATION_ID?: string | undefined;
    readonly AUTH_SESSION_HMAC_KEY?: string | undefined;
    readonly AUTH_CSRF_HMAC_KEY?: string | undefined;
    readonly AUTH_METADATA_HMAC_KEY?: string | undefined;
    readonly AUTH_OAUTH_ENCRYPTION_KEY?: string | undefined;
    readonly AUTH_KEY_VERSION?: string | undefined;
}
/** Parses raw process values without applying empty-string fallbacks. */
export declare function apiConfigurationFromEnvironment(environment: ApiProcessEnvironment): ApiConfigurationInput;
/** Starts the real API process; imports alone never invoke this function. */
export declare function main(environment: ApiProcessEnvironment): Promise<() => void>;
/**
 * Resolves the portal asset directory. `disabled` turns portal hosting off;
 * otherwise the configured or workspace `apps/web/public` directory is used
 * when it contains `index.html`.
 */
export declare function portalDirectoryFromEnvironment(value: string | undefined): string | undefined;
//# sourceMappingURL=main.d.ts.map