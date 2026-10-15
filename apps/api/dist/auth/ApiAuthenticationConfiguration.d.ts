import { discordGuildId, type OpaqueAuthenticationSecret } from "@qbox/authentication";
import type { AuthenticationKeyRegistration } from "@qbox/database";
import { DiscordOAuthConfiguration } from "./DiscordOAuthConfiguration.js";
/** Raw authentication runtime values supplied by the API composition root. */
export interface ApiAuthenticationConfigurationInput {
    readonly environment?: string | undefined;
    readonly publicBaseUrl?: string | undefined;
    readonly discordClientId?: string | undefined;
    readonly discordClientSecret?: string | undefined;
    readonly discordRedirectUri?: string | undefined;
    /** Optional default server; omit it for multi-server deployments. */
    readonly discordGuildId?: string | undefined;
    readonly sessionHmacKey?: string | undefined;
    readonly csrfHmacKey?: string | undefined;
    readonly metadataHmacKey?: string | undefined;
    readonly oauthEncryptionKey?: string | undefined;
    readonly keyVersion?: string | undefined;
}
/** Redacted diagnostics safe for startup logs and tests. */
export interface ApiAuthenticationConfigurationDiagnostics {
    readonly environment: "development" | "test" | "production";
    readonly sessionCookieName: "__Host-qbox_session" | "qbox_session";
    readonly oauthBindingCookieName: "__Host-qbox_oauth" | "qbox_oauth";
    readonly csrfCookieName: "__Host-qbox_csrf" | "qbox_csrf";
    readonly secureCookies: boolean;
    readonly keyVersion: number;
    /** Default server for browsers that have not picked one, when configured. */
    readonly defaultGuildId: string | undefined;
    readonly dashboardUrl: string;
    readonly callbackUrl: string;
    readonly discord: ReturnType<DiscordOAuthConfiguration["diagnostics"]>;
}
/** Immutable authentication runtime configuration for the browser POC. */
export declare class ApiAuthenticationConfiguration {
    #private;
    private constructor();
    /** Validates raw process values and builds one immutable configuration. */
    static from(input: ApiAuthenticationConfigurationInput): ApiAuthenticationConfiguration;
    /** Returns redacted diagnostics only. */
    diagnostics(): ApiAuthenticationConfigurationDiagnostics;
    /** Returns the validated Discord OAuth configuration. */
    discord(): DiscordOAuthConfiguration;
    /** Returns copied key registrations for the process-local key ring. */
    keyRegistrations(): readonly AuthenticationKeyRegistration[];
    /** Returns the default Discord guild snowflake, when one is configured. */
    defaultDiscordGuildId(): ReturnType<typeof discordGuildId> | undefined;
}
/** Converts an ephemeral cookie string to a branded authentication secret. */
export declare function cookieSecret(value: string | undefined): OpaqueAuthenticationSecret | undefined;
//# sourceMappingURL=ApiAuthenticationConfiguration.d.ts.map