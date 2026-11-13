import type { ApiLogger } from "../logging/ApiLogger.js";
/** Minimal application shutdown port owned by signal handling. */
export interface ApiShutdownTarget {
    shutdown(): Promise<void>;
}
/** Process operations isolated for deterministic signal tests. */
export interface ApiProcessSignals {
    exitCode: string | number | null | undefined;
    on(signal: "SIGINT" | "SIGTERM", listener: () => void): unknown;
    off(signal: "SIGINT" | "SIGTERM", listener: () => void): unknown;
}
/** Installs idempotent signal handling and returns explicit listener cleanup. */
export declare function installApiSignalHandlers(application: ApiShutdownTarget, logger: ApiLogger, processSignals?: ApiProcessSignals): () => void;
//# sourceMappingURL=ApiSignalHandler.d.ts.map