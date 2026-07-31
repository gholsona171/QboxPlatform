import { logger } from "@qbox/logger";
import { EventBus } from "../events/EventBus.js";
import { ModuleLoader } from "../modules/ModuleLoader.js";
import type { PlatformModule } from "../modules/PlatformModule.js";
import { ServiceContainer } from "../services/ServiceContainer.js";

export class PlatformKernel {
  public readonly services = new ServiceContainer();
  public readonly events = new EventBus();
  public readonly modules = new ModuleLoader();

  public registerModule(module: PlatformModule): void {
    this.modules.register(module);
  }

  public async start(): Promise<void> {
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

    logger.info(
      {
        moduleCount: this.modules.list().length
      },
      "Qbox Platform started."
    );
  }

  public async stop(): Promise<void> {
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
