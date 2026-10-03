/** Installs idempotent signal handling and returns explicit listener cleanup. */
export function installApiSignalHandlers(application, logger, processSignals = process) {
    let shutdown;
    const listeners = new Map();
    const begin = (signal) => {
        if (shutdown !== undefined)
            return;
        logger.info({ signal }, "API shutdown signal received.");
        shutdown = application.shutdown().then(() => {
            processSignals.exitCode = 0;
        }, (error) => {
            processSignals.exitCode = 1;
            logger.error({ signal, errorName: error instanceof Error ? error.name : "unknown" }, "API graceful shutdown failed.");
        });
    };
    for (const signal of ["SIGINT", "SIGTERM"]) {
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
//# sourceMappingURL=ApiSignalHandler.js.map