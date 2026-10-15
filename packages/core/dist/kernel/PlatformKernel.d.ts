import { EventBus } from "../events/EventBus.js";
import { ModuleLoader } from "../modules/ModuleLoader.js";
import type { PlatformModule } from "../modules/PlatformModule.js";
import { ServiceContainer } from "../services/ServiceContainer.js";
export declare class PlatformKernel {
    readonly services: ServiceContainer;
    readonly events: EventBus;
    readonly modules: ModuleLoader;
    registerModule(module: PlatformModule): void;
    start(): Promise<void>;
    stop(): Promise<void>;
}
//# sourceMappingURL=PlatformKernel.d.ts.map