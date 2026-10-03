import type { PlatformModule, PlatformModuleContext } from "./PlatformModule.js";
export declare class ModuleLoader {
    private readonly modules;
    register(module: PlatformModule): void;
    startAll(context: PlatformModuleContext): Promise<void>;
    stopAll(context: PlatformModuleContext): Promise<void>;
    list(): readonly PlatformModule[];
}
//# sourceMappingURL=ModuleLoader.d.ts.map