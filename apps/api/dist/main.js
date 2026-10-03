import { existsSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { logger } from "@qbox/logger";
import { createApiApplication } from "./composition/ApiApplication.js";
import { installApiSignalHandlers } from "./process/ApiSignalHandler.js";
import { BRAND } from "@qbox/shared/brand";
/** Parses raw process values without applying empty-string fallbacks. */
export function apiConfigurationFromEnvironment(environment) {
    return {
        environment: environment.NODE_ENV,
        host: environment.API_HOST,
        port: optionalNumber(environment.API_PORT),
        bodySizeLimitBytes: optionalNumber(environment.API_BODY_SIZE_LIMIT_BYTES),
        headerSizeLimitBytes: optionalNumber(environment.API_HEADER_SIZE_LIMIT_BYTES),
        userAgentLimitChars: optionalNumber(environment.API_USER_AGENT_LIMIT_CHARS),
        requestTimeoutMs: optionalNumber(environment.API_REQUEST_TIMEOUT_MS),
        keepAliveTimeoutMs: optionalNumber(environment.API_KEEP_ALIVE_TIMEOUT_MS),
        shutdownTimeoutMs: optionalNumber(environment.API_SHUTDOWN_TIMEOUT_MS),
        trustProxy: parseTrustProxy(environment.API_TRUST_PROXY),
        allowedHosts: parseOptionalCsv(environment.API_ALLOWED_HOSTS),
        publicBaseUrl: environment.API_PUBLIC_BASE_URL,
        logLevel: environment.LOG_LEVEL,
        buildVersion: environment.QBOX_BUILD_VERSION,
    };
}
/** Starts the real API process; imports alone never invoke this function. */
export async function main(environment) {
    const application = createApiApplication({
        api: apiConfigurationFromEnvironment(environment),
        authentication: {
            discordClientId: environment.DISCORD_OAUTH_CLIENT_ID,
            discordClientSecret: environment.DISCORD_OAUTH_CLIENT_SECRET,
            discordRedirectUri: environment.DISCORD_OAUTH_REDIRECT_URI,
            ...(environment.DISCORD_GUILD_ID?.trim() ? { discordGuildId: environment.DISCORD_GUILD_ID.trim() } : {}),
            sessionHmacKey: environment.AUTH_SESSION_HMAC_KEY,
            csrfHmacKey: environment.AUTH_CSRF_HMAC_KEY,
            metadataHmacKey: environment.AUTH_METADATA_HMAC_KEY,
            oauthEncryptionKey: environment.AUTH_OAUTH_ENCRYPTION_KEY,
            keyVersion: environment.AUTH_KEY_VERSION,
        },
        discord: {
            token: environment.DISCORD_TOKEN,
            applicationId: environment.DISCORD_APPLICATION_ID,
        },
        databaseUrl: environment.DATABASE_URL,
        portalDirectory: portalDirectoryFromEnvironment(environment.API_PORTAL_DIRECTORY),
    });
    const removeSignals = installApiSignalHandlers(application, logger);
    try {
        await application.start();
        const bound = application.apiModule.diagnostics();
        logger.info({
            service: "qbox-api",
            version: application.configuration.diagnostics().buildVersion,
            host: bound?.host,
            port: bound?.port,
            readiness: "ready",
        }, `${BRAND.name} API started.`);
        return removeSignals;
    }
    catch (error) {
        removeSignals();
        logger.error({ err: error, errorName: error instanceof Error ? error.name : "unknown" }, `${BRAND.name} API startup failed.`);
        throw error;
    }
}
function optionalNumber(value) {
    if (value === undefined)
        return undefined;
    return value.trim() === "" ? Number.NaN : Number(value);
}
function parseTrustProxy(value) {
    if (value === undefined)
        return undefined;
    if (value === "false")
        return false;
    return value.split(",").map((address) => address.trim());
}
function parseOptionalCsv(value) {
    if (value === undefined || value.trim() === "")
        return undefined;
    return value.split(",").map((item) => item.trim()).filter(Boolean);
}
/**
 * Resolves the portal asset directory. `disabled` turns portal hosting off;
 * otherwise the configured or workspace `apps/web/public` directory is used
 * when it contains `index.html`.
 */
export function portalDirectoryFromEnvironment(value) {
    if (value?.trim() === "disabled")
        return undefined;
    const directory = value?.trim()
        ? resolve(value.trim())
        : fileURLToPath(new URL("../../web/public/", import.meta.url));
    return existsSync(resolve(directory, "index.html")) ? directory : undefined;
}
//# sourceMappingURL=main.js.map