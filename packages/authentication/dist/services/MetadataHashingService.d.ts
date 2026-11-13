import type { AuthenticationCrypto, AuthenticationKeyProvider } from "../ports.js";
import type { EphemeralClientMetadata, HashedClientMetadata } from "./AuthenticationServiceContracts.js";
/**
 * Keyed-HMAC metadata correlation service. It is stateless, safe for concurrent
 * calls in one process, and deliberately never returns or retains raw metadata.
 * Hashes are correlation hints only and are never proof of identity.
 */
export declare class MetadataHashingService {
    private readonly crypto;
    private readonly keys;
    /** Creates a pure metadata hasher from injected cryptography and key ports. */
    constructor(crypto: AuthenticationCrypto, keys: AuthenticationKeyProvider);
    /** Hashes bounded present values and preserves absent/empty values as absent. */
    hash(metadata: EphemeralClientMetadata | undefined): Promise<HashedClientMetadata>;
}
//# sourceMappingURL=MetadataHashingService.d.ts.map