import { Buffer } from "node:buffer";
import { z } from "zod";
import {
  discordGuildId,
  type OpaqueAuthenticationSecret,
  opaqueAuthenticationSecret,
} from "@qbox/authentication";
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

const inputSchema = z.strictObject({
  environment: z.enum(["development", "test", "production"]).default("development"),
  publicBaseUrl: z.string().trim().min(1),
  discordClientId: z.string().trim().min(17).max(20),
  discordClientSecret: z.string().trim().min(1).max(512),
  discordRedirectUri: z.string().trim().min(1).max(2_048),
  discordGuildId: z.string().trim().min(17).max(20).optional(),
  sessionHmacKey: z.string().trim().min(1),
  csrfHmacKey: z.string().trim().min(1),
  metadataHmacKey: z.string().trim().min(1),
  oauthEncryptionKey: z.string().trim().min(1),
  keyVersion: z.string().trim().regex(/^[1-9][0-9]*$/u).default("1"),
});

/** Immutable authentication runtime configuration for the browser POC. */
export class ApiAuthenticationConfiguration {
  readonly #diagnostics: ApiAuthenticationConfigurationDiagnostics;
  readonly #discord: DiscordOAuthConfiguration;
  readonly #keyRegistrations: readonly AuthenticationKeyRegistration[];
  readonly #defaultGuildId: ReturnType<typeof discordGuildId> | undefined;

  private constructor(input: {
    readonly diagnostics: ApiAuthenticationConfigurationDiagnostics;
    readonly discord: DiscordOAuthConfiguration;
    readonly keyRegistrations: readonly AuthenticationKeyRegistration[];
    readonly defaultGuildId: ReturnType<typeof discordGuildId> | undefined;
  }) {
    this.#diagnostics = Object.freeze(input.diagnostics);
    this.#discord = input.discord;
    this.#keyRegistrations = Object.freeze(input.keyRegistrations);
    this.#defaultGuildId = input.defaultGuildId;
  }

  /** Validates raw process values and builds one immutable configuration. */
  public static from(input: ApiAuthenticationConfigurationInput): ApiAuthenticationConfiguration {
    const parsed = inputSchema.safeParse(input);
    if (!parsed.success) {
      const field = parsed.error.issues[0]?.path.join(".") || "configuration";
      throw new Error(`Invalid authentication ${field}.`);
    }
    const publicBaseUrl = parsePublicBaseUrl(parsed.data.publicBaseUrl, parsed.data.environment);
    const dashboardUrl = `${publicBaseUrl}/`;
    const callbackUrl = new URL(parsed.data.discordRedirectUri);
    const expectedCallback = `${publicBaseUrl}/auth/discord/callback`;
    if (callbackUrl.toString() !== expectedCallback)
      throw new Error("Discord OAuth redirect URI must match API_PUBLIC_BASE_URL /auth/discord/callback.");
    const loopback = isLoopback(callbackUrl.hostname);
    const secureCookies = parsed.data.environment === "production" || callbackUrl.protocol === "https:";
    if (parsed.data.environment === "production" && !secureCookies)
      throw new Error("Production authentication cookies require HTTPS.");
    if (!secureCookies && !loopback)
      throw new Error("Insecure authentication cookies are allowed only on loopback development hosts.");
    const version = Number(parsed.data.keyVersion);
    const discord = DiscordOAuthConfiguration.from({
      environment: parsed.data.environment,
      clientId: parsed.data.discordClientId,
      clientSecret: parsed.data.discordClientSecret,
      redirectUri: parsed.data.discordRedirectUri,
      ...(parsed.data.discordGuildId === undefined ? {} : { defaultGuildId: parsed.data.discordGuildId }),
    });
    const diagnostics: ApiAuthenticationConfigurationDiagnostics = {
      environment: parsed.data.environment,
      sessionCookieName: secureCookies ? "__Host-qbox_session" : "qbox_session",
      oauthBindingCookieName: secureCookies ? "__Host-qbox_oauth" : "qbox_oauth",
      csrfCookieName: secureCookies ? "__Host-qbox_csrf" : "qbox_csrf",
      secureCookies,
      keyVersion: version,
      defaultGuildId: parsed.data.discordGuildId,
      dashboardUrl,
      callbackUrl: callbackUrl.toString(),
      discord: discord.diagnostics(),
    };
    return new ApiAuthenticationConfiguration({
      diagnostics,
      discord,
      defaultGuildId: parsed.data.discordGuildId === undefined ? undefined : discordGuildId(parsed.data.discordGuildId),
      keyRegistrations: [
        registration("SESSION_HMAC", version, parsed.data.sessionHmacKey, 32),
        registration("CSRF_HMAC", version, parsed.data.csrfHmacKey, 32),
        registration("METADATA_HMAC", version, parsed.data.metadataHmacKey, 32),
        registration("OAUTH_ENCRYPTION", version, parsed.data.oauthEncryptionKey, 32),
      ],
    });
  }

  /** Returns redacted diagnostics only. */
  public diagnostics(): ApiAuthenticationConfigurationDiagnostics {
    return this.#diagnostics;
  }

  /** Returns the validated Discord OAuth configuration. */
  public discord(): DiscordOAuthConfiguration {
    return this.#discord;
  }

  /** Returns copied key registrations for the process-local key ring. */
  public keyRegistrations(): readonly AuthenticationKeyRegistration[] {
    return this.#keyRegistrations;
  }

  /** Returns the default Discord guild snowflake, when one is configured. */
  public defaultDiscordGuildId(): ReturnType<typeof discordGuildId> | undefined {
    return this.#defaultGuildId;
  }
}

/** Converts an ephemeral cookie string to a branded authentication secret. */
export function cookieSecret(value: string | undefined): OpaqueAuthenticationSecret | undefined {
  if (!value) return undefined;
  try {
    return opaqueAuthenticationSecret(value);
  } catch {
    return undefined;
  }
}

function registration(
  purpose: AuthenticationKeyRegistration["purpose"],
  version: number,
  encoded: string,
  expectedBytes: number,
): AuthenticationKeyRegistration {
  const material = decodeKey(encoded);
  if (material.byteLength !== expectedBytes)
    throw new Error(`${purpose} key must decode to ${expectedBytes} bytes.`);
  return Object.freeze({ purpose, version, material, active: true });
}

function decodeKey(value: string): Uint8Array {
  const normalized = value.trim();
  if (/^[0-9a-f]{64}$/iu.test(normalized))
    return new Uint8Array(Buffer.from(normalized, "hex"));
  return new Uint8Array(Buffer.from(normalized, "base64url"));
}

function parsePublicBaseUrl(value: string, environment: string): string {
  const url = new URL(value);
  if (url.username || url.password || url.search || url.hash)
    throw new Error("API_PUBLIC_BASE_URL cannot contain credentials, query, or fragment.");
  if (environment === "production" && url.protocol !== "https:")
    throw new Error("Production API_PUBLIC_BASE_URL must use HTTPS.");
  if (url.protocol !== "http:" && url.protocol !== "https:")
    throw new Error("API_PUBLIC_BASE_URL must use HTTP or HTTPS.");
  return url.toString().replace(/\/$/u, "");
}

function isLoopback(hostname: string): boolean {
  return hostname === "localhost" || hostname === "127.0.0.1" || hostname === "::1" || hostname === "[::1]";
}
