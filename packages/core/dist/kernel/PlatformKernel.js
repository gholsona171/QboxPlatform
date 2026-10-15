import { logger } from "@qbox/logger";
import { EventBus } from "../events/EventBus.js";
import { ModuleLoader } from "../modules/ModuleLoader.js";
import { ServiceContainer } from "../services/ServiceContainer.js";
export class PlatformKernel {
    services = new ServiceContainer();
    events = new EventBus();
    modules = new ModuleLoader();
    registerModule(module) {
        this.modules.register(module);
    }
    async start() {
        this.services.register("logger", logger);
        this.services.register("events", this.events);
        this.services.register("modules", this.modules);
        logger.info("Qbox Platform starting...");
        logger.info("Core services registered.");
        await this.modules.startAll({
            services: this.services,
            events: this.events
        });
        await this.events.emit("platform.started", {
            startedAt: new Date()
        });
        logger.info({
            moduleCount: this.modules.list().length
        }, "Qbox Platform started.");
    }
    async stop() {
        await this.events.emit("platform.stopping", {
            stoppedAt: new Date()
        });
        await this.modules.stopAll({
            services: this.services,
            events: this.events
        });
        logger.info("Qbox Platform stopped.");
    }
}
//# sourceMappingURL=PlatformKernel.js.map