import { AuthenticationServiceError } from "../errors.js";
const MAX_CLIENT_IP_LENGTH = 64;
const MAX_USER_AGENT_LENGTH = 512;
const MAX_DEVICE_LENGTH = 256;
/**
 * Keyed-HMAC metadata correlation service. It is stateless, safe for concurrent
 * calls in one process, and deliberately never returns or retains raw metadata.
 * Hashes are correlation hints only and are never proof of identity.
 */
export class MetadataHashingService {
    crypto;
    keys;
    /** Creates a pure metadata hasher from injected cryptography and key ports. */
    constructor(crypto, keys) {
        this.crypto = crypto;
        this.keys = keys;
    }
    /** Hashes bounded present values and preserves absent/empty values as absent. */
    async hash(metadata) {
        const clientIp = bounded(metadata?.clientIp, MAX_CLIENT_IP_LENGTH, "client IP");
        const userAgent = bounded(metadata?.userAgent, MAX_USER_AGENT_LENGTH, "user agent");
        const device = bounded(metadata?.device, MAX_DEVICE_LENGTH, "device value");
        if (!clientIp && !userAgent && !device)
            return Object.freeze({});
        const key = await this.keys.active("METADATA_HMAC");
        return Object.freeze({
            ...(clientIp ? { ipHmac: await this.crypto.hmac(clientIp, key) } : {}),
            ...(userAgent
                ? { userAgentHmac: await this.crypto.hmac(userAgent, key) }
                : {}),
            ...(device ? { deviceHmac: await this.crypto.hmac(device, key) } : {}),
            metadataKeyVersion: key.version,
        });
    }
}
function bounded(value, maximum, label) {
    if (value === undefined || value.length === 0)
        return undefined;
    if (value.length > maximum || /[\u0000-\u001f\u007f]/.test(value))
        throw new AuthenticationServiceError("authentication-failed", `The ${label} is outside reviewed metadata bounds.`);
    return value;
}
//# sourceMappingURL=MetadataHashingService.js.map