import type { EventBus } from "../events/EventBus.js";
import type { ServiceContainer } from "../services/ServiceContainer.js";
export interface PlatformModuleContext {
    services: ServiceContainer;
    events: EventBus;
}
export interface PlatformModule {
    name: string;
    version: string;
    start(context: PlatformModuleContext): void | Promise<void>;
    stop?(context: PlatformModuleContext): void | Promise<void>;
}
//# sourceMappingURL=PlatformModule.d.ts.map