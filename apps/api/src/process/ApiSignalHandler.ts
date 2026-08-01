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
export function installApiSignalHandlers(
  application: ApiShutdownTarget,
  logger: ApiLogger,
  processSignals: ApiProcessSignals = process,
): () => void {
  let shutdown: Promise<void> | undefined;
  const listeners = new Map<"SIGINT" | "SIGTERM", () => void>();
  const begin = (signal: "SIGINT" | "SIGTERM") => {
    if (shutdown !== undefined) return;
    logger.info({ signal }, "API shutdown signal received.");
    shutdown = application.shutdown().then(
      () => {
        processSignals.exitCode = 0;
      },
      (error: unknown) => {
        processSignals.exitCode = 1;
        logger.error(
          { signal, errorName: error instanceof Error ? error.name : "unknown" },
          "API graceful shutdown failed.",
        );
      },
    );
  };
  for (const signal of ["SIGINT", "SIGTERM"] as const) {
    const listener = () => begin(signal);
    listeners.set(signal, listener);
    processSignals.on(signal, listener);
  }
  return () => {
    for (const [signal, listener] of listeners)
      processSignals.off(signal, listener);
    listeners.clear();
  };
}
