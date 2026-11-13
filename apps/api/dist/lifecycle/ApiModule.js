import { beginApiTransportShutdown } from "../createApiServer.js";
/** Owns exactly one Fastify listen/close lifecycle. */
export class ApiModule {
    server;
    configuration;
    health;
    name = "api-http";
    version = "0.1.0";
    started = false;
    stopped = false;
    boundAddress;
    constructor(server, configuration, health) {
        this.server = server;
        this.configuration = configuration;
        this.health = health;
    }
    async start(context) {
        if (this.started)
            throw new Error("API module has already started.");
        if (this.stopped)
            throw new Error("API module cannot restart after shutdown.");
        this.health.markHttp("starting");
        const configured = this.configuration.diagnostics();
        try {
            await this.server.listen({ host: configured.host, port: configured.port });
            const address = this.server.server.address();
            if (address === null || typeof address === "string")
                throw new Error("API server did not expose a TCP bound address.");
            this.boundAddress = Object.freeze({ host: configured.host, port: address.port });
            this.started = true;
            this.health.markHttp("listening");
            context.services.register("api", this.server);
        }
        catch (error) {
            this.health.markHttp("failed");
            try {
                await this.closeWithinTimeout();
            }
            catch {
                // Preserve the listen failure while still attempting cleanup.
            }
            throw error;
        }
    }
    async stop() {
        if (this.stopped)
            return;
        this.stopped = true;
        this.health.beginShutdown();
        beginApiTransportShutdown(this.server, Math.max(1, Math.floor(this.configuration.diagnostics().shutdownTimeoutMs / 2)));
        await this.closeWithinTimeout();
        this.health.markHttp("stopped");
    }
    diagnostics() {
        return this.boundAddress;
    }
    async closeWithinTimeout() {
        const timeoutMs = this.configuration.diagnostics().shutdownTimeoutMs;
        let timer;
        try {
            await Promise.race([
                this.server.close(),
                new Promise((_, reject) => {
                    timer = setTimeout(() => reject(new Error("API shutdown timeout exceeded.")), timeoutMs);
                }),
            ]);
        }
        finally {
            if (timer !== undefined)
                clearTimeout(timer);
        }
    }
}
//# sourceMappingURL=ApiModule.js.map