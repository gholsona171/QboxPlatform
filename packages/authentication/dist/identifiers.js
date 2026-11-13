import { AuthenticationDomainError } from "./errors.js";
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const DISCORD_SNOWFLAKE_PATTERN = /^[1-9][0-9]{16,19}$/;
const DIGEST_PATTERN = /^[0-9a-f]{64}$/;
/** Validates and brands a platform-user UUID at an untrusted boundary. */
export function platformUserId(value) {
    return canonicalUuid(value, "platform user");
}
/** Validates and brands an external-identity UUID at an untrusted boundary. */
export function externalIdentityId(value) {
    return canonicalUuid(value, "external identity");
}
/** Validates and brands a browser-session UUID at an untrusted boundary. */
export function browserSessionId(value) {
    return canonicalUuid(value, "browser session");
}
/** Validates and brands an OAuth-transaction UUID at an untrusted boundary. */
export function oauthTransactionId(value) {
    return canonicalUuid(value, "OAuth transaction");
}
/** Validates and brands an OAuth-credential UUID at an untrusted boundary. */
export function oauthCredentialId(value) {
    return canonicalUuid(value, "OAuth credential");
}
/** Validates and brands a Discord membership UUID at an untrusted boundary. */
export function discordGuildMembershipId(value) {
    return canonicalUuid(value, "Discord guild membership");
}
/** Validates and brands an authentication-audit UUID at an untrusted boundary. */
export function authenticationAuditEventId(value) {
    return canonicalUuid(value, "authentication audit event");
}
/** Validates and brands a future service-identity UUID. */
export function serviceIdentityId(value) {
    return canonicalUuid(value, "service identity");
}
/** Validates and brands an internal guild UUID. */
export function guildId(value) {
    return canonicalUuid(value, "guild");
}
/** Validates and brands a canonical operation correlation UUID. */
export function authenticationCorrelationId(value) {
    return canonicalUuid(value, "correlation");
}
/** Validates and brands a trusted request UUID. */
export function authenticationRequestId(value) {
    return canonicalUuid(value, "request");
}
/** Validates and brands a Discord user snowflake. */
export function discordUserId(value) {
    return discordSnowflake(value, "Discord user");
}
/** Validates and brands a Discord guild snowflake. */
export function discordGuildId(value) {
    return discordSnowflake(value, "Discord guild");
}
/** Validates and brands a Discord role snowflake. */
export function discordRoleId(value) {
    return discordSnowflake(value, "Discord role");
}
/** Validates a lowercase 32-byte keyed-HMAC digest for safe persistence. */
export function authenticationDigest(value) {
    if (!DIGEST_PATTERN.test(value))
        throw new AuthenticationDomainError("invalid-identifier", "Authentication digests must be 64 lowercase hexadecimal characters.");
    return value;
}
/** Brands an in-memory opaque secret after rejecting empty or control-filled values. */
export function opaqueAuthenticationSecret(value) {
    if (value.length < 32 || value.length > 4096 || /[\u0000-\u001f\u007f]/.test(value))
        throw new AuthenticationDomainError("invalid-identifier", "Opaque authentication secrets must have a safe bounded representation.");
    return value;
}
/**
 * Brands a secret issued by an OAuth provider (authorization codes, access and
 * refresh tokens). Discord issues these at about 30 characters, shorter than
 * the 32-character floor for secrets Qbox generates itself.
 */
export function providerIssuedSecret(value) {
    if (value.length < 16 || value.length > 4096 || /[\u0000-\u001f\u007f]/.test(value))
        throw new AuthenticationDomainError("invalid-identifier", "Provider-issued secrets must have a safe bounded representation.");
    return value;
}
function canonicalUuid(value, label) {
    if (!UUID_PATTERN.test(value))
        throw new AuthenticationDomainError("invalid-identifier", `${label} identifiers must be canonical lowercase UUIDs.`);
    return value;
}
function discordSnowflake(value, label) {
    if (!DISCORD_SNOWFLAKE_PATTERN.test(value))
        throw new AuthenticationDomainError("invalid-identifier", `${label} identifiers must be 17 to 20 digit Discord snowflakes.`);
    return value;
}
//# sourceMappingURL=identifiers.js.map