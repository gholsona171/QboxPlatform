import { z } from "zod";

import { discordGuildId } from "@qbox/authentication";

/** Explicit Discord PKCE capability decision for OAuth authorization URLs. */
export type DiscordOAuthPkceCapability =
  | "DISABLED_UNVERIFIED"
  | "S256_VERIFIED";

/** Safe Discord OAuth prompt policy. */
export type DiscordOAuthPromptPolicy = "none" | "consent";

/** Immutable constructor input for Discord OAuth provider configuration. */
export interface DiscordOAuthConfigurationInput {
  readonly environment: "development" | "test" | "production";
  readonly clientId: string;
  readonly clientSecret: string;
  readonly redirectUri: string;
  readonly guildId: string;
  readonly requestTimeoutMs?: number;
  readonly maximumResponseBytes?: number;
  readonly pkceCapability?: DiscordOAuthPkceCapability;
  readonly apiVersion?: number;
  readonly prompt?: DiscordOAuthPromptPolicy;
  readonly tokenRefreshSkewMs?: number;
}

/** Redacted provider diagnostics safe for startup logs and tests. */
export interface DiscordOAuthConfigurationDiagnostics {
  readonly clientId: string;
  readonly redirectOrigin: string;
  readonly redirectPath: string;
  readonly scopes: readonly string[];
  readonly requestTimeoutMs: number;
  readonly maximumResponseBytes: number;
  readonly apiVersion: number;
  readonly guildId: string;
  readonly pkceCapability: DiscordOAuthPkceCapability;
  readonly prompt: DiscordOAuthPromptPolicy;
  readonly tokenRefreshSkewMs: number;
}

const APPROVED_SCOPES = Object.freeze(["guilds.members.read", "identify"]);
const INPUT = z.object({
  environment: z.enum(["development", "test", "production"]),
  clientId: z.string().regex(/^[1-9][0-9]{16,19}$/),
  clientSecret: z.string().min(1).max(512).refine((value) => !/[\u0000-\u001f\u007f]/.test(value)),
  redirectUri: z.string().url(),
  guildId: z.string().regex(/^[1-9][0-9]{16,19}$/),
  requestTimeoutMs: z.number().int().min(500).max(15_000).default(5_000),
  maximumResponseBytes: z.number().int().min(1_024).max(128 * 1_024).default(32 * 1_024),
  pkceCapability: z.enum(["DISABLED_UNVERIFIED", "S256_VERIFIED"]).default("DISABLED_UNVERIFIED"),
  apiVersion: z.literal(10).default(10),
  prompt: z.enum(["none", "consent"]).default("consent"),
  tokenRefreshSkewMs: z.number().int().min(0).max(60 * 60_000).default(5 * 60_000),
}).strict();

/**
 * Immutable Discord OAuth configuration.
 *
 * The object validates the exact approved scope policy, stores the client secret
 * only for provider construction, and emits redacted diagnostics that never
 * include the secret or a state-bearing authorization URL.
 */
export class DiscordOAuthConfiguration {
  readonly #clientSecret: string;
  /** Discord OAuth application/client ID. */
  public readonly clientId: string;
  /** Exact configured redirect URI. */
  public readonly redirectUri: URL;
  /** Configured Discord guild used for membership verification. */
  public readonly guildId: ReturnType<typeof discordGuildId>;
  /** Bounded provider request timeout. */
  public readonly requestTimeoutMs: number;
  /** Maximum accepted provider response size. */
  public readonly maximumResponseBytes: number;
  /** Explicit transaction PKCE capability. */
  public readonly pkceCapability: DiscordOAuthPkceCapability;
  /** Fixed Discord API version. */
  public readonly apiVersion: 10;
  /** Fixed provider authorization prompt behavior. */
  public readonly prompt: DiscordOAuthPromptPolicy;
  /** Refresh skew used by credential lifecycle composition. */
  public readonly tokenRefreshSkewMs: number;
  /** Exact approved Discord OAuth scopes. */
  public readonly scopes = APPROVED_SCOPES;

  private constructor(parsed: z.output<typeof INPUT>) {
    const redirectUri = new URL(parsed.redirectUri);
    validateRedirectUri(parsed.environment, redirectUri);
    this.clientId = parsed.clientId;
    this.#clientSecret = parsed.clientSecret;
    this.redirectUri = redirectUri;
    this.guildId = discordGuildId(parsed.guildId);
    this.requestTimeoutMs = parsed.requestTimeoutMs;
    this.maximumResponseBytes = parsed.maximumResponseBytes;
    this.pkceCapability = parsed.pkceCapability;
    this.apiVersion = parsed.apiVersion;
    this.prompt = parsed.prompt;
    this.tokenRefreshSkewMs = parsed.tokenRefreshSkewMs;
    Object.freeze(this);
  }

  /** Validates and constructs immutable Discord OAuth configuration. */
  public static from(input: DiscordOAuthConfigurationInput): DiscordOAuthConfiguration {
    return new DiscordOAuthConfiguration(INPUT.parse(input));
  }

  /** Returns the confidential client secret only to the provider adapter. */
  public secretForProvider(): string {
    return this.#clientSecret;
  }

  /** Returns safe diagnostics with no client secret or state-bearing URL. */
  public diagnostics(): DiscordOAuthConfigurationDiagnostics {
    return Object.freeze({
      clientId: this.clientId,
      redirectOrigin: this.redirectUri.origin,
      redirectPath: this.redirectUri.pathname,
      scopes: this.scopes,
      requestTimeoutMs: this.requestTimeoutMs,
      maximumResponseBytes: this.maximumResponseBytes,
      apiVersion: this.apiVersion,
      guildId: this.guildId,
      pkceCapability: this.pkceCapability,
      prompt: this.prompt,
      tokenRefreshSkewMs: this.tokenRefreshSkewMs,
    });
  }
}

function validateRedirectUri(
  environment: DiscordOAuthConfigurationInput["environment"],
  redirectUri: URL,
): void {
  if (environment === "production") {
    if (redirectUri.protocol !== "https:")
      throw new Error("Discord OAuth production redirect URI must use HTTPS.");
    return;
  }
  if (redirectUri.protocol === "https:") return;
  if (
    redirectUri.protocol === "http:" &&
    (redirectUri.hostname === "127.0.0.1" ||
      redirectUri.hostname === "localhost" ||
      redirectUri.hostname === "[::1]")
  )
    return;
  throw new Error("Discord OAuth non-production HTTP redirects must be loopback only.");
}
